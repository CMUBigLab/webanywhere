/*
 * sounds.js
 * 
 * Contains functions for retrieving, prefetching, and playing sounds.
 * 
 * Also handles stores and updates the current "browseMode" of the system,
 * which controls how the system moves through web pages.  For instance,
 * does it keep reading or stop after reading the next element.  Does it
 * read through by element, word, or character.
 * 
 * The current browseMode is set in wa.js from user input, and here (sounds.js)
 * when done automatically.
 * 
 * The system calls playWaiting() every playWaitingInterval milliseconds to
 * update the current status of the system, check if a new sound needs to be
 * played.
 * 
 * Sounds to be played are stored in the soundQ array.
 */

var soundsPlayed = 0;
var totalLatency = 0;
var startTime = 0;

// 1 == Flash, 2 == embed
var soundMethod = -1;
var soundsLoaded = new Array();

// BrowseMode sound playback states.
var READ = 1;
var KEYBOARD = 2;
var PAUSED = 3;
var PLAY_ONE = 4;
var PLAY_ONE_BACKWARD = 5;
var PLAY_TWO_BACKWARD = 6;
var PREV_CHAR = 7;
var PREV_CHAR_BACKONE = 8;

var FLASH_SOUND_METHOD = 1;
var EMBED_SOUND_METHOD = 2;

// Set the initial browseMode to KEYBOARD.
var browseMode = READ;

// Constants related to sound playback.
var startPriority = 30000;
var basePriority = startPriority;
var free_threads = 25;
var soundPlayerLoaded = false;

// The queue of sounds that are waiting to play.
var soundQ = new Array();

// The sound that is currently being played.
var playing = null;

// The clock frequency of the system.  The system looks for new sounds to play
// in the queue every playWaitingInterval milliseconds.
var playWaitingInterval = 50;

var inPlayWaiting = false;
var lastPath = -1;
var newPlaying = false;
var soundState = -1;
var readyState = -1;

var startedSoundInit = false;

// Embedded sounds take a bit of time to load.  This time makes sure they don't get cut off prematurely.
// Setting this too high will cause unnecessary latency.
// Setting this too low will cause sounds to get cut off.
var embedLatencyBuffer = 750;

// Used for debugging.
if(typeof console != 'undefined') {
  var hasConsole = (typeof console != 'undefined' && typeof console.log != 'undefined');
}

// 0 == none, 1 == parallel dom, 2 == next node, 3 == markov
var prefetchStrategy = 0;
var top_location = top.location + '';
if(/prefetch=\d+/.test(top_location)) {
  top_location = top_location.replace(/^.*prefetch=(\d+).*$/, "$1");
  prefetchStrategy = parseInt(top_location);
}

// Determines the soundMethod that should be used.
// Currently this is detected from the URL, eventually this should be done
// completely automatically.
function setSoundMethod() {
  if(/embed=true/.test(document.location + "")) {
    return EMBED_SOUND_METHOD;
  } else {
    return FLASH_SOUND_METHOD;  
  }
}
soundMethod = setSoundMethod();

// Initialize the sounds.
function initSounds() {
  startPriority = 30000;
  basePriority = startPriority;
  free_threads = 5;
  soundPlayerLoaded = false;

  soundQ = new Array();
  playing = null;

  soundMethod = 1;
  soundsLoaded = new Array();

  browseMode = READ;
}

// Prepare a string for playing sound.
// This includes normalizing the string by making it all lowercase, removing
// punctuation, etc.
function prepareSound(sid) {
  if(sid && sid.length > 1) {
    sid = sid.toLowerCase();
    sid = sid.replace(/(^\s*[\.\?!,\-:]*\s*)|(\s*[\.\?!,:]+\s*$)/g, "");
  }
  return sid;
}

// Returns a unique ID for the text entered.
function getSoundID(text) {
  return poorHash(text);
}

// Processes a sound by breaking it up according to punctuation,
// then adds the resulting sound(s) to the queue of sounds to play.
var splitSoundsByBoundaries = true;
var boundarySplitterRegExp = /[\.!\?:;\s]*(\s+\(|\s+\-\s+|[\.!\?:;\)]\s+)+[\.!\?:;\s]*/;
function splitSoundsByBoundary(sid) {
  return (sid + "").split(boundarySplitterRegExp);  
}

// Adds a new sound to the queue of sounds to be played.
function addSound(sid) {
  // Split sounds into multiple pieces to improve latency of sound retrieval.
  if(splitSoundsByBoundaries) {
    var matches = splitSoundsByBoundary(sid);
    if(matches && matches.length > 0) {
      for(var match_i=0, ml=matches.length; match_i<ml; match_i++) {
        if(!boundarySplitterRegExp.test(matches[match_i])) {
          _addIndividualSound(matches[match_i]);
        }
      }
    }
  } else { // TODO:  Is this needed?
    _addIndividualSound(sid);
  }
}

// Adds a single sound (one that does not get split) to the sound queue.
function _addIndividualSound(sid) {
  sid = prepareSound(sid);
  soundQ.unshift(sid);  
}

// Gets the next sound in the queue that should be played.
function getSound() {
  var sid = soundQ.pop();
  return sid;
}

// Prefetches the next element in the sound queue.
function prefetchFromSoundQ() {
  if(soundQ.length > 0) {
  	var remaining = soundQ.slice();
  	if(hasConsole) console.log('pf from q: ' + remaining.length);
  	remaining.reverse();
    addArrayToPrefetchQ(remaining);
  }
}

// Resets all sounds.
function stopAllSounds() {
  if(soundMethod == FLASH_SOUND_METHOD) {
    soundManager.stopAll();
  } else {
    EmbedSound.stopSounds();
  }
}

// Resets all sounds.
function resetSounds() {
  stopAllSounds();
  soundQ = null;
  soundQ = new Array();
  playing = null;
}

//  Main function called that actually plays sounds when it's supposed to.
function playWaiting() {
  if(inPlayWaiting) {
    return;
  }
  inPlayWaiting = true;

  //if(hasConsole) console.debug(soundPlayerLoaded + '||' + playing + '||' + soundQ.length + '||' + browseMode);

  if(!soundPlayerLoaded) {
    lastPath = 0;
    inPlayWaiting = false;
    return;
  } else if(!playing && soundQ.length > 0) {
    lastPath = 1;
    var sid = getSound();
    lastPath = 3;
    playing = sid;
    prefetch(sid, true, false);
    if(prefetchStrategy > 1) {
      prefetchFromSoundQ();
    }
  } else if(!playing && (browseMode == READ || browseMode == PLAY_ONE || browseMode == PLAY_ONE_BACKWARD || browseMode == PLAY_TWO_BACKWARD || browseMode == PREV_CHAR || browseMode == PREV_CHAR_BACKONE)) {
    lastPath = 2;
    //alert('notplaying');
    if(browseMode == PLAY_ONE_BACKWARD || browseMode == PLAY_TWO_BACKWARD || browseMode == PREV_CHAR || browseMode == PREV_CHAR_BACKONE) {
      lastPath = 99;
      //addObservation(prefetchTypes.PREVNODE, lastNode, WA.Keyboard.last_action);
      prevNode(true);
    } else {
      //addObservation(prefetchTypes.NEXTNODE, lastNode, WA.Keyboard.last_action);
      nextNode(true);
    }
  } else if(playing) {
    var is_playing = isPlaying(playing);
    //if(hasConsole) console.debug('playing ' + playing + ' ' + is_playing);
    if(!is_playing) {
      playing = null;
    }
  }
  inPlayWaiting = false;
}

// Returns the URL for the sound file for this string.
function urlForString(string) {
  var url = top.sound_url_base.replace(/\$text\$/, escape(string));
  url = proxifyURL(url, "");
  return url;
}

// Play the sound.
// TODO:  This is not actually used for prefetching anymore...should change its name.
function prefetch(string, playdone, bm) {
  string = prepareSound(string);

  var url = urlForString(string);

  switch(soundMethod) {
    case FLASH_SOUND_METHOD: _prefetchFlash(string, url, playdone, bm); break;
    case EMBED_SOUND_METHOD: _prefetchEmbed(string, url, playdone, bm); break;
  }
}

function prefetchKeycode(keycode, playdone) {
  var speak = "";
  switch(keycode) {
    case 8: speak = "back space"; break;
    default: speak = String.fromCharCode(keycode); 
  }

  var url = '/cgi-bin/getsound.pl?text=' + escape(speak);
  url = proxifyURL(url, "");

  switch(soundMethod) {
    case FLASH_SOUND_METHOD: _prefetchFlash("keycode_" + keycode, url, playdone, false); break;
    case EMBED_SOUND_METHOD: _prefetchEmbed("keycode_" + keycode, url, playdone, false); break;
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

  for( var j=123; j<127; j++ ) {
    prefetchKeycode(i, false);
  }

  init = 1;
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

// Is the current sid being played right now?
function isPlaying(sid) {
  sid = prepareSound(sid);

  switch(soundMethod) {
    case 1: return _isPlayingFlash(sid);
    case 2: return _isPlayingEmbed(sid);
    default: break;
  }
  return false;
}

// Is the embedded sound still playing?
// TODO:  Implement this function.
function _isPlayingEmbed(string) {
  return true;
}

// Is the Flash sound still playing?
function _isPlayingFlash(string) {
  string = getSoundID(string);
  var sound = soundManager.getSoundById(string);
  if(!sound) soundState = 8;
  if(sound && sound.readyState >= 2 && sound.playState == 0) {
    return false;
  } else {
    return true;
  }
}

// Stores timing information useful when conducting studies.
var timingArray = new Object();
function getTimingList() {
  var timing_list = "";
  var total_latency = 0;
  var total_sounds = 0;
  var total_length = 0;
  for(i in timingArray) {
    if(timingArray[i].playStart) {
      var latency = (timingArray[i].end - timingArray[i].playStart);
      if(latency > 0) {
        timing_list += latency + '\n';
        total_latency += latency;
      }
      total_length += timingArray[i].length;
    } else {
      alert('no playStart');
    }
    total_sounds++;
  }

  var mean = (total_latency/total_sounds);
  var sd = 0;
  
  for(i in timingArray) {
    if(timingArray[i].playStart) {
      var latency = (timingArray[i].end - timingArray[i].playStart);
      if(latency < 60000)
      sd += (latency - mean)*(latency - mean);
    }
  }
  sd = Math.sqrt((sd/total_sounds));

  return mean + ' ' + sd + ' ' + total_latency + ' ' + total_sounds + ' ' + total_length + '||';
}

// Code for the priority queue for DOM element prefetching.
function tInfo(string) {
  this.start = null;
  this.end = null;
  this.playStart = null;
  this.finished = false;
  this.length = null;
}

// "Prefetch" a sound into the Flash movie.
// The name suggests that this method is only used for prefetching, but it is
// also the primary mechanism for playing sounds as well.
function _prefetchFlash(string, url, playdone, bm) {
  if(!soundPlayerLoaded) {
    return;
  }

  var orig_string = string;

  string = getSoundID(string);
  var sound = soundManager.getSoundById(string);

  var old_length = 0;
  if(timingArray[string] && !timingArray[string].playStart) {
  	old_length = timingArray[string].length;
    timingArray[string + Math.random()] = timingArray[string];
  }

  timingArray[string] = new tInfo(string);
  timingArray[string].orig_string = orig_string;
  if(playdone) {
    timingArray[string].playStart = new Date();
    if(hasConsole) console.debug('starting sound: ' + timingArray[string].playStart.getTime() + ' ' + orig_string);
  }
  timingArray[string].length = old_length;

  if(!sound || sound.readyState == 2) {
    if(free_threads <= 0) {
      var p = new domQueue(string, url, playdone, bm, basePriority);
      basePriority++;
      pushQ(p);
    } else {
      free_threads--;
      soundManager.createSound({
        id: string,
	    url: url,
        autoLoad: true,
	    stream: playdone,
        autoPlay: playdone,
        onload: function() {
	      timingArray[this.sID].end = new Date();
	      timingArray[this.sID].length = this.durationEstimate;
	      if(hasConsole) console.debug('finished sound: ' + timingArray[this.sID].end.getTime() + ' ' + this.durationEstimate + ' ' + timingArray[this.sID].orig_string);

          free_threads++;
	      lastPath = 10;
	      this.didalmostfinish = false;
        },
        onplay: function() {
	      valPath += this.sID;
	      soundsPlayed++;
        },
        whileplaying: function() {
          if(timingArray[this.sID].end == null) {
            soundsPlayed++;
            timingArray[this.sID].end = new Date();
            this.whileplaying = null;
          }
        },
	    onfinish: _onjustbeforefinish,
        volume: 75
      });
    }
  } else if(sound.readyState == 3) {
    lastPath = 15;
    sound.onjustbeforefinish = _onjustbeforefinish;
    var duration = (prefetchRecords[string] && prefetchRecords[string].soundlength) ? prefetchRecords[string].soundlength : timingArray[string].length; 
    if(hasConsole) console.debug('finished sound: ' + timingArray[string].playStart.getTime() + ' ' + duration + ' ' + timingArray[string].orig_string);
    sound.play();
  } else if(sound.readyState == 0 ||
	sound.readyState == 1) {
    sound.autoPlay = playdone;
  }
}

function playLoadingSound() {
  return;
  soundManager.createSound({
    id: '::webanywhere-sound-effects::',
	url: url,
        autoLoad: true,
	stream: playdone,
    autoPlay: playdone,
    onload: function() {
	  timingArray[this.sID].end = new Date();
	  timingArray[this.sID].length = this.durationEstimate;
      free_threads++;
	  lastPath = 10;
	  this.didalmostfinish = false;
    },
    onplay: function() {
	 valPath += this.sID;
	 soundsPlayed++;
    },
    whileplaying: function() {
      if(timingArray[this.sID].end == null) {
        soundsPlayed++;
        timingArray[this.sID].end = new Date();
        this.whileplaying = null;
      }
    },
	onfinish: _onjustbeforefinish,
    volume: 75
  });
}


function _onjustbeforefinish() {
  if(this && this.duration) {
    timingArray[this.sID].length = this.duration;
    if(hasConsole) console.debug('finished sound: ' + timingArray[string].playStart.getTime() + ' ' + this.duration + ' ' + timingArray[string].orig_string);
  } else {
    if(hasConsole) console.debug('finished sound: ' + timingArray[string].end.getTime() + ' ' + this.durationEstimate + ' ' + timingArray[string].orig_string);
  }
  if(playing != null) {
    var is_playing = isPlaying(playing);
    if(is_playing) {
      setTimeout("_onjustbeforefinish();", 100);
    } else {
      playing = null;
      // Don't wait for timed event if there's something else to read right now.
      if(browseMode == READ || soundQ.length > 0) {
        playWaiting();
      }
    }
  }
}

// Called after the system believes that it should be done playing a sound.
function _donePlayingEmbedSound() {
  if(hasConsole) console.debug('done playing: ' + playing);
  playing = null;
}

// Plays a sound using an embedded sound player.
function _prefetchEmbed(string, url, playdone, bm) {
  var sid = getSoundID(string);

  if(hasConsole) console.debug('playing: ' + string);

  // If the sound has already been prefetched, then we'll try to play it.
  if(prefetchRecords[sid]) {
    var sl = String(prefetchRecords[sid].soundlength);

    var sl_f = parseInt(sl.replace(/\..*$/, ''));  // Make it a whole number of microseconds.

    EmbedSound._playSound(url);

    // Magical formula that seems to guess reasonably accurately
    // when the sound will finish playing.
    var timeout = sl_f*1.1 + embedLatencyBuffer;

    if(hasConsole) console.debug('will be done in ' + timeout + 'seconds');    

    // Simulate the onfinish event with a timer.
    setTimeout("_donePlayingEmbedSound();", timeout);
  } else {  // Prefetch the sound and set it to play automatically.
    prefetchRecords[sid] = new Object();
    prefetchRecords[sid].soundlength = -1;
    prefetchRecords[sid].contentlength = -1;

    prefetchSound(url, string, true);    
  }
}

var qLock = false;
var domQ = new Array();
var N = 0;

// A queueu element that can be prefetched.
function domQueue(text, url, playdone, bm, val) {
  this.text = text;
  this.sid = getSoundID(text);
  this.val = val;
  this.url = url;
  this.playdone = playdone;
  this.bm = bm;
  this.alertMe = function() { alert(text + ' ' + url + ' ' + playdone + ' ' + bm + ' ' + val); };
}

// Do upHeap operation on the queue.
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

// Adds an element to the priority queue.
function pushQ(elem) {
  qLock = true;
  N++;
  domQ[N] = elem;
  upHeap(N);
  qLock = false;
}

// Do downHeap operation on the queue.
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

// Peaks at next element in the queue without modifying it.
function peakQ() {
  return domQ[1];
}

// Gets called to prefetch the things in the queue.
function prefetchNext() {
  switch(prefetchStrategy) {
    case -1:
      if(N > 0) {
        var p = peakQ();
        prefetchSound(p.url, p.text, p.playdone);
      } else {}
      break;
    case 0:
      break;
    // For all of the prefetch stratgies,
    // we just retrieve elements form the queue.
    case 1:
    case 2:
    case 3:
      var text_to_fetch = getFromPrefetchQ();
      if(text_to_fetch) {
        if(/\S/.test(text_to_fetch)) {
          var pred = prefetchText(text_to_fetch);
          if(!pred) setTimeout("prefetchNext();", 0);
        } else {
          setTimeout("prefetchNext();", 500);
        }
      } else {
        // Nothing in the prefetch queue.  Wait longer before trying again.
        setTimeout("prefetchNext();", 3000);
      }
      break;
    default: // Do nothing.
  }
}

// The prefetch queue is set up as a queue of caches,
// each with its own priority.
// prefetch_array: is the array holding each cache, which is itself
//                 an array of strings.
// prefetch_curr_index:  the index of the current cache.
var prefetch_array = new Array();
var prefetch_curr_index = 0;

// Record of what has been previously prefetched by the system
// during this session.
var prefetchRecords = new Object();

// Adds an array of sounds to the prefetch queue.
function addArrayToPrefetchQ(sarray) {
  prefetch_array[prefetch_curr_index + 1] = new Array();
  for(var i=0, sl=sarray.length; i<sl; i++) {
    var sid = sarray[i];
    //var poor_hash = getSoundID(sid);
    // If changed to !poor_hash would indicate that sounds should not be
    // prefetched twice.  Generally, it's more trouble than it's worth to
    // keep track of this, considering prefetching from the cache requires
    // little overhead and sounds can be evicted from the browser cache.
    if(true) { //!poor_hash) {
      prefetch_array[prefetch_curr_index + 1].push(sid);
    } else {
      //alert('sid ' + sid + ' already fetched.');
    }
  }
  prefetch_curr_index++;
}

// Move to another prefetch row.
function incPrefetchIndex() {
  prefetch_curr_index++;
  prefetch_array[prefetch_curr_index] = new Array();
}

// Adds the sid (sound ID) to the prefetch queue.
function addToPrefetchQ(sid) {
  if(splitSoundsByBoundaries) {
    var matches = splitSoundsByBoundary(sid);
    if(matches && matches.length > 0) {
      for(var match_i=0, ml=matches.length; match_i<ml; match_i++) {
        if(!boundarySplitterRegExp.test(matches[match_i])) {
          _addIndividualToPrefetchQ(matches[match_i]);
        }
      }
    }
  } else { // TODO:  Is this needed?
    _addIndividualToPrefetchQ(sid);
  }
}

// Adds the sid (sound ID) to the prefetch queue.
function _addIndividualToPrefetchQ(sid) {
  sid = prepareSound(sid);
  prefetch_array[prefetch_curr_index].push(sid);
}

// Returns the next sound to be prefetched from the queue.
function getFromPrefetchQ() {
  var sid = null;
  if(prefetch_array && prefetch_array[prefetch_curr_index].length < 1
    && prefetch_curr_index > 0) {
    if(hasConsole) console.debug('moving from queue: ' + prefetch_curr_index + ' to ' + (prefetch_curr_index-1));
    prefetch_curr_index--;
  	sid = getFromPrefetchQ();
  } else {
    if(hasConsole) console.debug('fetching from: ' + prefetch_curr_index);
    sid = prefetch_array[prefetch_curr_index].shift();
  }

  return sid;
}

// The XMLHttpRequest object for prefetching.
var prefetch_req = null;

// Prefetch a sound using an AJAX request.
// This also lets us know how long the sound is, ideally.
function prefetchSound(url, text, playdone) {
  // Try to reuse the prefetch_req object is possible.
  if(!prefetch_req) {
    // Branch for native XMLHttpRequest object
    if(window.XMLHttpRequest) {
      prefetch_req = new XMLHttpRequest();
      // branch for IE/Windows ActiveX version
    } else if(window.ActiveXObject) {
      prefetch_req = new ActiveXObject("Microsoft.XMLHTTP");
    }
  }

  prefetch_req.text = text;
  prefetch_req.sid = getSoundID(text);
  prefetch_req.playdone = playdone;

  // Setup the request and the make the request.
  prefetch_req.onreadystatechange = processReqChangePrefetchSound;
  prefetch_req.open("GET", url, true);
  prefetch_req.send(null);
}

// Handle onreadystatechange event of httpreq object.
function processReqChangePrefetchSound() {
  if(prefetch_req.readyState == 4) {
    if(prefetch_req.status == 200) {      
      var soundLength = prefetch_req.getResponseHeader('sound-length');
      if(soundLength) {  // Not all TTS have lengths.
        if(hasConsole) console.debug('got sound ' + prefetch_req.text + ' ' + soundLength);
        prefetchRecords[prefetch_req.sid].soundlength = soundLength;
      } else {
        // This TTS doesn't support the length header.
      }
      var contentLength = prefetch_req.getResponseHeader('content-length');
      if(contentLength) {  // Not all TTS have lengths.
        if(hasConsole) console.debug('got sound ' + prefetch_req.text + ' ' + contentLength);
        prefetchRecords[prefetch_req.sid].contentlength = contentLength;
      } else {
        // This TTS doesn't support the length header.
      }

      if(prefetch_req.playdone) {
        if(hasConsole) console.debug("playing after supposed fetching");
        prefetch(prefetch_req.text, true, false);
      }

      //prefetch_req = null;    
    } else {}

    // Requests that the next sound be prefetched, assuming there is one.
    prefetchNext();
  }
}

// Makes an HTTP Post requeste.
function postURL(url, params) {
  // branch for native XMLHttpRequest object
  if(window.XMLHttpRequest) {
    prefetch_req = new XMLHttpRequest();
    prefetch_req.onreadystatechange = processReqChange;
    prefetch_req.open("POST", url, true);
    //Send the proper header information along with the request
    prefetch_req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    prefetch_req.setRequestHeader("Content-length", params.length);
    prefetch_req.setRequestHeader("Connection", "close");

    prefetch_req.send(params);
    // branch for IE/Windows ActiveX version
  } else if(window.ActiveXObject) {
    prefetch_req = new ActiveXObject("Microsoft.XMLHTTP");
    if(prefetch_req) {
      //Send the proper header information along with the request
      prefetch_req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      prefetch_req.setRequestHeader("Content-length", params.length);
      prefetch_req.setRequestHeader("Connection", "close");

      prefetch_req.onreadystatechange = processReqChange;
      prefetch_req.open("POST", url, true);
      prefetch_req.send(params);
    }
  }
}

// Defines the types of predictive prefetching that the system can do.
var prefetchTypes = new Object();
prefetchTypes.NEXTNODE = 1;
prefetchTypes.PREVNODE = 2;
prefetchTypes.NEXTFOCUS = 3;
prefetchTypes.PREVFOCUS = 4;
prefetchTypes.NEXTINPUT = 5;
prefetchTypes.PREVINPUT = 6;
prefetchTypes.NEXTHEADING = 7;
prefetchTypes.PREVHEADING = 8;
prefetchTypes.OTHER = 9;

// Matches key presses to the supported kinds of predictive prefetching.
function keyToAction(key_string) {
  if(key_string == "arrowdown") {
  	return prefetchTypes.NEXTNODE;
  } else if(key_string == "arrowup") {
  	return prefetchTypes.PREVNODE;
  } else if(key_string == "tab") {
  	return prefetchTypes.NEXTFOCUS;
  } else if(key_string == "shift tab") {
  	return prefetchTypes.PREVFOCUS;
  } else if(key_string == "ctrl i") {
  	return prefetchTypes.NEXTINPUT;
  } else if(key_string == "ctrl shift i") {
  	return prefetchTypes.PREVINPUT;
  } else if(key_string == "ctrl h") {
  	return prefetchTypes.NEXTHEADING;
  } else if(key_string == "ctrl shift h") {
  	return prefetchTypes.PREVHEADING;
  } else {
  	return prefetchTypes.OTHER;
  }
}

// Holds counts of observations of user actions to build the Markov model.
var prefetchObservations = new Object();

// Records the specified observation to the predictive prefetching model.
function addObservation(currAction, currNode, prevAction) {
  var obs_string = String(prevAction) + " " + String(nodeToString(currNode));
  if(prefetchObservations[obs_string] == null) {
  	prefetchObservations[obs_string] = new Array(prefetchTypes.OTHER + 1);
  	for(var i=0; i<prefetchTypes.OTHER + 1; i++) {
  	  prefetchObservations[obs_string][i] = 0;
  	}
  }
  prefetchObservations[obs_string][currAction]++;
  prefetchObservations[obs_string][0]++;
}

// Converts node to a descriptive type/name for predictive prefetching.
function nodeToString(currNode) {
  if(currNode) {
    return currNode.nodeName;
  } else {
  	return null;
  }
}

// Returns a normalized probability array of possible actions
// that could be taken.
function predictNext(currNode, prevAction) {
  var possActions = new Array(prefetchTypes.OTHER + 1);
  var obs_string = String(prevAction) + " " + String(nodeToString(currNode));
  if(hasConsole) console.log('pfetch for ' + obs_string);
  if(prefetchObservations[obs_string] != null) {
    var totalObs = prefetchObservations[obs_string][0] +
      prefetchObservations[obs_string].length;
    for(var i=0, pal=possActions.length; i<pal; i++) {
      possActions[i] = (prefetchObservations[obs_string][i] + 1)/(totalObs);
    }
  } else {
  	uniformArray(possActions);
  }
  return possActions;
}

// Makes the input array of numbers into a uniform array in which all
// elements add to one.
function uniformArray(array) {
  var val = 1.0 / (array.length);
  for(var i=0; i<array.length; i++) {
  	array[i] = val;
  }
}

// Alerts information about the current state of the prefetching algorithm.
function alertPrefetching() {
  var string = "";
  for(i in prefetchObservations) {
  	string += i + ": " + prefetchObservations[i].join(", ") + " \n";
  }
  
  var predictN = predictNext(lastNode, WA.Keyboard.last_action);

  string += "\n" + lastNode + "  " + WA.Keyboard.last_action;
  string += "\n\n" + predictN.join(", ");

  alert(string);
  return;
}

// Prefetch a the sound for the supplied text.
var numPrefetched = 0;
function prefetchText(text) {
  var string = prepareSound(text);
  var url = urlForString(string);

  var sid = getSoundID(text);

  if(!prefetchRecords[sid]) {
    prefetchRecords[sid] = new Object();
    prefetchRecords[sid].soundlength = -1;
    numPrefetched++;
    prefetchSound(url, text, false);
    return true;
  } else {
  	return false;
  }
}

// Adds the textual representation of the node to the prefetch queue.
function prefetchNode(node) {
  if(node) {
    var text = handlenode(node, true);
    addToPrefetchQ(text);
  }
}

function prefetchNextOnes(node, num) {
  for(i=0; i<num; i++) {
  	node = firstNodeNoSound(node);
  	node = nextBySpeaks(node);
    prefetchNode(node);
  }
}

// Prediction-based prefetching.
function prefetchSomething() {
  var predictions = predictNext(lastNode, WA.Keyboard.last_action);

  var impl = [1, 3, 5, 7];
  var highest = 1;
  var high_val = 0.0;
  for(var i=0, il=impl.length; i<il; i++) {
    var pred = predictions[impl[i]];
    if(pred > high_val) {
      high_val = pred;
      highest = impl[i];
    }
  }

  if(hasConsole) console.log('highest is ' + highest);

  var next_node = null;

  incPrefetchIndex();

  switch(highest) {
    case prefetchTypes.NEXTFOCUS:
      next_node = nextByFocus(currentNode); prefetchNode(next_node);
      var best_node = next_node;
      prefetchNextOnes(currentNode, 2);
      best_node = firstNodeNoSound(best_node);    
      next_node = nextByFocus(best_node); prefetchNode(next_node);
      prefetchNextOnes(best_node, 1);
      break;
    case prefetchTypes.NEXTHEADING:
      next_node = nextByTag(currentNode, "H"); prefetchNode(next_node);
      var best_node = next_node;
      prefetchNextOnes(currentNode, 2);
      best_node = firstNodeNoSound(best_node);    
      next_node = nextByTag(best_node, "H"); prefetchNode(next_node);
      prefetchNextOnes(best_node, 1);
      break;
    case prefetchTypes.NEXTINPUT:
      next_node = nextByTag(currentNode, "INPUT|SELECT|TEXTAREA"); prefetchNode(next_node);
      var best_node = next_node;
      prefetchNextOnes(currentNode, 2);
      best_node = firstNodeNoSound(best_node);    
      next_node = nextByTag(best_node, "INPUT|SELECT|TEXTAREA"); prefetchNode(next_node);
      prefetchNextOnes(best_node, 1);
      break;
    case prefetchTypes.NEXTNODE:
    default:
      prefetchNextOnes(currentNode, 3);
      break;
  }

  //treeTraverseRecursion(next_node, addNodeToPrefetch, leafNode, 3, true);

  /*
  console.log(next_node);
  next_node = firstNodeNoSound(next_node)
  console.log(next_node);
  if(next_node) {

  next_node = nextByTag(next_node, "H");

    var text = handlenode(next_node, true);
    prefetchText(text);
  }*/
}

// A simple hash function, not necessarily secure or good, but
// produces unique strings used as keys in the system.
function poorHash(str) {
  if(!str || str.length <= 0) {
    return 'aaaa0009209384';
  }

  str = str.replace(/[\n\r]+/, "");

  str = str.replace(/&#(\d)+;/, "p$1");

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
  for(var i=0, bl=bin.length; i<bl; i++) {
    str2 += hex_tab.charAt(bin[i] & 0x3F);
  }

  var val = orig_piece + str2;
  return val;
}

// Initialize the system to prefetch letters and common symbols.
// Letters are ordered according to a guess of their popularity in the web context.
var lettersNotFetched = ['w','.','h','t','p','f','g','c','i','j','k','l','m','n','o','d','q','r','s','e','u','v','a','x','y','z','b'];
function prefetchLetters() {
  if(prefetch_array && prefetch_array[0]) {
    for(i=0, lnfl=lettersNotFetched.length; i<lnfl; i++) {
      prefetch_array[0].push(lettersNotFetched[i]);
    }
  }
}

//
// After all the function definitions, start initializing the system.
//
if(soundMethod == FLASH_SOUND_METHOD) {
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
}

if(soundMethod == FLASH_SOUND_METHOD) {
  soundManager.onload = function() {
    // soundManager 2 should be ready to use/call at this point.
    soundPlayerLoaded = true;

    newPage();

    if(browserInit) {
      setupBaseSounds();
    }
  }

  // Called when there is an error with the Flash sound player.
  // Currently, this means the the program will try to play sounds
  // using the embedded method instead.
  soundManager.onerror = function() {
    soundPlayerLoaded = false;
    soundMethod = EMBED_SOUND_METHOD;
  }
}
addSound("Welcome to Web Anywhere");

