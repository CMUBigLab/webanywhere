var soundsPlayed = 0;
var totalLatency = 0;
var startTime = 0;

// 1 == Flash, 2 == embed
var soundMethod = 1;
var soundsLoaded = new Array();

var READ = 1;
var KEYBOARD = 2;
var PAUSED = 3;
var PLAY_ONE = 4;
var PLAY_ONE_BACKWARD = 5;
var PLAY_TWO_BACKWARD = 6;
var PREV_CHAR = 7;
var PREV_CHAR_BACKONE = 8;

var browseMode = READ;
var startPriority = 30000;
var basePriority = startPriority;
var free_threads = 25;
var soundManagerLoaded = false;

var soundQ = new Array();
var playing = null;

function initSounds() {
  browseMode = READ;
  startPriority = 30000;
  basePriority = startPriority;
  free_threads = 5;
  soundManagerLoaded = false;

  soundQ = new Array();
  playing = null;

  soundMethod = 1;
  soundsLoaded = new Array();
}

function addSound(sid) {
  soundQ.unshift(sid);
}
function getSound() {
  var sid = soundQ.pop();
  return sid;
}
function resetSounds() {
  soundManager.stopAll();
  soundQ = new Array();
  playing = null;
}

var playWaitingInterval = 50;

var inPlayWaiting = false;
var lastPath = -1;
var newPlaying = false;
var soundState = -1;
var readyState = -1;

var startedSoundInit = false;

function playWaiting() {
  if(inPlayWaiting) {
    return;
  }
  inPlayWaiting = true;
  if(!soundManagerLoaded) {
    lastPath = 0;
    inPlayWaiting = false;
    return;
  } else if(!playing && soundQ.length > 0) {
    lastPath = 1;
    var sid = getSound();
    lastPath = 3;
    playing = sid;
    prefetch(sid, true, false);
  } else if(!playing && (browseMode == READ || browseMode == PLAY_ONE || browseMode == PLAY_ONE_BACKWARD || browseMode == PLAY_TWO_BACKWARD || browseMode == PREV_CHAR || browseMode == PREV_CHAR_BACKONE)) {
    lastPath = 2;
    if(browseMode == PLAY_ONE_BACKWARD || browseMode == PLAY_TWO_BACKWARD || browseMode == PREV_CHAR || browseMode == PREV_CHAR_BACKONE) {
      lastPath = 99;
      prevNode(true);
    } else {
      nextNode(true);
    }
  } else if(playing) {
    var is_playing = isPlaying(playing);
    if(!is_playing) {
      playing = null;
      //alert('set playing null');
    }
    //newPlaying = playing;
  }
  inPlayWaiting = false;
}


soundManager.defaultOptions = {
  'autoLoad': false,             // enable automatic loading (otherwise .load() will be called on demand with .play()..)
  'stream': true,                // allows playing before entire file has loaded (recommended)
  'autoPlay': false,             // enable playing of file as soon as possible (much faster if "stream" is true)
  'onid3': null,                 // callback function for "ID3 data is added/available"
  'onload': null,                // callback function for "load finished"
  'whileloading': null,          // callback function for "download progress update" (X of Y bytes received)
  'onplay': null,                // callback for "play" start
  'whileplaying': null,          // callback during play (position update)
  'onstop': null,                // callback for "user stop"
  'onfinish': null,              // callback function for "sound finished playing"
  'onbeforefinish': null,        // callback for "before sound finished playing (at [time])"
  'onbeforefinishtime': 5000,    // offset (milliseconds) before end of sound to trigger beforefinish..
  'onbeforefinishcomplete':null, // function to call when said sound finishes playing
  'onjustbeforefinish':null,     // callback for [n] msec before end of current sound
  'onjustbeforefinishtime':200,  // [n] - if not using, set to 0 (or null handler) and event will not fire.
  'multiShot': true,             // let sounds "restart" or layer on top of each other when played multiple times..
  'pan': 0,                      // "pan" settings, left-to-right, -100 to 100
  'volume': 100                  // self-explanatory. 0-100, the latter being the max.
}

function preprocessSound(string) {
  if(!string || !string.toLowerCase) return "";
  string = string.toLowerCase();
  string = string.replace(/^\s+|\s+$/g, ' ');
  
  return string;
}

function prefetch(string, playdone, bm) {
  if(!soundManagerLoaded) {
    return;
  }

  var url = '/cgi-bin/getsound.pl?text=' + escape(string);

  string = preprocessSound(string);

  switch(soundMethod)
    {
    case 1: _prefetchFlash(string, url, playdone, bm); break;
    case 2: _prefetchEmbed(string, url, playdone, bm); break;
    }
}

function prefetchKeycode(keycode, playdone) {
  var speak = "";
  switch(keycode) {
  case 8: speak = "back space"; break;
  default: speak = String.fromCharCode(keycode); 
  }

  var url = '/cgi-bin/getsound.pl?text=' + escape(speak);

  switch(soundMethod)
    {
    case 1: _prefetchFlash("keycode_" + keycode, url, playdone, false); break;
    case 2: _prefetchEmbed("keycode_" + keycode, url, playdone, false); break;
    }
}



soundManager.onload = function() {
  // soundManager should be ready to use/call at this point
  soundManagerLoaded = true;

  addSound("Welcome to Web Anywhere");

  newPage();

  if(browserInit) {
    setupBaseSounds();
  }
}

// Load all the sounds for the keypresses
function setupBaseSounds() {
  startedSoundInit = true;
  if(startedSoundInit) {
    return;
  }

  for(var i=32; i<97; i++) {
    prefetchKeycode(i, false);
  }
  //soundManager.createSound( String(i), './base_speech/mp3/0' + String(i) + '.mp3' );
  for( var j=123; j<127; j++ ) {
    prefetchKeycode(i, false);
  }
  //soundManager.createSound( String(j), './base_speech/mp3/' + String(j) + '.mp3' );

  init = 1;
}

function _queuePrefetch(string, url, playdone, bm) {
}

function _fetchFromQueue() {
  for(var i=0; i<5 && i <N && free_threads > 0; i++) {
    var p = popQ();
    switch(soundMethod) {
    case 1: _prefetchFlash(p.text, p.url, p.playdone, p.bm); break;
    case 2: _prefetchEmbed(p.text, p.url, p.playdone, p.bm); break;
    default: break;
    }
  }
}

function isPlaying(sid) {
  sid = preprocessSound(sid);

  switch(soundMethod) {
  case 1: return _isPlayingFlash(sid);
  case 2: return _isPlayingEmbed(sid);
  default: break;
  }
  return false;
}

function _isPlayingEmbed(string) {
  return false;
}

function _isPlayingFlash(string) {
  string = poorHash(string);
  var sound = soundManager.getSoundById(string);
  if(!sound) soundState = 8;
  if(sound && sound.readyState >= 2 && sound.playState == 0) {
    //alert('sou ' + sound + ' ' + sound.readyState +  ' ' + sound.playState);
    return false;
  } else {
    //alert('here!');
    return true;
  }
}

var timingArray = new Object();

// Code for the priority queue for DOM element prefetching.
function tInfo(string) {
  this.start = null;
  this.end = null;
  this.playStart = null;
  this.finished = false;
}

function _prefetchFlash(string, url, playdone, bm) {
  string = poorHash(string);
  var sound = soundManager.getSoundById(string);

  if(!timingArray[string]) {
    timingArray[string] = new tInfo();
  }

  if(timingArray[string].playStart == null) {
    timingArray[string].playStart = new Date();
  }

  if(timingArray[string].start == null) {
    timingArray[string].start = new Date();
  }

  if(!sound || sound.readyState == 2) {
    if(free_threads <= 0) {
      var p = new domQueue(string, url, playdone, bm, basePriority);
      basePriority++;
      pushQ(p);
    } else {
      free_threads--;
      var ti = new tInfo(string);
      timingArray[string] = ti;
      timingArray[string].start = new Date();
      soundManager.createSound({
        id: string,
	url: url,
        autoLoad: true,
        stream: playdone,
        autoPlay: playdone,
        onload: function() {
	  timingArray[this.sID].end = new Date();
          free_threads++;
	  lastPath = 10;
	  this.didalmostfinish = false;
        },
        onplay: function() {
	  valPath += this.sID;
	  soundsPlayed++;
	  //alert('hello!');
        },
        onjustbeforefinish: _onjustbeforefinish,
	onfinish: function() {
	  //alert(timingArray[this.sID].start + ' ' + timingArray[this.sID].end + ' ' + timingArray[this.sID].playStart);
	},
        volume: 75
      });
    }
  } else if(sound.readyState == 3) {
    //sound.position = 300;
    lastPath = 15;
    sound.onjustbeforefinish = _onjustbeforefinish; //function() { alert('onjust before finish'); };
    //alert('callback: ' + sound.onjustbeforefinish);
    sound.play();
    //soundManager.play(string);
  } else if(sound.readyState == 0 ||
	    sound.readyState == 1) {
    sound.autoPlay = playdone;
  }
}

function _onjustbeforefinish() {
  playing = null;
  if(browseMode == READ ||
     soundQ.length > 0) {
    playWaiting();
  }
}

function _prefetchEmbed(string, url) {

}

function playSound(string) {
  switch(soundMethod) {
  case 1: soundManager.play(poorHash(string)); break;
  }
}

function prefetchSounds(doc) {

}


var qLock = false;
var domQ = new Array();
var N = 0;

// Code for the priority queue for DOM element prefetching.
function domQueue(text, url, playdone, bm, val) {
  this.text = text;
  this.val = val;
  this.url = url;
  this.playdone = playdone;
  this.bm = bm;
  this.alertMe = function() { alert(text + ' ' + url + ' ' + playdone + ' ' + bm + ' ' + val); };
}

function upHeap(child) {
  var newElt = domQ[child];
  var parent = Math.floor(child/2);
  while(parent >= 1) {
    if(domQ[parent].val < newElt.val) {
      domQ[child] = domQ[parent]; // move parent down
      child  = parent;
      parent = Math.floor(child/2);
    } else break;
  }
  domQ[child] = newElt;
}

function pushQ(elem) {
  qLock = true;
  N++;
  domQ[N] = elem;
  upHeap(N);
  qLock = false;
}

function downHeap(parent) {
  var newElt = domQ[parent];
  var child = 2*parent;
  while(child <= N) {
    if(child < N)
      if(domQ[child+1].val > domQ[child].val)
	child++;
    if(newElt.val < domQ[child].val) {
      domQ[parent] = domQ[child];
      parent = child;
      child = 2*parent;
    } else break;
  }
  domQ[parent] = newElt;
}

// to remove highest priority element
function popQ() {
  qLock = true;
  var highest = domQ[1];
  domQ[1] = domQ[N]; N--;
  downHeap(1);
  return highest;
  qLock = false;
}

function poorHash(str) {
  if(!str || str.length <= 0) {
    return 'a((((0009209384';
  }

  var orig_str_num = (str.length > 15) ? 15 : str.length - 1;
  var orig_piece = (str.length < 15) ? str : str.substring(0, orig_str_num);
  orig_piece = orig_piece.replace(/[\s]/, '_'); //'
  orig_piece = orig_piece.replace(/'/, 'gE'); //'
  orig_piece = orig_piece.replace(/"/, 'gEE'); //'
  orig_piece = orig_piece.replace(/#/, 'gnE'); //'x


  var bin = Array();
  var mask = 0xFFF;

  var str_len = str.length;

  for(var i=0; i<16; i++) {
    bin[i] = str_len + i;
  }

  for(var i = 0; i < str.length; i++) {
    var update_val = str.charCodeAt(i)*(i & 0xFF)
    bin[(i & 0xF)] += update_val;
    bin[((i << 2) & 0xF)] += update_val;
  }

  var hex_tab = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#*@!";
  var str2 = "";
  for(var i = 0; i < bin.length; i++) {
    str2 += hex_tab.charAt(bin[i] & 0x3F);
  }

  var val = orig_piece + str2;
  return val;
}
