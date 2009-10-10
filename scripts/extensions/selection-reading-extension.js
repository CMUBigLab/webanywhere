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
    // Stop WebAnywhere from reading new nodes, remove any current spotlights,
    // and empty the sound queue.
    WA.Sound.silenceAll();
    WA.Extensions.spotlightNode(null);
  };

  this.oncePerDocument = function(doc) {
    WA.Utils.log("ATTACHING MOUSEUP HANDLER");
    var self = this;

    if(doc.attachEvent) doc.attachEvent('onmouseup', function() {self.handleMouseUp(doc); });
    else if(doc.addEventListener) doc.addEventListener('mouseup', function() {self.handleMouseUp(doc); }, false);

    if(doc.attachEvent) doc.attachEvent('onmousedown', function() {self.handleMouseDown(doc); });
    else if(doc.addEventListener) doc.addEventListener('mousedown', function() {self.handleMouseDown(doc); }, false);
  };
}

var selectionExtension = new WA.Extensions.SelectionReadingExtension();
WA.Extensions.oncePerDocument.push(selectionExtension);