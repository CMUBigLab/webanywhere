/* base64.js
 *
 * Contains functions for converting to and from base64 encoding,
 * which is what the web proxy uses by default.
 * 
 * encode64() encodes, and decode64() decodes.
 * 
 * Depends on utils.js, WA.Utils.
 * 
 * This code was originally written by Tyler Akins and has been placed in the
 * public domain.  It would be nice if you left this header intact.
 * Base64 code from Tyler Akins -- http://rumkin.com
 */

WA.Utils.Base64 = {
  // String used by the encoding/decoding functions.
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  
  // Encodes the input string and returns in base64.
  encode64: function(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
  
    do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
  
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
  
      if(isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if(isNaN(chr3)) {
        enc4 = 64;
      }
  
      output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + 
      this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    } while (i < input.length);
  
    return output;
  },

  // Decode base64 encoded string, and returns the result.
  decode64: function(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    // Remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    var fcc = String.fromCharCode;

    do {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
  
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
  
      output = output + fcc(chr1);
  
      if(enc3 != 64) {
        output = output + fcc(chr2);
      }
      if(enc4 != 64) {
        output = output + fcc(chr3);
      }
    } while (i < input.length);
  
    return output;
  }
}