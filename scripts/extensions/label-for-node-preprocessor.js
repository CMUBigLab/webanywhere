/*
 * Label For Node Preprocessor.
 * /extensions/label-for-node-preprocessor.js
 *
 * An extension for pre-processing nodes so that .
 *
 */

WA.Extensions.LabelForNodePreprocessor = function() {
  /**
   * preprocess
   * LabelFor preprocesses "LABEL" nodes by adding a label to the node that they
   * specify the label for.
   * @param node Node to be pre-processed.
   */
  this.preprocess = function(node) {
	  if(node.nodeName == "LABEL") {
      var for_id = node.getAttribute('for');
      if(for_id) {
        var id_elem = node.ownerDocument.getElementById(for_id);
        if(id_elem) {
          id_elem.setAttribute('my_label', WA.Nodes.handleChildNodes(node));
          if(!node.id) {
          	node.setAttribute('id', for_id + "_backref");
          }
          id_elem.setAttribute('assoc_id', node.id);
        }
      }
    }
  };

  this.cleanUp = function() {};
};

// Add this extension to the node preprocessor extensions.
WA.Extensions.nodePreprocessors.push(new WA.Extensions.LabelForNodePreprocessor());