/*
 * handlenodes.js
 * 
 * Contains functions for handling DOM elements.
 * 
 * Used primarily to determine when a DOM element should be read,
 * and for determining what text to read for such nodes, and
 * supporting functionality.
 */

WA.Nodes = {
  // Should node type identifiers and the node text be broken apart?
  // This has benefits for caching.
  _breakUpSound: false,
  _breakUpSoundDelimiter: " || ",

  // This string is inserted between the type of the node and the text for
  // the node, when applicable.  For instance, this string will be placed
  // between "Image" and the alt text for that image.
  nodeTypeBreaker: (this._breakUpSound ? this._breakUpSoundDelimiter : ""),
  
  // Return true if we should treat this node as a leaf, false otherwise.
  // The only nodes that possibly aren't leaves are the element nodes (type 3)
  leafNode: function(node) {
    if(node && node.nodeType && node.nodeType == 3) {
      return true;
    } else {
    	return this.leafElement(node);
    }
  },

  // Returns 'true' if the given node contains the specified attribute,
  // and 'false' otherwise.
  hasAttribute: function(node, attrib) {
    if(node.hasAttribute) {
      return node.hasAttribute(attrib);
    } else {
      var attr = node.attributes[attrib];
      return (attr != undefined) && attr && attr.specified; 
    }
  },
 
  // Boolean: Is this element (type 3 node) a leaf?
  leafElement: function(elem) {
    switch(elem.tagName) {
      case 'A': // Anchor
        if(this.hasAttribute(elem, 'name')) {
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
        return isVisible(elem);
    }
  
    return !elem.hasChildNodes();
  },

  // Returns a string for this node.
  handleNode: function(node, goingDown) {
    if(!goingDown) {
      return null;
    }
  
    switch(node.nodeType) {
    case 1: // An HTML Element
      // Only speak elements that are displayed.
      //var disp = this.getStyle(node, 'display');
      if(node.offsetWidth <= 0) {
        return "";
      } else {
        return this.handleElement(node);
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
  },

  // Forms a giant string of all the child nodes of a node.
  handleChildNodes: function(node) {
    var result = "";
    for(var i=0, ncl=node.childNodes.length; i<ncl; i++) {
      result += this.handleNode(node.childNodes[i], true) + " ";
      if(!this.leafNode(node.childNodes[i]))
        result += this.handleChildNodes(node.childNodes[i]);
    }
    return result;
  },
  
  // Handle and area node to get the correct link name for it.
  handleAreaNode: function(elem) {
    if(elem.getAttribute('alt') )
      return elem.getAttribute('alt');
    else if(elem.getAttribute('href'))
      return elem.getAttribute('href');
    else
      return "";
  },
  
  // Handles an Image Node to get the correct text for it.
  handleImageNode: function(elem) {
    if(elem.getAttribute('alt')) {
      return elem.getAttribute('alt');
    } else {
      return "";
    }
  },

  // Handle List Items.
  handleListNode: function(elem) {
    var result = "";
  
    // Check to see if we're part of an ordered list.
    var parent = elem.parentNode;
    while( parent && parent.tagName != "BODY" ) {
      if( parent.tagName == "OL" ) {
        var elems = parent.getElementsByTagName("LI");
        for( var i=0, el=elems.length; i<el; i++ ) {
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
  },
  
  // Handle an input node
  handleInputNode: function(elem) {
    var result = "";
  
    if(this.hasAttribute(elem, 'type')) {
      switch(elem.getAttribute('type')) {
        case 'button':
          result += "Button: " + this.nodeTypeBreaker + elem.value;
          break;
        case 'checkbox':
          result += "Checkbox " + this.nodeTypeBreaker + this.getLabelName(elem);
          result += ": " + ((elem.checked == true) ? "checked" : "unchecked");
          break;
        case 'file':
          result += "File Input " + this.nodeTypeBreaker + this.getLabelName(elem);
          result += ": " + elem.value;
          break;
        case 'hidden':
          break;
        case 'image':
          result += "Image Input " + this.nodeTypeBreaker + this.getLabelName(elem) + ": ";
          result += elem.value;
          break;
        case 'password':
          result += "Password Textarea " + this.nodeTypeBreaker + this.getLabelName(elem);
          break;
        case 'radio':
          result += "Radio Button " + this.nodeTypeBreaker + this.getLabelName(elem) + ": " + elem.value;
          break;
        case 'reset':
          result += "Reset Button: " + this.nodeTypeBreaker + elem.value;
          break;
        case 'submit':
          result += "Submit Button: " + this.nodeTypeBreaker + elem.value;
          break;
        default:
          result += "Text Area " + this.nodeTypeBreaker + this.getLabelName(elem) + ": " + elem.value;
      }
    }
    return result;
  },

  // Accumulates the total text that should be spoken for the provided element.
  // elem - node to be spoken.
  // local variable result is where the end result is gathered.
  //
  // NOTE: Lists work but list item numbers are spoken seperately
  // NOTE: Need to handle leaving a table...say "table <name> end"
  handleElement: function(elem) {
    var result = "";
  
    switch(elem.tagName) {
      case 'A': // Anchor
        if(this.hasAttribute(elem, 'href'))
          result += "link " + this.nodeTypeBreaker + this.handleChildNodes(elem);
        break;
      case 'AREA': // Image map region
        result += "link " + this.nodeTypeBreaker + this.handleAreaNode(elem); 
        break;
  
      case 'BUTTON': // Button
        result += this.handleChildNodes(elem) + " button";
        break;
      
      // No this.nodeTypeBreaker because low number of possibilities, likely to be cached in full.
      case 'H1': // Level-one heading
        result += "Heading 1";
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
        var image_text = this.handleImageNode(elem);
        if(image_text && image_text.length > 0) {
          result += "Image " + this.nodeTypeBreaker + image_text;
        }
        break;
      case 'INPUT': // Form input
        result += this.handleInputNode(elem);
        break;
  
      case 'LI': // List item -- Just read the list item text
        result += this.handleListNode(elem);
        break;
  
      case 'SELECT': // Option selector
        result += "Selection " + this.getLabelName(elem) + ": " + this.nodeTypeBreaker + elem.value;
        break;
  
      case 'TABLE': // Table e.g Table 2 <name> start # rows # columns
          var rows = elem.rows.length;
          var cols = this.getLargestRowLength(elem.rows);
          if(rows > 2 && cols > 2) {
            result += "Table " + this.getTableNum(elem) + " " + this.getTableName(elem) +
                                 " start " +
                                 rows + " rows " +
                                 cols + " columns";
          }
          break;
      case 'TEXTAREA': // Multi-line text input
          result += "Text Area " + this.getLabelName(elem) + ": " + this.nodeTypeBreaker + elem.value;
          break;
  
      case 'UL': // Unordered List
      case 'OL': // Ordered List
        var numitems = this.getNumberOfListElements(elem);
        if(numitems > 0) {
          result += "List with " + numitems + " items";
        }
    }
  
    if(elem.getAttribute('title')) {
      result = result + " " + elem.getAttribute('title');
    }
  
    return result;
  },

  // Function for returning the name of an input element.
  // Page is preprocessed to record location of <label>
  // elements and the elements that they describe.
  getLabelName: function(elem) {
    if(this.hasAttribute(elem, 'my_label'))
      return elem.getAttribute('my_label');  
    else if(this.hasAttribute(elem, 'name'))
      return elem.getAttribute('name');
  
    return "";
  },

  // Counts the number of LI elements the passed in element (elem) has
  // as children.
  getNumberOfListElements: function(elem) {
    var num = 0;
    if(typeof elem == 'undefined' || typeof elem.childNodes == 'undefined') {
      return 0;   
    }
    for(var i=0, ecl=elem.childNodes.length; i<ecl; i++)  {
      if(elem.childNodes.nodeName == "LI") {
        num++;
      }
    }
    
    return num;
  },

  // Gets the textual description of a table.
  getTableName: function(elem) {
    if(elem.caption) {
      return this.handleChildNodes(elem.caption);
    } else if(elem.summary) {
      return elem.summary;
    } else {
      return "";
    }
  },

  // Gets the table number in the document.
  getTableNum: function(elem) {
    var tables = elem.ownerDocument.getElementsByTagName('TABLE');
    for(var i=0, tl=tables.length; i<tl; i++) {
      if(tables[i] == elem) return i;
    }
    return 0;
  },

  // Returns the largest row length.
  getLargestRowLength: function(rows) {
    var longest = 0;
    for(var i=0, rl=rows.length; i<rl; i++)
      if(rows[i].cells.length > longest)
        longest = rows[i].cells.length;
    return longest;
  },

  // Function to get the computed style of an element for the specified property.
  getStyle: function(elem, prop) {
    var prop_value = null;
    if(elem.currentStyle) {
      prop_value = elem.currentStyle[prop];
    } else if(window.getComputedStyle) {
      prop_value =
    	 document.defaultView.getComputedStyle(elem,null).getPropertyValue(prop);
    }
    return prop_value;
  }
};