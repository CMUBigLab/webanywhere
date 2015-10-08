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

  // Break-up delimiter.
  _breakUpSoundDelimiter: " || ",

  // This string is inserted between the type of the node and the text for
  // the node, when applicable.  For instance, this string will be placed
  // between "Image" and the alt text for that image.
  nodeTypeBreaker: (this._breakUpSound ? this._breakUpSoundDelimiter : ""),
  
  // Recursion limit.
  // TODO: remove 20 level "fudge factor"
  //       turns out the recursion limits vary browser to browser...
  recursion_limit: 1000 - 20,
  
  // Stack of iframe nodes is populated as we encounter iframes. 
  _iframeNodes: [],

  /**
   * Return true if we should treat this node as a leaf, false otherwise.
   * The only nodes that possibly aren't leaves are the element nodes (type 3).
   * @@shouldn't this be s/element nodes/text nodes?
   * @param node Node to see if it's a leaf node or not.
   * @return Boolean Boolean indicating whether this is a leaf node.
   */
  leafNode: function(node) {
    if(!node || !node.nodeType || node.nodeType == 3) {
      return true;
    } else {
    	return this.leafElement(node);
    }
  },

  /**
    * Does node type only make sense inside parent?
    * @param node DOMElement to check.
    * @return Boolean Whether this node is an internal node.
    */
  internalNode: function(node) {
    var parent = node.parentNode;
    if(parent) {
      if(parent.nodeName == "OPTION" || parent.nodeName == "SELECT") {
        return true;
      }
    }

    return false;
  },
	
  /**
   * Returns 'true' if the given node contains the specified attribute,
   * and 'false' otherwise.
   * @param node Node to check.
   * @param attrib Attribute to check.
   * @return[boolean] Boolean to check if the attribute exists in.
   */
  hasAttribute: function(node, attrib) {
    // First check to see if the DOM2 hasAttribute is available.
    if(node.hasAttribute) {
      return node.hasAttribute(attrib);
    }

    // Give IE a chance to reject it.
    // In this case we should be able to use the 'specified' property of the
    // attribute to see if it is provided, but this has not proven reliable,
    // particulary for 
    if(node.attributes && !(attrib in node.attributes)) {
      return false;
    }

    // Use straight-forward, but error-prone method.
    // In particular, this will not distinguish between an image with alt=""
    // and undefined alt text.
    // TODO: FIXME
    var attrVal = node.getAttribute(attrib);
    if(attrVal != null && attrVal != "") {
      return true;
    }

    // Couldn't find the attribute no matter how hard we tried.
    return false;
  },
 
  /**
   *  Boolean: Is this element a leaf node?
   */
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
      case 'LABEL': // <label>'s will be read at the input element.
      case 'NOSCRIPT':
      case 'SELECT':
        return this.isVisible(elem);
      case 'HEAD':
      case 'SCRIPT':
      case 'STYLE':
        return true;
      case 'IFRAME':
        /* not sure what to return. Moved this from the above set with img and label... */
    }
  
    return !elem.hasChildNodes();
  },

  /**
   * Returns whether the node is currently invisible.
   * @param node Node to test.
   * @return Boolean Is the node invisible.
   */
  isInvisible: function(node) {
    //var viz = WA.Nodes.isVisible(node);
    //WA.Utils.log('Is VIZ (' + node.nodeName + ' ' + node.id + ') - ' + viz);
 
    if(node == null || typeof node == 'undefined' || node.nodeType != 1 || node.nodeName == "BODY") {
    	return false;
    }

    var disp = this.getNodeStyle(node, 'display', 'display');
    var vis = this.getNodeStyle(node, 'visibility', 'visibility');
    WA.Utils.log('In isInvisible (' + node.nodeName + ' ' + node.id + ') - disp: '+disp+' vis: '+vis);
    if(disp == 'none' || vis == 'hidden' || node.offsetWidth <= 0 || !node.parentNode) return true;

    return false; //WA.Nodes.isInvisible(node.parentNode);
  },

  isVisible: function(obj) {
    if(obj.nodeName == "BODY") return true
    
    if(!obj) return false
    else if(!obj.parentNode) return false
    else if(obj.style) {
      if (obj.style.display == 'none') return false
      else if (obj.style.visibility == 'hidden') return false
    }

    if(window.getComputedStyle) {
      var style = window.getComputedStyle(obj, "")
      if (style.display == 'none') return false
      if (style.visibility == 'hidden') return false
    }
    
    var style = obj.currentStyle
    if(style) {
      if (style['display'] == 'none') return false
      if (style['visibility'] == 'hidden') return false
    }
    
    return WA.Nodes.isVisible(obj.parentNode)
  },

  /**
   * Boolean: can this node receive focus?
   * @param node DOM node.
   * @return Boolean Is the node focusable?
   */
  isFocusable: function(node) {
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
  },

  /**
   * Returns a string for this node.
   * @param node Node to get the text for.
   * @param goingDown Are we doing a DFS or a r-DFS?
   * @return String Text for this node.
   */
  handleNode: function(node, goingDown) {
    WA.Utils.log('In handleNode: '+node.nodeName+"  "+node.nodeValue);
    if(!goingDown) {
      return null;
    }

    var return_val = "";

    switch(node.nodeType) {
	    case 1: // An HTML Element
	      // Only speak elements that are displayed.
	      if(this.isInvisible(node)) {
	        return_val = "";
	      } else {
	        return_val = this.handleElement(node);
	      }
        break;
	    case 2: // An element attribute -- DO NOTHING
	      return_val = "";
        break;
	    case 3: // Text -- Read the Text
	      var ret_val = node.data;
	      if(ret_val.length > 0 && ret_val.match(/[^\s,\.\?!:\-]/)) {
	        ret_val = ret_val.replace(/&#\d+;/, "");
	        return_val = ret_val;
	      } else {
	        return_val = "";
	      }
	      break;
	    case 8: // Comment
	    case 9: // Document 
	    case 10: // Document Type Definition
	    // @@ need to handle document fragment? 11
	    default:
	      return_val = "";
    } 
    
    return return_val;
  },

  /**
   * Forms a giant string of all the child nodes of a node.
   * @param node
   * @return String Text for all the children of this node.
   */
  handleChildNodes: function(node) {
    var result = "";
    for(var i=0, ncl=node.childNodes.length; i<ncl; i++) {
      result += this.handleNode(node.childNodes[i], true) + " ";
      if(!this.leafNode(node.childNodes[i]))
        result += this.handleChildNodes(node.childNodes[i]);
    }

    return result;
  },
  
  /**
   * Handle and area node to get the correct link name for it.
   * @param elem AreaElement
   * @return String Text for this area element.
   */
  handleAreaNode: function(elem) {
    if(elem.getAttribute('alt') )
      return elem.getAttribute('alt');
    else if(elem.getAttribute('href'))
      return elem.getAttribute('href');
    else
      return "";
  },
  
  /**
   * Handles an Image Node to get the correct text for it.
   * @param elem Image Element to get the textual description for.
   * @return String Textual description of the image.
   */
  handleImageNode: function(elem) {
    if(elem.getAttribute('alt')) {
      return elem.getAttribute('alt');
    } else {
      return "";
    }
  },

  /**
   * Handle List Items.
   * @param elem List Item Element.
   * @return Textual description of list item <li>
   */
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
  
  /** Handle an input node.
   *  @param elem Input element.
   *  @return Textual description of the input element.
   */
  handleInputNode: function(elem) {
    var result = "";

    switch(elem.getAttribute('type')) {
      case 'button':
        result += wa_gettext("Button") + ": " + this.nodeTypeBreaker + elem.value;
        break;
      case 'checkbox':
        result += wa_gettext("Checkbox") + " " + this.nodeTypeBreaker +
                    this.getLabelName(elem);
        result += ": " + ((elem.checked == true) ? "checked" : "unchecked");
        break;
      case 'file':
        result += wa_gettext("File Input") + " " + this.nodeTypeBreaker +
                    this.getLabelName(elem);
        result += ": " + elem.value;
        break;
      case 'hidden':
        break;
      case 'image':
        result += wa_gettext("Image Input") + " " + this.nodeTypeBreaker +
                    this.getLabelName(elem) + ": ";
        result += elem.value;
        break;
      case 'password':
        result += wa_gettext("Password Textarea") + " " + this.nodeTypeBreaker +
                    this.getLabelName(elem);
        break;
      case 'radio':
        result += wa_gettext("Radio Button") + " " + this.nodeTypeBreaker +
                    this.getLabelName(elem) + ": " + elem.value;
        break;
      case 'reset':
        result += wa_gettext("Reset Button") + ": " + this.nodeTypeBreaker + elem.value;
        break;
      case 'submit':
        result += wa_gettext("Submit Button") + ": " + this.nodeTypeBreaker + elem.value;
        break;
      case 'text':
      default:
        result += wa_gettext("Text Area") + " " + this.nodeTypeBreaker +
                    this.getLabelName(elem) + ": " + elem.value;
    }
    return result;
  },

  /** Accumulates the total text that should be spoken for the provided element.
   *   elem - node to be spoken.
   *  local variable result is where the end result is gathered.
   *
   * NOTE: Lists work but list item numbers are spoken seperately
   * NOTE: Need to handle leaving a table...say "table <name> end"
  */
  handleElement: function(elem) {
    var result = "";
  
    switch(elem.tagName) {
      case 'A': // Anchor
        if(this.hasAttribute(elem, 'href'))
          result += wa_gettext("link") + " " + this.nodeTypeBreaker + this.handleChildNodes(elem);
          WA.Utils.log('nodes.js result: '+result);
        break;
      case 'AREA': // Image map region
        result += wa_gettext("link") + " " + this.nodeTypeBreaker + this.handleAreaNode(elem); 
        break;
  
      case 'BUTTON': // Button
        result += this.handleChildNodes(elem) + " " + wa_gettext("button");
        break;
      
      // No this.nodeTypeBreaker because low number of possibilities, likely to be cached in full.
      case 'H1': // Level-one heading
        result += wa_gettext("Heading 1");
        break;
      case 'H2': // Level-two heading
        result += wa_gettext("Heading 2");
        break;
      case 'H3': // Level-three heading
        result += wa_gettext("Heading 3");
        break;
      case 'H4': // Level-four heading
        result += wa_gettext("Heading 4");
        break;
      case 'H5': // Level-five heading
        result += wa_gettext("Heading 5");
        break;
      case 'H6': // Level-six heading
        result += wa_gettext("Heading 6");
        break;
  
      case 'IMG': // Inline image
        var image_text = this.handleImageNode(elem);
        if(image_text && image_text.length > 0) {
          result += wa_gettext("Image") + " " + this.nodeTypeBreaker + image_text;
        }
        break;
      case 'INPUT': // Form input
        result += this.handleInputNode(elem);
        break;
  
      case 'LI': // List item -- Just read the list item text
        result += this.handleListNode(elem);
        break;
  
      case 'SELECT': // Option selector
        result += wa_gettext("Selection") + " " + this.getLabelName(elem) + ": " + this.nodeTypeBreaker + elem.value;
        break;
  
      case 'TABLE': // Table e.g Table 2 <name> start # rows # columns
          var rows = elem.rows.length;
          var cols = this.getLargestRowLength(elem.rows);
          if(rows > 2 && cols > 2) {
            result += wa_gettext("Table") + " " + this.getTableNum(elem) + " " + this.getTableName(elem) +
                                 " " + wa_gettext("start") + " " +
                                 rows + " " + wa_gettext("rows") + " " +
                                 cols + " " + wa_gettext("columns") + " ";
          }
          break;
      case 'TEXTAREA': // Multi-line text input
          result += wa_gettext("Text Area") + " " + this.getLabelName(elem) + ": " + this.nodeTypeBreaker + elem.value;
          break;
  
      case 'UL': // Unordered List
      case 'OL': // Ordered List
        var numitems = this.getNumberOfListElements(elem);
        if(numitems > 0) {
          result += wa_gettext("List with") + " " + numitems + " " + wa_gettext("items");
        }
    }

    if(elem.getAttribute('title')) {
      result = result + " " + elem.getAttribute('title');
    }
  
    return result;
  },

  /**
   * Function for returning the name of an input element.
   * Page is preprocessed to record location of <label>
   * elements and the elements that they describe.
   * @param elem
   * @return String Textual description of the input element.
   */
  getLabelName: function(elem) {
    if(this.hasAttribute(elem, 'my_label'))
      return elem.getAttribute('my_label');  
    else if(this.hasAttribute(elem, 'name'))
      return elem.getAttribute('name');
  
    return "";
  },

  /** 
   * Counts the number of LI elements the passed in element (elem) has
   * as children.
   * @param elem ListElement to get the number of list items in.
   */
  getNumberOfListElements: function(elem) {
    var num = 0;
    if(typeof elem == 'undefined' || typeof elem.childNodes == 'undefined') {
      return 0;   
    }
    for(var i=0, ecl=elem.childNodes.length; i<ecl; i++)  {
      if(elem.childNodes[i].nodeName == "LI") {
        num++;
      }
    }

    return num;
  },

  /**
   * Gets the textual description of a table.
   * @param elem Table Element to get the name of.
   * @return String Name of the table or the empty string.
   */
  getTableName: function(elem) {
    var ret = "";
    if(elem.caption) {
      ret = this.handleChildNodes(elem.caption);
    } else if(elem.summary) {
      ret = elem.summary;
    }

    return ret;
  },

  /**
   * Gets the 0-indexed table number in the document.
   * @param elem
   * @return Integer Number of the table in the document, -1 if not found.
   */
  getTableNum: function(elem) {
    if(elem != null) {	
	    var tables = elem.ownerDocument.getElementsByTagName('TABLE');
	    for(var i=0, tl=tables.length; i<tl; i++) {
	      if(tables[i] == elem) return i;
	    }
    }
    return -1;
  },

  /**
   * Returns the largest row length.
   * @param rows Array of TableRowElements <tr>
   * @return Integer Largest number of cells in the table row.
   */
  getLargestRowLength: function(rows) {
    var longest = 0;
    for(var i=0, rl=rows.length; i<rl; i++)
      if(rows[i].cells.length > longest)
        longest = rows[i].cells.length;
    return longest;
  },

  /** Does a DFS on the supplied node, passing node to visitor for each
   * node that it encounters.
   * Leaf nodes can be determined by the optional isleaf function.
   * inv_depth keeps track of the depth of the recursion.
   * first is a boolean value indicating whether this is the first iteration.
   * @param node Node where the traversal should start.
   * @param visitor Function to call on each node.
   * @param isleaf Function indicating whether the current node is a leaf.
   */
  treeTraverseRecursion: function(node, visitor, isleaf) {
    this._treeTraverseRecursion(node, visitor, isleaf, 0);
  },

  /**
   * Does a DFS starting from node, passing node to visitor for each
   * node that it encounters.
   * Leaf nodes can be determined by the optional isleaf function.
   * inv_depth keeps track of the depth of the recursion.
   * first is a boolean value indicating whether this is the first iteration.
   * @param node Current node on the DFS path.
   * @param visitor Function to call on each node.
   * @param isleaf Function for determining is the node is a leaf.
   * @param depth Integer representing the current depth.
   * */
  _treeTraverseRecursion: function(node, visitor, isleaf, depth) {
    if(depth > this.recursion_limit) {
      return;
    }

    // The node visitors might change the DOM structure of the tree in
    // unpredictable ways, so keep track of the nodes that we wanted to
    // visit before we actually visit the current node.
    var nodesToVisit = new Array();

    // Add in the node's first child (for DFS).
    if((typeof isleaf != 'function') || !isleaf(node)) {
      if(node.firstChild) {
      	nodesToVisit.push(node.firstChild);
      }
    }

    // Add the node's first sibling, will be explored after the sub-tree
    // rooted at its first child.
    if(node.nextSibling) {
      nodesToVisit.push(node.nextSibling);
    }
    
    // @@ if the current node is an iframe, push node.contentDocument.body 
    // onto the stack? Also want to check that contentDocument.body exists?
    // Check that the IFRAME isvisible or have we done that already? I think 
    // we do that before we start traversing this node....
    if(node.nodeName == 'IFRAME') {
      // try/catch to make sure that we have permission to view the contents
      // of this IFRAME.  This is a bit ugly, but necessary for the moment.
      // Ideally, we would be able to explicitly test if accessing the iframe
      // violates the same-origin policy.
      try{
        if(node.contentDocument) 
        // Firefox, Opera
        {
          nodesToVisit.push(node.contentDocument.body);
        }
        else if(node.contentWindow)
        // Internet explorer
        {
          nodesToVisit.push(node.contentWindow.document.body);
        }
        else if(node.document)
        // Others?
        {
          nodesToVisit.push(node.document.body);
        }
      } catch(e) {
        // Nothing to do here, but IFRAME will be ignored.
      }
    }

    // Visit the node.
    if(depth!=this.recursion_limit && node) {
      try {
        visitor(node);
      } catch(e) {
        WA.Utils.log('unable to keep going ' + e + " node: " + node);
      }
    }

    for(var i=0; i<nodesToVisit.length; i++) {
      this._treeTraverseRecursion(nodesToVisit[i], visitor, isleaf, depth+1);
    }
  },

  /**
   * depthFirstVisitor:
   * Visits the node rooted here with the supplied visitor and detecting the
   * leaf node by the passed in root node.
   * @param node Node to explore.
   * @param visitor Function(node) to explore each node with.
   * @param isleaf Function(node) called to detect whether a leaf.
   */
  depthFirstVisitor: function(node, visitor, isleaf) {
    visitor(node);

    var children = node.childNodes;
    for(var i=0; i<children.length; i++) {
      var child = children[i];
      if(!isleaf(child)) {
        this.depthFirstVisitor(child, visitor, isleaf);
      }
    }
  },

  /**
   * getNodeStyle:  Returns the computed style for the supplied node.
   * Takes as input both the script property name and the CSS property name,
   * i.e. backgroundColor and background-color.
   * @param node Node to compute the style of.
   * @param scriptStyleProp Style property desired in the script camel-case
   *                        notation.
   * @param cssStyleProp    Style property desired in CSS notation.
   * @return String of the computed style.
   */
  getNodeStyle: function(node, scriptStyleProp, cssStyleProp) {
    if(typeof node != 'undefined' && node.nodeType != 1) {
    	node = node.parentNode;
    }

    if (node.currentStyle) {
      return node.currentStyle[scriptStyleProp];
    } else if (window.getComputedStyle) {
      var compStyle = window.getComputedStyle(node, "");
      return compStyle.getPropertyValue(cssStyleProp);
    } else {
      // This should not happen.
      return "";
    }
  },

  getTextContent: function(node) {
    if(node!=null) {
      if(node.textContent) {
        return node.textContent;
      } else if(node.innerText) {
        return node.innerText;
      }
    }
  }
};
