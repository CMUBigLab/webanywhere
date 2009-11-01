/*
 * keyboard.js
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

// WebAnywhere Keyboard Object.
WA.Keyboard = {
  // Variables to track when CTRL, ALT, and SHIFT keys are pressed, and if an
  // intervening press of another key should prevent these from being spoken.
  wa_ctrl_pressed: false,
  wa_alt_pressed: false,
  wa_shift_pressed: false,

  wa_ctrl_speaks: false,
  wa_alt_speaks: false,
  wa_shift_speaks: false,

  // CTRL up tracker: true if CTRL could activate on ctrl up.
  wa_up_tracker: false,

  // This is only used if the user is using forms mode.
  formsModeOn: false,

  // The last action that was performed.
  // Used for predictive prefetching.
  last_action: null,

  /**
   * Handle key events.
   * The monster global key event handler.
   * Uses parameters specifying keys pressed that are created
   * by the event handlers below.
   * @param e Original event.
   * @param target Target element of the event.
   * @param key_string Sting representation of the keyboard event.
   * @param source String: key down, key up, key press.
   * @return Boolean Indicates whether event should be blocked.
   */
  doKeyPress: function (e, target, key_string, source) {
    //WA.Keyboard.ActionQueue.recordAction(e, target, key_string, source);
    this._doKeyPress(e, target, key_string, source);
  },

  _doKeyPress: function (e, target, key_string, source) {
      if(e && !WA.browserInit) {
    	this.suppressKeys(e);
    	return false;
    }

    var target_id = null;
    var target_type = null;
  
    if(target) {  
      target_id = target.getAttribute('id');
      target_type = target.tagName;
    }

    WA.Utils.recordLine('keypress: ' + key_string + ' ' + source + ' ' + WA.Utils.getXPath(target) + ' ' + WA.Utils.getXPath(currentNode));

    var return_val = false;
  
    var default_case = false;
  
    if(this.alwaysAllowed(key_string)) {
    	return true;
    }

    var new_node = null;
    var last_node = currentNode;
  
    switch(key_string) {
    case 'ctrl':
      WA.Sound.silenceAll();
      this.wa_up_tracker = false;
      break;
    case 'tab':
      this.suppressKeys(e);
      switch(target_id) {
      	case 'location':
          WA.Interface.focusBrowserElement('location_go');
          break;
        case 'location_go':
					setBrowseMode(WA.KEYBOARD);
					focusContentElement('always_first_node');
					WA.Sound.resetSounds();
					setBrowseMode(WA.PLAY_ONE);
					break;
				case 'always_last_node':
	        setBrowseMode(WA.KEYBOARD);
	        WA.Sound.resetSounds();
	        setBrowseMode(WA.PLAY_ONE);
          break;
        case 'wa_finder_field':
          WA.Interface.focusBrowserElement('find_next_button');
          break;
        case 'find_next_button':
          WA.Interface.focusBrowserElement('find_previous_button');
          break;
        default:
	        setBrowseMode(WA.KEYBOARD);
	        WA.Sound.resetSounds();
	        nextNodeFocus();
	        setBrowseMode(WA.PLAY_ONE);        
      }
      break;
    //case 'ctrl shift':
    //  WA.Interface.addLanguageChanger();
    //  break;
    case 'ctrl forward slash':
      WA.Interface.addKeyboardHelp();
      break;
    case 'esc':
      WA.Interface.removeBlocker();
      break;
    case 'shift tab':
      this.suppressKeys(e);
      switch(target_id) {
        case 'location_go':
        case 'location':
          WA.Interface.focusBrowserElement('location');
          break;
        case 'always_first_node':
          WA.Interface.focusBrowserElement('location_go');
          break;
        case 'find_previous_button':
          WA.Interface.focusBrowserElement('find_next_button');
          break;
        case 'find_next_button':
          WA.Interface.focusBrowserElement('wa_finder_field');
          break;
        default:
	        setBrowseMode(WA.KEYBOARD);
	        WA.Sound.resetSounds();
	        prevNodeFocus();
	        setBrowseMode(WA.PLAY_ONE);
	        break;
      }
      break;
    case 'ctrl a':
      WA.Extensions.callPeriodics();
      break;
    case 'alt leftarrow':
      goBack();
      break;
    case 'alt rightarrow':
      goForward();
      break;
    case 'ctrl n':
      WA.Keyboard.ActionQueue.playFromQueue();
      break;
    case 'ctrl l':
      this.suppressKeys(e);
      WA.Interface.focusBrowserElement('location');
      setBrowseMode(WA.KEYBOARD);
      break;
    case 'ctrl tab':
    case 'ctrl shift tab':
      // Let this go through for now.
      break;
    case 'ctrl r':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      new_node = nextTableRow(lastNodePlayed);
      if(new_node) {
        setCurrentNode(new_node);
        setBrowseMode(WA.PLAY_ONE);
      } else {
        setBrowseMode(WA.KEYBOARD);
      }
      break;
    case 'ctrl f':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      WA.Interface.focusBrowserElement('wa_finder_field');
      finderBarFocus();
      break;
    case 'ctrl d':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      new_node = nextTableCol(lastNodePlayed);
      if(new_node) {
        setCurrentNode(new_node);
        setBrowseMode(WA.PLAY_ONE);
      } else {
        broseMode = WA.KEYBOARD;
      }
      break;
    case 'ctrl t':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      new_node = nextNodeTagAttrib("TABLE", null);
      if(new_node) {
        setBrowseMode(WA.READ);
      } else {
        broseMode = WA.KEYBOARD;
      }
      break;
    case 'ctrl shift t':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      new_node = prevNodeTagAttrib("TABLE", null);
      if(new_node) {
        setBrowseMode(WA.READ);
      } else {
        setBrowseMode(WA.KEYBOARD);
      }
      break;
    case 'ctrl h':
      var startnode = getScriptWindow().currentNode;
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      new_node = nextNodeTagAttrib("H", null);
      if(new_node) {
        setBrowseMode(WA.READ);
      } else {
      	setCurrentNode(startnode);
        setBrowseMode(WA.KEYBOARD);
      }
      break;
    case 'ctrl shift h':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      new_node = prevNodeTagAttrib("H", null);
      if(new_node) {
        setBrowseMode(WA.READ);
      } else {
        setBrowseMode(WA.KEYBOARD);
      }
      break;
    case 'ctrl shift f5':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      WA.Utils.log(WA.Sound.getTimingList() + '\n\n' + WA.Sound.totalLatency + ' ' + WA.Sound.soundsPlayed + ' ' + totalDuration + ' ' + (WA.Sound.totalLatency/totalDuration));
      break;
    case 'ctrl shift f6':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      WA.Sound.Prefetch.alertPrefetching();
      break;
    case 'ctrl shift f7':
      WA.Sound.timingArray = new Object();
      WA.Utils.log('reset timing array');
      break;
    case 'ctrl shift r':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      new_node = prevTableRow(lastNodePlayed);
      if(new_node) {
        setCurrentNode(new_node);
        setBrowseMode(WA.PLAY_ONE);
      } else {
        setBrowseMode(WA.KEYBOARD);
      }
      break;
    case 'ctrl shift d':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD);
      WA.Sound.resetSounds();
      new_node = prevTableCol(lastNodePlayed);
      if(new_node) {
        setCurrentNode(new_node);
        setBrowseMode(WA.PLAY_ONE);
      } else {
        setBrowseMode(WA.KEYBOARD);
      }
      break;
    case 'ctrl p':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD); WA.Sound.resetSounds(); new_node = nextNodeTagAttrib("P", null); setBrowseMode(WA.READ);
      break;
    case 'ctrl shift p':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD); WA.Sound.resetSounds(); new_node = prevNodeTagAttrib("P", null); setBrowseMode(WA.READ);
      break;
    case 'ctrl i':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD); WA.Sound.resetSounds(); new_node = nextNodeTagAttrib("INPUT|SELECT|BUTTON", null); setBrowseMode(WA.PLAY_ONE);
      break;
    case 'ctrl shift i':
      this.suppressKeys(e);
      setBrowseMode(WA.KEYBOARD); WA.Sound.resetSounds(); new_node = prevNodeTagAttrib("INPUT|SELECT|BUTTON", null); setBrowseMode(WA.PLAY_ONE);
      break;
    case 'ctrl 6':
      WA.Sound.Prefetch.prefetchPrediction();
      WA.Utils.log('done');
      break;
    case 'ctrl 7':
      WA.Utils.log("calling Periodics");
      WA.Extensions.callPeriodics();
      WA.Utils.log("done calling Periodics");
      break;
    case 'ctrl 8':
      WA.Extensions.resetExtensions();
      WA.Nodes.treeTraverseRecursion(currentNode, function(node){WA.Extensions.preprocessNode(node)}, function(node){return WA.Nodes.leafNode(node)});
      WA.Extensions.runOncePerDocument(currentDoc);
      break;
    case 'pagedown':
      this.suppressKeys(e);
      WA.Sound.resetSounds();
      nextNode(true);
      setBrowseMode(WA.READ);
      break;
    case 'home':
      this.suppressKeys(e);
      WA.Sound.resetSounds();
      setCurrentNode(currentDoc.body);
      setBrowseMode(WA.READ);
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
  
    // Special handling for SELECT nodes.
    if(target_type == "SELECT") {
      if(key_string.match(/ctrl arrow(up|down)/)) {
        return_val = false;
        default_case = false;
        select_chosen = true;
        selectChange(key_string, target);
      } else if(key_string.match(/arrow/)) {
        this.suppressSelect(e, target, true);
      } else {
        this.suppressSelect(e, target, false);    	
      }
  
      WA.Utils.recordLine('return from select: ' + default_case);
    }
  
    if(default_case) {
      if(key_string == "arrowup" && !select_chosen) {
        this.suppressKeys(e);
        var wasPlaying = WA.Sound.isPlayingSomething();

        WA.Sound.resetSounds();
        prevNode();

        // A little trickery to get it to play the right node.
        // This basically makes it so if you're in the middle of reading
        // an element, it will skip back to the previous one, but if you're
        // done reading that element, it will repeat it.
        if(wasPlaying && (WA.lastBrowseModeDirection != WA.BACKWARD)) {
        	prevNode();
        }
 
        setBrowseMode(WA.PLAY_ONE_BACKWARD);
      } else if(key_string == "arrowdown" && !select_chosen) {
        this.suppressKeys(e);
        var wasPlaying = WA.Sound.isPlayingSomething();

        WA.Sound.resetSounds();
        nextNode(true);

        // Analogous trickery to get it to play the right node going forward.
        // This basically makes it so if you're in the middle of reading
        // an element, it will skip back to the previous one, but if you're
        // done reading that element, it will repeat it.
        if(wasPlaying && (WA.lastBrowseModeDirection != WA.FORWARD)) {
          nextNode(true);
        }

        setBrowseMode(WA.PLAY_ONE);
      } else if(target_type == "INPUT" || target_type == "TEXTAREA") {
        return_val = true;
        var target_type = target.getAttribute('type');
        if(target_type && (/password/i.test(target_type))) {
          _playkey("star", target); // Don't speak passwords.
        } else {
          _playkey(key_string, target);
        }
      } else if(key_string == "backspace") {
        this.suppressKeys(e);
        goBack();
      } else if(key_string == "spacebar") {
        this.suppressKeys(e);
        setBrowseMode(WA.KEYBOARD);
        WA.Sound.resetSounds();
      } else if(key_string == "enter") {        
        // Otherwise, do nothing. Let the browser handle activation of the node.
        WA.Utils.log("Trying to write something to the log. Did it work?");
        return_val = true;
      } else if(!select_chosen) {
        key_string = String(key_string);
        if(source == 'key up') {
          if(/^ctrl|alt|shift|insert$/.test(key_string)) {}
        } else if(source == 'key press') {
        } else if(source == 'key down') {}
  
        WA.Sound.addSound(wa_gettext("Invalid key press"));
        this.resetKeyboardModifiers();
  
        this.suppressKeys(e);	
      }
    }

    // Should move to separate Markov prediction object.
    this.recordObservation(key_string, new_node, lastNode);
  
    // Update our record of the last node to be played.
    if(new_node != null) {
    	lastNode = new_node;
    }
  
    // Improves response time, could introduce a race condition, doesn't seem to.
    setTimeout("WA.Sound.playWaiting();", 0);

    return return_val;
  },

  // Records an observation for use by the Markov-model-based prefetcher.
  recordObservation: function(key_string, new_node, old_node) {
    var action = WA.Sound.Prefetch.keyToAction(key_string)
    WA.Sound.Prefetch.addObservation(action, old_node, this.last_action);
    this.last_action = action;
  },

  // Returns a string representation of the provided key event.
  getKeyString: function(e) {
    var key_id = e.which ? e.which : e.keyCode;
  
    var key = "";
    if(key_id >= 48 && key_id <= 90) {
      key = String.fromCharCode(key_id);
    } else {
      switch(key_id) {
  	  // Set other key names based on key codes < 48 && > 90.
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
        case 190: key = "dot"; break;
        case 191: key = "forward slash"; break;
        case 192: key = "grave accent"; break;
        case 219: key = "open bracket"; break;
        case 220: key = "back slash"; break;
        case 221: key = "close bracket"; break;
        case 222: key = "single quote"; break;
      }
    }
  
    return key;	
  },

  // Handles the keydown event.
  // Most keys will be passed through
  // to getKeyString() and then handled by doKeyPress().
  // The main exceptions are the ALT, CTRL, and SHIFT modifiers, which
  // are recorded here, but have no effect until either:
  // (i)  another key is pressed, or
  // (ii) the keyup event is recorded (in case of CTRL).
  handleKeyDown: function(e) {
    if(!e) e = window.event;

    var return_val = true;

    var key = this.getKeyString(e);

    var target = WA.Utils.getTarget(e);

    var ctrlPressed = false;
    var altPressed = false;
    var shiftPressed = false;

    var appv = parseInt(navigator.appVersion);
    if(appv>3) {
      //var evt = (navigator.appName=="Netscape" || navigator.appName=="Microsoft Internet Explorer") ? e : window.event;

      if(appv!=4 || navigator.appName!="Netscape") {
        shiftPressed = e.shiftKey;
        altPressed   = e.altKey;
        ctrlPressed  = e.ctrlKey;
      } else {
        var mString  = (e.modifiers+32).toString(2).substring(3,6);
        shiftPressed = (mString.charAt(0)=="1");
        ctrlPressed  = (mString.charAt(1)=="1");
        altPressed   = (mString.charAt(2)=="1");
      }
    }

    var string = "";

    if((ctrlPressed || this.wa_ctrl_pressed) && key != "ctrl") {
      string += "ctrl ";
    }
    if((altPressed || this.wa_alt_pressed) && key != "alt") {
      string += "alt ";
    }
    if((shiftPressed || this.wa_shift_pressed) && key != "shift") {
      string += "shift ";
    }
    
    if(!shiftPressed) this.wa_shift_pressed = false;
    if(!altPressed) this.wa_alt_pressed = false;
    if(!ctrlPressed) this.wa_shift_presssed = false;
  
    if(key == "ctrl") {
      this.wa_ctrl_pressed = true;
      this.wa_ctrl_speaks = true;
    } else if(key == "alt") {
      this.wa_alt_pressed = true;
      this.wa_alt_speaks = true;
    } else if(key == "shift") {
      this.wa_shift_pressed = true;
      this.wa_shift_speaks = true;
    }

    if(key && key != "") {
      string += key;
    }

    key = string.toLowerCase();

    if(!key.match(/^((ctrl|alt|shift)\s*)*$/)) {
      // Reset the control keys since this command used them.
      this.wa_ctrl_speaks = false;
      this.wa_alt_speaks = false;
      this.wa_shift_speaks = false;
  
      return_val =
        this.doKeyPress(e, target, key, "key down");
    }

    return return_val;	
  },

  // Returns true for keys that should always be passed through unscathed.
  // Currently this just the 'enter' key.
  // TODO:  Have this consider the keys defined by keymapping.php.
  alwaysAllowed: function (key) {
    return /enter/i.test(key);
  },

  // Handles the keyup event.
  // Because users can release keys in any order, this can also trigger a key
  // combination.
  // Suppresses the event for most keys, exceptions are modifiers like
  // CTRL, ALT, SHIFT.
  handleKeyUp: function (e) {
    if(!e) e = window.event;

    var return_val = false;

    var target = WA.Utils.getTarget(e);
    if(target.nodeName == "INPUT") {
      var target_type = target.getAttribute('type');
      if(/^password/i.test(target_type)) {
        return true;
      }
    }

    var key = this.getKeyString(e);

    if(this.alwaysAllowed(key)) {
    	return true;
    }

    var orig_key = key;

    var string = "";

    if(this.wa_ctrl_pressed && key != "ctrl") {
      string += "ctrl ";
    }
    if(this.wa_alt_pressed && key != "alt") {
      string += "alt ";
    }
    if(this.wa_shift_pressed && key != "shift") {
      string += "shift ";
    }
    if(key && key != "") {
      string += key;
    }

    key = string.toLowerCase();

    // The only keys that speak in keyUp are the control keys -
    // for now, just CTRL, ALT and SHIFT.
    if((this.wa_ctrl_speaks || this.wa_alt_speaks || this.wa_shift_speaks) &&
       key.match(/^((alt|ctrl|shift)\s*)*$/)) {
      var full_key = "";

      // Build the key string.
      if(this.wa_ctrl_pressed) {
        this.wa_ctrl_speaks = false;
        full_key += "ctrl ";
      }
      if(this.wa_alt_pressed) {
        this.wa_alt_speaks = false;
        full_key += "alt ";
      }
      if(this.wa_shift_pressed) {
        this.wa_shift_speaks = false;
        full_key += "shift ";
      }

      // Remove ending space that we added in.
      key = full_key.substring(0, full_key.length-1);

      // Reset modifier key that triggered the event.
      switch(orig_key) {
        case "ctrl": this.wa_ctrl_pressed = false; break;
        case "alt": this.wa_alt_pressed = false; break;
        case "shift": this.wa_shift_pressed = false; break;
      }
      return_val = this.doKeyPress(e, target, key, "key up");
    } else {
      switch(orig_key) {
        case "ctrl": this.wa_ctrl_pressed = false; break;
        case "alt": this.wa_alt_pressed = false; break;
        case "shift": this.wa_shift_pressed = false; break;
        }
      this.suppressKeys(e);
    }
    if(!return_val) {
      this.suppressKeys(e);
    }

    return return_val;
  },

  // Handles the keypress event.
  // Currently, this mostly suppresses the event, allowing other handlers to
  // process the event, and preventing the browser from attempting to handle it.
  handleKeyPress: function (e) {
    // Another event handler will process key presses on password boxes.
    var target = WA.Utils.getTarget(e);
    if(target.nodeName == "INPUT") {
      var target_type = target.getAttribute('type');
      if(/^password/i.test(target_type)) {
        return true;
      }
    }

    // Don't suppress the enter key, unless playByType says too.
    var key = this.getKeyString(e);
    if(key != "enter" && !this.playByType(target)) {
      this.suppressKeys(e);
      return false;
    } else {
      return true;
    }
  },

  // Function for determining which keys to have key events
  // passed through to them.
  playByType: function (target) {
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
  },
  
  // Suppresses all key events.
  // This is used to let WebAnywhere process key events and helps prevent users
  // from accidently pressing a shortcut that would cause them to leave the
  // browsing window.
  suppressKeys: function (e) { //, key) {
    if(e != null) {
	    if(e.stopPropagation) {
	      e.stopPropagation();
	      e.preventDefault();
	    } else {
	      e.cancelBubble = true;
	      e.returnValue = false;
	      //e.keyCode = 0;
	    }
    }
  
    return false;
  },
  
  // For some reason, suppressing keys on select objects needs to be
  // handled more carefully, at least in Firefox.
  // 
  // This first blurs the target, then calls a function to focus it again
  // after the blur.
  suppressSelect: function (e, target, refocus) {
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
  },
  
  // Resets the keyboard modifier keys.
  resetKeyboardModifiers: function () {
    this.wa_ctrl_pressed = false;
    this.wa_alt_pressed = false;
    this.wa_shift_pressed = false;
  
    this.wa_ctrl_speaks = false;
    this.wa_alt_speaks = false;
    this.wa_shift_speaks = false;

    this.wa_up_tracker = false;

    this.formsModeOn = false;
  },

  /**
   * Resets various components of the keyboard listening upon a new page load.
   */
   resetOnNewPage: function() {
     WA.Keyboard.resetKeyboardModifiers();
   },

  _keyEventList: null,

  // Creates a new doKeyPress function from a passed-in array of keyboardEvent objects.
  create_doKeyPress: function(kevents) {
    kevent = [{name: "NextHeading", description: "Next Heading", key: "h", ctrl: true, alt: false, shift: false}];

    for(var i=0; i<kevents.length; i++) {
      
    }
  }
};
