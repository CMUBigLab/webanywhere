/*
 * sound_embed.js
 * 
 * Functions for playing sounds using embedded sound players like
 * Windows Media Player, Quicktime, etc.
 * 
 */

// Create the EmbedSound namespace.
var EmbedSound = new Object();

// Redirect to the embedded sound version of this page.
EmbedSound.doEmbedSounds = function() {
  getNavigationDocument().location = "browser.php?embed=true";	
}

// Play a sound using the embedded player.
EmbedSound._playSound = function(url) {
  var doc = getNavigationDocument();
  if(doc) {
    var play = document.getElementById('webanywhere_embed');
    if(!play) {
      play = document.createElement('div');
      play.setAttribute('id', 'webanywhere_embed');
      document.body.appendChild(play);
    }

    play.innerHTML = "<object classid=\"clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B\" codebase=\"http://www.apple.com/qtactivex/qtplugin.cab\" height=\"16\" width=\"250\"><param name=\"src\" value=\"" + url + "\"><param name=\"autoplay\" value=\"true\"><param name=\"controller\" value=\"false\"><embed height=\"0\" width=\"0\" src=\"" + url + "\" pluginspage=\"http://www.apple.com/quicktime/download/\" type=\"video/quicktime\" controller=\"false\" autoplay=\"true\">";
  }
}

// Stop sounds being played with the embedded player.
EmbedSound.stopSounds = function() {
  var doc = getNavigationDocument();
  if(doc) {
    var play = document.getElementById('webanywhere_embed');
    if(play) {
      play.innerHTML = '';
    }
  }  
}

// Returns the sound object for a particular string if it exists.
EmbedSound.getSoundById = function(string) {
  var return_sound = null;
  if(EmbedSound._sounds[string]) {
    return_sound = EmbedSound._sounds[string];
  }
  return return_sound;
}

// A class for storing sounds.
EmbedSound.Sound = function(name) {
  this.id = name;
  this.readyState = 0;
  this.play = function() {
    alert('playing: ' + name);
  }
}

// Creates and plays a new sound.
EmbedSound.createSound = function(options) {
  var sound = new EmbedSound.Sound(options.id);
  if(options.autoPlay === true) {
    EmbedSound._playsound(options.url);
  }

  setTimeout("_onjustbeforefinish();", 5000);
}

// Creates the object to hold new sounds.
EmbedSound._sounds = new Object();


EmbedSound.loadContent = function(name, url) {
  // branch for native XMLHttpRequest object
  if(window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
    req = new XMLHttpRequest();
    req.onreadystatechange = processReqChange;
    req.open("GET", url, true);
    req.send(null);
    // branch for IE/Windows ActiveX version
  } else if(window.ActiveXObject) {
    req = new ActiveXObject("Microsoft.XMLHTTP");
    if(req) {
      req.onreadystatechange = processReqChange;
      req.open("GET", url, true);
      req.send();
    }
  }
}

EmbedSound.processReqChange = function() {
  // only if req shows "complete"
  if(req.readyState == 4) {
    // only if "OK"
    if(req.status == 200) {
      alert("Sound is "+
      req.getResponseHeader("Sound-length") + " milliseconds long.");
    } else {
      //alert("There was a problem retrieving the XML data:\n" + req.statusText);
    }
  }
}
