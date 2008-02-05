// Return true if we should treat this
// node as a leaf, false otherwise
function leafNode(node) {
  if(node && node.nodeType) {
    if(node.nodeType == 3) {
      return true;
    } else if(node.nodeType == 1) {
      return leafElement(node);
    } else {
      return false;
    }
  } else {
  	return true;
  }
}

// Returns true if we should treat this 
// element as a leaf, false otherwise
function leafElement(elem) {
  switch(elem.tagName) {
    case 'A': // Anchor
      if(myHasAttribute(elem, 'name')) {
        return false;
      } else {
        return true;
      }
    case 'AREA': // Image map region
    case 'BUTTON': // Button
    case 'IMG': // Inline image
    case 'SCRIPT':
    case 'HEAD':
    case 'IFRAME':
    case 'SELECT':
    case 'NOSCRIPT':
    case 'LABEL': // <label>'s will be read at the input element.
      return true;
  }
  return !elem.hasChildNodes();
}

// Returns a string for this node
function handlenode(node, goingDown) {
  if(!goingDown) {
    return null;
  }

  switch(node.nodeType) {
  case 1: // An HTML Element
    // Only speak elements that are displayed.
    //var disp = getStyle(node, 'display');
    if(node.offsetWidth <= 0) {
      return "";
    } else {
      return handleElement(node);
    }
  case 2: // An element attribute -- DO NOTHING
    return "";
  case 3: // Text -- Read the Text
    var ret_val = node.data;
    if(ret_val.length > 0 && ret_val.match(/\w/)) {
      ret_val = ret_val.replace(/&#\d+;/, "");
      return ret_val;
    }
    return "";
  case 8: // Comment
  case 9: // Document 
  case 10: // Document Type Definition
  default:
    return "";
  } 
  
  return "";
}

// Forms a giant string of all the child nodes of a node
function handleChildNodes(node) {
  var result = "";
  for(var i=0; i<node.childNodes.length; i++) {
    result += handlenode(node.childNodes[i], true) + " ";
    if(!leafNode(node.childNodes[i]))
      result += handleChildNodes(node.childNodes[i]);
  }
  return result;
}

// Handle and area node to get the correct link name for it
function handleAreaNode(elem) {
  if( elem.getAttribute('alt') )
    return elem.getAttribute('alt');
  else if( elem.getAttribute('href') )
    return elem.getAttribute('href');
  else
    return "";
}

// Handles an Image Node to get the correct text for it
function handleImageNode( elem ) {
  if( elem.getAttribute('alt') )
    return elem.getAttribute('alt');
  else
    return "";
}

// Handle List Items
function handleListNode( elem ) {
  var result = "";

  // Check to see if we're part of an ordered list
  var parent = elem.parentNode;
  while( parent && parent.tagName != "BODY" ) {
    if( parent.tagName == "OL" ) {
      var elems = parent.getElementsByTagName("LI");
      for( var i=0; i<elems.length; i++ ) {
        if(elems[i] == elem) {
          result += (i+1) + ". ";
          break;
        }
      }
      break;
    }
    parent = parent.parentNode;
  }

  return result;
}

// Handle an input node
function handleInputNode( elem ) {
  var result = "";

  if( myHasAttribute( elem, 'type' ) ) {
    switch( elem.getAttribute( 'type' ) ) {
      case 'button':
        result += "Button: " + elem.value;
        break;
      case 'checkbox':
        result += "Checkbox " + getLabelName(elem) + ": " + ((elem.checked == true) ? "checked" : "unchecked"); //elem.value;
        break;
      case 'file':
        result += "File Input " + getLabelName(elem) + ": " + elem.value;
        break;
      case 'hidden':
        break;
      case 'image':
        result += "Image Input " + getLabelName(elem) + ": " + elem.value;
        break;
      case 'password':
        result += "Password Textarea " + getLabelName(elem);
        break;
      case 'radio':
        result += "Radio Button " + getLabelName(elem) + ": " + elem.value;
        break;
      case 'reset':
        result += "Reset Button: " + elem.value;
        break;
      case 'submit':
        result += "Submit Button: " + elem.value;
        break;
      default:
        result += "Text Area " + getLabelName(elem) + ": " + elem.value;
    }
  }
  return result;
}

// NOTE: Lists work but list item numbers are spoken seperately
// NOTE: Need to handle leaving a table...say "table <name> end"
function handleElement(elem) {
  var result = "";

  switch(elem.tagName) {
    case 'A': // Anchor
      if(myHasAttribute(elem, 'href'))
        result += ("link " + handleChildNodes(elem));
      break;
    case 'AREA': // Image map region
      result += "link " + handleAreaNode(elem); 
      break;

    case 'BUTTON': // Button
      result += handleChildNodes(elem) + " button";
      break;
    
    case 'H1': // Level-one heading
      result += "Heading 1 ";
      break;
    case 'H2': // Level-two heading
      result += "Heading 2";
      break;
    case 'H3': // Level-three heading
      result += "Heading 3";
      break;
    case 'H4': // Level-four heading
      result += "Heading 4";
      break;
    case 'H5': // Level-five heading
      result += "Heading 5";
      break;
    case 'H6': // Level-six heading
      result += "Heading 6";
      break;

    case 'IMG': // Inline image
      var image_text = handleImageNode(elem);
      if(image_text && image_text.length > 0) {
        result += "Image " + image_text;
      }
      break;
    case 'INPUT': // Form input
      result += handleInputNode(elem);
      break;

    case 'LI': // List item -- Just read the list item text
      result += handleListNode(elem);
      break;

    case 'SELECT': // Option selector
      result += "Selection " + getLabelName(elem) + ": " + elem.value;
      break;

    //case 'TABLE': // Table e.g Table 2 <name> start # rows # columns
    //    result += "Table " + getTableNum(elem) + " " + getTableName(elem) 
    //                       + " start " + elem.rows.length 
    //                       + " rows " + getLargestRowLength(elem.rows) 
    //                       + " columns";
    //    break;
    case 'TEXTAREA': // Multi-line text input
        result += "Text Area " + getLabelName(elem) + ": " + elem.value;
        break;

    //case 'UL': // Unordered List
  }

  if(elem.getAttribute('title'))
    result = result + " " + elem.getAttribute('title');

  return result;
}

function getLabelName(elem) {
  if(myHasAttribute(elem, 'my_label'))
    return elem.getAttribute('my_label');  
  else if(myHasAttribute(elem, 'name'))
    return elem.getAttribute('name');

  return "";
}


// Gets the text description of the table
function getTableName( elem ) {
  if(elem.caption)
    return handleChildNodes(elem.caption);
  else if (elem.summary)
    return elem.summary;
  else
    return "";
}

// Gets the table number in the document 
function getTableNum( elem ) {
  var tables = elem.ownerDocument.getElementsByTagName('TABLE');
  for(i=0; i<tables.length; i++)
    if(tables[i] == elem)
      return i;
  return 0;
}

function getLargestRowLength( rows ) {
  var longest = 0;
  for(var i=0; i<rows.length; i++)
    if(rows[i].cells.length > longest)
      longest = rows[i].cells.length;
  return longest;
}

function getStyle(el,styleProp) {
	var x = el;
	if (x.currentStyle)
		var y = x.currentStyle[styleProp];
	else if (window.getComputedStyle)
		var y = document.defaultView.getComputedStyle(x,null).getPropertyValue(styleProp);
	return y;
}

function getStyle2(n, p) {
	var s = eval("n.style." + p);

	// try inline
	if((s != "") && (s != null)) {
		return s;
	}

	// try currentStyle
	if(n.currentStyle) {
		var s = eval("n.currentStyle." + p);
		if((s != "") && (s != null)) {
			return s;
		}
	}
	
	// try styleSheets
	var sheets = document.styleSheets;
	if(sheets.length > 0) {
		// loop over each sheet
		for(var x = 0; x < sheets.length; x++) {
			// grab stylesheet rules
			var rules = sheets[x].cssRules;
			if(rules.length > 0) {
				// check each rule
				for(var y = 0; y < rules.length; y++) {
					var z = rules[y].style;
					// selectorText broken in NS 6/Mozilla: see
					// http://bugzilla.mozilla.org/show_bug.cgi?id=51944
					ugly_selectorText_workaround();
					if(allStyleRules) {
						if(allStyleRules[y] == i) 
{
							return z[p];
						}			
					} else {
						// use the native selectorText and style stuff
						if(((z[p] != "") && (z[p] != null)) ||
						   (rules[y].selectorText == i)) {
							return z[p];
						}
					}
				}
			}
		}
	}
	return null;
}
var ugly_selectorText_workaround_flag = false;
var allStyleRules;
function ugly_selectorText_workaround() {
	if((navigator.userAgent.indexOf("Gecko") == -1) ||
	   (ugly_selectorText_workaround_flag)) {
		return; // we've already been here or shouldn't be here
	}
	var styleElements = document.getElementsByTagName("style");
	
	for(var i = 0; i < styleElements.length; i++) {
		var styleText = styleElements[i].firstChild.data;
		// this should be using match(/\b[\w-.]+(?=\s*\{)/g but ?= causes an
		// error in IE5, so we include the open brace and then strip it
		allStyleRules = styleText.match(/\b[\w-.]+(\s*\{)/g);
	}

	for(var i = 0; i < allStyleRules.length; i++) {
		// probably insufficient for people who like random gobs of 
		// whitespace in their styles
		allStyleRules[i] = allStyleRules[i].substr(0, (allStyleRules[i].length - 2));
	}
	ugly_selectorText_workaround_flag = true;
}
