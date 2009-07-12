/*
 * Scroll Into View Spotlighter Extension.
 * /extensions/scroll-into-view-spotlighter.js
 *
 * An extension for scrollling current node into view.
 */
WA.Extensions.ScrollIntoViewSpotlighter = function() {
  this.spotlight = function(node) {
    if(node==null)
      return;

  	if(node.nodeType != 1 || node.nodeName=="OPTION")
  	 node = node.parentNode;

    var win = getContentWindow();

    var cdim = WA.Utils.contentWidthHeight(win);
    var soff = WA.Utils.getScrollOffset(win);

    // Calculate the boundaries of the current viewport.
    var view_top = soff[1];
    var view_bottom = (view_top + cdim[1] - node.offsetHeight)
    var view_left = soff[0];
    var view_right = (view_left + cdim[0] - node.offsetWidth);

    var pos = WA.Utils.findPos(node);

    // If the current node is outside of the current viewport,
    // scroll it into view.
    if(pos != null && pos.length == 2) {
      if(pos[1] < view_top || pos[0] < view_left) {
        node.scrollIntoView(true);
      } else if(pos[1] >  view_bottom || pos[0] > view_right) {
      	node.scrollIntoView(false);
      }
    }
  }

  this.unspotlight = function() {}
  this.reset = function() {}
}

// Add this extension to the node spotlighter extensions.
WA.Extensions.nodeSpotlighters.push(new WA.Extensions.ScrollIntoViewSpotlighter());