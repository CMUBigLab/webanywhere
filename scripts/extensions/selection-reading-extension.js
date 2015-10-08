/**
 * Recorder Extension.
 * /extensions/selection-reading-extension.js
 * 
 **/

WA.Extensions.SelectionReadingExtension = function() {
  this.handleMouseUp = function(doc) {
    var text = WA.Utils.trim(WA.Utils.getSelection(doc));
    if(text.length > 0) {
      // Speak the text.
      WA.Sound.resetSounds();
      WA.Sound.addSound(text);
    }
  };

  this.handleMouseDown = function(doc) {
    var cdim = WA.Utils.contentWidthHeight(top);
    // Stop WebAnywhere from reading new nodes, remove any current spotlights,
    // and empty the sound queue.
    WA.Sound.silenceAll();
    WA.Extensions.spotlightNode(null);
  };

  this.oncePerDocument = function(doc) {
    WA.Utils.log("ATTACHING MOUSEUP HANDLER");
    var self = this;
    //The reference to the document doesn't seem to exist
    //Get a new reference in order to set up the event listeners
    var doc = getContentDocument();
    if(doc.attachEvent) doc.body.attachEvent('onmouseup', function() {self.handleMouseUp(doc); });
    else if(doc.addEventListener) doc.body.addEventListener('mouseup', function() {self.handleMouseUp(doc); }, false);
    if(doc.attachEvent) doc.body.attachEvent('onmousedown', function() {self.handleMouseDown(doc); });
    else if(doc.addEventListener) doc.body.addEventListener('mousedown', function() {self.handleMouseDown(doc); }, false);
  };
};


//Run from anonymous function to avoid polluting the namespace.
(function() {
  var selectionExtension = new WA.Extensions.SelectionReadingExtension();
  WA.Extensions.oncePerDocument.push(selectionExtension);
})();

