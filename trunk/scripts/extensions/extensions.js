/**
 * /extensions/extensions.js
 * 
 * Place where extension options are registered.
 *
 */

WA.Extensions = {
  // Objects used to spotlight the current node.
  // Expected to expose the following interface:
  // obj.spotlight(node)
  nodeSpotlighters: new Array(),

  // Objects used to preprocess nodes when a page loads.
  // Expected to expose the following interface:
  // obj.preprocess(node)
  nodePreprocessors: new Array(),

  // Functions to be executed once at the load of each document.
  oncePerDocument: new Array(),

  /**
   * SpotlightNodes:
   * Applies spotlighters to the supplied node.
   * @param node Node to be spotlighted.
   */
  spotlightNode: function(node) {
    // Call the spotlight member function on each defined spotlighter extension.
    var num = this.nodeSpotlighters.length;
    for(var i=0; i<num; i++) {
    	this.nodeSpotlighters[i].spotlight(node);
    }
  },

  /**
   * runOncePerDocument:
   * Runs functions that are to be executed once per each document load.
   * @param doc DocumentElement that is to be processed.
   */
  runOncePerDocument: function(doc) {
    // Call the oncePerDocument member function on each defined object.
    var num = this.oncePerDocument.length;
    for(var i=0; i<num; i++) {
      this.oncePerDocument[i].oncePerDocument(doc);
    }    
  },

  /**
   * preprocessNodes:
   * Pre-processes nodes upon page load.
   * @param node Node to be pre-processed.
   */
  preprocessNode: function(node) {
    // Call the spotlight member function on each defined spotlighter extension.
    var num = this.nodePreprocessors.length;
     //WA.Utils.log('Number of preprocessors '+num);
    for(var i=0; i<num; i++) {
      this.nodePreprocessors[i].preprocess(node);
    }
  },

  resetExtensions: function() {
  	var num = this.nodeSpotlighters.length;
  	for(var i=0; i<num; i++) {
      this.nodeSpotlighters[i].reset();
  	}
  }
}