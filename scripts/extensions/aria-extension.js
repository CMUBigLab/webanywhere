// LIVE REGIONS
WA.Extensions.AriaExtension = function() {

  this.ARIANode = function(type, node) {
    this.type = type;
    this.node = node;
  };

  // List of ARIA records to check.
  this._ariaNodes = null;

  /**
   * Runs once per document.
   * @param doc Main document object.
   */
  this.oncePerDocument = function(doc) {}

  /**
   * Reinitializes the ARIA nodes array.
   */
  this.reset = function() {
    this._ariaNodes = new Array();
  }


  /**
   * Called periodically to poll the status of ARIA objects,
   * and respond appropriately based on the type of ARIA markup applied.
   */
  this.runPeriodic = function() {
    if(this._ariaNodes==null) return;

    WA.Utils.log(this._ariaNodes.length + " ARIA NODES");
    for(var i=0; i<this._ariaNodes.length; i++) {
      WA.Utils.log("TYPE: " + this._ariaNodes[i].type)
      switch(this._ariaNodes[i].type) {
        case "live":
          this._checkLive(this._ariaNodes[i]);
          break;
        default:
      }
    }
  },

  /**
   * Handles the periodic check of changes for live regions.
   * @param anode The ARIANode object for this node.
   */
  this._checkLive = function(anode) {
    var node = anode.node;
    var live = node.getAttribute('aria-live');
    if(live && live != null && live != "off") {
      WA.Utils.log(anode.value + " " +  node.innerHTML)
      if(anode.value != node.innerHTML) {
        WA.Utils.log("LIVE CHANGE");
        anode.value = node.innerHTML;

        // This will need to change based on the live politeness value.
        if(live == "rude") {
          WA.Sound.silenceAll();
        }
        WA.Sound.addSound(WA.Nodes.getTextContent(node));
      }
    } else {
      WA.Utils.log("NO LIVE CHANGE");
    }
  },

  /**
   * Looks for nodes that contain ARIA that needs to be periodically updated
   * and adds them to a queue.  Eventually, may need to add the idea of nodes
   * being added to the live DOM that need to be refreshed.
   * @param node Called for each node to preprocess.
   */
  this.preprocess = function(node) {
    if(node && node != null && node.nodeType == 1) {
      var live = node.getAttribute('aria-live');
      WA.Utils.log("PREPROCESSING ARIA NODE: " + live);

      if(live) {
        alert("found live!");
        var anode = new this.ARIANode("live", node);
        anode.value = node.innerHTML;
        anode.type = "live";

        // Add this ARIANode to the list for this document.
        this._ariaNodes.push(anode);
      }
    }
  }
};

(function(){
  var newAE = new WA.Extensions.AriaExtension();

  WA.Extensions.nodePreprocessors.push(newAE);
  WA.Extensions.periodicFunctions.push(newAE);
  WA.Extensions.extensionList.push(newAE);
})();