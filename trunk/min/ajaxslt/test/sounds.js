var soundsPlayed = 0;
var totalLatency = 0;
var startTime = 0;

// 1 == Flash, 2 == embed
var soundMethod = 1;
var soundsLoaded = new Array();

// Operating Modes
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

// 0 == none, 1 == parallel dom, 2 == next node, 3 == markov
var prefetchStrategy = 2;
var top_location = top.location + '';
if(/prefetch=\d+/.test(top_location)) {
  top_location = top_location.replace(/^.*prefetch=(\d+).*$/, "$1");
  prefetchStrategy = parseInt(top_location);
}

function initSounds() {
  startPriority = 30000;
  basePriority = startPriority;
  free_threads = 5;
  soundManagerLoaded = false;

  soundQ = new Array();
  playing = null;

  soundMethod = 1;
  soundsLoaded = new Array();

  browseMode = READ;
}

function prepareSound(sid) {
  if(sid && sid.length > 1) {
    sid = sid.toLowerCase();
    sid = sid.replace(/(^\s*[\.\?!,\-:]*\s*)|(\s*[\.\?!,:]+\s*$)/g, "");
  }
  return sid;
}

function addSound(sid) {
  sid = prepareSound(sid);
  soundQ.unshift(sid);
}
function getSound() {
  var sid = soundQ.pop();
  return sid;
}

function prefetchFromSoundQ() {
  if(soundQ.length > 0) {
  	var remaining = soundQ.slice();
  	if(hasConsole) console.log('pf from q: ' + remaining.length);
  	remaining.reverse();
    addArrayToPrefetchQ(remaining);
  }
}

function resetSounds() {
  soundManager.stopAll();
  soundQ = null;
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

//  Main function called that actually plays sounds when it's supposed to.
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
    if(prefetchStrategy > 1) {
      prefetchFromSoundQ();
    }
  } else if(!playing && (browseMode == READ || browseMode == PLAY_ONE || browseMode == PLAY_ONE_BACKWARD || browseMode == PLAY_TWO_BACKWARD || browseMode == PREV_CHAR || browseMode == PREV_CHAR_BACKONE)) {
    lastPath = 2;
    //alert('notplaying');
    if(browseMode == PLAY_ONE_BACKWARD || browseMode == PLAY_TWO_BACKWARD || browseMode == PREV_CHAR || browseMode == PREV_CHAR_BACKONE) {
      lastPath = 99;
      //addObservation(prefetchTypes.PREVNODE, lastNode, last_action);
      prevNode(true);
    } else {
      //addObservation(prefetchTypes.NEXTNODE, lastNode, last_action);
      nextNode(true);
    }
  } else if(playing) {
    var is_playing = isPlaying(playing);
    if(!is_playing) {
      playing = null;
    }
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

//  Not used anymore.  See prepareSound.
/*function preprocessSound(string) {
  if(!string || !string.toLowerCase) return "";
  string = string.toLowerCase();
  string = string.replace(/^\s+|\s+$/g, ' ');

  return string;
}*/

function urlForString(string) {
  var url = '/cgi-bin/getsound.pl?text=' + escape(string);
  return url;
}

function prefetch(string, playdone, bm) {
  string = prepareSound(string);

  var url = urlForString(string);

  switch(soundMethod) {
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

soundManager.onerror = function() {
	soundManagerLoaded = false;
	soundMethod = 2;
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
  sid = prepareSound(sid);

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
    return false;
  } else {
    return true;
  }
}

var timingArray = new Object();


function getTimingList() {
  var timing_list = "";
  var total_latency = 0;
  var total_sounds = 0;
  var total_length = 0;
  for(i in timingArray) {
    if(timingArray[i].playStart) {
      //alert(i + ': ' + timingArray[i].end + ' ' + timingArray[i].playStart +
      //' ' + (timingArray[i].end - timingArray[i].playStart));
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
      //alert(i + ': ' + timingArray[i].end + ' ' + timingArray[i].playStart +
      //' ' + (timingArray[i].end - timingArray[i].playStart));
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

function _prefetchFlash(string, url, playdone, bm) {
  if(!soundManagerLoaded) {
    return;
  }

  string = poorHash(string);
  var sound = soundManager.getSoundById(string);

  var old_length = 0;
  if(timingArray[string] && !timingArray[string].playStart) {
  	old_length = timingArray[string].length;
    timingArray[string + Math.random()] = timingArray[string];
  }

  timingArray[string] = new tInfo(string);
  //if(sound && sound.readyState == 3) {
  if(playdone) {
    timingArray[string].playStart = new Date();
  }
  timingArray[string].length = old_length;
  //timingArray[string].start = new Date();

  if(!sound || sound.readyState == 2) {
    if(free_threads <= 0) {
      var p = new domQueue(string, url, playdone, bm, basePriority);
      basePriority++;
      pushQ(p);
    } else {
      free_threads--;
      //var ti = new tInfo(string);
      //timingArray[string] = ti;
      //timingArray[string].start = new Date();
      soundManager.createSound({
        id: string,
	url: url,
        autoLoad: true,
	stream: playdone,
        autoPlay: playdone,
        onload: function() {
	      timingArray[this.sID].end = new Date();
	      timingArray[this.sID].length = this.durationEstimate;
          //alert(timingArray[this.sID].playStart + ' ' + timingArray[this.sID].end);
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
        //onjustbeforefinish: _onjustbeforefinish,
	    onfinish: _onjustbeforefinish,
        //onfinish: function() {
	    //if(hasConsole) console.log(timingArray[this.sID].start + ' ' + timingArray[this.sID].end + ' ' + timingArray[this.sID].playStart);
	    //},
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
  timingArray[this.sID].length = this.duration;
  if(playing != null) {
    var is_playing = isPlaying(playing);
    if(is_playing) {
      setTimeout("_onjustbeforefinish();", 100);
    } else {
      //alert('assigned null here: ');
      playing = null;
      // Don't wait for timed event if there's something else to read right now.
      if(browseMode == READ ||
        soundQ.length > 0) {
        playWaiting();
      }
    }
  }
}

function _onfinish() {
  alert('setting null here instead');
  if(playing != null) {
    playing = null;
    // Don't wait for timed event if there's something else to read right now.
    if(browseMode == READ ||
      soundQ.length > 0) {
      playWaiting();
    }
  }
}

function _prefetchEmbed(string, url, playdone, bm) {
  string = poorHash(string);
  var sound = EmbedSound.getSoundById(string);

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
      EmbedSound.createSound({
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

function peakQ() {
  return domQ[1];
}

/*if(prefetchStrategy == 1) {
  setInterval("prefetchNode();", 4000);
}*/

// Gets called to prefetch the things in the queue.
function prefetchNext() {
  switch(prefetchStrategy) {
  case -1:
    if(N > 0) {
      var p = peakQ();
      loadURL(p.url);
    } else {
    }
    break;
  case 0:
    break;
  case 1:
  case 2:
  case 3:
    var text_to_fetch = getFromPrefetchQ();
    if(text_to_fetch && /\S/.test(text_to_fetch)) {
      var pred = prefetchText(text_to_fetch);
      if(!pred) setTimeout("prefetchNext();", 0);
    } else {
      setTimeout("prefetchNext();", 2500);
    }
    break;
    default:
      //if(hasConsole) console.log('default');
  }
}

var prefetch_array = new Array();
var prefetch_curr_index = 0;

var prefetchRecord = new Object();

function addArrayToPrefetchQ(sarray) {
  prefetch_array[prefetch_curr_index + 1] = new Array();
  for(var i=0; i<sarray.length; i++) {
    var sid = sarray[i];
    var poor_hash = poorHash(sid);
    if(true) { //!poor_hash) {
      prefetch_array[prefetch_curr_index + 1].push(sid);
    } else {
      //alert('sid ' + sid + ' already fetched.');
    }
  }
  prefetch_curr_index++;
}

function incPrefetchIndex() {
  prefetch_curr_index++;
  prefetch_array[prefetch_curr_index] = new Array();
}

function addToPrefetchQ(sid) {
  var poor_hash = poorHash(sid);
  //if(!poor_hash) {
    //prefetch_array[prefetch_curr_index] = new Array();
    prefetch_array[prefetch_curr_index].push(sid);
    //prefetch_curr_index++;
  //} else {
 // 	alert('ssid ' + sid + ' already fetched.');
  //}
}

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

var prefetch_req;

// retrieve XML document (reusable generic function);
// parameter is URL string (relative or complete) to
// an .xml file whose Content-Type is a valid XML
// type, such as text/xml; XML source must be from
// same domain as HTML file
function loadURL(url) {
  // branch for native XMLHttpRequest object
  if(window.XMLHttpRequest) {
    prefetch_req = new XMLHttpRequest();
    prefetch_req.onreadystatechange = processReqChange;
    prefetch_req.open("GET", url, true);
    prefetch_req.send(null);
    // branch for IE/Windows ActiveX version
  } else if (window.ActiveXObject) {
    prefetch_req = new ActiveXObject("Microsoft.XMLHTTP");
    if(prefetch_req) {
      prefetch_req.onreadystatechange = processReqChange;
      prefetch_req.open("GET", url, true);
      prefetch_req.send();
    }
  }
}

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
  } else if (window.ActiveXObject) {
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

function keyToAction(key_string) {
  if(key_string == "downarrow") {
  	return prefetchTypes.NEXTNODE;
  } else if(key_string == "uparrow") {
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

var prefetchObservations = new Object();

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

function nodeToString(currNode) {
  if(currNode) {
    return currNode.nodeName;
  } else {
  	return null;
  }
}

// Retuns a normalized probability array of possible actions
// that could be taken.
function predictNext(currNode, prevAction) {
  var possActions = new Array(prefetchTypes.OTHER + 1);
  var obs_string = String(prevAction) + " " + String(nodeToString(currNode));
  if(hasConsole) console.log('pfetch for ' + obs_string);
  if(prefetchObservations[obs_string] != null) {
    var totalObs = prefetchObservations[obs_string][0] +
      prefetchObservations[obs_string].length;
    for(var i=0; i<possActions.length; i++) {
      possActions[i] = (prefetchObservations[obs_string][i] + 1)/(totalObs);
    }
  } else {
  	uniformArray(possActions);
  }
  return possActions;
}

function uniformArray(array) {
  var val = 1.0 / (array.length);
  for(var i=0; i<array.length; i++) {
  	array[i] = val;
  }
}

function alertPrefetching() {
  var string = "";
  for(i in prefetchObservations) {
  	string += i + ": " + prefetchObservations[i].join(", ") + " \n";
  }
  
  var predictN = predictNext(lastNode, last_action);

  string += "\n" + lastNode + "  " + last_action;

  string += "\n\n" + predictN.join(", ");

  alert(string);
  return;
}

function doesNothing(text) {
  var node = text;
  return node;
}

// handle onreadystatechange event of req object
function processReqChange() {
  // only if req shows "loaded"
  if(prefetch_req.readyState == 4) {
    // only if "OK"
    if(prefetch_req.status == 200) {
      //doesNothing(prefetch_req.responseText);
      //alert('got 200 response');
    } else {
      //alert("There was a problem retrieving the XML data:\n" +
      //prefetch_req.statusText);
    }
    //console.log("calling prefetch Next from processReqChange");
    prefetchNext();
  }
}

var lastPrefetched = null;

var numPrefetched = 0;
function prefetchText(text) {
  var string = prepareSound(text);
  var url = urlForString(string);

  if(!prefetchRecord[poorHash(text)]) {
    prefetchRecord[poorHash(text)] = true;
    numPrefetched++;
    loadURL(url);
    return true;
  } else {
  	return false;
  }
}

function prefetchNode(node) {
  if(node) {
    var text = handlenode(node, true);
    var string = prepareSound(text);
    addToPrefetchQ(string);
    //prefetchText(text);
  }
}

function prefetchNextOnes(node, num) {
  for(i=0; i<num; i++) {
  	node = firstNodeNoSound(node);
  	node = nextBySpeaks(node);
    prefetchNode(node);
  }
}

function prefetchSomething() {
  var predictions = predictNext(lastNode, last_action);

  var impl = [1, 3, 5, 7];
  var highest = 1;
  var high_val = 0.0;
  for(var i=0; i<impl.length; i++) {
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

function poorHash(str) {
  if(!str || str.length <= 0) {
    return 'a((((0009209384';
  }

  str = str.replace(/[\n\r]+/, "");

  str = str.replace(/&#(\d)+;/, "$1");

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

var lettersNotFetched = ['w','.','h','t','p','f','g','c','i','j','k','l','m','n','o','d','q','r','s','e','u','v','a','x','y','z','b'];

function prefetchLetters() {
  if(prefetch_array && prefetch_array[0]) {
    for(i=0; i<lettersNotFetched.length; i++) {
      prefetch_array[0].push(lettersNotFetched[i]);
    }
  }
}
