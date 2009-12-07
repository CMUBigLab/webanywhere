/*
 * Recorder Extension.
 * /extensions/recorder-extension.js
 *
 * An extension for recording user actions.
 * 
 * Captures most API calls for anonymized recording.
 * Good place to look to see what API options are available.
 * 
 * Sends info specific to API call, along with session id and page id.
 */

WA.Extensions.RecorderExtension = function() {
  // Sequence number for this event.
  this._seq = 0;

  // Send anonymzed information about the event to the server to be recorded.
  this.recordEvent = function(params) {
    // Send info to be delay posted.
    WA.Utils.delayProxyPost(params);
  };

  // Record the spotlighter .
  this.spotlight = function(node) {
    var xpath = WA.Utils.getXPath(node);
    this.recordEvent("x(" + (this._seq++) + ")" + xpath);
  };

  // Record the current document load.
  this.oncePerDocument = function(doc) {
    this.recordEvent("l(" + (this._seq++) + ")" + WA.Interface.getURLFromProxiedDoc(doc));
  };

  // Record when a sound finishes.
  // We do not record the sid of the finishing sound.
  this.soundFinished = function(sid, percent) {
    this.recordEvent("sf(" + (this._seq++) + ")" + percent + "," + sid);
  };

  // Generic reset.
  this.reset = function() {};
};

// Add this extension to the list of extensions.
(function() {
  var recorderExtension = new WA.Extensions.RecorderExtension();

  WA.Extensions.oncePerDocument.push(recorderExtension);
  WA.Extensions.nodeSpotlighters.push(recorderExtension);
  WA.Extensions.soundFinishers.push(recorderExtension);

  WA.Extensions.extensionList.push(recorderExtension);
})();