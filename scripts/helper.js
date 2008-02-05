function isIE() {
  return (navigator.appName == "Microsoft Internet Explorer");
}

function myHasAttribute( node, attrib ) {
  if( node.hasAttribute ) {
    return node.hasAttribute( attrib );
  } else {
    return node.getAttribute( attrib ) != undefined; 
  } 
}

