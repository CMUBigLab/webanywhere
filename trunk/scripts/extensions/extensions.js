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

  // Functions to run when the nothing is playing.
  waitingForPauses: new Array(),

  // Functions that need to be called periodically.
  periodicFunctions: new Array(),

  // List of all extensions.
  extensionList: new Array(),

  callPeriodics: function() {
    // Call the functions that are to be called periodically.
    var num = WA.Extensions.periodicFunctions.length;
    WA.Utils.log(num + "PERIODICS");
    for(var i=0; i<num; i++) {
      WA.Extensions.periodicFunctions[i].runPeriodic();
    }
  },

  // Are there actions waiting to be completed during pauses?
  actionsWaiting: function() {
    var num = this.waitingForPauses.length;
    for(var i=0; i<num; i++) {
      if(this.waitingForPauses[i].actionsWaiting()) {
      	return true;
      }
    }
    return false;
  },

  runActionsWaiting: function() {
    var num = this.waitingForPauses.length;
    for(var i=0; i<num; i++) {
      this.waitingForPauses[i].playNext();
    }
  },

  // Functions that specify what will be read next.
  readNext: new Array(),

  // 
  actionsWaiting: function() {
    var num = this.waitingForPauses.length;
    for(var i=0; i<num; i++) {
      if(this.waitingForPauses[i].actionsWaiting()) {
        return true;
      }
    }
    return false;
  },
  



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
  	var num = this.extensionList.length;
  	for(var i=0; i<num; i++) {
  	  if(this.extensionList[i].reset) {
        this.extensionList[i].reset();
  	  }
  	}
  },

  runWaitingForPause: function() {
    var num = this.waitingForPauses.length;
    for(var i=0; i<num; i++) {
      this.waitingForPauses[i].run();
    }    
  }
}