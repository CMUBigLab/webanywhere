/*
 * utils.js
 * 
 * Some useful functions dealing with string manipulation, time, debugging,
 * xpaths, and DOM manipulation.
 * 
 */

WA.Utils = {
  // Removes spaces from the beginning/end of a string argument.
  trim: function(stringToTrim) {
    return stringToTrim.replace(/^\s+|\s+$/g,"");
  },

  // Returns a reference to the textarea used for recording messages.
  getRecordingTextarea: function() {
    var doc = getNavigationDocument();
    var rta = doc.getElementById('recording');
    return rta;
  },

  // Returns the current time.
  getTime: function() {
    var d = new Date();
    return d.valueOf();
  },

  // Add the text of the parameter line to the recording textarea.
  recordLine: function(line) {
    if(recordActions) {
      var rta = this.getRecordingTextarea();
      rta.value += this.getTime() + " " + line + "\n";
    }
  },

  /**
   * Calls the supplied function on each document
   * and subdocument (frame, iframe).
   * 
   * @param doc Root document.
   * @param func Function to call on each document.
   */
  callForEachDoc: function(win, func) {
    for(var i=0; i < win.frames.length; i++) {
      func(win.frames[i].document);
	}
  },

  /**
   * Makes a POST HTTP request to the provided url, sending the provided parameters.
   * 
   * @param url URL to POST to.
   * @param params Parametercs to POST.
   * @param cb Callback for the onreadystatechange event.
   */
  postURL: function(url, params, cb) {
    var prefetch_req = null;

    // Find native XMLHttpRequest object.
    if(window.XMLHttpRequest) {
      prefetch_req = new XMLHttpRequest();
    } else if(window.ActiveXObject) {
      prefetch_req = new ActiveXObject("Microsoft.XMLHTTP");
    }

    // Setup callback and open the connection.
    prefetch_req.onreadystatechange = cb;
    prefetch_req.open("POST", url, true);

    //Send the proper header information along with the request.
    prefetch_req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    prefetch_req.setRequestHeader("Content-length", params.length);
    prefetch_req.setRequestHeader("Connection", "close");

    // Make the request.
    prefetch_req.send(params);
  },

  // Returns an XPATH for the specified node, starting with its document element
  // as root.
  getXPath: function(node) {
   if(!node) {
   	return "(none)";
   }
  
   var xpath = "";
  
   var namespace = node.ownerDocument.documentElement.namespaceURI;
   var prefix = namespace ? "x:" : "";
  
   var node2 = node;
   var doc = node.ownerDocument;
  
   var node_id = null;
   if(node.getAttribute) {
     node_id = node.getAttribute('id');
   }
  
   for(var i=0; node2 && node2 != doc; i++) {
     if(!node2.tagName || !node2.parentNode) {
       return "";
     }
  
     var tag = node2.tagName.toLowerCase();
     var id = node2.id;
     var className = node2.className;
  
     var segment = prefix + tag;
     if(tag.length > 0) {
       var cl = node2.getAttribute('class');
       if(id && id != "" && false) {
         xpath = "//" + segment + '[@id="' + id + '"]' + xpath;
         break;
       } else {
         var par_childs = node2.parentNode.childNodes;
         var node_num = 1;
  
         for(var j=0, pcl=par_childs.length; j<pcl; j++) {
           var child_tag = par_childs[j].tagName;
           if(!child_tag) {
             continue;
           }
           child_tag = par_childs[j].tagName.toLowerCase();
           if(par_childs[j] == node2) {
             break;
           }
           if(child_tag == tag) {
             node_num++;
           }
         }
         segment += '[' + node_num + ']';
       }
     } else if(tag == "tr") {
       var rowCount = node2.parentNode.rows.length;
       if(rowCount > 1 && rowCount < 5) {
         segment += '[' + (node2.rowIndex+1) + ']';
       }
     } else if(tag == "td") {
       var cellCount = node2.parentNode.cells.length;
       if(cellCount > 1 && cellCount < 5) {
         segment += '[' + (node2.cellIndex+1) + ']';
       }
     }
  
     xpath = "/" + segment + xpath;
  
     node2 = node2.parentNode;
   }
   
   if(node_id) {
     xpath += '#' + node_id;
   }
   return xpath;
  },

  // Boolean function.
  // Returns true if the user is using IE and false otherwise.
  isIE: function() {
    return (navigator.appName == "Microsoft Internet Explorer");
  },

  // A long but simple hash function, not necessarily secure or 'good', but
  // it produces unique strings to use as keys in the system that don't
  // contain any of the characters disallowed by Sound Manager 2.
  simpleHash: function(str) {
    // If string is null or undefined, return null string hash.
    if(str == null) {
      return 'nullhash';
    }

    // Next, branch based on the type of string.
    var type = String(typeof str);
    if(type == 'undefined') {
      return 'undefinedhash';
    }
    if(type != 'string') {
      str = String(str);
	}

    // If the string is empty, return the empty string hash.
    if(str.length <= 0) {
      return 'emptystring';
    }

    var bin = Array(16);
    var str_len = str.length;

    for(var i=0; i<16; i++) {
      bin[i] = str_len + i;
    }
    for(var i=0; i<str_len; i++) {
      var update_val = str.charCodeAt(i)*(i & 0xFF)
      bin[(i & 0xF)] += update_val;
      bin[((i << 2) & 0xF)] += update_val;
    }

    var hex_tab = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#*@!";
    var str2 = "";
    for(var i=0, bl=bin.length; i<bl; i++) {
      str2 += hex_tab.charAt(bin[i] & 0x3F);
    }

	// Prepare the final string.
    var val = str.substring(0, 15) + str2;
    val = val.replace(/&#(\d)+;/g, "p$1");
    val = val.replace(/[^a-zA-Z0-9]+/g, '');

    return val;
  },

  // Function for logging error messages to the Firebug console when it is available.
  log: function(str) {
  	if(typeof console != 'undefined' && typeof console.log != 'undefined') {
  		console.log(str);
  	}
  }
};
