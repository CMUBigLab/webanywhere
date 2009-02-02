/*
 * sound_embed.js
 * 
 * Functions for playing sounds using embedded sound players like
 * Windows Media Player, Quicktime, etc.
 * 
 */

WA.Sound.Embed = {
  // Embedded sounds take a bit of time to load.  This time makes sure they don't get cut off prematurely.
  // Setting this too high will cause unnecessary latency.
  // Setting this too low will cause sounds to get cut off.
  _embedLatencyBuffer: 750,

  // Redirect to the embedded player version of the page.
  doEmbedSounds: function() {
    getNavigationDocument().location = "browser.php?embed=true";	
  },

  // Play a sound using the embedded player.
  _playSound: function(url) {
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
  },

  // Stop sounds being played with the embedded player.
  stopSounds: function() {
    var doc = getNavigationDocument();
    if(doc) {
      var play = document.getElementById('webanywhere_embed');
      if(play) {
        play.innerHTML = '';
      }
    }  
  },

  // Returns the sound object for a particular string if it exists.
  getSoundById: function(string) {
    var return_sound = null;
    if(this._sounds[string]) {
      return_sound = this._sounds[string];
    }
    return return_sound;
  },

  // A class for storing sounds.
  Sound: function(name) {
    this.id = name;
    this.readyState = 0;
    this.play = function() {
      alert('playing: ' + name);
    }
  },

  // Creates and plays a new sound.
  createSound: function(options) {
    var sound = new this.Sound(options.id);
    if(options.autoPlay === true) {
      this._playsound(options.url);
    }
  
    setTimeout(function(){WA.Sound._onsoundfinish()}, 5000);
  },

  // Creates the object to hold new sounds.
  _sounds: new Object(),

  /*processReqChange: function() {
    if(req.readyState == 4) {
      if(req.status == 200) {
        alert("Sound is " +
              req.getResponseHeader("Sound-length") +
              " milliseconds long.");
      } else {}
    }
  },(*/
  
    // Plays a sound using an embedded sound player.
  _prefetchEmbed: function(string, url, playdone, bm) {
    var sid = WA.Sound.getSoundID(string);
  
    WA.Utils.log('playing: ' + string);
  
    // If the sound has already been prefetched, then we'll try to play it.
    if(WA.Sound.Prefetch.prefetchRecords[sid]) {
      var sl = String(WA.Sound.Prefetch.prefetchRecords[sid].soundlength);
  
      var sl_f = parseInt(sl.replace(/\..*$/, ''));  // Make it a whole number of microseconds.
  
      this._playSound(url);
  
      // Magical formula that seems to guess reasonably accurately
      // when the sound will finish playing.
      var timeout = sl_f*1.1 + this._embedLatencyBuffer;
  
      WA.Utils.log('will be done in ' + timeout + 'seconds');    
  
      // Simulate the onfinish event with a timer.
      setTimeout("WA.Sound._donePlayingEmbedSound();", timeout);
    } else {  // Prefetch the sound and set it to play automatically.
      WA.Sound.Prefetch.prefetchRecords[sid] = new Object();
      WA.Sound.Prefetch.prefetchRecords[sid].soundlength = -1;
      WA.Sound.Prefetch.prefetchRecords[sid].contentlength = -1;
  
      prefetchSound(url, string, true);    
    }
  }
};