/*
 * Tab Index Preprocessor.
 * /extensions/inpage-link-preprocessor.js
 *
 * An extension for pre-processing nodes to handle tab indexes.
 *
 */

WA.Extensions.TabIndexExtension = function() {
  /**
   * preprocess
   * tab index info.
   * @param node Node to be pre-processed.
   */
  this.preprocess = function(node) {
  	if(node && WA.Nodes.isFocusable(node)) {
  		var tabindex = node.getAttribute('tabindex');

      // Only elements with tabindex > 0 cause something different to happen.
      if(tabindex && tabindex > 0) {
      	if(tabindex > this.tabIndexMap.length) {
      		for(var i=this.tabIndexMap.length; i<tabindex; i++) {
      			this.tabIndexMap[i] = null;
      		}
      	}
      	this.tabIndexMap[tabindex] = node;
      	WA.Utils.log('mapped ' + tabindex + " to " + node);
      }
  	}
  };

  // A map from tab index to 
  this.tabIndexMap = new Array(null);

  this.setLastFocused = function(num) {
  	this.lastFocused = parseInt(num);
  }

  // The last focused node.
  this.lastFocused = 0;

  // Clean up resources, reset.
  this.reset = function() {
  	//this.tabIndexMap = new Array(null);
  	this.setLastFocused(0);
  }

  // Record the tabindex of this node if it has one.
  this.spotlight = function(node) {
    /*if(node && node.getAttribute) {
    	var tabindex = node.getAttribute('tabindex');
    	if(tabindex) {
    		this.lastFocused = tabindex;
    	}
    }*/
  }

  // Record the tabindex of this node if it has one.
  this.recordTabIndex = function(node) {
    if(node && node.getAttribute) {
      var tabindex = node.getAttribute('tabindex');
      if(tabindex) {
      	WA.Utils.log("updating tabindex to: " + tabindex);
        this.setLastFocused(tabindex);
      }
    }
  }

  this.getPrevNode = function() {
    WA.Utils.log(this.lastFocused + " " + this.tabIndexMap.length);
    for(var i=this.lastFocused-1; i>0; i--) {
      WA.Utils.log(i + "  " + this.tabIndexMap[i]);
      if(this.tabIndexMap[i] != null) {
        this.lastFocused = this.tabIndexMap[i];
        return this.tabIndexMap[i];
      }
    }

    return null;
  }

  this.inMiddle = function() {
  	return (this.lastFocused > 0 && this.lastFocused < this.tabIndexMap.length-1);
  }

  this.getNextNode = function() {
  	if(this.resetToHomeNext) {
  		WA.Utils.log("resetting to home");
  		setCurrentNode(getFirstContent());
  		nextNode();
  		this.resetToHomeNext = false;
  	}

    WA.Utils.log(this.lastFocused + " " + this.tabIndexMap.length);
  	for(var i=this.lastFocused+1; i<this.tabIndexMap.length; i++) {
      WA.Utils.log(i + "  " + this.tabIndexMap[i]);
      if(i>=this.tabIndexMap.length-1) {
        WA.Utils.log("RESET NEXT");
        this.resetToHomeNext = true;
      } else {
        WA.Utils.log("NO RESET NEXT");      	
      }
  		if(this.tabIndexMap[i] != null) {
  		  this.setLastFocused(i);
  		  return this.tabIndexMap[i];
  		}
  	}

    return null;
  }

  this.resetToHomeNext = false;
};

// Create this extension &
// add to the node preprocessor & spotlighter extensions.
var tabIndexExt = new WA.Extensions.TabIndexExtension();
WA.Extensions.nodePreprocessors.push(tabIndexExt);
WA.Extensions.nodeSpotlighters.push(tabIndexExt);