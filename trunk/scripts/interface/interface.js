WA.Interface = {
  // Boolean variable indicating whether we expected the location bar
  // to be focused.  The location bar also gets focus when the window
  // loses and then regains focus.
  expectingLocationFocus: false,

  /**
   * Focuses the WebAnywhere location bar.
   */
  focusLocation: function() {
    WA.Interface.expectingLocationFocus = true;
	  var location_field = document.getElementById('location');
	  if(location_field) {
	    location_field.blur();
	    location_field.focus();
	    location_field.select();
	  }
	  WA.Interface.expectingLocationFocus = false;
  },

  /**
   * Called when the location bar gains focus.
   * @param e: the focus event.
   */
  locationFocus: function(e) {
    var target = WA.Utils.getTarget(e);

    if(WA.Interface.expectingLocationFocus) {
      WA.Interface.expectingLocationFocus = false;
      getScriptWindow().textBoxFocused = true;

      WA.Sound.resetSounds();

      WA.Sound.addSound(wa_gettext("Location field text area:"));
      if(target.value) {
        WA.Sound.addSound(target.value);
      }
    } else {
      target.blur();
    }
  },

  locationMouseDown: function(e) {
    var target = WA.Utils.getTarget(e);
    WA.Interface.expectingLocationFocus = true;

    // Prevent WebAnywhere from continuing reading.
    WA.Sound.silenceAll();
    WA.Extensions.spotlightNode(null);

    WA.Interface.locationFocus(e);
  },

  /**
   * Sets up the appropriate events for the location field.
   */
   setupLocationBar: function() {
     // Event listeners for the location bar.
     var location_field = document.getElementById('location');
     if(location_field) {
       if(window.attachEvent) location_field.attachEvent('onfocus', WA.Interface.locationFocus);
       else if(window.addEventListener) location_field.addEventListener('focus', WA.Interface.locationFocus, false);
    
       if(window.attachEvent) location_field.attachEvent('onblur', function() { getScriptWindow().textBoxFocused = false; });
       else if(window.addEventListener) location_field.addEventListener('blur', function() { getScriptWindow().textBoxFocused = false; }, false);

       if(window.attachEvent) location_field.attachEvent('onmousedown', WA.Interface.locationMouseDown);
       else if(window.addEventListener) location_field.addEventListener('mousedown', WA.Interface.locationMouseDown, false);
     }
   },

  /**
   * Places focus on an element in the browser frame.
   * @param element_id ID of the element to focus.
   **/
  focusBrowserElement: function(element_id) {
    var doc = getNavigationDocument();

    var elem = doc.getElementById(element_id);

    if(elem) {
      if(element_id == 'location') {
        WA.Interface.expectingLocationFocus = true;
      }

      elem.blur();
      elem.focus();
      if(elem.select) {
        elem.select();
      };

      setTimeout("WA.Interface.expectingLocationFocus = false;", 0);
    }
  },


  updateCurrentlyPlayingSize: function(time, total) {
    // Not the best way to handle whatever problem is happening with IE.
    if(WA.Utils.isIE()) {
      return;
    }

    var width = WA.Utils.contentWidthHeight(top)[0];
    var text_disp = document.getElementById('wa_text_display');
    var curr_width = text_disp.offsetWidth;

    var diff = width - curr_width;

    if(diff >= 0) {
      // Center.
      text_disp.style.position = 'relative';
      text_disp.style.left = Math.floor(diff / 2.0) + "px";
      WA.Utils.log("SET Relative: " + Math.floor(diff / 2.0) + ' ' + width + " " + curr_width);
    } else {
      // Scroll.
      var delay = width * 2.0;
      if(time > delay) {
        text_disp.style.position = 'relative';
        var frac = ((time-delay) / (total-delay));
        text_disp.style.left = Math.floor(diff * frac) + "px";
        WA.Utils.log("SET Relative: " + frac + ' ' + Math.floor(diff / 2.0) + ' ' + width + " " + curr_width);
        if(frac < 1.0) {
          setTimeout(function(){ WA.Interface.updateCurrentlyPlayingSize(time+100, total); }, 100);
        }
      } else {
        text_disp.style.position = 'relative';
        text_disp.style.left = "0px";
        setTimeout(function(){ WA.Interface.updateCurrentlyPlayingSize(time+100, total); }, 150);
      }
    }
  },

  /**
   * Returns the actual underlying URL based on a proxied, 64encoded address.
   * @param url Proxied URL.
   * @return Original URL of the page.
   */
  getURLFromProxiedDoc: function(doc) {
    var url = this.getLocationFromDoc(doc);

    url = unescape(url);

    var matches = /^[^\?]+\?.*(____pgfa|proxy_url)=([^\&]+)(.*)$/.exec(url);

    if(matches.length <= 2) {
      url = "Error";
    } else {
      url = matches[2].replace(/(%(25)?3D(?=%|$))/g, '=');
      url = WA.Utils.Base64.decode64(url);
    }

    if(matches.length > 3) {
      url += matches[3].replace(/&\$dp\$.*$/, "").replace(/&dp\d+=.*$/, "");
    }

    return url;
  },

  getLocationFromDoc: function(doc) {
    var url = ""+((typeof doc.location == "undefined") ? doc[0].location : doc.location);
    return url;
  },
 
  /**
   * Updates the information DIVs that say what's playing (deprecated: also used for debugging).
   */
  updatePlaying: function() {
    var play_div = document.getElementById('playing_div');
    if(play_div) {
      play_div.innerHTML = (WA.Sound.playing!=null) ? WA.Sound.playing : "(null)";
    }
  
    var disp_div = document.getElementById('wa_text_display');
    if(disp_div && WA.Sound.playing != null) {
      disp_div.innerHTML = WA.Sound.playing;
      // Currently this uses an estimate of the file's playing time, but we
      // could consider using the real, live playing time.
      WA.Interface.updateCurrentlyPlayingSize(0, String(WA.Sound.playing).length * 110);
    }
  
    /*var sound_div = document.getElementById('sound_div');
    if(sound_div) {
      if(currentNode && currentNode.nodeType == 1) {
        sound_div.innerHTML = "curr: " +
          (currentNode ? (currentNode.nodeName + ' ' + (((currentNode.parentNode) ? currentNode.parentNode.nodeName : ""))) : "nully") + " q: " + WA.Sound.soundQ.length + " b: " + WA.browseMode + ' focus: ' + focusedNode + ' las: ' + this.lastPath + ' threads: ' + this.free_threads + ' ' + (updatePlayingCount++) + ' ' + WA.Sound.soundQ + ' bMode:' + WA.browseMode;
      } else {
        sound_div.innerHTML = "curr: " +
          (currentNode ? (currentNode.nodeName + ' (' + currentNode.data + ') ' + (((currentNode.parentNode) ? currentNode.parentNode.nodeName : ""))) : "nully") + " q: " + WA.Sound.soundQ.length + " b: " + WA.browseMode + ' focus: ' + focusedNode + ' las: ' + this.lastPath + ' threads: ' + this.free_threads + ' ' + (updatePlayingCount++) + ' ' + WA.Sound.soundQ + ' bMode:' + WA.browseMode;
      }
    }*/
  },

  _nodeToReturn: null,

  _keyboardHelpString:  "<div id='wa_keyboard_shortcuts'>" +
                    "<h2 id='wa_keyboard_shortcuts_heading'>" + wa_gettext("Keyboard Shortcuts") + "</h2>" +
                    "<p>" + wa_gettext("The following keyboard shortcuts are available.") + wa_gettext("Press escape to exit this menu.") + "</p>" +
                    "<ul>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>CTRL+L</b> - " + wa_gettext("move the cursor to the location box where you can type a URL to visit.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>" + wa_gettext("Arrow Down") + "</b> - " + wa_gettext("read the next element on the page.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>" + wa_gettext("Arrow Up") + "</b> - " + wa_gettext("read the previous element on the page.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>TAB</b> - " + wa_gettext("skip to the next link or form control.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>CTRL+H</b> - " + wa_gettext("skip to the next heading.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>CTRL+I</b> - " + wa_gettext("skip to the next input element.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>CTRL+R</b> - " + wa_gettext("skip to the next row by cell when in a table.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>CTRL+D</b> - " + wa_gettext("skip to the next column by cell when in a table.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>Page Down</b> - " + wa_gettext("read continuously from the current position.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>Home</b> - " + wa_gettext("read continuously, starting over from the beginning of the page.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>CTRL</b> - " + wa_gettext("silence WebAnywhere and pause the system.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>CTRL+" + wa_gettext("Arrow Down") + "</b> - " + wa_gettext("when a selection box is focused, read the next option.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>CTRL+" + wa_gettext("Arrow Up") + "</b> - " + wa_gettext("when a selection box is focused, read the previous option.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>CTRL+F</b> - " + wa_gettext("search text in current page.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>ALT+" + wa_gettext("Arrow Left") + "</b> - " + wa_gettext("Go back to previous page.") + "</li>" +
                    "<li style='margin: 0; padding: 0.1em;'><b>ALT+" + wa_gettext("Arrow Right") + "</b> - " + wa_gettext("Go forward to next page.") + "</li>" +
                    "</ul>" +
                    "</div>",

  addKeyboardHelp: function() {
    this.addBlocker(this._keyboardHelpString);
  },

  _languageChanger: "<form method='get' target='_top'>" +
                    "<select name='locale'>" +
                    "<option value='af'>Afrikanns</option>" +
                    "<option value='zh_CN'>Chinese (Simplified)</option>" +
                    "<option value='zh_TW'>Chinese (Traditional)</option>" +
                    "<option value='de'>German</option>" +
                    "<option value='fr'>French</option>" +
                    "<option value='bs'>Bosnian</option>" +
                    "<option value='ca'>Catalan</option>" +
                    "<option value='cs'>Czech</option>" +
                    "<option value='el'>Greek</option>" +
                    "<option value='eo'>Esperanto</option>" +
                    "<option value='es'>Spanish</option>" +
                    "<option value='fi'>Finnish</option>" +
                    "<option value='hr'>Croatian</option>" +
                    "<option value='hu'>Hungarian</option>" +
                    "<option value='it'>Italian</option>" +
                    "<option value='ku'>Kurdish</option>" +
                    "<option value='lv'>Latvian</option>" +
                    "<option value='pt'>Portuguese (Brazil)</option>" +
                    "<option value='pt-pt'>Portguese (European)</option>" +
                    "<option value='ro'>Romanian</option>" +
                    "<option value='sk'>Slovak</option>" +
                    "<option value='sr'>Serbian</option>" +
                    "<option value='sv'>Swedish</option>" +
                    "<option value='sw'>Swahili</option>" +
                    "<option value='ta'>Tamil</option>" +
                    "<option value='tr'>Turkish</option>" +
                    "<option value='en' SELECTED>English</option>" +
                    "</select>" +
                    "<br>" +
                    "<input type='submit' value='Submit'/>" +
                    "</form>",

  addLanguageChanger: function() {    
    this.addBlocker(wa_gettext("Select a language to switch to" + ": <br> " + this._languageChanger));
  },

  addBlocker: function(innerHTML) {
    WA.Sound.silenceAll();
    WA.Extensions.spotlightNode(null);
    setBrowseMode(WA.KEYBOARD);

    WA.Interface._nodeToReturn = getScriptWindow().currentNode;

    var blocker_div = document.getElementById('wa_blocker_div');
    var bcontent_div = document.getElementById('wa_blocker_content_div');

    blocker_div.style.top = "0px";
    blocker_div.style.display = 'block';
    blocker_div.style.height = document.getElementById('wa_iframe_div').offsetHeight + "px";
    blocker_div.style.top = document.getElementById('wa_iframe_div').style.top;

    bcontent_div.style.top = "0px";
    bcontent_div.style.display = 'block';
    bcontent_div.style.height = blocker_div.style.height;
    bcontent_div.style.top = blocker_div.style.top;

    bcontent_div.innerHTML = innerHTML;

    setCurrentNode(document.getElementById('wa_blocker_content_div').firstChild);
    setBrowseMode(WA.READ);
  },

  removeBlocker: function() {
    setBrowseMode(WA.KEYBOARD);

    var div = document.getElementById('wa_blocker_div');
    div.style.display = 'none';

    div = document.getElementById('wa_blocker_content_div');
    div.style.display = 'none';

    if(WA.Interface._nodeToReturn) {
      setCurrentNode(WA.Interface._nodeToReturn);
      WA.Extensions.spotlightNode(WA.Interface._nodeToReturn);
    }
  },

  visualizeRecordings: function() {
    var doc = getContentDocument();
    var loc = WA.Interface.getURLFromProxiedDoc(doc);

    alert('here: ' + loc);

    var req = new XMLHttpRequest();  
    req.open('GET', 'get-recording.php?url=' + loc, false);   
    req.send(null);  
    var recordings = [];
    if(req.status == 200) {
      eval("recordings = " + req.responseText);  
    }

    alert(req.responseText);

    for(var i=0; i<recordings.length; i++) {
      //alert(recordings[i].xpath + " " + recordings[i].weight);
      //recordings[i].xpath = "//a";
      try {
        var nodes = doc.evaluate(recordings[i].xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        var node = nodes.singleNodeValue;
  
        if(node != null) {
          var div = doc.createElement('div');
          doc.body.appendChild(div);
    
          div.style.position = 'absolute';
          div.style.backgroundColor = '#F00';
          div.style.width = node.offsetWidth + 'px';
          div.style.height = node.offsetHeight + 'px';
          div.style.zIndex = '90';

          div.style.opacity = recordings[i].weight;
    
          var pos = WA.Utils.findPos(node);
          div.style.left = pos[0] + 'px';
          div.style.top = pos[1] + 'px';
        }
      } catch(e) {
        alert("failed on: " + recordings[i].xpath);
      }
    }
  }
}
