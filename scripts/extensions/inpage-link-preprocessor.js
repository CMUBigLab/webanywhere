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
    if(node.nodeName == "A") {
      var href = node.getAttribute('href');
      if(/^#./.test(href)) {
        var self = this;
        var ref = href.substring(1);

        node.setAttribute('onclick', 'return false');

        WA.Utils.setListener(node, 'click', function() {
        	var targ_id = self._nameToId[ref];
        	if(targ_id) {
            var targ = node.ownerDocument.getElementById(targ_id);
            if(targ) {
            	WA.Utils.log('Skipping down to ');
              visit(targ, true);
              setCurrentNode(targ, true);
              setBrowseMode(WA.READ);
            }
            return false;
        	}
        });
      } else if(WA.Nodes.hasAttribute(node, 'name')) {
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