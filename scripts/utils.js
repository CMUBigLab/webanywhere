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
  // it produces unique strings for use as keys in the system.
  simpleHash: function(str) {
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
};