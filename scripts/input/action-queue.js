/*
 * input-queue.js
 * 
 * Represents a queue of input.
 * 
 */
WA.Keyboard.ActionQueue = new (function() {
  // The underlying queue object.
  this._queue = new Array();

  this.Event = function(command, source) {
  	this.command = command;
  	this.source = source;
  };

  playNext = function() {
  	this.playFromQueue();
  };

  playFromQueue = function() {
    var event = this._queue.shift();
    this.playAction(event);
  };

  recordAction = function(e, target, key_string, source) {
    var event = new this.Event(key_string, source);
    //this._queue.push(event);
  };

  playAction = function(event) {
  	var e = {};
  	var target = {};

    setBrowseMode(WA.KEYBOARD);
    WA.Sound.resetSounds();

    WA.Utils.log("EVENT: " + event.command + " " + event.source + " " + WA.browseMode);

    if(/goto/.test(event.command)) {
      setContentLocation(event.source);
    } else if(/alert/.test(event.command)) {
    	alert(event.source);
    } else {
     	WA.Keyboard._doKeyPress(null, null, event.command, event.source);
    }

    this.updateDisplay(event.command);
  };

  updateDisplay = function(str) {
    var img_url = '/wa/images/keyboard-blank.png';
    var description = '';
    switch(str) {
      case "arrowdown":
        img_url = '/wa/images/keyboard-arrowdown.png';
        description = 'next element';
        break;        
      case "tab":
        img_url = '/wa/images/keyboard-tab.png';
        description = 'next focusable element';
        break;
      case "ctrl h":
        img_url = '/wa/images/keyboard-nextheading.png';
        description = 'next heading';
        break;
      default:
        img_url = '/wa/images/keyboard-blank.png';
        break;
    }

    img_url = 'http://localhost' + img_url;

    var doc = getContentDocument();
    var div = doc.getElementById('wa-script-playback-info');
    if(!div) {
    	div = doc.createElement('div');
    	div.style.MozBorderRadius = "10px";
    	div.style.MozOpacity = '0.95';
    	div.style.position = 'absolute';
    	div.style.right = '0px';
    	div.style.bottom = '0px';
    	div.style.backgroundColor = '#FFF';
    	div.style.zIndex = "9999";
    	div.style.border = "5px solid #000";
    	div.style.backgroundColor = '#DDD';
    	div.style.padding = "0.5em";
    	div.style.margin = "0.5em";
    	div.style.width = '485px';
      div.style.height = '155px';    	
    	div.style.textAlign = 'center';
      div.setAttribute('id', 'wa-script-playback-info');

      div.innerHTML = "<div style='float: left; position: relative; width: 310px; margin: 0; padding: 0;'>" +
      		"<p style='opacity: 1.0;'>" +
      		"<img id='wa-keyboard-image' style='opacity: 1.0;' src='" +
          img_url +
          "' style='moz-radius: 5px; width='300'/><p id='wa-command-description' style='font-size: 1.3em; font-weight: 300; padding: 0.2em; margin: 0;'/></div>" +
          "<div width='150' id='wa-commands' style='float: left; position: relative; width: 150px; font-weight: bold; margin: 0.1em; padding: 0.2em;'/>";

      if(str != 'arrowdown' && str != 'goto') {
      	doc.body.appendChild(div);
      }
    }

    if(str != 'arrowdown' && str != 'goto') {
    	var keyboard_img = doc.getElementById('wa-keyboard-image');
     	keyboard_img.src = img_url;

      var command_list = doc.getElementById('wa-commands');
      var newp = doc.createElement('p');
      newp.style.margin = 0;
      newp.style.padding = 0;
      newp.innerHTML = (str + "").toUpperCase();

      if(command_list.firstChild) {
        command_list.insertBefore(newp, command_list.firstChild);
      } else {
      	command_list.appendChild(newp);
      }

      for(i=command_list.childNodes.length-1; i>=0; i--) {
      	var child = command_list.childNodes[i];
      	if(i==0) {
      		child.style.fontWeight = "900";
          child.style.fontSize = "1.6em";
          child.style.color = "#000";
          child.style.height = "1.8em";
      	} else if(i>5) {
      		child.parentNode.removeChild(child);
      	} else {
      		child.style.fontWeight = "normal";
      		child.style.fontSize = (1.50 - (i/5)*.85) + "em";
      		var color = "";
      		switch(i) {
      			case 1: color = "444"; break;
            case 2: color = "555"; break;
            case 3: color = "666"; break;
            case 4: color = "888"; break;
            case 5: color = "AAA"; break;
            case 6: color = "CCC"; break;
            default: color = "000";
      		}
          child.style.color = "#" + color;
          child.style.marginBottom = "0";
          child.style.height = "";
      	}
      } 

      newp.style.fontSize = "1.4em";
      setTimeout(function() {newp.style.fontSize = "1.45em";}, 50);
      setTimeout(function() {newp.style.fontSize = "1.5em";}, 100);
      setTimeout(function() {newp.style.fontSize = "1.6em";}, 125);

      var desc = doc.getElementById('wa-command-description');
      desc.innerHTML = description;
    } 

    div.style.backgroundColor = "#000";

    setTimeout(function() {div.style.backgroundColor = "#444";}, 100);
    setTimeout(function() {div.style.backgroundColor = "#888";}, 175);
    setTimeout(function() {div.style.backgroundColor = "#DDD";}, 250);
  };

  this.actionsWaiting = function() {
  	return this.queueSize() > 0;
  }

  this.queueSize = function() {
    return this._queue.length;
  };
});