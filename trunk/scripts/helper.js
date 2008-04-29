function isIE() {
  return (navigator.appName == "Microsoft Internet Explorer");
}

function myHasAttribute( node, attrib ) {
  // A cross-browser friendlier has attribute
  if( node.hasAttribute ) {
    return node.hasAttribute( attrib );
  } else {
	var attr= node.attributes[attrib];
    return (attr != undefined) && attr && attr.specified; 
  }
  /*
  if( node.hasAttribute ) {
    return node.hasAttribute( attrib );
  } else {
    return node.getAttribute( attrib ) != undefined; 
  } 
  */
}

