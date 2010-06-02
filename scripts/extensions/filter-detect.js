/**
 * FilterDetect - An extension that attempts to determine whether or not the 
 * local client is filtering a website that a WebAnywhere user is trying to visit. 
 * If a site is blocked locally, we attempt to block it in WebAnywhere as well.
 * 
 * Rationale: WebAnywhere has made its way onto some lists that web content filters 
 * use to block web proxies, since it does indeed proxy web content.  However, this 
 * problem could be avoided if we closely emulate the local filtering policies.
 *
 * Two imperfect approaches are used.  One scans the page for image elements 
 * that come from the same host as the page itself.  WebAnywhere then attempts 
 * to load that image again without going through the proxy.  If the image isn't 
 * blocked, then presumably the entire domain is safe.  The second approach is 
 * meant to detect content filters that redirect via a <meta /> refresh tag.  When a
 * page loads, this extension creates an iframe that has the local client load the 
 * page (off-screen) without proxying it.  Pages with (meta-based) redirects dispatch 
 * more than the usual, single 'load' event, so redirected pages can be detected that 
 * way.
 *
 * @author  krilnon
 *
 */

WA.Extensions.FilterDetect = function(){
  this.extension = arguments.callee;
  arguments.callee.instance = this;
  this._loadCount = -1;
  
  /**
   * Checks to see whether or not the local client can load a given image by its URI.
   * This is useful to see whether or not the local network is filtering content.
   * 
   * @param   uri           The URI of the image to load.
   * @param   resultLambda  The function to be called when then result is found. 
   *                          -> function(exists:Boolean) // whether or not the image exists
   */
	this.imageExists = function(uri, resultLambda){
		var img = document.createElement('IMG');
  	img.style.position = 'absolute';
  	img.style.left = '-1000em';
  	//img.style.filter = 'alpha(opacity=0)';
  	img.src = uri;

  	var success = function(e){
	  	if((img.offsetWidth && img.offsetWidth > 0) || (img.width && img.width > 0)){
	  	  resultLambda(true);
	  	} else {
	  		resultLambda(false);
	  	}
	  	document.body.removeChild(img);
  	};

  	var failure = function(e){
  	  document.body.removeChild(img);
  		resultLambda(false);
  	}

  	if(img.addEventListener){
  	  img.addEventListener('load', success, false);
  	  //img.addEventListener('error', failure, false);
  	} else if(img.attachEvent){
  		img.attachEvent('onload', success);
  		//img.attachEvent('onerror', failure);
  	}
  	document.body.appendChild(img);
	};
	
	/**
	 * Checks all of the <img /> elements on each page for one that is from the same domain
	 * as the document itself.  If one exists, then call this.imageExists to see if the local 
	 * client can load it. If it's restricted by the local client, then force webanywhere to go
	 * a page that explains what has happened and how the problem can be fixed.
	 * 
	 * @param doc   The DOM Document that is currently in WA's content frame.
	 */
	this.checkImages = function(doc){
	  var docHost = parseUri(WA.Interface.getURLFromProxiedDoc(doc)).host;
	  var imgs = doc[0].getElementsByTagName('IMG');
		
		// "found" is searching for images on the current page that are hosted at the same host as the page
		var found = false;
		for(var i = 0; i < imgs.length; i++){
		  var img = imgs[i];
		  var imgHost = parseUri(WA.Interface.getURLFromProxiedURL(img.src)).host;
		  if((imgHost == docHost) && ((img.width && img.width > 0) || (img.offsetWidth && img.offsetWidth > 0))){
		    found = true;
		    break;
	    }
	  }
		
		if(found){
		  var uri = WA.Interface.getURLFromProxiedURL(img.src);
  		this.imageExists(uri, function(result){
        if(!result){
          var loc = document.getElementById('location');
          loc.value = WA.Extensions.FilterDetect.blockedInfoPage;
          navigate(null);
        }
      });
    } else {
      // no images on this page are hosted by this page's host, docHost
    }
  };
  
  /**
   * This functions implements the second approach to content filter detection.  It compares
   * the number of iframe loads between the proxied page and an unproxied page.  It first 
   * determines whether or not there are any <meta /> refresh tags on the proxied page, so
   * that the number of false positives is reduced.
   * 
   * @param   doc   The document passed in by the generic oncePerDocument function available
   *                to all WebAnywhere extensions.
   */
  this.checkMeta = function(doc){
    doc = doc[0]; // the doc passed into this.oncePerDocument, oddly, is a one-element array
    var found = false;
    var metas = doc.getElementsByTagName('META');
    for(var i = 0; i < metas.length; i++){
      var meta = metas[i];
      if(meta.attributes['http-equiv'] && meta.attributes['http-equiv'].value == 'refresh'){
        found = true;
        break;
      }
    }
    
    if(!found){
      // no meta refresh tags
      // check local network version of the page for refresh tags
      var uri = WA.Interface.getURLFromProxiedDoc(doc);
      var iframe = document.createElement('IFRAME');
      
      var iframeNotify = function(){
        ++arguments.callee.count;
      }
      
      iframeNotify.count = 0; // this counts frame loads
      
      if(iframe.attachEvent){
        iframe.attachEvent('onload', iframeNotify);
      } else {
        iframe.addEventListener('load', iframeNotify, false);
      }
      
      var iframeKill = function(){
        var count = arguments.callee.iframeNotify.count;

        if(count > 1){
          // a refresh was detected locally and not on the proxied version
          var loc = document.getElementById('location');
          loc.value = WA.Extensions.FilterDetect.blockedInfoPage;
          navigate(null);
        }
        // TODO: find a way to remove this iframe
        arguments.callee.iframe.parentNode.removeChild(arguments.callee.iframe);
      }
      
      setTimeout(iframeKill, 2000);
      iframeKill.iframe = iframe;
      iframeKill.iframeNotify = iframeNotify;
      
      iframe.src = uri;
      iframe.style.position = 'absolute';
      iframe.style.left = -9999;
      doc.body.appendChild(iframe);
    } else {
      /*
        It's okay to do nothing if there are refresh tags on the actual page,
        since both WA and the original content will forward.  If the destination 
        page is blocked, it will be detected there.
      */
      //alert('some refresh tags on the WA page');
    }
  };
	
	this.oncePerDocument = function(doc) {
		this.checkImages(doc);
		this.checkMeta(doc);

		if(this._loadCount == -1){
		  document.getElementById('content_frame').addEventListener('load', WA.Extensions.FilterDetect._onFrameLoad, false);
		  this._loadCount = 0;
	  }
	};
};

WA.Extensions.FilterDetect.blockedInfoPage = top.webanywhere_url + '/scripts/extensions/blocked.html';
WA.Extensions.FilterDetect._onFrameLoad = function(){
  WA.Extensions.FilterDetect.instance._loadCount++;
}

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		  m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		  uri = {},
		  i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

(function() {
  var detector = new WA.Extensions.FilterDetect();

  // Add this extension to the general list of extensions.
  WA.Extensions.extensionList.push(detector);
  WA.Extensions.oncePerDocument.push(detector);
})();