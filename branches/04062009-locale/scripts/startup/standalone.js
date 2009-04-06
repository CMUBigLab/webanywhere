/**
 * Add event listeners to the navigation window.
 */
WA.start = function() {
	// Attach browser onload handler
	if(window != top) {
	  if(window.addEventListener) {
	    window.addEventListener('load', init_browser, false);
	  } else if(window.attachEvent) {
	    window.attachEvent('onload', init_browser);
	  }
	}

  // Set the soundManager onload function.
  soundManager.onload = function() {
    WA.Utils.log("soundManager loaded");

    // soundManager 2 should be ready to use/call at this point.
    WA.Sound.soundPlayerLoaded = true;
    top.soundPlayerLoaded = true;

    // Call newPage to process the newly-loaded page.
    if(top.pageLoaded) {
      newPage();
    }
  }

	// Initialize sounds to get things rolling.
	WA.Sound.initSound();
}