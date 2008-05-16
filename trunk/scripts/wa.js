/*
 * wa.js  -  main WebAnywhere script
 * 
 * This script provides the main functionality for reading through a web page,
 * skipping through a web page, handling new page loads, capturing user input,
 * etc.
 */


// WebAnywhere Operating States.
var READING_PAGE = 0;
var LOADING_PAGE = 1;
var IN_BROWSER = 2;

// The current state of WebAnywhere.
// Start with IN_BROWSER.
var operating_state = IN_BROWSER;

// Information about the document that the system is currently reading.
var currentLoc = null;
var currentDoc = null;

// The current reading "caret."
var currentNode = null;
var currentWord = 0;
var currentChar = 0;

// The last node to be played by the system.
var lastNodePlayed = null;

// Keeps track of whehter a programmatic focus was requested.
var programmaticFocus = false;

var textBoxFocused = false;

var browserInit = false;
var init = 0;

var waiting_on_page = "";

var focusedNode = null;

// Is the Firebug console available?
var hasConsole = (typeof console != 'undefined' && typeof console.log != 'undefined');

// Should the actions of the user be recorded?
// This is used for user studies and should be kept to 'false' at most times.
var recordActions = false;

// 0 none, 1 JAWS, 2 Window-Eyes
var emulationType = 0;

// Recursion limit.
// TODO: remove 20 level "fudge factor"
var recursion_limit = 1000 - 20;

// Attach browser onload handler
if(window.addEventListener) {
  window.addEventListener('load', init_browser, false);
} else if(window.attachEvent) {
  window.attachEvent('onload', init_browser);
}

// Writes a string to the debug div, which is a location in the browser frame
// where debug messages are written.
function debug(str) {
  var debug_div = document.getElementById('debug_div');
  if(debug_div) {
  	debug_div.appendChild(document.createTextNode(str));
  }
}
// Counts number of times that updatePlaying() has been called.
// Something like the clock tick of the system.
var updatePlayingCount = 0;
// Updates the text that is displayed visually as what is currently being
// played by the system.
function updatePlaying() {
  var play_div = document.getElementById('playing_div');
  if(play_div) {
    play_div.innerHTML = (playing!=null) ? playing : "(null)";
  }

  var sound_div = document.getElementById('sound_div');

  if(currentNode && currentNode.nodeType == 1) {
    sound_div.innerHTML = "curr: " + (currentNode ? (currentNode.nodeName + ' ' + (((currentNode.parentNode) ? currentNode.parentNode.nodeName : ""))) : "nully") + " q: " + soundQ.length + " b: " + browseMode + ' focus: ' + focusedNode + ' las: ' + lastPath + ' threads: ' + free_threads + ' ' + (updatePlayingCount++) + ' ' + soundQ + ' val: ' + valPath + ' bMode:' + browseMode;
  } else {
    sound_div.innerHTML = "curr: " + (currentNode ? (currentNode.nodeName + ' (' + currentNode.data + ') ' + (((currentNode.parentNode) ? currentNode.parentNode.nodeName : ""))) : "nully") + " q: " + soundQ.length + " b: " + browseMode + ' focus: ' + focusedNode + ' las: ' + lastPath + ' threads: ' + free_threads + ' ' + (updatePlayingCount++) + ' ' + soundQ + ' val: ' + valPath + ' bMode:' + browseMode;
  }
}

// Initializes the WebAnywhere browser.  Called when the frameset page loads.
function init_browser() {
  browserInit = true;

  prefetch_array = new Array();
  prefetch_array[0] = new Array();
  prefetch_curr_index = 0;

  setInterval('updatePlaying()', 50);
  setInterval('playWaiting()', playWaitingInterval);

  var go_button = document.getElementById('location_go');
  var location_field = document.getElementById('location');

  if(window.attachEvent) location_field.attachEvent('onfocus', locationFocus);
  else if(window.addEventListener) location_field.addEventListener('focus', locationFocus, false);

  if(window.attachEvent) location_field.attachEvent('onblur', function() { top.navigation_frame.textBoxFocused = false; });
  else if(window.addEventListener) location_field.addEventListener('blur', function() { top.navigation_frame.textBoxFocused = false; }, false);

  if(window.attachEvent) go_button.attachEvent('onfocus', goButtonFocus);
  else if(window.addEventListener) go_button.addEventListener('focus', goButtonFocus, false);

  //  All for the location textbox.
  /*if(window.attachEvent) location_field.attachEvent('onkeypress', playKeypress);
  else if(window.addEventListener) location_field.addEventListener('keypress', playKeypress, false);

  if(window.attachEvent) location_field.attachEvent('onkeydown', tabLocation);
  else if(window.addEventListener) location_field.addEventListener('keypress', tabLocation, false);

  if(window.attachEvent) go_button.attachEvent('onkeydown', goKeyDown);
  else if(window.addEventListener) go_button.addEventListener('keydown', goKeyDown, false);

  // Deal with key presses elsewhere in document.
  if(window.attachEvent) document.attachEvent('onkeydown', docKeyPress);
  else if(window.addEventListener) document.addEventListener('keydown', docKeyPress, false);

  if(window.attachEvent) document.attachEvent('onkeypress', suppressKeys);
  else if(window.addEventListener) document.addEventListener('keypress', suppressKeys, false);

  if(window.attachEvent) document.attachEvent('onkeyup', suppressKeys);
  else if(window.addEventListener) document.addEventListener('keyup', suppressKeys, false);
*/
   
  if(window.attachEvent) document.attachEvent('onkeydown', function(e) { WA.Keyboard.handleKeyDown(e) });
  else if(window.addEventListener) document.addEventListener('keydown', function(e) { WA.Keyboard.handleKeyDown(e) }, false);

  if(window.attachEvent) document.attachEvent('onkeyup', function(e) { WA.Keyboard.handleKeyUp(e) });
  else if(window.addEventListener) document.addEventListener('keyup', function(e) { WA.Keyboard.handleKeyUp(e) }, false);

  if(window.attachEvent) document.attachEvent('onkeypress', function(e) { WA.Keyboard.handleKeyPress(e) });
  else if(window.addEventListener) document.addEventListener('keypress', function(e) { WA.Keyboard.handleKeyPress(e) }, false);

  if(soundPlayerLoaded) {
    setupBaseSounds();
  }

  // For Flash, the system waits until the Flash movie has loaded.
  // For embedded sounds, the system can proceed immediately.
  if(soundMethod == EMBED_SOUND_METHOD) {
    soundPlayerLoaded = true;
    newPage();
  }
}

// Called when the location bar gains focus.
function locationFocus(e) {
  top.navigation_frame.textBoxFocused = true;

  var target;
  if(!e) e = window.event;
  if(e.target) target = e.target;
  else if(e.srcElement) target = e.srcElement;
  if(target.nodeType == 3) target = target.parentNode;

  resetSounds();

  addSound("Location field text area:");
  if(target.value) {
    addSound(target.value);
  }
}

// Called when the finder box receives focus.
function finderBarFocus() {
  resetSounds();
  addSound("Type a string to find in the current page");
}

// Called in response to a keydown event on the browser frame's "GO" button.
function goKeyDown(e) {
  var key = top.navigation_frame.keyString(e);
  if(key == 'tab') {
    if(currentDoc.body) {
      top.navigation_frame.programmaticFocus = true;
      debug("goKeyDown:true");
      setCurrentNode(currentDoc.body);
      currentDoc.body.firstChild.focus();
      top.navigation_frame.programmaticFocus = false;
      browseMode = READ;
    }
    stopProp(e);
    return false;
  }
}

// Called in response to the focus event on the browser frame's "GO" button.
function goButtonFocus(e) {
  var target;
  if(!e) e = window.event;
  if(e.target) target = e.target;
  else if(e.srcElement) target = e.srcElement;
  if(target.nodeType == 3) // defeat Safari bug
    target = target.parentNode;

  var text = handlenode(target, true);
  resetSounds();
  addSound("Go") //text);
}

// Called when users hit a key when the last node in the page has focus.
// Current responds to the "tab" combination.
function tabEndNode(e) {
  var key = top.navigation_frame.keyString(e);
  if(key == 'tab') {
    addSound("End of Page.");
    stopProp(e);
    return false;
  }
}

// Called when users hit a key when the first node in the page is focused.
// Current responds to the "shift tab" combination.
function tabStartNode(e) {
  var key = top.navigation_frame.keyString(e);
  if(key == 'shift tab') {
    var go_butt =
      top.navigation_frame.document.getElementById('location_go');
    go_butt.focus();
    stopProp(e);
    return false;
  }
}

// Called when the user hits the TAB key from the location bar.
function tabLocation(e) {
  var key = top.navigation_frame.keyString(e);
  if(key == 'ctrl l') {
    stopProp(e);
    return false;
  } else if(key == 'shift tab') {
    resetSounds();
    addSound( "Start of Page." );
    stopProp(e);
    return false;
  }
}

// Focuses the location bar.
function focusLocation() {
  var location_field = document.getElementById('location');
  if(location_field) {
    location_field.blur();
    location_field.focus();
    location_field.select();
  }
}

// A flexible "focus element" function.
// Focuses the element with the provided ID in the provided document.
function focusElement(doc, element_id) {
  browseMode = PAUSED;
  resetSounds();

  var elem = doc.getElementById(element_id);
  if(elem) {
    elem.blur();
    elem.focus();
    if(elem.select) {
      elem.select();
    }
    setCurrentNode(elem);
  }
}

function focusNavigationElement(element_id) {
  var doc = getNavigationDocument();
  focusElement(doc, element_id);  
}

function focusContentElement(element_id) {
  var doc = getContentDocument();
  focusElement(doc, element_id);  
}

function getContentDocument() {
  return top.content_frame.document;
}

function getFirstContent() {
  var doc = getContentDocument();
  var first = doc.getElementById('always_first_node');
  if(!first && doc.body && doc.body.firstChild) { first = doc.body.firstChild; }
  return first;
}

function getLastContent() {
  var doc = getContentDocument();
  var last = doc.getElementById('always_last_node');
  if(!last && doc.body && doc.body.lastChild) { last = doc.body.lastChild; }
  return last;
}

// Gets the document element of the Navigation element.
function getNavigationDocument() {
  return top.navigation_frame.document;
}

function silenceAll() {
  browseMode = KEYBOARD;
  resetSounds();
}

// Speak text boxes when they are focused.
function textBoxFocus(element) {
  //var text = handlenode(element, true);
  //prefetch(text, true, false);  
}

function getCursor(myField) {
  if(!myField) {
    return -3;
  }
  if(!myField.value || myField.value == '') {
    return 0;
  } else if(document.selection) {
    var delim = "deliim";
    myField.focus();
    sel = document.selection.createRange();
    sel.text = delim;
    var pos = myField.value.indexOf("deliim");
    myField.value = myField.value.replace(/deliim/, '');
    return pos;
  } else if(myField.selectionStart || myField.selectionStart == '0') {
    var startPos = myField.selectionStart;
    return startPos;
  }
  return '-2';
}

function stopProp(e) {
  if(e.stopPropagation) {
    e.stopPropagation();
    e.preventDefault();
  } else {
    e.cancelBubble = true;
    e.returnValue = false;
    e.keyCode = 0;
  }
  return false;
}

function docKeyUpDown(e) {
  //alert('keystring: ' + keyString);
  var key = keyString(e);
  alert('key: ' + key);
  if(key.matches(/ctrl l/)) {
    browseMode = KEYBOARD;
    resetSounds();
    stopProp(e);
    return false;
  } else {
    return true;
  }
}

function docKeyPress(e) {
  var targ;
  if(!e) e = window.event;
  if(e.target) targ = e.target;
  else if(e.srcElement) targ = e.srcElement;
  if(targ.nodeType == 3) // defeat Safari bug
    targ = targ.parentNode;

  var key = top.navigation_frame.keyString(e);

  if(targ.nodeName == "SELECT" &&
     /ctrl.*arrow(up|down)/.test(key)) {
    return;
  }

  if(top.navigation_frame.textBoxFocused) {
    if(/\s|tab|enter|home|arrowleft|arrowright/.test(key)) {
      return;
    }
  }

  top.navigation_frame._docKeyPress(key, targ, e);
}


var refocusedSelect = null;
function refocusSelect() {
  top.navigation_frame.programmaticFocus = true;
  debug("refocusedSelect:true");
  refocusedSelect.focus();
}


// Returns true if we have a sound for this keycode and false otherwise
function isValidKey(k) {
  if(k >= 32 && k <= 126)
    return true;
  return false;
}

// Converts a keycode to the uppercase version of the keycode
function toUpperKeyCode(k) {
  if(k > 96 && k < 123)
    return k-32;
  return k;
}

function _playkey(key, targ) {
  top.navigation_frame.resetSounds();
  top.navigation_frame.browseMode = top.navigation_frame.KEYBOARD;

  if(/ctrl l/.test(key)) {
    focusLocation();
  } /* else if(/ctrl/.test(key)) {
  } */ else if(/arrow|backspace|del/.test(key)) {
    var pos = top.navigation_frame.getCursor(targ);
    var text = targ.value;
    if(/left|right|backspace|del/.test(key)) {
      if(/left/.test(key)) {
	text = text.substring((pos-1), pos);
      } else if(/right/.test(key)) {
	text = text.substring(pos+1, (pos+2));
      } else if(/backspace/.test(key)) {
        text = text.substring((pos-1), pos);
      } else if(/del/.test(key)) {
        text = text.substring(pos, pos+1);
      }
      if(!text || text=="") {
      	text = "blank";
      }
      top.navigation_frame.addSound(text);
    } else {
      return;
    }
  } else if(key=="enter") {
    return;
  } else {
    //prefetch(key, true, false);
    top.navigation_frame.prefetch(key, true, false);
  }
}

// Plays the sounds for a keypress specifically for a textbox.
function playKeypress(e) {
  var stopPropagate = false;

  top.navigation_frame.resetSounds();
  top.navigation_frame.browseMode = top.navigation_frame.KEYBOARD;

  if(!e) e = window.event;

  var targ;
  if(e.target) targ = e.target;
  else if(e.srcElement) targ = e.srcElement;

  var key = top.navigation_frame.WA.Keyboard.getKeyString(e);

  if(/ctrl l/.test(key)) {
    focusLocation();
    stopPropagate = true;
  } /* else if(/ctrl/.test(key)) {
    docKeyPress(e);
  } */ else if(/arrow/.test(key)) {
    var pos = top.navigation_frame.getCursor(targ);
    var text = targ.value;
    if(/left|right/.test(key)) {
      if(/left/.test(key)) {
	text = text.substring((pos-1), pos);
      } else if(/right/.test(key)) {
	text = text.substring(pos, (pos+1));
      }
      top.navigation_frame.addSound(text);
    } else {
      return;
    }
  } else if(key=="enter") {
    return;
  } else {
    var keynum;
    // Get the keycode
    if(!e.which) {
      keynum = e.keyCode;
    } else if(e.which) {
      keynum = e.which;
    }
    //prefetch(key, true, false);
    top.navigation_frame.prefetchKeycode(keynum, true);
  }

  if(stopPropagate) {
    stopProp(e);
    return false;
  } else {
    return true;
  }
}

// Called on each node upon page load.
// Performs a number of administrative functions.
function preVisit(node) {
  if(isFocusable(node)) {
    if(window.attachEvent) node.attachEvent('onfocus', gotFocus);
    else if(window.addEventListener) node.addEventListener('focus', gotFocus, false);
  }

  if(prefetchStrategy >= 1) {
  	text = handlenode(node, true);
  	if(text && (prefetchStrategy <= 1 || prefetch_curr_index == 0)) {
  	  prefetch_array[prefetch_curr_index].push(text);
  	}
  }

  if(node.nodeType == 1) {
    if(node.tagName == "LABEL") {
      var for_id = node.getAttribute('for');
      if(for_id) {
	    var id_elem = node.ownerDocument.getElementById(for_id);
	    if(id_elem) {
	      id_elem.setAttribute('my_label', handleChildNodes(node));
	    }
      }
    }
  } else if(node.nodeType == 3 && !internalNode(node)) {
    var node_text = node.data;
    if(node_text && node_text.length > 0 && /[\.\?\!,]\s/.test(node_text)) {
      var matches = node_text.match(/[^\.\?\!,]{20,}[\.\?\!,]?\s*/g);
      if(matches) {
        var node_before = null;
        var doc = node.ownerDocument;
        for(var i=matches.length-1; i>=0; i--) {
          var curr_node = doc.createTextNode(matches[i]);
      	  if(node_before==null) {
      	    if(node.parentNode) node.parentNode.replaceChild(curr_node, node);
      	  } else {
            if(node_before.parentNode) node_before.parentNode.insertBefore(curr_node, node_before);
          }
      	  node_before = curr_node;
        }
      }
    }
  }
}

// Event handler for changes to select elements.
function selectChange(key_string, target) {
  if(/ctrl arrow(up|down)/.test(key_string)) {
    if(/ctrl/.test(key_string)) {
      resetSounds();
      browseMode = KEYBOARD;

      var sindex = target.selectedIndex;
      if(/down/.test(key_string)) {
	    sindex = (sindex + 1 < target.options.length) ? sindex + 1 : sindex;
      } else if(/up/.test(key_string)) {
	    sindex = (sindex - 1 >= 0) ? sindex - 1 : sindex;
      }

      if(isIE()) {
        target.selectedIndex = sindex;
      }

      var text_value = target.options[sindex].value;
      addSound(text_value);
    }
  }
}

// Called when a new page loads.
function newPage() {
  browseMode = PAUSED;

  var content_frame = top.document.getElementById("content_frame");
  if(content_frame) {
    var src = content_frame.src;
    if(src.indexOf(top.webanywhere_url)!=0) {
      var location_field = document.getElementById('location');
      if(/mail\.google\.com\/mail/.test(location_field.value) &&
          !(/ui=?html/i.test(location_field.value))) {
        setContentLocation('https://mail.google.com/mail/?ui=html&zy=f');
      } else {}
    } else if(/starting_url=.*/.test(src)) {} // Eventually will enable users to specify starting page.
  }

  var newDoc = top.content_frame.document;
  var newLoc = String(top.content_frame.document.location);  // Document URL.

  valPath += "|";

  if(newDoc != currentDoc && currentLoc != newLoc) {
    var location_field = document.getElementById('location');
    if(location_field) {
      recordLine('new page: ' + location_field.value);
      if(/mail\.google\.com\/mail/.test(location_field.value) && !(/ui=?html/.test(location_field.value))) {
      	setContentLocation('https://mail.google.com/mail/?ui=html&zy=f');
      }
      var temp_loc = location_field.value;
      location_field.value = temp_loc.replace(/[^A-Za-z0-9\s~!@#\$%\^&\*\\.\,:<>\+\{\}(\)\-\?\\\/]/g, "");
    }

  var loc_val = location_field.value;
  if(loc_val.match(/.*ServiceLogin.*/)) {
    //alert('matched');
    var content_doc = top.content_frame.document;
    var login_form = content_doc.getElementById("gaia_loginform");
  }

  currentDoc = newDoc;
  setCurrentNode(currentDoc.body);
  currentLoc = newLoc;

  basePriority = startPriority;
    
  // Deal with key presses elsewhere in document.
  if(window.attachEvent) currentDoc.attachEvent('onkeydown', function(e) {WA.Keyboard.handleKeyDown(e) });
  else if(window.addEventListener) currentDoc.addEventListener('keydown', function(e) {WA.Keyboard.handleKeyDown(e) }, false);

  if(window.attachEvent) currentDoc.attachEvent('onkeyup', function(e) {WA.Keyboard.handleKeyUp(e) });
  else if(window.addEventListener) currentDoc.addEventListener('keyup', function(e) {WA.Keyboard.handleKeyUp(e) }, false);

  if(window.attachEvent) currentDoc.attachEvent('onkeypress', function(e) {WA.Keyboard.handleKeyPress(e) });
  else if(window.addEventListener) currentDoc.addEventListener('keypress', function(e) {WA.Keyboard.handleKeyPress(e) }, false);

  treeTraverseRecursion(currentNode, preVisit, leafNode, recursion_limit, true);

  var start_node = currentDoc.createElement('div');
  start_node.innerHTML = currentDoc.title;
  if(isIE()) {
    start_node.tabIndex = 0;
   } else {
    start_node.setAttribute('tabindex', 0);
  }
  start_node.setAttribute('id', 'always_first_node');
  currentDoc.body.insertBefore(start_node, currentDoc.body.firstChild);
  //start_node.focus();

  var end_node = currentDoc.createElement('div');
  end_node.innerHTML = "End of Page";
  if(isIE()) {
    end_node.tabIndex = 0;
  } else {
    end_node.setAttribute('tabindex', 0);
  }
  end_node.setAttribute('id', 'always_last_node');
  currentDoc.body.appendChild(end_node);

    /*if(window.attachEvent) {
      start_node.attachEvent('onkeydown', tabStartNode);
      start_node.attachEvent('onfocus', startNodeFocus);
      //start_node.attachEvent('onkeypress', suppressKeys);
      //start_node.attachEvent('onkeyup', suppressKeys);

      end_node.attachEvent('onkeydown', tabEndNode);
      end_node.attachEvent('onkeypress', suppressKeys);
      end_node.attachEvent('onkeyup', suppressKeys);
      end_node.attachEvent('onfocus', endNodeFocus);
    } else if(window.addEventListener) {
      start_node.addEventListener('keypress', tabStartNode, false);
      start_node.addEventListener('focus', startNodeFocus, false);
      //start_node.addEventListener('keydown', suppressKeys, false);
      //start_node.addEventListener('keyup', suppressKeys, false);

      end_node.addEventListener('keypress', tabEndNode, false);
      end_node.addEventListener('keydown', suppressKeys, false);
      end_node.addEventListener('keyup', suppressKeys, false);
      end_node.addEventListener('focus', endNodeFocus, false);
    }*/

  if(prefetchStrategy > 0) {
    prefetchNext();
  }
  }

  soundsPlayed = 0;
  totalLatency = 0;
  totalDuration = 0;

  resetSounds();
  playing = null;

  addSound("Page has loaded.");
  if(currentDoc.title) {
    addSound(currentDoc.title);
  }

  // Speak the number of headings and links on the page.
  addSound(countNumHeadings() + " Headings " + countNumLinks() + " Links");

  browseMode = READ;

  var nav_doc = getNavigationDocument();
  var rec = nav_doc.getElementById('recording');

  if(rec && !(/debug/.test(top.document.location))) {
    postURL('recorder.php', "submit=submit&recording=" + rec.value);
    rec.value = "";
  }
}

// Focuses the first node of the document and resets the reading to start
// back at the beginning.
function startNodeFocus(e) {
  if(currentDoc && currentDoc.title) {
    resetSounds();
    addSound(currentDoc.title);
  }
}

// Focuses the end node and resets the reading to last node in the document.
function endNodeFocus(e) {
  if(currentDoc && currentDoc.title) {
    resetSounds();
    addSound("End of page");
  }
}

// Goes back one step in the history.
function goBack() {
  if(top.content_frame.history.back) {
  	top.content_frame.history.back();
  }
}

// Goes forward one step in the history.
function goForward() {
  if(top.content_frame.history.forward) {
  	top.content_frame.history.forward();
  }
}

// Called by event handlers for both the location bar and the 'Go' button.
function navigate(e) {
  playLoadingSound();

  var loc = document.getElementById('location');
  var loc_val = loc.value;

  // GMail-specific redirection.
  if((/^(https?:\/\/)?((www\.)?gmail\.com|mail\.google\.com)/.test(loc_val)) &&
      !(/ui=?html/.test(loc_val))) {
    loc_val = "https://mail.google.com/mail/?ui=html&zy=a";
  } else if(loc_val.match(/\.pdf$/)) {
    loc_val = "http://www.google.com/search?q=cache:" + loc_val;
  }

  loc.value = loc_val;

  setContentLocation(loc_val);
}


// Makes URL come from same domain as WebAnywhere using the web proxy.
// The subdomain (if supplied) is tacked on to the front.
function proxifyURL(loc, subdomain) {
  // No need to proxy from our own server;
  // can cause problems when running on localhost.
  if(loc.indexOf(top.webanywhere_url) != 0) {
    loc = top.web_proxy_url.replace(/\$url\$/, encode64(loc));
    if(subdomain && subdomain.length > 0) {
      loc = top.webanywhere_location + loc;
      loc = loc.replace(top.webanywhere_domain, (subdomain + '.' + top.webanywhere_domain));
    }
    //if(hasConsole) console.debug('in here: ' + subdomain + ' ' + loc + top.webanywhere_domain);
  }

  return loc;
}

// Initialize the sound_url_base to appear to come from same location as WebAnywhere.
// This is only needed for prefetching using XmlHttpRequest.
//function setSoundBase() {
//  top.sound_url_base = proxifyURL(top.sound_url_base);
//  console.log('setting: ' + top.sound_url_base);
//}

var domainRegExp = /^(https?:\/\/)?([^\/]+\.[^\/]+[^\/]*)/;

// Called to set the location of content frame.
function setContentLocation(loc) {
  var dmatches = String(loc).match(domainRegExp);

  var domain_requested = "";

  if(top.cross_domain_security) {
    if(dmatches && dmatches.length > 2) {
      domain_requested = dmatches[2];
    } else { // Domain is invalid.
    }
  }
  
  loc = proxifyURL(loc, domain_requested);

  if(hasConsole) console.debug('location is ' + loc);

  // Set new location by setting the src attribute of the content frame.
  // Do not set the location of the frame document because WebAnywhere can
  // lose control of this because of redirects, etc.
  var content_frame = top.document.getElementById('content_frame');
  content_frame.setAttribute('src', loc);
}

// Plays a sound.  Updates any information related to that, such as prefetcher.
function playNodeSound(node, node_text) {
  addSound(node_text);

  // Update prefetcher with node that will be played.
  if(prefetchStrategy > 1) {
    if(prefetchStrategy == 3) {
      //alert('prefetching something');
      prefetchSomething();
    } else {
      incPrefetchIndex();
      prefetchNextOnes(currentNode, 3);
    }
    // else if(prefetchStrategy == 2) {
      //alert('prefetching: ' + node_text + ":" + node + ' ' + node.nextSibling);
      //while(node && node.nodeName != "BODY" && node.parentNode.childNodes.length < 2) {
   	  //  node = node.parentNode;
      //}
      //treeTraverseRecursion(node, addNodeToPrefetch, leafNode, 3, true);
      //}
  }
}

// Adds the specified node to the prefetch queue.
function addNodeToPrefetch(node) {
  text = handlenode(node, true);

  if(text && /\S/.test(text) && (prefetchStrategy >= 1 || prefetch_curr_index == 0)) {
    addToPrefetchQ(text);
  }
}

// Does a DFS on the supplied node.
function treeTraverseRecursion(node, visitor, isleaf, inv_depth, first) {
  if(inv_depth < 0) {
  	return;
  }

  if(!first && node) {
    visitor(node);
  }

  if(!isleaf || !isleaf(node)) {
    if(node.firstChild) {
      treeTraverseRecursion(node.firstChild, visitor, isleaf, inv_depth-1, false);
    }
  }

  if(node.nextSibling) {  	
    treeTraverseRecursion(node.nextSibling, visitor, isleaf, inv_depth-1, false);
  }
}

// Responds to user-initiated focus events,
// such as those triggered by the mouse.
function gotFocus(e) {
  /*
  var targ;
  if(!e) e = window.event;
  if(e.target) targ = e.target;
  else if(e.srcElement) targ = e.srcElement;
  if(targ.nodeType == 3) // defeat Safari bug
    targ = targ.parentNode;

  debug( "stat:" + top.navigation_frame.programmaticFocus );
  if( !top.navigation_frame.programmaticFocus ) {
    var dnode = top.navigation_frame.dfsNode(targ, false);
    top.navigation_frame.setCurrentNode(dnode);
    debug("dnode:" + ((dnode && dnode.tagName) ? dnode.tagName : dnode) );
    var test_div = top.navigation_frame.document.getElementById('test_div');
    test_div.innerHTML = "got focus " + targ.nodeName + ' ' + targ + ' ' + top.navigation_frame.programmaticFocus;
    top.navigation_frame.resetSounds();

    browseMode = PLAY_ONE;
  } else {
  }

  focusedNode = targ;

  debug("focus:false");
  top.navigation_frame.programmaticFocus = false;*/
}

// Play the previous character.
function prevChar() {
  var node_text = handlenode(currentNode, true);
  if(node_text) {
    browseMode = KEYBOARD;
    var curr = getCurrentChar();
    if(curr > 0 && curr <= node_text.length) {
      addSound(node_text.substring(curr-1, curr));
      setCurrentChar(curr-1);
    } else {
      browseMode = PREV_CHAR_BACKONE;
      prevNode();
    }
  } else {
    prevNode();
  }
}

// Sets node that will be at the current cursor location.
function setCurrentNode(node) {
  top.navigation_frame.currentNode = node;
  setCurrentChar(-1);
}

// Sets the character at the current cursor location.
function setCurrentChar(pos) {
  top.navigation_frame.currentChar = pos;  
}

// Returns the character at the current cursor location.
function getCurrentChar() {
  return top.navigation_frame.currentChar;
}

//----------------------- START ADVANCE TO TAG ---------------------

// Returns a function that return true when a provided elem has
// the specified name (tag) and attribute (attrib).
function matchByTag(tag, attrib) {
  var matchByTagFunc = function(elem) {
 	return isTagAttribute(elem, tag, attrib);
  };
  return matchByTagFunc;
}

// Determines if a tag is visible.
// Tags that aren't visible, shouldn't be read.
function isVisible(elem) {
  if(elem.nodeType == 1) {
  	if(elem.tagName == "INPUT") {
      var input_type = elem.getAttribute('type');
      if(input_type && /hidden/i.test(input_type)) {
        return false;
      }
  	}
  }

  // Default is that it's visible.
  return true;  
}


// Functions for navigating within a table.
function nextTableRow(node) {
  return navTableCell(node, 1, 0, "end of table");
}
function prevTableRow(node) {
  return navTableCell(node, -1, 0, "start of table");
}
function nextTableCol(node) {
  return navTableCell(node, 0, 1, "end of table");
}
function prevTableCol(node) {
  return navTableCell(node, 0, -1, "start of table");
}

// Primary function for navigating within a table.
function navTableCell(node, row_offset, col_offset, edge_message) {
  if(!node) return null;
	
  var matching_row = null;
  var matching_col = null;

  do {
  	if(node.nodeName == "TD") {
  	  matching_col = node;
  	}
    node = node.parentNode; 
  } while(node && node.nodeName != "TR");
  matching_row = node;

  var rowIndex = -1;
  var colIndex = -1;
  if(matching_row && matching_row.nodeName == "TR") {
    rowIndex = matching_row.rowIndex;    
  }
  if(matching_col && matching_col.nodeName == "TD") {
  	colIndex = matching_col.cellIndex;
  }

  if(rowIndex != -1 && colIndex != -1) {
    var final_row = rowIndex + row_offset;
    var table = matching_row.parentNode;

    if(table && table.nodeName == "TBODY" &&
         final_row >= 0 && final_row < table.rows.length) {
      var row = table.rows[final_row];
      var final_col = colIndex + col_offset;

      if(row && final_col >= 0 && final_col < row.cells.length) {
        var col = row.cells[final_col];
        return col;
      }
    }	
  } else {
  	addSound('Not in a table.');
  	return null;
  }

  addSound(edge_message);
  return null;
}

// Focusable elements can be matched by the tag names shown here.
var fucusableElementRegExp = /^A|SELECT|TEXTAREA|BUTTON|INPUT/;

// Matches focusable elements.
function matchByFocusFunc(elem) {
  if(elem && elem.nodeType == 1)  {
    var tindex = elem.getAttribute('tabindex');
    if(fucusableElementRegExp.test(elem.nodeName)) {
      if(elem.tagName == "INPUT") {
        var input_type = elem.getAttribute('type');
        if(input_type && /hidden/i.test(input_type)) {
          return false;
        }
      }
      
      return true;
    } else if((tindex && tindex >=0) || (elem.tabIndex && elem.tabIndex >= 0)) {
	  return true;
    }
  }
  return false;
}

// Matches readable (non-empty) elements.
function nonEmptyMatchFunc() {
  var func = function(elem) {
    if(leafElement(elem)) {
      var text = handlenode(elem, true);
      if(/\S/.test(text)) {
	return true;
      }
    }
    return false;
  };
  return func;
}

// Matches elements matching the supplied text, used for find functionality.
// context:  text to be matched.
function contentMatchFunc(context) {
  var func = function(elem) {
    if(leafElement(elem)) {
      var text = handlenode(elem, true);
      var reg = new RegExp(context, "i");

      if(reg.test(text)) {
    	return true;
      }
    }

    return false;
  };

  return func;
}

// Matches elements that would produce speech if read.
function matchBySpeaksFunc() {
  var func = function(elem) {
    var text = handlenode(elem, true);
    if(text && text != "") {
      return true;
    }

    return false;
  };

  return func;
}

function nextBySpeaks(node) {
  var matcher = matchBySpeaksFunc();
  return _nextNodeByMatcher(matcher, node);
}

function nextByFocus(node) {
  var matcher = matchByFocus();
  return _nextNodeByMatcher(matcher, node);
}

function nextByTag(node, tag) {
  var matcher = matchByTag(tag, null);
  return _nextNodeByMatcher(matcher, node);
}

function nextNonEmpty() {
  var matcher = nonEmptyMatchFunc();
  return nextNodeByMatcher(matcher, "");  
}

function getFinderValue() {
  var find_text = getFinderBox();
  var find_val = find_text.value;

  return find_val;
}

function getFinderBox() {
  var nav_doc = getNavigationDocument();
  var find_text = nav_doc.getElementById('finder_field');

  return find_text;
}

function nextNodeContentFinder() {
  var find_val = getFinderValue();

  var result = nextNodeContentFind(find_val);

  if(result) {
    browseMode = PLAY_ONE;
  } else {
    browseMode = KEYBOARD;
  }
}

function prevNodeContentFinder() {
  var find_val = getFinderValue();

  var result = prevNodeContentFind(find_val);

  if(result) {
    browseMode = PLAY_ONE;
  } else {
    browseMode = KEYBOARD;
  }
}

function nextNodeContentFind(context) {
  var matcher = contentMatchFunc(context);
  return nextNodeByMatcher(matcher, "phrase found");
}

function prevNodeContentFind(context) {
  var matcher = contentMatchFunc(context);
  return prevNodeByMatcher(matcher, "phrase found");
}

function matchByFocus() {
  return matchByFocusFunc;
}

// Goes to the next node with the given tagName and optional attribute.
// tag -    a regular expression that matches the nodeName
//          of the appropriate type.
// attrib - an option attribute that needs to be present
//          in order for a node to match
function nextNodeTagAttrib(tag, attrib) { 
  var matcher = matchByTag(tag, attrib);
  
  // Switches on the known regular expression patterns.
  switch(tag.toUpperCase()) {
    case "H":
      description = "headings"; break;
    case "TR":
      description = "table rows"; break;
    case "INPUT|SELECT|BUTTON":
      description = "input elements"; break;
    case "TABLE":
      description = "tables"; break;
    case "P":
      description = "paragraphs"; break;
    default:
      description = "results"; break;
  }

  return nextNodeByMatcher(matcher, description);
}

// Goes to the next node that is focusable.
// Used to simulate TAB key press.
function nextNodeFocus() { 
  var matcher = matchByFocus();
  return nextNodeByMatcher(matcher, "");
}

// Finds the next node that matches the supplied 'matcher' function.
function _nextNodeByMatcher(matcher, node) {
  var last_result = null;
  var result = node;

  // Some ugliness to handle Javascript recursion limits, which
  // could otherwise cause the method to fail on large web pages.
  do {
    last_result = result;
    result = nextNodeNoSound(last_result, matcher, true, 0);
  } while(last_result != result && !matcher(result));
  return result;
}

// Returns the very next node, regardless of its type.
function firstNodeNoSound(node) {
  var result = nextNodeNoSound(node, function(elem) { return true; }, true, -1);
  return result;
}

// Function takes as input
// 1)  a "matcher" function which takes as input a DOM element and returns
//     true if it matches and false otherwise.
// 2)  a "description" which is a string that describes the type of element
//     being looked for, which is used to describe to users what was found.
function nextNodeByMatcher(matcher, description) {
  if(browseMode == PAUSED) {
    return false;
  } else if(!currentNode) {
    if(!currentDoc) {
      currentDoc = top.content_frame.document;
    }
    if(currentDoc) {
      setCurrentNode(currentDoc.body);
    }
    if(!currentNode) {
      return false;
    }
  }

  var result = _nextNodeByMatcher(matcher, currentNode);

  if(result) {
    var result_id = "";
    if(result.getAttribute) {
      result_id = result.getAttribute('id');
    }
    if(result_id == 'always_last_node' && description != "") {
      addSound('no ' + description);
      return false;
    } else {
      visit(result);
      setCurrentNode(result);
      return true;
    }
  } else if(description != "") {
    addSound('no ' + description);
    return false;
  }
}

// Finds the next node that matches 'matcher'
// without queueing it to be spoken.
function nextNodeNoSound(node, matcher, first, num) {
  var result = "";

  // Don't let Javascript die because of recursion limit.
  if(num > recursion_limit) {
    return node;
  }

  if(num < 0) {
    num = 0;
  } else if(matcher(node)) { // && isVisible(node)) {
      result = node;
      if(browseMode == PLAY_ONE) {
        browseMode = KEYBOARD;
      }
      return result;
  }

  // Check if we're the body
  if(!first && node.nodeName == "BODY") {
    var last_node = document.getElementById('always_last_node');
    result = last_node;
    return result;
  }

  // Explore children
  if(!leafNode(node) && node.firstChild) {
    result = nextNodeNoSound(node.firstChild, matcher, false, num+1);
    if(result != null)
      return result;
  }

  // Explore Siblings
  if(node.nextSibling) {
    result = nextNodeNoSound(node.nextSibling, matcher, false, num+1);
    if(result != null)
      return result;
  }

  // Explore Parent Tree
  while(node.parentNode) {
    node = node.parentNode;
    if(node.nodeName == "BODY") {
      result = node.lastChild; // "Fell off bottom.";
      browseMode = KEYBOARD;
      var last_node = currentDoc.getElementById('always_last_node');
      if(last_node) result = last_node;

      return result;
    } else if(node.nextSibling) {
      result = nextNodeNoSound(node.nextSibling, matcher, false, num+1);
      if(result != null)
        return result;
    }
  }

  return result;
}

// Goes to the next node with the given tagName and optional attribute
function prevNodeTagAttrib(tag, attrib) { 
  var matcher = matchByTag(tag, attrib);
  prevNodeByMatcher(matcher);
}

// Goes to the next node with the given tagName and optional attribute
function prevNodeFocus() { 
  var matcher = matchByFocus();
  prevNodeByMatcher(matcher);
}

// Maches the previous node that matches the function matcher.
function prevNodeByMatcher(matcher) {
  if(browseMode == PAUSED) {
    return;
  } else if(!currentNode) {
    if(!currentDoc) {
      currentDoc = top.content_frame.document;
    }
    if(currentDoc) {
      setCurrentNode(currentDoc.body);
    }
    if(!currentNode) {
      return;
    }
  }

  var result = null;
  var last_result = null;

  do {
    last_result = result;
    result = prevNodeNoSound(currentNode, matcher, 0, 0);
  } while(last_result != result && !matcher(result));
  
  if(result) {
    visit(result);
    setCurrentNode(result);
  }
}

// Boolean: Does the parent node match the given matcher function?
function parentMatches(node, matcher) {
  return matcher(node.parentNode);
}

// Does node only make sense inside parent?
function internalNode(node) {
  var parent = node.parentNode;
  if(parent) {
  	if(parent.nodeName == "OPTION" || parent.nodeName == "SELECT") {
      return true;
  	}
  }

  return false;
}

// Finds the previous node that matches the supplied 'matcher'
// and returns it.
function prevNodeNoSound(node, matcher, first, num) {
  // Recursion hack, prevents Javascript from crashing from going over
  // 1000-level recursion limit.
  if(first > recursion_limit) {
    return node;
  }

  var result = null;

  if(num > 1 || (first > 4 && !internalNode(node))) {
    num++;
  } else if(first!=0 && !internalNode(node) && !parentMatches(node, matcher)) {
    var node_text = handlenode(node, true);
    if((node_text && !(/^\s*$/.test(node_text)))) {
      num++;
    }
  } else if(first==0 && node && node.nodeType == 1) {
    var node_id = node.getAttribute('id');
    if(node_id && node_id == "always_last_node") {
      num++;
    }
  }

  // Check if this is the right node
  if(num > 1 && matcher(node)) { // && isVisible(node)) {
    return node;
    /*var node_text = handlenode(node, true);
    if( node_text != "" ) {
      result = node_text;
      setCurrentNode(node);
      setCurrentChar(node_text.length);
      if(browseMode == PREV_CHAR) {
        browseMode = KEYBOARD;
        prevChar();
      } else if(browseMode == PREV_CHAR_BACKONE) {
        browseMode = PREV_CHAR;
      } else if(browseMode == PLAY_ONE_BACKWARD) {
	    browseMode = KEYBOARD;
      }
      return result;
    }*/
  }

  // Base case: check for body
  if(node.tagName == "BODY") {
    browseMode = KEYBOARD;
    return getFirstContent();
  }

  // Explore previous sibling's right-hand path
  if(node.previousSibling) {
    node = node.previousSibling;
    while(node && node.nodeType == 1 && node.lastChild) {
      if(node.tagName == "SCRIPT" ||
         node.tagName == "STYLE") {
        break;
      }
      node = node.lastChild;
    }
    result = prevNodeNoSound(node, matcher, first+1, num);
    if(result != null)
      return result;
  }

  // Go to Parent
  return prevNodeNoSound(node.parentNode, matcher, first+1, num);
}

// Returns true if the node is an element with the given tag name and 
// attribute (optional).
// tag - regular expression to be applied to tag names.
// node - node to be tested.
// attrib - attribute node is required to have to pass test.
function isTagAttribute(node, tag, attrib) {
  if(!node || !node.tagName) {
    return false;
  }

  var tagmatch = new RegExp("^" + tag, "i");

  if(attrib) {
    return (node.nodeType == 1 && tagmatch.test(node.tagName) && myHasAttribute(node, attrib));
  } else {
    return (node.nodeType == 1 && tagmatch.test(node.tagName));
  }
}

//----------------------- END ADVANCE TO TAG ---------------------

var lastNode = null;

function nextNode() {
  var next_node_info = _nextNode();
  var next_node = next_node_info[0];
  var node_text = next_node_info[1];

  if(next_node && node_text) {
    recordLine('playing sound: ' + getXPath(next_node) + ' ' + node_text);
    lastNode = next_node;

    playNodeSound(next_node, node_text);
    setCurrentChar(node_text.length);
    if(browseMode == PLAY_ONE) {
      browseMode = KEYBOARD;
    }
  }
}

function _nextNode() {
  var spoken_node = null; // The node that is advanced to.
  var node_text = null;

  if(browseMode == PAUSED) {
    return [null, null];
  } else if(!currentNode) {
    if(!currentDoc) {
      currentDoc = top.content_frame.document;
    }
    if(currentDoc) {
      setCurrentNode(currentDoc.body);
    }
    if(!currentNode) {
      return [null, null];
    }
  }

  debug("nextNode:" + ((currentNode.tagName) ? currentNode.tagName : currentNode));
  visit(currentNode);

  node_text = handlenode(currentNode, true);
  if(node_text) {
  	
  	/*recordLine('playing sound: ' + getXPath(currentNode) + ' ' + node_text);
  	
  	lastNode = currentNode;
  	
    addSound(node_text);
    setCurrentChar(node_text.length);
    if(browseMode == PLAY_ONE) {
      browseMode = KEYBOARD;
    }*/
    spoken_node = currentNode;
  }

  if(currentNode.firstChild && !leafNode(currentNode)) {
    setCurrentNode(dfsNode(currentNode, true));
  } else if(currentNode.nextSibling) {
    setCurrentNode(currentNode.nextSibling);
  } else if(currentNode.nodeName == "BODY") {
    setCurrentNode(currentNode.firstChild);
  } else {
    goBackUp();
  }
  
  return [spoken_node, node_text];
}

function goBackUp() {
  var oldCurrent = currentNode;

  while(currentNode.parentNode) {
    setCurrentNode( currentNode.parentNode );
    if(currentNode.nextSibling) {
      setCurrentNode(currentNode.nextSibling);
      break;
    }
    if(currentNode.nodeName == "BODY") { // At the last node.
      browseMode = KEYBOARD;
      var end_node = null;
      if(currentDoc) {
	    end_node = currentDoc.getElementById('always_last_node');
      } else {
	    end_node = oldCurrent;
      }
      setCurrentNode(end_node);
      break;
    }
  }
}


var valPath = "";

function prevNode() {
  debug("prevNode");
  visit(currentNode);

  var node_text = handlenode(currentNode, true);
  if(node_text) {
    setCurrentChar(node_text.length);
    if(browseMode == PREV_CHAR) {
      browseMode = KEYBOARD;
      prevChar();
      return;
    } else if(browseMode == PREV_CHAR_BACKONE) {
      browseMode = PREV_CHAR;
    } else if(browseMode != PAUSED) {
      addSound(node_text);
      if(browseMode == PLAY_ONE_BACKWARD) {
        browseMode = KEYBOARD;
      }
    }
  }  

  if(currentNode.tagName == "BODY") {
    browseMode = KEYBOARD;
    addSound("Start of page.");
  } else if(currentNode.previousSibling) {
    setCurrentNode(currentNode.previousSibling);
    setCurrentNode(rdfsNode(currentNode, true));
  } else {
    setCurrentNode(currentNode.parentNode);
  }
}

function rdfsNode(node, focusMe) {
  while(node && node.nodeType == 1 && node.lastChild && !leafNode(node)) {
    if(node.tagName == "SCRIPT" ||
       node.tagName == "STYLE") {
      break;
    }
    if(focusMe && top.navigation_frame.isFocusable(node)) {
      debug( "rdfsNode" );
      focusNode(node);
    }
    node = node.lastChild;
  }
  return node;
}

function dfsNode(node, focusMe) {
  if(focusMe && top.navigation_frame.isFocusable(node)) {
    debug( "dfsNode" );
    focusNode(node);
  }
  if(leafNode(node)) {
    return node;
  } else {
    return node.firstChild;
  }
}

function focusNode(node) {
  if(focusedNode != node) { 
    programmaticFocus = true;
    debug("focusNode:true");
    try {
      node.focus();
      if(node.select) {
      	node.select();
      }
    } catch(e) {
      debug('focused: ' + node);
    }
  }
}

// Gets called for each element that is visited.
function visit(elem) {
  if(isFocusable(elem)) {
    debug("visit");
    focusNode(elem);
  }
  lastNodePlayed = elem;
}

// Counts the number of links that have an href, indicating that they're
// a link and not just an anchor.
function countNumLinks() {
  var cnt = 0;
  var elems = currentDoc.getElementsByTagName('A');
  for(i=elems.length-1; i>=0; i--) {
    if(myHasAttribute(elems[i], 'href')) {
      cnt++;
    }
  }
  return cnt;
}

// Counts the number of heading elements.
function countNumHeadings() {
  var cnt = currentDoc.getElementsByTagName('H1').length;
  cnt += currentDoc.getElementsByTagName('H2').length;
  cnt += currentDoc.getElementsByTagName('H3').length;
  cnt += currentDoc.getElementsByTagName('H4').length;
  cnt += currentDoc.getElementsByTagName('H5').length;
  cnt += currentDoc.getElementsByTagName('H6').length;
  return cnt;
}

// Boolean: can this node receive focus?
function isFocusable(node) {
  if(!node) return false;
  if(node.nodeType == 1) {
    if(node.tagName == "INPUT") {
      var input_type = node.getAttribute('type');
      if(!input_type || input_type != 'hidden') {
        return true;
      }    	
    } else if((node.tagName == "A" && myHasAttribute(node, 'href')) || 
        node.tagName == "SELECT" ||
        node.tagName == "TEXTAREA") {
      return true;
    }
    var tabindex = node.getAttribute('tabindex');
    if(tabindex) {
      return true;
    }
  }
  return false;
}

// This function returns the [x, y] position of the supplied object.
// This can be slow since it requires tracing the element back to the root.
function findPos(obj) {
  var curleft = curtop = 0;
  if(obj.offsetParent) {
    curleft = obj.offsetLeft;
    curtop = obj.offsetTop;
    while (obj = obj.offsetParent) {
	  curleft += obj.offsetLeft;
	  curtop += obj.offsetTop;
    }
  }

  return [curleft,curtop];
}

// Returns the first node in the document matching the supplied tag name.
function _firstMatching(tag_name) {
  if(tag_name == null || typeof tag_name == 'undefined') {
    return null;
  }

  var my_nodes = document.getElementsByTagName(tag_name);
  if(my_nodes && my_nodes.length > 0) {
    return my_nodes[0];
  }

  return null;
}