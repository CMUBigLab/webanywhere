/*
 * In-Page Link Preprocessor.
 * /extensions/inpage-link-preprocessor.js
 *
 * An extension for pre-processing nodes so that they can handle inpage links.
 *
 */

WA.Extensions.InPageLinkPreprocessor = function() {
  /**
   * preprocess
   * Adds appropriate onclicks
   * @param node Node to be pre-processed.
   */
  this.preprocess = function(node) {
  /* If the node is an "a" element, test if it is an in-page link */
            WA.Utils.log('inpage-link-preprocessor, preprocess, node value is: '+node.nodeValue+' nodeName is: '+node.nodeName);
    if(node.nodeName == "A") {
      var href = node.getAttribute('href');
      WA.Utils.log('inpage-link-preprocessor, href is: '+href);
      if(/^#./.test(href)) {
        var self = this;
        var ref = href.substring(1);
		WA.Utils.log('inpage-link-preprocessor, ref is: '+ref);
		
		/* If we have an in-page link, add an onclick element with false so that we handle the click action instead of the browser */
		/* trying to address the IE6 bug where it doesn't recognize return false. */
        node.setAttribute('onclick', 'if (window.event) event.returnValue=false; return false;');

        /* There are two ways to create targets of in-page links. One is to set the "name" attribute on an "a" element, the other is to set the "id" attribute on any element. */

        WA.Utils.setListener(node, 'click', function() {
          WA.Utils.log('inpage-link-preprocessor, setListener, node is: '+node+' nodeValue is: '+node.nodeValue);
            /* If the user has clicked on an in-page link, we need to make the target node the current node. The first step is to see which kind of target we're linking to. If it's an "a" element with a "name" attribute, self._nameToId will exist and "targ_id" will be set to the value we assigned it during the preprocessing. */
        	var targ_id = self._nameToId[ref];
        	
        	/* If targ_id is undefined, the target was created with an "id" attribute, set targ_id to ref */
        	if(!targ_id) {
        	  targ_id = ref;
        	}
        	
        	/* We should have a value for targ_id. If we do, find the element with that id, make it the current node, and start reading from there. */
        	if(targ_id) {
            var targ = node.ownerDocument.getElementById(targ_id);
              if(targ) {
                visit(targ, true);
                setCurrentNode(targ, true);
                setBrowseMode(WA.READ);
              }
            return false;
        	}
        });
      } /* If we have an "a" element with a "name" attribute, create and assign it a unique id. Store the id in ._nameToId */
      else if(WA.Nodes.hasAttribute(node, 'name')) {
        var node_name = node.getAttribute('name');
        if(node_name != null && node_name != "") {
					if(!node.id) {
					  node.setAttribute('id', node_name + '_wa_id');
					}
					this._nameToId[node_name] = node.id;
        }
      }
    }
  };

  this.cleanUp = function() {
  	this._nameToId = new Object();
  }

  this._nameToId = new Object();
};

// Add this extension to the node preprocessor extensions.
WA.Extensions.nodePreprocessors.push(new WA.Extensions.InPageLinkPreprocessor());