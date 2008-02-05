var EmbedSound = new Object();

/**
 * Creates the embed element that will be used to 
 */
EmbedSound.doEmbedSounds = function() {
	document.location = "browser.php?embed=true";	
}

EmbedSound._playsound = function(url) {
  var playIt=document.getElementById("p_embed");
  var stopIt=document.getElementById("audio_embed");

  playIt.innerHTML='<embed src="' + url + '" autostart=true hidden=true id="audio" enablejavascript="true">'
}

EmbedSound.getSoundById = function(string) {
  var return_sound = null;
  if(EmbedSound._sounds[string]) {
    return_sound = EmbedSound._sounds[string];
  }
  return return_sound;
}

EmbedSound.Sound = function(name) {
  this.id = name;
  this.readyState = 0;
  this.play = function() {
    alert('playing: ' + name);
  }
}

EmbedSound.createSound = function(options) {
  var sound = new EmbedSound.Sound(options.id);
  if(options.autoPlay === true) {
    EmbedSound._playsound(options.url);
  }

  setTimeout("_onjustbeforefinish();", 5000);
}

EmbedSound._sounds = new Object();

EmbedSound.loadContent = function(name, url) {
    // branch for native XMLHttpRequest object
    if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
        req = new XMLHttpRequest();
        req.onreadystatechange = processReqChange;
        req.open("GET", url, true);
        req.send(null);
    // branch for IE/Windows ActiveX version
    } else if (window.ActiveXObject) {
        req = new ActiveXObject("Microsoft.XMLHTTP");
        if (req) {
            req.onreadystatechange = processReqChange;
            req.open("GET", url, true);
            req.send();
        }
    }
}

EmbedSound.processReqChange = function() {
    // only if req shows "complete"
    if (req.readyState == 4) {
        // only if "OK"
        if (req.status == 200) {
            alert("Sound is "+
              req.getResponseHeader("Sound-length") + " milliseconds long.");
        } else {
            //alert("There was a problem retrieving the XML data:\n" + req.statusText);
        }
    }
}
