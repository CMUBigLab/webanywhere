// Some useful string functions.
function trim(stringToTrim) {
  return stringToTrim.replace(/^\s+|\s+$/g,"");
}

// Returns a reference to the textarea used for recording messages.
function getRecordingTextarea() {
  var doc = getNavigationDocument();
  var rta = doc.getElementById('recording');
  return rta;
}

// Returns the current time.
function getTime() {
  var d = new Date();
  return d.valueOf();
}

// Add the text of the parameter line to the recording textarea.
function recordLine(line) {
  if(recordActions) {
    var rta = getRecordingTextarea();
    rta.value += getTime() + " " + line + "\n";
  }
}

// Returns an XPATH for the specified node, starting with its document element
// as root.
function getXPath(node) {
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

       for(var j=0; j<par_childs.length; j++) {
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
}


// Boolean function.
// Returns true if the user is using IE and false otherwise.
function isIE() {
  return (navigator.appName == "Microsoft Internet Explorer");
}

// Returns 'true' if the given node contains the specified attribute,
// and 'false' otherwise.
function myHasAttribute(node, attrib) {
  // A cross-browser friendlier has attribute
  if(node.hasAttribute) {
    return node.hasAttribute(attrib);
  } else {
	var attr= node.attributes[attrib];
    return (attr != undefined) && attr && attr.specified; 
  }
}