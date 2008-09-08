/*
 * Autocomplete Off Node Preprocessor.
 * /extensions/autocomplete-off-node-preprocessor.js
 *
 * An extension for pre-processing nodes so that autocomplete is turned for
 * web forms, thus preventing one type of annoying pop-up.
 *
 */

WA.Extensions.AutocompleteOffNodePreprocessor = function() {
  /**
   * preprocess
   * LabelFor preprocesses "LABEL" nodes by adding a label to the node that they
   * specify the label for.
   * @param node Node to be pre-processed.
   */
  this.preprocess = function(node) {
    if(node.nodeName == "FORM") {
      node.setAttribute('autocomplete', 'off');
    }
  }
};

// Add this extension to the node preprocessor extensions.
WA.Extensions.nodePreprocessors.push(new WA.Extensions.AutocompleteOffNodePreprocessor());