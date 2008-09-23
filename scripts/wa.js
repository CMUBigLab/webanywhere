/*
 * Main WebAnywhere script.
 * /scripts/wa.js
 * 
 * This script provides the main functionality for reading through a web page,
 * skipping through a web page, handling new page loads, capturing user input,
 * etc.
 */

// Information about the document that the system is currently reading.
var currentLoc = null;
var currentDoc = null;

// The current reading position (caret).
var currentNode = null;
var currentWord = 0;
var currentChar = 0;

// The last node to be played by the system.
var lastNodePlayed = null;

// Keeps track of whether a programmatic focus was requested.
var programmaticFocus = false;

// Records whether a textbox has the current focus.
var textBoxFocused = false;

// Boolean used to set if we're waiting on a page to load.
var waiting_on_page = "";

// Node last focused.
var focusedNode = null;

// Should the actions of the user be recorded?
// This is used for user studies and should be kept to 'false' at most times.
var recordActions = false;

// 0 none, 1 JAWS, 2 Window-Eyes
var emulationType = 0;

// Counts number of times that updatePlaying() has been called.
// Something like the clock tick of the system.
var updatePlayingCount = 0;

/**
 * Updates the information DIVs (used primarily for debugging).
 */
function updatePlaying() {
  var play_div = document.getElementById('playing_div');
  if(play_div) {
    play_div.innerHTML = (WA.Sound.playing!=null) ? WA.Sound.playing : "(null)";
  }

  var sound_div = document.getElementById('sound_div');
  if(sound_div) {
	  if(currentNode && currentNode.nodeType == 1) {
	    sound_div.innerHTML = "curr: " +
        (currentNode ? (currentNode.nodeName + ' ' + (((currentNode.parentNode) ? currentNode.parentNode.nodeName : ""))) : "nully") + " q: " + WA.Sound.soundQ.length + " b: " + WA.browseMode + ' focus: ' + focusedNode + ' las: ' + this.lastPath + ' threads: ' + this.free_threads + ' ' + (updatePlayingCount++) + ' ' + WA.Sound.soundQ + ' bMode:' + WA.browseMode;
	  } else {
	    sound_div.innerHTML = "curr: " +
        (currentNode ? (currentNode.nodeName + ' (' + currentNode.data + ') ' + (((currentNode.parentNode) ? currentNode.parentNode.nodeName : ""))) : "nully") + " q: " + WA.Sound.soundQ.length + " b: " + WA.browseMode + ' focus: ' + focusedNode + ' las: ' + this.lastPath + ' threads: ' + this.free_threads + ' ' + (updatePlayingCount++) + ' ' + WA.Sound.soundQ + ' bMode:' + WA.browseMode;
	  }
  }
}

/**
 * Initializes the WebAnywhere browser.
 * Called when the frameset page loads.
 */
function init_browser() {
	// Start by focusing the location bar.
  WA.Interface.focusLocation();

  // Mark the browser as having been initialized.
  WA.browserInit = true;

  // Updates the debugging panel.
  setInterval('updatePlaying()', 200);

  // Hack for resetting the keyboard events, currently once every 45 seconds.
  // TODO:  Figure out what the underlying problem is that makes this necessary.
  setInterval(function() {WA.Keyboard.resetKeyboardModifiers();}, 45000);

  // Event listeners for the location bar.
  var location_field = document.getElementById('location');

  if(location_field) {
	  if(window.attachEvent) location_field.attachEvent('onfocus', locationFocus);
	  else if(window.addEventListener) location_field.addEventListener('focus', locationFocus, false);
	
	  if(window.attachEvent) location_field.attachEvent('onblur', function() { getScriptWindow().textBoxFocused = false; });
	  else if(window.addEventListener) location_field.addEventListener('blur', function() { getScriptWindow().textBoxFocused = false; }, false);
  }

  // Event listeners for the GO button.
  var go_button = document.getElementById('location_go');
  if(go_button) {
	  if(window.attachEvent) go_button.attachEvent('onfocus', goButtonFocus);
	  else if(window.addEventListener) go_button.addEventListener('focus', goButtonFocus, false);
  }

  // Window-level key event handlers.
  // Event handlers also attached in newPage to catch events
  // when content is focused.
  if(window.attachEvent) document.attachEvent('onkeydown', handleKeyDown);
  else if(window.addEventListener) document.addEventListener('keydown', handleKeyDown, false);

  if(window.attachEvent) document.attachEvent('onkeyup', handleKeyUp);
  else if(window.addEventListener) document.addEventListener('keyup', handleKeyUp, false);

  if(window.attachEvent) document.attachEvent('onkeypress', handleKeyPress);
  else if(window.addEventListener) document.addEventListener('keypress', handleKeyPress, false);

  // For Flash, the system waits until the Flash movie has loaded.
  // For embedded sounds, the system can proceed immediately.
  if(WA.Sound.soundMethod == WA.Sound.EMBED_SOUND_METHOD) {
    WA.Sound.soundPlayerLoaded = true;
    top.soundPlayerLoaded = true;

    newPage();
  }

  // Time for the system to start looking for sounds to play.
  WA.Sound.startPlayWaiting();

  // Prefetch the letters.
  WA.Sound.Prefetch.prefetchLetters();
}

/**
 * Called when a new page loads.
 * Adds event handlers, pre-processes content when appropriate.
 */
function newPage() {
  WA.browseMode = WA.PAUSED;

  var content_frame = top.document.getElementById("content_frame");
  if(content_frame) {
    var src = content_frame.src;

    if(src.indexOf(top.webanywhere_url)!=0) {
      var location_field = document.getElementById('location');
      if(/mail\.google\.com\/mail/.test(location_field.value) &&
          !(/ui=?html/i.test(location_field.value))) {
        setContentLocation('https://mail.google.com/mail/?ui=html&zy=f');
      } else {}
    }
  }

  var newDoc = getContentDocument();
  var newLoc = String(newDoc.location);  // Document URL.

  // Sometimes we get multiple loads from the same page.
  var startNode = newDoc.getElementById('id');

  if(newDoc != currentDoc && (!startNode ||currentLoc != newLoc)) {
    var location_field = document.getElementById('location');
    if(location_field) {
      WA.Utils.recordLine('new page: ' + location_field.value);
      if(/mail\.google\.com\/mail/.test(location_field.value) && !(/ui=?html/.test(location_field.value))) {
        setContentLocation('https://mail.google.com/mail/?ui=html&zy=f');
      }

      var enc_url = newLoc.replace(/^[^\?]+\?[^=]+=([^\&]+).*$/, '$1');
      location_field.value = WA.Utils.Base64.decode64(unescape(enc_url.replace(/%253D/g, '=')));
    }

    // Update the current nodes.
    currentDoc = newDoc;
    setCurrentNode(currentDoc.body);
    currentLoc = newLoc;
      
    // Capture key presses.
    if(window.attachEvent) currentDoc.attachEvent('onkeydown', handleKeyDown);
    else if(window.addEventListener) currentDoc.addEventListener('keydown', handleKeyDown, false);
  
    if(window.attachEvent) currentDoc.attachEvent('onkeyup', handleKeyUp);
    else if(window.addEventListener) currentDoc.addEventListener('keyup', handleKeyUp, false);
  
    if(window.attachEvent) currentDoc.attachEvent('onkeypress', handleKeyPress);
    else if(window.addEventListener) currentDoc.addEventListener('keypress', handleKeyPress, false);

    // Special case for our WebAnywhere audio description button.
    var desc_butt = currentDoc.getElementById('webanywhere-audio-description');
    if(desc_butt) {
      var playDesc =
        function(e) {WA.Sound._prefetchFlash('webanywhere_audio_description',
          'http://webanywhere.cs.washington.edu/webanywhere-description.mp3',
          true, true);};

      // Check to see if we should play the WebAnywhere description.
      if(window.attachEvent)
        desc_butt.attachEvent('onclick', playDesc);
      else if(window.addEventListener)
        desc_butt.addEventListener('click', playDesc, false);
    }

    // Reset the prefetching queue.
    if(WA.prefetchStrategy > 0) {
      WA.Sound.Prefetch.resetPrefetchArray();
      WA.Sound.Prefetch.incPrefetchIndex();
    }

    // Preprocess the page, including adding to the list of nodes
    // to be prefetched, and other preprocessing steps.
    WA.Nodes.treeTraverseRecursion(currentNode, preVisit, function(node){return WA.Nodes.leafNode(node);});

    // Run any extensions that request to be run once per document.
    WA.Extensions.runOncePerDocument(currentDoc);

    // Create an artificial focusable start element containg the page title.
    var start_node = currentDoc.createElement('div');
    start_node.innerHTML = currentDoc.title;
    if(start_node.tabIndex) { // IE.
      start_node.tabIndex = 0;
    }
    start_node.setAttribute('tabindex', 0);
    start_node.setAttribute('id', 'always_first_node');
    currentDoc.body.insertBefore(start_node, currentDoc.body.firstChild);
  
    // Create an artificial focusable end element.
    var end_node = currentDoc.createElement('div');
    end_node.innerHTML = "End of Page";
    if(end_node.tabIndex) { // IE.
      end_node.tabIndex = 0;
    }
    end_node.setAttribute('tabindex', 0);
    end_node.setAttribute('id', 'always_last_node');
    currentDoc.body.appendChild(end_node);

    // Begin prefetching.
    if(WA.prefetchStrategy > 0) {
      WA.Sound.Prefetch.restartPrefetchTimeout();
    }
  }

  // Reset the keyboard modifiers, in case we missed the release of one
  // while page was loading.
  WA.Keyboard.resetKeyboardModifiers();

  // Reinitialize sound player.
  WA.Sound.resetSounds();
  playing = null;

  // Normally, say that a page has loaded and announce its title.
  if(WA.timesLoaded > 0) {
    WA.Sound.addSound(WA.pageLoadedSound);
  } else {
    // Handle the first load specially.
    WA.Sound.addSound(WA.initSound);
  }

  // Speak the number of headings and links on the page.
  var nheadings = countNumHeadings(currentDoc);
  var nlinks = countNumLinks(currentDoc);
  var head = nheadings + ' ' + ((nheadings > 1) ? "Headings" : "Heading");
  var link = nlinks + ' ' + ((nlinks > 1) ? "Links" : "Link");
  WA.Sound.addSound(head + ' ' + link);

  // Reset extensions.
  WA.Extensions.resetExtensions();

  // Set our browsing mode to READ after a short delay.
  setTimeout(function() {WA.browseMode = WA.READ;}, 50);

  // Get and submit recorder if we're in debug mode.
  var rec = getNavigationDocument().getElementById('recording');
  if(rec && !(/debug/.test(top.document.location))) {
    WA.Utils.postURL('recorder.php',
                     'submit=submit&recording=' + rec.value,
                     function(){});
    rec.value = "";
  }

  // Count number of pages loaded.
  WA.timesLoaded++;

  WA.Utils.log("finished new page load");
}

/**
 * Wrappers for key event handlers that handle namespace issues.
 * @param Event
 */
function handleKeyDown(e) {
	WA.Keyboard.handleKeyDown(e);
}
function handleKeyUp(e) {
  WA.Keyboard.handleKeyUp(e);
}
function handleKeyPress(e) {
  WA.Keyboard.handleKeyPress(e);
}


// Called when the location bar gains focus.
function locationFocus(e) {
  getScriptWindow().textBoxFocused = true;

  var target;
  if(!e) e = window.event;
  if(e.target) target = e.target;
  else if(e.srcElement) target = e.srcElement;
  if(target.nodeType == 3) target = target.parentNode;

  WA.Sound.resetSounds();

  WA.Sound.addSound("Location field text area:");
  if(target.value) {
    WA.Sound.addSound(target.value);
  }
}

// Called when the finder box receives focus.
function finderBarFocus() {
  WA.Sound.resetSounds();
  WA.Sound.addSound("Type a string to find in the current page");
}

// Called in response to the focus event on the browser frame's "GO" button.
function goButtonFocus(e) {
  var target;
  if(!e) e = window.event;
  if(e.target) target = e.target;
  else if(e.srcElement) target = e.srcElement;
  if(target.nodeType == 3) // defeat Safari bug
    target = target.parentNode;

  var text = WA.Nodes.handleNode(target, true);
  WA.Sound.resetSounds();
  WA.Sound.addSound("Go");
}

// Called when users hit a key when the last node in the page has focus.
// Current responds to the "tab" combination.
function tabEndNode(e) {
  var key = getNavigationDocument().keyString(e);
  if(key == 'tab') {
    WA.Sound.addSound("End of Page.");
    stopProp(e);
    return false;
  }
}

// Called when users hit a key when the first node in the page is focused.
// Current responds to the "shift tab" combination.
function tabStartNode(e) {
  var key = getNavigationDocument().keyString(e);
  if(key == 'shift tab') {
    var go_butt =
      getNavigationDocument().getElementById('location_go');
    go_butt.focus();
    stopProp(e);
    return false;
  }
}

// Called when the user hits the TAB key from the location bar.
function tabLocation(e) {
  var key = getNavigationDocument().keyString(e);
  if(key == 'ctrl l') {
    stopProp(e);
    return false;
  } else if(key == 'shift tab') {
    WA.Sound.resetSounds();
    WA.Sound.addSound("Start of Page.");
    stopProp(e);
    return false;
  }
}

// A flexible "focus element" function.
// Focuses the element with the provided ID in the provided document.
function focusElement(doc, element_id) {
  WA.browseMode = WA.PAUSED;
  WA.Sound.resetSounds();

  if(currentNode) {
  	currentNode.blur();
  }

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

// Places focus on an element in the browser frame.
function focusBrowserElement(element_id) {
  var doc = getNavigationDocument();

  var elem = doc.getElementById(element_id);
  elem.focus();
  //focusElement(doc, element_id);  
}

// Sets focus to the content element with the specified id.
// @param element_id  The id of the element to which focus will be set.
function focusContentElement(element_id) {
  var doc = getContentDocument();
  focusElement(doc, element_id);  
}

/**
 * Returns the content document.
 * @return document Content document.
 */
function getContentDocument() {
  return getContentWindow().document;
}

/**
 * getContentWindow
 * Returns the content window.
 * @return window Content window.
 */
function getContentWindow() {
  if(typeof top.content_frame != 'undefined') {
    return top.content_frame;
  } else {
    return top;
  }	
}

/**
 * Returns the first node of the web page.
 * @return HTMLElement Returns the first node of the current content document.
 */
function getFirstContent() {
  var doc = getContentDocument();
  var first = doc.getElementById('always_first_node');
  if(!first && doc.body && doc.body.firstChild) {
    first = doc.body.firstChild;
  }

  return first;
}

/**
 * Returns the last node of the web page.
 * @return DOMElement Last node on the content page.
 */
function getLastContent() {
  var doc = getContentDocument();
  var last = doc.getElementById('always_last_node');
  if(!last && doc.body && doc.body.lastChild) {
    last = doc.body.lastChild;
  }

  return last;
}

/**
 * Gets the document element of the Navigation element.
 * @return docElement Document element of the navigation frame.
 */
function getNavigationDocument() {
	if("navigation_frame" in top) {
    return top.navigation_frame.document;
	} else {
		return top.document;
	}
}

/**
 * Returns the window where the code is kept.
 * In WebAnywhere browser, mode this means the navigation frame.
 * In site-specific mode, this means the main window.
 * @return window
 */
function getScriptWindow() {
  	if("navigation_frame" in top) {
  		return top.navigation_frame;
  	} else {
  		return top;
  	}
}

/**
 * Silence the system and stop automatic forward progression.
 */
function silenceAll() {
  WA.browseMode = WA.KEYBOARD;
  WA.Sound.resetSounds();
}

/**
 * Returns the current position of the cursor in the specified field.
 * @param myField Field in which to determine the cursor position.
 * @return Integer Cursor position, or negative error value.
 */
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

var refocusedSelect = null;
function refocusSelect() {
  getScriptWindow().programmaticFocus = true;
  refocusedSelect.focus();
}

/** Plays a single key press.
 * Determines what to play based on the target element.
 * @param key String representation of the key combination that was pressed.
 * @param targ Target element of the key event.
 */
function _playkey(key, targ) {
  WA.Sound.resetSounds();
  WA.browseMode = getScriptWindow().WA.KEYBOARD;

  if(/ctrl l/.test(key)) {
    focusLocation();
  } else if(/arrow|backspace|del/.test(key)) {
    var pos = getScriptWindow().getCursor(targ);
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
      getScriptWindow().WA.Sound.addSound(text);
    }
  } else if(key=="enter") {
  } else {
    WA.Sound.playSound(key, false);
  }
}

/**
 * preVisit
 * Called on each node upon page load.
 * Performs a number of administrative functions.
 * @param node Node to pre-visit.
 **/
function preVisit(node) {
  // Add the text for each node to the prefetching queueu.
  if(WA.prefetchStrategy >= 1) {
  	var text = WA.Nodes.handleNode(node, true);
  	if(text && (WA.prefetchStrategy <= 1 ||
  	    WA.Sound.Prefetch.prefetch_curr_index == 0)) {
  	  WA.Sound.Prefetch.prefetch_array[WA.Sound.Prefetch.prefetch_curr_index].push(text);
  	}
  }

  // Perform other optional preprocessing steps.
  WA.Extensions.preprocessNode(node);
}

/**
 * Event handler for changes to select elements.
 * @param key_string String generated by the key event handler.
 * @param target Selection Element.
 */
function selectChange(key_string, target) {
  if(/ctrl arrow(up|down)/.test(key_string)) {
    if(/ctrl/.test(key_string)) {
      WA.Sound.resetSounds();
      WA.browseMode = WA.KEYBOARD;

      var sindex = target.selectedIndex;
      if(/down/.test(key_string)) {
      sindex = (sindex + 1 < target.options.length) ? sindex + 1 : sindex;
      } else if(/up/.test(key_string)) {
      sindex = (sindex - 1 >= 0) ? sindex - 1 : sindex;
      }

      if(WA.Utils.isIE()) {
        target.selectedIndex = sindex;
      }

      var text_value = target.options[sindex].value;
      WA.Sound.addSound(text_value);
    }
  }
}

// Focuses the first node of the document and resets the reading to start
// back at the beginning.
function startNodeFocus(e) {
  if(currentDoc && currentDoc.title) {
    WA.Sound.resetSounds();
    WA.Sound.addSound(currentDoc.title);
  }
}

// Focuses the end node and resets the reading to last node in the document.
function endNodeFocus(e) {
  if(currentDoc && currentDoc.title) {
    WA.Sound.resetSounds();
    WA.Sound.addSound("End of page");
  }
}

// Goes back one step in the history.
function goBack() {
  var contentDoc = getContentDocument();
  if(contentDoc.history.back) {
  	contentDoc.history.back();
  }
}

// Goes forward one step in the history.
function goForward() {
  var contentDoc = getContentDocument();
  if(contentDoc.history.forward) {
  	contentDoc.history.forward();
  }
}

// Called by event handlers for both the location bar and the 'Go' button.
function navigate(e) {
  WA.Sound.playLoadingSound();

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

var sameDomainRegExp = new RegExp("^(https?://)?" + top.webanywhere_url);

// Makes URL come from same domain as WebAnywhere using the web proxy.
// The subdomain (if supplied) is tacked on to the front.
function proxifyURL(loc, subdomain, rewrite) {
  var rewriteForSure = (typeof rewrite != 'undefined') && rewrite;
  // No need to proxy from our own server;
  // can cause problems when running on localhost.
  if(rewriteForSure || !sameDomainRegExp.test(loc)) {
    loc = top.web_proxy_url.replace(/\$url\$/, WA.Utils.Base64.encode64(loc));
    if(subdomain && subdomain.length > 0) {
      loc = top.webanywhere_location + loc;
      loc = loc.replace(top.webanywhere_domain,
      			(subdomain + '.' + top.webanywhere_domain));
    }
  }

  return loc;
}

// Regular expression used to separate out pieces of the URL.
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

  WA.Utils.log('location is ' + loc);

  // Set new location by setting the src attribute of the content frame.
  // Do not set the location of the frame document because WebAnywhere can
  // lose control of this because of redirects, etc.
  var contentDoc = getContentDocument();
  var content_frame = top.document.getElementById('content_frame');
  if(content_frame != null) {
    content_frame.setAttribute('src', loc);
  }
}

// Plays a sound.  Updates any information related to that, such as prefetcher.
function playNodeSound(node, node_text) {
  WA.Sound.addSound(node_text);

  // Update prefetcher with node that will be played.
  if(WA.prefetchStrategy > 1) {
    if(WA.prefetchStrategy == 3) {
      WA.Sound.Prefetch.prefetchPrediction();
    } else {
      WA.Sound.Prefetch.incPrefetchIndex();
      WA.Sound.Prefetch.prefetchNextOnes(currentNode, 3);
    }
    // else if(WA.prefetchStrategy == 2) {
      //alert('prefetching: ' + node_text + ":" + node + ' ' + node.nextSibling);
      //while(node && node.nodeName != "BODY" && node.parentNode.childNodes.length < 2) {
   	  //  node = node.parentNode;
      //}
      //treeTraverseRecursion(node, addNodeToPrefetch, function(node){WA.Nodes.leafNode(node)});
      //}
  }
}

// Adds the specified node to the prefetch queue.
function addNodeToPrefetch(node) {
  text = WA.Nodes.handleNode(node, true);

  if(text && /\S/.test(text) && (WA.prefetchStrategy >= 1 || WA.Sound.Prefetch.prefetch_curr_index == 0)) {
    WA.Sound.Prefetch.addToPrefetchQ(text);
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
  if(targ.nodeType == 3)
    targ = targ.parentNode;

  if( !getScriptWindow().programmaticFocus ) {
    var dnode = getScriptWindow().dfsNode(targ);
    getScriptWindow().setCurrentNode(dnode);
    var test_div = getScriptWindow().document.getElementById('test_div');
    test_div.innerHTML = "got focus " + targ.nodeName + ' ' + targ + ' ' + getScriptWindow().programmaticFocus;
    getScriptWindow().WA.Sound.resetSounds();

    WA.browseMode = WA.PLAY_ONE;
  } else {
  }

  focusedNode = targ;

  getScriptWindow().programmaticFocus = false;*/
}

// Play the previous character.
function prevChar() {
  var node_text = WA.Nodes.handleNode(currentNode, true);
  if(node_text) {
    WA.browseMode = WA.KEYBOARD;
    var curr = getCurrentChar();
    if(curr > 0 && curr <= node_text.length) {
      WA.Sound.addSound(node_text.substring(curr-1, curr));
      setCurrentChar(curr-1);
    } else {
      WA.browseMode = WA.PREV_CHAR_BACKONE;
      prevNode();
    }
  } else {
    prevNode();
  }
}

// Sets node that will be at the current cursor location.
function setCurrentNode(node) {
  getScriptWindow().currentNode = node;
  setCurrentChar(-1);
}

// Sets the character at the current cursor location.
function setCurrentChar(pos) {
  getScriptWindow().currentChar = pos;  
}

// Returns the character at the current cursor location.
function getCurrentChar() {
  return getScriptWindow().currentChar;
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
  	WA.Sound.addSound('Not in a table.');
  	return null;
  }

  WA.Sound.addSound(edge_message);
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
    if(WA.Nodes.leafElement(elem)) {
      var text = WA.Nodes.handleNode(elem, true);
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
    if(WA.Nodes.leafElement(elem)) {
      var text = WA.Nodes.handleNode(elem, true);
      var reg = new RegExp(context, "i");

      WA.Utils.log("comparing: " + context + " to " + text);

      if(reg.test(text)) {
        return true;
      }
    }

    return false;
  };

  return func;
}

/**
 * Matches elements that would produce speech if read.
 * @return Function that matches nodes by whether or not they speak.
 */
function matchBySpeaksFunc() {
  var func = function(elem) {
    var text = WA.Nodes.handleNode(elem, true);
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
    WA.browseMode = WA.PLAY_ONE;
  } else {
    WA.browseMode = WA.KEYBOARD;
  }
}

function prevNodeContentFinder() {
  var find_val = getFinderValue();

  var result = prevNodeContentFind(find_val);

  if(result) {
    WA.browseMode = WA.PLAY_ONE;
  } else {
    WA.browseMode = WA.KEYBOARD;
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

/**
 * Returns the match by focus function.
 * @return matchByFocusFunc
 */
function matchByFocus() {
  return matchByFocusFunc;
}

/** Goes to the next node that is focusable.
 * Used to simulate TAB key press.
 * @return nextNodeByMatcher
 */
function nextNodeFocus() { 
  var matcher = matchByFocus();
  return nextNodeByMatcher(matcher, "");
}

/**
 * Finds the next node that matches the supplied 'matcher' function.
 * @param matcher
 * @param node
 * @return The next node.
 */
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

/**
 * Returns the very next node, regardless of its type.
 * @param node Node to start at.
 * @return Next node.
 */
function firstNodeNoSound(node) {
  var result = nextNodeNoSound(node, function(elem) { return true; }, true, -1);
  return result;
}

/**
 * Function takes as input
 * @param matcher Function which takes as input a DOM element and returns true
 * if it matches and false otherwise.
 * @param description String that describes the type of element
 * being looked for, which is used to describe to users what was found.
 */
function nextNodeByMatcher(matcher, description) {
  if(WA.browseMode == WA.PAUSED) {
    return false;
  } else if(!currentNode) {
    if(!currentDoc) {
      currentDoc = getContentDocument();
    }
    if(currentDoc) {
      setCurrentNode(currentDoc.body);
    }
    if(!currentNode) {
      return false;
    }
  }

  WA.Utils.log('current node is: ' + currentNode + "\n");

  var result = _nextNodeByMatcher(matcher, currentNode);

  if(result) {
    var result_id = "";
    if(result.getAttribute) {
      result_id = result.getAttribute('id');
    }
    if(result_id == 'always_last_node' && description != "") {
      WA.Sound.addSound('no ' + description);
      return false;
    } else {
      visit(result, true);
      setCurrentNode(result, true);
      return true;
    }
  } else if(description != "") {
    WA.Sound.addSound('no ' + description);
    return false;
  }
}

/** 
 * Finds the next node that matches 'matcher'
 * without queueing it to be spoken.
 * @param node Node to start from.
 * @param matcher Function to match the node with.
 * @param first Recursion depth count.
 * @param num Number of nodes visited.
 */
function nextNodeNoSound(node, matcher, first, num) {
  var result = "";

  // Don't let Javascript die because of recursion limit.
  if(num > WA.Nodes.recursion_limit) {
    return node;
  }

  if(num < 0) {
    num = 0;
  } else if(matcher(node)) { // && isVisible(node)) {
      result = node;
      if(WA.browseMode == WA.PLAY_ONE) {
        WA.browseMode = WA.KEYBOARD;
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
  if(!WA.Nodes.leafNode(node) && node.firstChild) {
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
      WA.browseMode = WA.KEYBOARD;
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

/**
 * Goes to the next node with the given tagName and optional attribute
 * @param tag Tag to look for.
 * @param attrib Attribute to loook for.
 * @return Node with matching tag and attrib.
 */
function prevNodeTagAttrib(tag, attrib) { 
  var matcher = matchByTag(tag, attrib);
  return prevNodeByMatcher(matcher);
}

/**
 * Goes to the next node with the given tagName and optional attribute
 * @return Node that was found.
 */
function prevNodeFocus() { 
  var matcher = matchByFocus();
  return prevNodeByMatcher(matcher);
}

/**
 * Maches the previous node that matches the function matcher.
 * @param matcher Function used as a matcher.
 * @return Element found.
 */
function prevNodeByMatcher(matcher) {
  if(WA.browseMode == WA.PAUSED) {
    return null;
  } else if(!currentNode) {
    if(!currentDoc) {
      currentDoc = getContentDocument();
    }
    if(currentDoc) {
      setCurrentNode(currentDoc.body);
    }
    if(!currentNode) {
      return null;
    }
  }

  var result = null;
  var last_result = null;

  do {
    last_result = result;
    result = prevNodeNoSound(currentNode, matcher, 0, 0);
  } while(last_result != result && !matcher(result));
  
  if(result) {
    visit(result, true);
    setCurrentNode(result);
  }

  return result;
}

/**
 * Boolean: Does the parent node match the given matcher function?
 * @param node DOMElement to check.
 * @param matcher Boolean matcher function to check with.
 */
function parentMatches(node, matcher) {
  return matcher(node.parentNode);
}

/**
 * Finds the previous node that matches the supplied 'matcher'
 * and returns it.
 * @param node Node where the search should start.
 * @param matcher Function used to match.
 * @param first Count of the depth of the recursion to keep under the limit.
 * @param num Number of nodes seen.
 * @return node Last node seen.
 */
function prevNodeNoSound(node, matcher, first, num) {
  // Prevents Javascript from crashing as a result of going over the
  // 1000-level recursion limit.
  if(first > WA.Nodes.recursion_limit) {
    return node;
  }

  var result = null;

  // Some magic to find the appropriate next node.
  if(num > 1 || (first > 4 && !WA.Nodes.internalNode(node))) {
    num++;
  } else if(first!=0 && !WA.Nodes.internalNode(node) &&
              !parentMatches(node, matcher)) {
    var node_text = WA.Nodes.handleNode(node, true);
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
    /*var node_text = WA.Nodes.handleNode(node, true);
    if( node_text != "" ) {
      result = node_text;
      setCurrentNode(node);
      setCurrentChar(node_text.length);
      if(WA.browseMode == WA.PREV_CHAR) {
        WA.browseMode = WA.KEYBOARD;
        prevChar();
      } else if(WA.browseMode == WA.PREV_CHAR_BACKONE) {
        WA.browseMode = WA.PREV_CHAR;
      } else if(WA.browseMode == WA.PLAY_ONE_BACKWARD) {
	    WA.browseMode = WA.KEYBOARD;
      }
      return result;
    }*/
  }

  // Base case: check for body
  if(node.tagName == "BODY") {
    WA.browseMode = WA.KEYBOARD;
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

/**
 * Returns true if the node is an element with the given tag name and 
 * attribute (optional).
 * @param tag  Regular expression to be applied to tag names.
 * @param node  Node to be tested.
 * @param attrib  Attribute node is required to have to pass test.
 */
function isTagAttribute(node, tag, attrib) {
  if(!node || !node.tagName) {
    return false;
  }

  var tagmatch = new RegExp("^" + tag, "i");

  if(attrib) {
    return (node.nodeType == 1 && tagmatch.test(node.tagName) && WA.Nodes.hasAttribute(node, attrib));
  } else {
    return (node.nodeType == 1 && tagmatch.test(node.tagName));
  }
}

//----------------------- END ADVANCE TO TAG ---------------------

var lastNode = null;

/**
 * nextNode
 * Advance to the next node.
 */
function nextNode() {
	//var _currNode = currentNode;
  var next_node_info = _nextNode();
  var next_node = next_node_info[0];
  var node_text = next_node_info[1];

  if(next_node && node_text) {
    lastNode = next_node;

    // Queue the sound to be played.
    playNodeSound(next_node, node_text);

    setCurrentChar(node_text.length);
    if(WA.browseMode == WA.PLAY_ONE) {
      WA.browseMode = WA.KEYBOARD;
    }
  }
}

/**
 * Support for advancing to the next node.
 */
function _nextNode() {
  var spoken_node = null; // The node that is advanced to.
  var node_text = null;

  if(WA.browseMode == WA.PAUSED) {
    return [null, null];
  } else if(!currentNode) {
    if(!currentDoc) {
      currentDoc = getContentDocument();
    }
    if(currentDoc) {
      setCurrentNode(currentDoc.body);
    }
    if(!currentNode) {
      return [null, null];
    }
  }

  // Retrieve the text that will be spoken for this node.
  node_text = WA.Nodes.handleNode(currentNode, true);
  if(node_text) {
    spoken_node = currentNode;
  }

  // Visit the current node.
  visit(currentNode, (spoken_node != null));

  if(currentNode.firstChild && !WA.Nodes.leafNode(currentNode)) {
    setCurrentNode(dfsNode(currentNode));
  } else if(currentNode.nextSibling) {
    setCurrentNode(currentNode.nextSibling);
  } else if(currentNode.nodeName == "BODY") {
    setCurrentNode(currentNode.firstChild);
  } else {
    goBackUp();
  }
  
  return [spoken_node, node_text];
}

/**
 * Move back up the DFS tree.
 */
function goBackUp() {
  var oldCurrent = currentNode;

  while(currentNode.parentNode) {
    setCurrentNode( currentNode.parentNode );
    if(currentNode.nextSibling) {
      setCurrentNode(currentNode.nextSibling);
      break;
    }
    if(currentNode.nodeName == "BODY") { // At the last node.
      WA.browseMode = WA.KEYBOARD;
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

/**
 * Navigate to the previous node in the document.
 */
function prevNode() {
  var node_text = WA.Nodes.handleNode(currentNode, true);
  var spoken = (node_text != null && String(node_text).length > 0);

  visit(currentNode, spoken);

  if(node_text) {
    setCurrentChar(node_text.length);
    if(WA.browseMode == WA.PREV_CHAR) {
      WA.browseMode = WA.KEYBOARD;
      prevChar();
      return;
    } else if(WA.browseMode == WA.PREV_CHAR_BACKONE) {
      WA.browseMode = WA.PREV_CHAR;
    } else if(WA.browseMode != WA.PAUSED) {
      // Queue the sound to be played.
      WA.Sound.addSound(node_text);

      // Update for the next play.
      if(WA.browseMode == WA.PLAY_ONE_BACKWARD) {
        WA.browseMode = WA.KEYBOARD;
      }
    }
  }  

  if(currentNode.tagName == "BODY") {
    WA.browseMode = WA.KEYBOARD;
    WA.Sound.addSound("Start of page.");
  } else if(currentNode.previousSibling) {
    setCurrentNode(currentNode.previousSibling);
    setCurrentNode(rdfsNode(currentNode));
  } else {
    setCurrentNode(currentNode.parentNode);
  }
}

/**
 * Reverse depth-first search from the node supplied.
 * @param node Node where the reverse DFS should start.
 */
function rdfsNode(node) {
  while(node && node.nodeType == 1 && node.lastChild && !WA.Nodes.leafNode(node)) {
    if(node.tagName == "SCRIPT" || node.tagName == "STYLE") {
      break;
    }

    visit(node, false);

    node = node.lastChild;
  }
  return node;
}

/**
 * Depth-first search from the supplied node.
 * @param node Node where the DFS shoudl start.
 */
function dfsNode(node) {
  visit(node, false);

  if(WA.Nodes.leafNode(node)) {
    return node;
  } else {
    return node.firstChild;
  }
}

/**
 * Processes the supplied element when it becomes the current focus
 * of reading.
 * @param elem Element that has been visited.
 * @param is_spoken Is the visit to a spoken node?
 */
function visit(elem, is_spoken) {
  if(is_spoken) {
    WA.Extensions.spotlightNode(elem);
    lastNodePlayed = elem;
  }

  // Focus the element if it's a focusable element.
  if(isFocusable(elem)) {
    focusNode(elem);
  }
}

/**
 * Counts the number of links that have an href, indicating that they're
 * a link and not just an anchor.
 * @param doc Document on which links should be calculated.
 * @return cnt Count of the links in the document.
 */
function countNumLinks(doc) {
  var cnt = 0;
  var elems = doc.getElementsByTagName('A');
  for(i=elems.length-1; i>=0; i--) {
    if(WA.Nodes.hasAttribute(elems[i], 'href')) {
      cnt++;
    }
  }
  return cnt;
}

/**
 * Counts the number of heading elements on the supplied document.
 * @param doc Document on which the number of headings should be counted.
 * @return cnt Count of the headings in the document.
 */
function countNumHeadings(doc) {
  var cnt = doc.getElementsByTagName('H1').length;
  cnt += doc.getElementsByTagName('H2').length;
  cnt += doc.getElementsByTagName('H3').length;
  cnt += doc.getElementsByTagName('H4').length;
  cnt += doc.getElementsByTagName('H5').length;
  cnt += doc.getElementsByTagName('H6').length;
  return cnt;
}

/**
 * Boolean: can this node receive focus?
 * @param node DOM node.
 * @return Boolean Is the node focusable?
 */
function isFocusable(node) {
  if(!node || node == null) return false;
  if(node.nodeType == 1) {
    if(node.tagName == "INPUT") {
      var input_type = node.getAttribute('type');
      if(!input_type || input_type != 'hidden') {
        return true;
      }    	
    } else if((node.tagName == "A" && WA.Nodes.hasAttribute(node, 'href')) || 
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

/**
 * Focus the supplied node if possible.
 * @param node Node to be focused.
 */
function focusNode(node) {
  if(focusedNode != node) { 
    programmaticFocus = true;
    try {
      node.focus();
      if(node.select) {
        node.select();
      }
    } catch(e) {}
  }
}