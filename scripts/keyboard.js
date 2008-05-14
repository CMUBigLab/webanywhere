/*
 * keyboards.js
 * 
 * Contains functions for handling keyboard events.
 * 
 * Contains a separate function for handling
 * keydown (handleKeyDown),
 * keyup (handleKeyUp),
 * & keypress (handleKeyPress) events.
 * 
 * Each first calls getKey, which returns a string representation of the key event.
 * 
 * Most key events are caught and handled in keydown.  Exceptions primarily
 * involve the modifier keys, such as SHIFT, ALT, CTRL, etc., which are set
 * on keydown, but are released in keyup.
 * 
 * After being caught by these handlers, the events are blocked so that the
 * browser does not attempt to handle them.  suppressKeys(e) does this.
 * 
 * Eventual integration with keymapping.php will make the keys corresponding
 * to specific functionality more flexible and personalizable.
 */

var wa_ctrl_pressed = 0;
var wa_alt_pressed = 0;
var wa_shift_pressed = 0;

var wa_ctrl_speaks = 0;
var wa_alt_speaks = 0;
var wa_shift_speaks = 0;

// This is only used if the user is using forms mode.
var formsModeOn = false;

// Handle key events.
// The monster global key event handler thing.
// Uses parameters specifying keys pressed that are created
// by the event handlers below.
function doKeyPress(e, target, key_string, source) {
  if(!browserInit) {
  	suppressKeys(e);
  	return false;
  }

  var target_id = null;
  var target_type = null;

  if(target) {  
    target_id = target.getAttribute('id');
    target_type = target.tagName;
  }

  recordLine('keypress: ' + key_string + ' ' + source + ' ' + getXPath(target) + ' ' + getXPath(currentNode));

  var return_val = false;

  var default_case = false;

  if(alwaysAllowed(key_string)) {
  	return true;
  }

  var new_node = null;
  var last_node = currentNode;

  switch(key_string) {
  case 'ctrl': silenceAll(); break;
  case 'tab':
    suppressKeys(e);
    if(target_id == "location") {
      focusNavigationElement('location_go');
    } else if(target_id == 'location_go') {
      browseMode = KEYBOARD;
      focusContentElement('always_first_node');
      resetSounds();
      browseMode = PLAY_ONE;      
    } else if(target_id == 'always_last_node') {
      browseMode = KEYBOARD;
      resetSounds();
      browseMode = PLAY_ONE;
    } else{
      browseMode = KEYBOARD;
      resetSounds();
      nextNodeFocus();
      browseMode = PLAY_ONE;
    } break;
  case 'shift tab':
    suppressKeys(e);
    if(target_id == "location_go" || target_id == "location") {
      focusNavigationElement('location');
    } else if(target_id == 'always_first_node') {
      focusNavigationElement('location_go');
    } else {
      browseMode = KEYBOARD;
      //setCurrentNode(lastFocusableNode);
      resetSounds();
      /*prevNode();
      if(isFocusable(currentNode)) {
        prevNode();
      }*/
      prevNodeFocus();
      browseMode = PLAY_ONE;
    }
    break;
  case 'alt leftarrow':
    goBack();
    break;
  case 'alt rightarrow':
    goForward();
    break;
  case 'ctrl l':
    suppressKeys(e);
    focusNavigationElement('location');
    break;
  //case 'ctrl shift r':
  case 'ctrl tab':
  case 'ctrl shift tab':
    // Let this go through.
    break;
  case 'ctrl r':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    new_node = nextTableRow(lastNodePlayed);
    if(new_node) {
      setCurrentNode(new_node);
      browseMode = PLAY_ONE;
    } else {
      broseMode = KEYBOARD;
    }
    break;
  case 'ctrl f':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    focusNavigationElement('finder_field');
    finderBarFocus();
    break;
  case 'ctrl d':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    new_node = nextTableCol(lastNodePlayed);
    if(new_node) {
      setCurrentNode(new_node);
      browseMode = PLAY_ONE;
    } else {
      broseMode = KEYBOARD;
    }
    break;
  case 'ctrl t':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    new_node = nextNodeTagAttrib("TABLE", null);
    if(new_node) {
      browseMode = READ;
    } else {
      broseMode = KEYBOARD;
    }
    break;
  case 'ctrl shift t':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    new_node = prevNodeTagAttrib("TABLE", null);
    if(new_node) {
    browseMode = READ;
    } else {
      browseMode = KEYBOARD;
    }
    break;
  case 'ctrl h':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    new_node = nextNodeTagAttrib("H", null);
    if(new_node) {
      browseMode = READ;
    } else {
      broseMode = KEYBOARD;
    }
    break;
  case 'ctrl shift h':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    new_node = prevNodeTagAttrib("H",null);
    if(new_node) {
      browseMode = READ;
    } else {
      browseMode = KEYBOARD;
    }
    break;
  case 'ctrl shift f5':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    if(hasConsole) console.log(getTimingList() + '\n\n' + totalLatency + ' ' + soundsPlayed + ' ' + totalDuration + ' ' + (totalLatency/totalDuration));
    break;
  case 'ctrl shift f6':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    alertPrefetching();
    break;
  case 'ctrl shift f7':
    timingArray = new Object();
    if(hasConsole) console.log('reset timing array');
    break;
  case 'ctrl shift r':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    new_node = prevTableRow(lastNodePlayed);
    if(new_node) {
      setCurrentNode(new_node);
      browseMode = PLAY_ONE;
    } else {
      broseMode = KEYBOARD;
    }
    break;
  case 'ctrl shift d':
    suppressKeys(e);
    browseMode = KEYBOARD;
    resetSounds();
    new_node = prevTableCol(lastNodePlayed);
    if(new_node) {
      setCurrentNode(new_node);
      browseMode = PLAY_ONE;
    } else {
      broseMode = KEYBOARD;
    }
    break;
  case 'ctrl p':
    suppressKeys(e);
    browseMode = KEYBOARD; resetSounds(); new_node = nextNodeTagAttrib("P",null); browseMode = READ;
    break;
  case 'ctrl shift p':
    suppressKeys(e);
    browseMode = KEYBOARD; resetSounds(); new_node = prevNodeTagAttrib("P",null); browseMode = READ;
    break;
  case 'ctrl i':
    suppressKeys(e);
    browseMode = KEYBOARD; resetSounds(); new_node = nextNodeTagAttrib("INPUT|SELECT|BUTTON",null); browseMode = PLAY_ONE;
    break;
  case 'ctrl shift i':
    suppressKeys(e);
    browseMode = KEYBOARD; resetSounds(); new_node = prevNodeTagAttrib("INPUT|SELECT|BUTTON",null); browseMode = PLAY_ONE;
    break;
  case 'ctrl 6':
    prefetchSomething();
    if(hasConsole) console.log('done');
    break;
  case 'pagedown':
    suppressKeys(e);
    resetSounds();
    nextNode(true);
    browseMode = READ;
    break;
  case 'home':
    suppressKeys(e);
    resetSounds();
    setCurrentNode(currentDoc.body);
    browseMode = READ;
    break;
  case 'ctrl shift r':  // Allow reloads.
  case 'ctrl shift tab':  // Allow switching forward tabs.
  case 'ctrl tab':  // Allow switching back tabs.
    break;
  default:
    default_case = true;
    break;
  }

  var select_chosen = false;

  // Select elements are odd, must handle them regardless.
  if(target_type == "SELECT") {
  	select_chosen = true;
    if(key_string.match(/ctrl arrow(up|down)/)) {
      return_val = false;
      default_case = false;
      selectChange(key_string, target);
    } else if(key_string.match(/arrow/)) {
      suppressSelect(e, target, true);
    } else {
      suppressSelect(e, target, false);    	
    }

    recordLine('return from select: ' + default_case);
  }

  if(default_case) {
    if(key_string == "arrowup" && !select_chosen) {
      suppressKeys(e);
      resetSounds();
      prevNode();
      browseMode = PLAY_ONE_BACKWARD;
    } else if(key_string == "arrowdown" && !select_chosen) {
      suppressKeys(e);      resetSounds();
      browseMode = PLAY_ONE;
      nextNode(true);
    } else if(target_type == "INPUT" || target_type == "TEXTAREA") {
      return_val = true;
      var target_type = target.getAttribute('type');
      if(target_type && (/password/i.test(target_type))) {
        _playkey("star", target); // Don't speak passwords.
      } else {
        _playkey(key_string, target);
      }
    } else if(key_string == "backspace") {
      suppressKeys(e);
      goBack();
    } else if(key_string == "spacebar") {
      suppressKeys(e);
      browseMode = KEYBOARD;
      resetSounds();
    } else if(key_string == "enter") {
      // Do nothing.
      return_val = true;
    } else if(!select_chosen) {
      key_string = String(key_string);
      if(source == 'key up') {
        if(/^ctrl|alt|shift|insert$/.test(key_string)) {}
      } else if(source == 'key press') {} else if(source == 'key down') {}
      addSound("Invalid key press");
      suppressKeys(e);	
    }
  }

  recordObservation(key_string, new_node, lastNode)

  if(new_node != null) {
  	lastNode = new_node;
  }

  // Improves response time.
  setTimeout("playWaiting();", 0);

  return return_val;
}


var last_action = null;
//var last_node = null;

// Records the observation for use by the Markov-model-based prefetcher.
function recordObservation(key_string, new_node, old_node) {
  var action = keyToAction(key_string)
  addObservation(action, old_node, last_action);
  last_action = action;
}

function getKey(e) {
  var key_id = e.which ? e.which : e.keyCode;

  var key = "";
  if(key_id >= 48 && key_id <= 90) {
    key = String.fromCharCode(key_id);
  } else {
    switch(key_id) {
		// Set key name in case of other (mostly) control keys.
        case 8: key = "backspace"; break;  
		case 9: key = "tab"; break;
		case 13: key = "enter"; break;
        case 16: key = "shift"; break;  
        case 17: key = "ctrl"; break;  
        case 18: key = "alt"; break;
		case 19: key = "pause"; break;
        case 20: key = "capslock"; break;
        case 27: key = "esc"; break;
        case 32: key = "spacebar"; break;
        case 33: key = "pageup"; break;  
        case 34: key = "pagedown"; break;  
        case 35: key = "end"; break;                  
        case 36: key = "home"; break;
		case 37: key = "arrowleft"; break;
		case 38: key = "arrowup"; break;
		case 39: key = "arrowright"; break;
		case 40: key = "arrowdown"; break;
		case 45: key = "insert"; break;
      	case 46: key = "del"; break;
      	case 59: key = "semi-colon"; break;  // same as key code 186.
        case 91: key = "left windows"; break;
        case 92: key = "right windows"; break;
        case 93: key = "select"; break;
        case 96: key = "numpad 0"; break;
        case 97: key = "numpad 1"; break;
        case 98: key = "numpad 2"; break;
        case 99: key = "numpad 3"; break;
        case 100: key = "numpad 4"; break;
        case 101: key = "numpad 5"; break;
        case 102: key = "numpad 6"; break;
        case 103: key = "numpad 7"; break;
        case 104: key = "numpad 8"; break;
        case 105: key = "numpad 9"; break;
        case 106: key = "multiply"; break;
        case 107: key = "add"; break;
        case 109: key = "subtract"; break;
        case 110: key = "decimal point"; break;
        case 111: key = "divide"; break;
        case 112: key = "f1"; break;
        case 113: key = "f2"; break;
        case 114: key = "f3"; break;
        case 115: key = "f4"; break;
        case 116: key = "f5"; break;
        case 117: key = "f6"; break;
        case 118: key = "f7"; break;
        case 119: key = "f8"; break;
        case 120: key = "f9"; break;
        case 121: key = "f10"; break;
        case 122: key = "f11"; break;
        case 123: key = "f12"; break;
        case 144: key = "num lock"; break;
        case 145: key = "scroll lock"; break;
        case 186: key = "semi-colon"; break;  // same as key code 59.
        case 187: key = "equal sign"; break;
        case 188: key = "comma"; break;
        case 189: key = "dash"; break;
        case 190: key = "period"; break;
        case 191: key = "forward slash"; break;
        case 192: key = "grave accent"; break;
        case 219: key = "open bracket"; break;
        case 220: key = "back slash"; break;
        case 221: key = "close braket"; break;
        case 222: key = "single quote"; break;
    }
  }

  return key;	
}

function getTarget(e) {
  var target;

  if(e.target) target = e.target;
  else if(e.srcElement) target = e.srcElement;
  else return null; // Something is wrong.

  // Returned #text node (defeat Safari bug).
  if(target.nodeType == 3)
    target = target.parentNode;

  return target;
}

/* Detects key combinations: first part - key down
 * flags are set in the case that shift, ctrl, or alt is pressed
 * in case any og those flags is true, a combination is detected and logged.  */
function handleKeyDown(e) {
  if(!e) e = window.event;

  var return_val = true;

  var key = getKey(e);

  var target = getTarget(e);

  var ctrlPressed = false;
  var altPressed = false;
  var shiftPressed = false;

  if(parseInt(navigator.appVersion)>3) {
    var evt = ( navigator.appName=="Netscape" || 
                navigator.appName=="Microsoft Internet Explorer") ? e : window.event;

    if(navigator.appName=="Netscape" && parseInt(navigator.appVersion)==4) {
      var mString =(e.modifiers+32).toString(2).substring(3,6);
      shiftPressed=(mString.charAt(0)=="1");
      ctrlPressed =(mString.charAt(1)=="1");
      altPressed  =(mString.charAt(2)=="1");
      self.status="modifiers="+e.modifiers+" ("+mString+")";
    } else {
      shiftPressed=evt.shiftKey;
      altPressed  =evt.altKey;
      ctrlPressed =evt.ctrlKey;
      self.status=""
	+  "shiftKey="+shiftPressed
	+", altKey="  +altPressed
	+", ctrlKey=" +ctrlPressed;
    }
  }

  var string = "";

  if((ctrlPressed || wa_ctrl_pressed) && key != "ctrl") {
    string += "ctrl ";
  }
  if((altPressed || wa_alt_pressed) && key != "alt") {
    string += "alt ";
  }
  if((shiftPressed || wa_shift_pressed) && key != "shift") {
    string += "shift ";
  }
  
  if(!shiftPressed) wa_shift_pressed = false;
  if(!altPressed) wa_alt_pressed = false;
  if(!ctrlPressed) wa_shift_presssed = false;

  if(key == "ctrl") {
    wa_ctrl_pressed = 1;
    wa_ctrl_speaks = 1;
  } else if(key == "alt") {
    wa_alt_pressed = 1;
    wa_alt_speaks = 1;
  } else if(key == "shift") {
    wa_shift_pressed = 1;
    wa_shift_speaks = 1;
  }

  if(key && key != "") {
    string += key;
  }

  key = string.toLowerCase();

  if(!key.match(/^((ctrl|alt|shift)\s*)*$/)) {
    if(wa_ctrl_pressed) {
      wa_ctrl_speaks = 0;
    }
    if(wa_alt_pressed) {
      wa_alt_speaks = 0;
    }
    if(wa_shift_pressed) {
      wa_shift_speaks = 0;
    }

    return_val =
      doKeyPress(e, target, key, "key down");
  }

  return return_val;	
}

// Returns true for keys that should always be passed through unharmed.
function alwaysAllowed(key) {
  return /enter/i.test(key);
}

// Processes the release of key combinations: second part - key up/released
// flags are reset in case shift, ctrl, or alt is released
// in case any flag is true a combination is detected and logged.
function handleKeyUp(e) {
  if(!e) e = window.event;

  var return_val = false;

  var target = getTarget(e);
  if(target.nodeName == "INPUT") {
    var target_type = target.getAttribute('type');
    if(/^password/i.test(target_type)) {
      return true;
    }
  }

  var key = getKey(e);

  if(alwaysAllowed(key)) {
  	return true;
  }

  var orig_key = key;

  var string = "";

  if(wa_ctrl_pressed && key != "ctrl") {
    string += "ctrl ";
  }
  if(wa_alt_pressed && key != "alt") {
    string += "alt ";
  }
  if(wa_shift_pressed && key != "shift") {
    string += "shift ";
  }

  if(key && key != "") {
    string += key;
  }

  key = string.toLowerCase();

  // The only keys that speak in keyUp are the control keys -
  // for now, just CTRL, ALT and SHIFT.
  if((wa_ctrl_speaks || wa_alt_speaks || wa_shift_speaks) && key.match(/^((alt|ctrl|shift)\s*)*$/)) {
    var full_key = "";

    // Build the key string.
    if(wa_ctrl_pressed) {
      wa_ctrl_speaks = 0;
      full_key += "ctrl ";
    }
    if(wa_alt_pressed) {
      wa_alt_speaks = 0;
      full_key += "alt ";
    }
    if(wa_shift_pressed) {
      wa_shift_speaks = 0;
      full_key += "shift ";
    }
    
    key = full_key.substring(0, full_key.length -1); // Remove last space.

    // Reset the one that triggered the event.
    switch(orig_key) {
    case "ctrl": wa_ctrl_pressed = 0; break;
    case "alt": wa_alt_pressed = 0; break;
    case "shift": wa_shift_pressed = 0; break;
    }
    return_val =
      doKeyPress(e, target, key, "key up");
  } else {
    switch(orig_key) {
    case "ctrl": wa_ctrl_pressed = 0; break;
    case "alt": wa_alt_pressed = 0; break;
    case "shift": wa_shift_pressed = 0; break;
    }
    suppressKeys(e);
  	//doKeyPress(e, target, key, "fake key up orig(" + orig_key + ") " + wa_ctrl_speaks + wa_alt_speaks + wa_shift_speaks + wa_ctrl_pressed + wa_alt_pressed + wa_shift_pressed);
  }
  if(!return_val) {
    suppressKeys(e);
  }


  return return_val;
}

/* Logs all regular single key presses. are logged
 * If keyPress flag is enabled (in case no control key is clicked at the same time)
 * the keyPress event returns for regular char keys the correct small case key code. */
function handleKeyPress(e) {
  var target = getTarget(e);
  if(target.nodeName == "INPUT") {
    var target_type = target.getAttribute('type');
    if(/^password/i.test(target_type)) {
      return true;
    }
  }

  var key = getKey(e);

  if(key != "enter" && !playByType(target)) {
    suppressKeys(e);
    return false;
  } else {
    return true;
  }
}

function playByType(target) {
  var target_id = null;
  var target_name = null;

  if(target) {  
    target_id = target.getAttribute('id');
    target_name = target.tagName;
  }

  if(target_name == "INPUT") {
  	var target_type = target.getAttribute('type');
    if(!target_type || /text/i.test(target_type)) {
      return true;
    }
  } else if(target_name == "TEXTAREA") {
  	return true;
  }

  return false;
} 
// Suppress all control keys to prevent user from accidently leaving
// the browsing window.
function suppressKeys(e) { //, key) {
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

// For some reason, suppressing keys on select objects needs to be
// handled more carefully, at least in Firefox.
function suppressSelect(e, target, refocus) {
  if(!e.which) {
    e.cancelBubble = true;
    e.returnValue = false;
  } else {
    if(refocus) {
      target.blur();
      refocusedSelect = target;
      setTimeout("refocusSelect()",0);
    }
  }

  return false;
}
