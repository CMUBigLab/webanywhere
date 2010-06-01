/*
 * Visual Spotlighter Extension.
 * /extensions/visual-spotlighter.js
 *
 * An extension for visually spotlighting a given node.
 */

WA.Extensions.VisualSpotlighter = function() {
  /**
   * Spotlight the supplied node.
   * @param node Node to be spotlighted.  node=null unspotlights.
   */
  this.spotlight = function(node) {
    var self = this;

    if(this._nodeRecords != null && this._nodeRecords.length > 0) {
      // Unspotlight the last node, then store this node.
      this.unspotlight();
    }

    if(node == null) return;

    if(node.nodeType != 1 || node.nodeName == "OPTION") {
      node = node.parentNode;
    }

    this._nodeRecords = new Array();

    if(node.nodeName == "A") {
	    WA.Nodes.depthFirstVisitor(
	      // First node to visit.
	      node,
	      // Visitor function called for each node.
	      function(node) {
	      	self._processNode(node);  
	      },
	      // isLeaf function.
		    function(node) {
		    	return (!node || node.nodeType != 1);
		    }
	    )
    } else {
    	this._processNode(node);
    }

    // Label any nodes associated with this one, specifically nodes
    // that serve as this node's label.
    if(WA.Nodes.hasAttribute(node, 'assoc_id')) {
      var assocNode = node.ownerDocument.getElementById(node.getAttribute('assoc_id'));
      this._processNode(assocNode);
    }
  };

  /**
   * Highlight the specified node and store its original style in a
   * constructed NodeRecord.
   * @param node Node to style and store.
   */
  this._processNode = function(node) {
    this._nodeRecords.push(new this.NodeRecord(node));

    if((node.className + "").length > 0) {
      node.className = "wahighlight " + node.className;
    } else {
    	node.className = "wahighlight";
    }
    
    if(WA.Extensions.WebTrax){
      if(node){
        WA.Extensions.WebTrax.trace.push({node: node});
        WA.Extensions.WebTrax.currentHLNode = node;
      }
    }
  },

  /**
   * Remove spotlighting from supplied node.
   */
  this.unspotlight = function() {
    var nodes = this._nodeRecords;
  	for(var i=0; i<nodes.length; i++) {
    	nodes[i].restore();
  	}
  };

  /**
   * Reset the spotlight.
   */
  this.reset = function() {
    // Jeff: commented out because IE complains if node is no longer loaded.
    /*if(this._nodeRecords) {
    	this.unspotlight();
    }*/
  	this._nodeRecords = new Array();
  };

  /**
   * A class representing the current style of a node.
   * @param node The node for which the current style will be stored.
   */
  this.NodeRecord = function(node) {
    this._node = node;

    // Store the node's current class in order to restore it later.
    if((node.className + "").length > 0) {
      this._className = node.className;
    }

    /**
     * Restore the original style of the node.
     */
    this.restore = function() {
    	if(this._node) {
            this._node.className = this._className;
    	}
    }
  };

  /**
   * Adds the CSS class used for highlighting.
   * @param doc Document to have the CSS style tag added to it.
   * @param docs Array of documents to have the CSS style tag added to each of them.
   */
  //this.oncePerDocument = function(doc) {
  this.oncePerDocument = function(docs) {
          
    // Avoid highlighting nodes no longer in existence.
    this._nodeRecords = null;

  	/* var styleNode = doc.createElement('div');
    // Funky way of adding style required to make this work with IE.
    styleNode.innerHTML =
      "<p>&nbsp;</p>" +
      "<style>" +
      ".wahighlight {-moz-border-radius: 2px; border-color: #FF0 !important; color: #FF0 !important; background-color: #000 !important;}" +
      "a.wahighlight {color: #FF0 !important;}" +
      "</style>";
    doc.body.appendChild(styleNode); */
    
      
    // Add the style to each document. If no iframes, then should only add
    // this to the base document.
    for(var i=0; i<nDocuments.length; i++) {
      var styleNode = docs[i].createElement('div');
      // Funky way of adding style required to make this work with IE.
      styleNode.innerHTML =
          "<p>&nbsp;</p>" +
          "<style>" +
          ".wahighlight {-moz-border-radius: 2px; border-color: #FF0 !important; color: #FF0 !important; background-color: #000 !important;}" +
          "a.wahighlight {color: #FF0 !important;}" +
          "</style>";
      docs[i].body.appendChild(styleNode);
     }
   } 
    
  //};
};

// Initialize the visual spotlighter and add it to the extensions
// that will be executed.  Run from anonymous function to avoid polluting
// the namespace.
(function() {
  var newVS = new WA.Extensions.VisualSpotlighter();

  // Add this extension to the node spotlighter extensions.
  WA.Extensions.nodeSpotlighters.push(newVS);

  // Add the function to add the style tag to each document to the list of
  // functions called for each document.
  WA.Extensions.oncePerDocument.push(newVS);

  // Add this extension to the general list of extensions.
  WA.Extensions.extensionList.push(newVS);
})();