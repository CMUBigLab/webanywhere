WA.Extensions.WebTrax = function() {
  arguments.callee._paths = [];
  arguments.callee._webtrax = [];
  arguments.callee.recordMode = 'trail'; // can also be 'heatmap'
  arguments.callee.trace = [];
  arguments.callee.instance = this;
  arguments.callee.pagenum = 0;
  arguments.callee.pageStart = new Date().getTime();
  arguments.callee.random = Math.floor(Math.random() * 1000);
  arguments.callee.recordQueue = [];
  
	this.showHeatmap = function(){
	  alert('heatmap');
    var doc = document;
    
    var frame = doc.getElementById('content_frame');
    var fdoc = frame.contentDocument;
    var div = fdoc.createElement('div');
    
    div.id = 'flashLayer';
    div.position = 'absolute';
    div.innerHTML = 'testInnerHTML';
    fdoc.body.appendChild(div);
    div.y = 0;
    div.style.top = 0;
    
    var attrs = { 
      id: 'flash',
      data: top.webanywhere_url + '/scripts/extensions/flash/Layer.swf?' + Math.random(), 
      width: fdoc.body.getClientRects()[0].width.toString() + ' px', 
      height: fdoc.body.getClientRects()[0].height.toString() + ' px',
      wmode: 'transparent',
      allowScriptAccess: 'sameDomain'
    };
    swfobject.createSWF(attrs, {}, div);
    
    var fl = fdoc.getElementById('flash');
    window.fl = fl; // for debug convenience
    fl.style.position = 'absolute';
    fl.style.top = '0px';
    fl.style.zIndex = 999;
    
    WA.Extensions.WebTrax.removeFlash = function(){
      //alert('removeFlash');
      fl.parentNode.removeChild(fl);
    }
    
    if(this._heatpoints){
      //alert('passing heatmap points to flash: ' + this._heatpoints.length);
      WA.Extensions.WebTrax.heatpoints = this._heatpoints;
      setTimeout(function(){ fl.invoke('heatmap', WA.Extensions.WebTrax.heatpoints, WA.Extensions.WebTrax.trace.numPages); }, 500);
    }
  };
  
  this.showTrail = function(){
    alert('trail');
    var doc = document.getElementById('content_frame').contentDocument;
    for(var i = 0; i < WA.Extensions.WebTrax.trace.length; i++){
      var node = WA.Extensions.WebTrax.trace[i].node;
      ////alert('webtrax node: ' + node + ', style: ' + ((node && node.style) ? node.style : 'nope'));
      if(node && node.style){
        
        var r = 255;
        var gb = 192;
        var gb_border = 192;
        var progress = Math.round(Math.pow(i / WA.Extensions.WebTrax.trace.length, 3) * 192);
        var progress_border = Math.round((i / WA.Extensions.WebTrax.trace.length) * 192);
        gb -= progress;
        gb_border -= progress_border;
        gb = gb.toString(16);
        if(gb.length == 1){
          gb = '0' + gb;
        }
        gb_border = gb_border.toString(16);
        if(gb_border.length == 1){
          gb_border = '0' + gb_border;
        }
        
        var bgColor = '#' + r.toString(16) + gb + gb;
        var borderColor = '#' + r.toString(16) + gb_border + gb_border;
        
        if(node.nodeName == 'P' || node.nodeName == 'UL' || node.nodeName == 'OL' || node.nodeName == '__DIV'){ // don't highlight these because they overshadow the inner spans
          ////alert('skipping nodetype ' + node.nodeName);
        } else if(node.nodeName != 'SPAN'){
          //node.style.backgroundColor = 0x0000ff;
          var div = doc.createElement('div');
          var extraPadding = 15;
          doc.body.appendChild(div);
  
          div.style.position = 'absolute';
          div.style.backgroundColor = bgColor;
          div.style.width = (node.offsetWidth + extraPadding * 2) + 'px';
          div.style.height = (node.offsetHeight + extraPadding * 2) + 'px';
          div.style.zIndex = '90';
          
          div.style.borderStyle = 'solid';
          div.style.borderWidth = '3px';
          div.style.borderColor = borderColor;

          div.style.opacity = 0.6 * (i / WA.Extensions.WebTrax.trace.length) + 0.2;
          //node.style.backgroundColor = 0x00ff00;
  
          try {
            var pos = WA.Utils.findPos(node);
            div.style.left = (pos[0] - extraPadding) + 'px';
            div.style.top = (pos[1] - extraPadding) + 'px';
          } catch(err){
            ////alert('died on ' + node);
          }
        } else { // it's a span element
        
          node.style.backgroundColor = bgColor;
          node.style.borderColor = borderColor;
        }
      }
    }
  };
  
  this.showAggregateHeatmap = function(xpathArrays){
    alert('showing aggregate map, ' + xpathArrays.length + ' visits. ');
    
    var aggregatePoints = [];
    var numPages = 0;
    
    var prevSession = '';
    var prevPagenum = -1;
    
    for(var i = 0; i < xpathArrays.length; i++){
      var xpath = xpathArrays[i].xpath;
      //alert('xpath: ' + i + '/' + xpathArrays.length + ': ' + xpath + ', completeness: '  + xpathArrays[i].completeness);
      var elems = document.getElementById('content_frame').contentDocument.evaluate(xpath, document.getElementById('content_frame').contentDocument, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
      
      var sessionid = xpathArrays[i].sessionid;
      var pagenum = xpathArrays[i].pagenum;
      
      if(pagenum != prevPagenum && sessionid == prevSession){
        numPages++;
        prevPagenum = pagenum;
      }
      
      if(sessionid != prevSession){
        numPages++;
        prevSession = sessionid;
        prevPagenum = pagenum;
      }
      
      for(var j = 0; j < elems.snapshotLength; j++){
        var elem = elems.snapshotItem(j);
        //alert('got result: ' + elem );
        break;
        /* need to do something similar to the original heatmap, where <span/>s are 
           handled separately, but those and all other elements have their position 
           determined by getClientRect(s) or some similar method. 
           
           also need to add some new fields to the database:
              - percent
              - action: "click", type, read, etc.
              * duration: getTimer() - getTimerWhenPageLoaded (optional)
        */
        
        
      }
      
      if(elem){
        // this object should match the object that is passed into the regular 
        // WebTrax array (an element and a percent-read)
        var completeness = parseFloat(xpathArrays[i].completeness);
        aggregatePoints.push({
          node: elem,
          partial: true,
          percent: completeness
        });
      }
      
    }
    
    alert('got this many page visits: ' + numPages + ', this many elems: ' + aggregatePoints.length);
    aggregatePoints.numPages = numPages;
    WA.Extensions.WebTrax.trace = aggregatePoints;
    WA.Extensions.WebTrax.recordMode = 'heatmap';
    WA.Extensions.WebTrax.instance.visualizeRecordings(getContentDocument());
    
    /*
      next: 
        - take xpath array and convert each xpath into (x, y) coordinates on the current page
        - test or rework heatmap code so that it weights these visits properly
        - pass coordinates to heatmap code and generate heatmap.... this probably won't use 
          exactly the same code as before
    */
  }
  
  this.calculateHeatmap = function(){
    var pointSpacing = 40; // in pixels, #px between heatpoints, horizontally, in a span or what not
    this._heatpoints = [];
    
    var recordInfos = [];
    
    for(var i = 0; i < WA.Extensions.WebTrax.trace.length; i++){
      var node = WA.Extensions.WebTrax.trace[i].node;
      var obj = WA.Extensions.WebTrax.trace[i];
      var len;
      var j, k;
      
      var percentFill = 0;
      if(obj.partial){
        percentFill = obj.percent;
      } else {
        percentFill = 0;
      }
      
      if(node && node.style){
        // out of date (10.17.10)
        recordInfos.push({
          uri: WA.Interface.getURLFromProxiedDoc(document.getElementById('content_frame').contentDocument),
          xpath: WA.Utils.getXPath(node),
          completeness: percentFill,
          sessionid: top.sessionid + WA.Extensions.WebTrax.random.toString(),
          pagenum: WA.Extensions.WebTrax.pagenum
        });
        
        if(node.id == 'always_first_node'){
          continue; // this one is causing problems
        }
        
        if(node.nodeName == 'P' || node.nodeName == 'UL' || node.nodeName == 'OL' || node.nodeName == '__DDIV'){
          ////alert('skipping elementType: ' + node.nodeName);
        } else if(node.nodeName == 'SPAN') {
          try {
            var pos = WA.Utils.findPos(node);
            //this._heatpoints.push({x: pos[0], y: pos[1]});
            
            var lineRects = node.getClientRects();
            var numLines = lineRects.length;
            var totalWidth = 0;
            for(j = 0; j < numLines; j++){
              var rect = lineRects[j];
              totalWidth += rect.width;
            }
            
            
            // need to loop twice because we don't know the total width until all have been summed
           
            var widthSoFar = 0;
            for(j = 0; j < numLines; j++){
              rect = lineRects[j];
              widthSoFar += rect.width;
              
              if(widthSoFar / totalWidth <= percentFill){ // this rect was completely read
				        widthSoFar -= rect.width;
                len = Math.floor(rect.width / pointSpacing);
                for(k = 0; k < len; k++){
				          //alert('heat: ' + ((widthSoFar + pointSpacing * (k / len)) / totalWidth ));
                  this._heatpoints.push({ x: rect.left + ((k * pointSpacing)), y: rect.top + (rect.height / 2), heat: ((widthSoFar + pointSpacing * (k / len)) / totalWidth ) });
                }
                widthSoFar += rect.width
              } else {
                if((widthSoFar - rect.width) / totalWidth < percentFill){
                  // then this rect contains a partial amount of read-ness
                  var percentRectRead = percentFill - ((widthSoFar - rect.width) / totalWidth);
                  var widthToFill = percentRectRead * totalWidth;
                  for(k = 0; k < Math.floor(widthToFill / pointSpacing); k++){
                    this._heatpoints.push({ x: rect.left + ((k * pointSpacing)), y: rect.top + (rect.height / 2), heat: (totalWidth - (widthSoFar + widthToFill * k)) / totalWidth });
                  }
                } else {
                  // this part was not read at all, by our estimation
                }
              }
            }
          } catch(err){
            ////alert('died on ' + node);
          }
        } else { // any element other than a span or ones that aren't being heatmapped
          try {
            var pos = WA.Utils.findPos(node);
            this._heatpoints.push({x: pos[0], y: pos[1]});
            
            var readableChildren = false;
            var hasReadableChildren = function(node){
							if(!node) return false;
              if(['A', 'SPAN'].indexOf(node.nodeName) > -1){
                return true;
              }
              if(node.childNodes && node.childNodes.length > 0){
                for(k = 0; k < node.childNodes.length; k++){
                  if(arguments.callee(node.childNodes[k])){
                    return true;
                  }
                }
              }
            }
            
            for(k = 0; k < node.childNodes.length; k++){
              if(hasReadableChildren(node.childNodes[i])){
                readableChildren = true;
              }
            }
            
            if(readableChildren){
              throw new Error(); // just to escape this loop iteration... 'continue' may work
            }
            
            var rect = node.getBoundingClientRect();              
            len = Math.floor((rect.width * percentFill) / pointSpacing);
            for(k = 0; k < len; k++){
              this._heatpoints.push({ x: rect.left + ((k * pointSpacing)), y: rect.top + (rect.height / 2), heat: Number(len - k) / len });
            }
          } catch(err){
            ////alert('died on ' + node);
          }
        }
      }
    }
    
    // send path info to database, only if this is the ctrl+2 non-aggregate version
    if(!WA.Extensions.WebTrax.trace.numPages){
      for(i = 0; i < recordInfos.length; i++){
        WA.Utils.postURL('/wa/webtrax-record.php', 'json=' + encodeURIComponent(JSON.stringify(recordInfos[i])), function(e){ });
      }
    }
    
    this.showHeatmap();
  }
  
  this.visualizeRecordings = function(doc){
    //alert('WA.Extensions.WebTrax.trace.length?: ' + WA.Extensions.WebTrax.trace.length);
    if(WA.Extensions.WebTrax.recordMode == 'trail'){
      this.showTrail();
    } else if(WA.Extensions.WebTrax.recordMode == 'heatmap'){
      this.calculateHeatmap();
    }
  };
  
  this.spotlight = function(node) {
    //WA.Extensions.WebTrax.trace2.push({ node: node });
  };
  
  this.soundFinished = function(sid, percent){
    //WA.Extensions.WebTrax.trace.push([WA.Extensions.RecorderExtension._lastSpotlight, percent]);
    
    if(true || WA.Extensions.WebTrax.recordMode == 'heatmap'){
      var i = 0;
      for(i = 0; i < WA.Extensions.WebTrax.trace.length; i++){
        var cur = WA.Extensions.WebTrax.trace[i];
        if(cur.node == WA.Extensions.WebTrax.currentHLNode){
          //alert('matching finished node, ' + percent);
          cur.partial = true;
          cur.percent = percent;
          
          // send node info to DB

          var percentFill = 0;
          if(cur.partial){
            percentFill = percent;
          } else {
            percentFill = 0;
          }

          if(cur.node){
            
            var rect;
            if(cur.node.nodeName == 'SPAN'){
              rect = cur.node.getClientRects()[0];
            } else {
              rect = cur.node.getBoundingClientRect();
            }
            
            var contentDoc = document.getElementById('content_frame').contentDocument;
            contentDoc = contentDoc ? contentDoc : document.frames['content_frame'].document;
            
            WA.Extensions.WebTrax.recordQueue.push({
              uri: WA.Interface.getURLFromProxiedDoc(contentDoc),
              xpath: WA.Utils.getXPath(cur.node),
              completeness: percentFill,
              sessionid: top.sessionid + WA.Extensions.WebTrax.random.toString(),
              time: (new Date().getTime() - WA.Extensions.WebTrax.pageStart),
              type: 'readElement',
              keycode: 0,
              text: cur.node.textContent,
              x: parseInt(rect.left),
              y: parseInt(rect.top),
              width: parseInt(rect.width),
              height: parseInt(rect.height),
              pagenum: WA.Extensions.WebTrax.pagenum
            });
            
            if(WA.Extensions.WebTrax.recordQueue.length >= 5){
              this.sendQueue();
            }
            
          }
        }
      }
    }
  };
  
  this.sendQueue = function(){
    var queue = WA.Extensions.WebTrax.recordQueue;
    if(queue.length > 0){
      WA.Utils.postURL('webtrax-record.php', 'json=' + encodeURIComponent(JSON.stringify(queue)), function(e){ });
      WA.Extensions.WebTrax.recordQueue = [];
    }
  };
  arguments.callee.interval = setInterval(this.sendQueue, 15000);
  
  this.keyPress = function(e, target, key_string, source){
    var type = 'keypress';
    var text = '';
    if(target){
      var path = WA.Utils.getXPath(target);
      if(target.ownerDocument == document){
        type = 'interfaceKeypress';
      }
      
      var rect;
      if(target.nodeName == 'SPAN'){
        rect = target.getClientRects()[0];
      } else {
        rect = target.getBoundingClientRect();
      }
      
    } else {
      path = null;
      rect = { top: 0, left: 0, width: 0, height: 0 };
    }
    
    var contentDoc = document.getElementById('content_frame').contentDocument;
    contentDoc = contentDoc ? contentDoc : document.frames['content_frame'].document;
    
    WA.Extensions.WebTrax.recordQueue.push({
      uri: WA.Interface.getURLFromProxiedDoc(contentDoc),
      xpath: path,
      completeness: 0,
      sessionid: top.sessionid + WA.Extensions.WebTrax.random.toString(),
      time: (new Date().getTime() - WA.Extensions.WebTrax.pageStart),
      type: type,
      keycode: key_string,
      text: text,
      x: parseInt(rect.left),
      y: parseInt(rect.top),
      width: parseInt(rect.width),
      height: parseInt(rect.height),
      pagenum: WA.Extensions.WebTrax.pagenum
    });
    
    if(WA.Extensions.WebTrax.recordQueue.length >= 10){
      this.sendQueue();
    }
  }
  
  this.oncePerDocument = function(doc){
    WA.Extensions.WebTrax.pagenum++;
    WA.Extensions.WebTrax.pageStart = new Date().getTime();
  }
  
};


(function() {
  var trax = new WA.Extensions.WebTrax();
  
  WA.Extensions.nodeSpotlighters.push(trax);
  WA.Extensions.soundFinishers.push(trax);
  WA.Extensions.oncePerDocument.push(trax);
  
  // Add this extension to the general list of extensions.
  WA.Extensions.extensionList.push(trax);
})();