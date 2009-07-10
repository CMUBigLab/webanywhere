WA.Interface = {
  // Boolean variable indicating whether we expected the location bar
  // to be focused.  The location bar also gets focus when the window
  // loses and then regains focus.
  expectingLocationFocus: false,

  /**
   * Focuses the WebAnywhere location bar.
   */
  focusLocation: function() {
    WA.Interface.expectingLocationFocus = true;
	  var location_field = document.getElementById('location');
	  if(location_field) {
	    location_field.blur();
	    location_field.focus();
	    location_field.select();
	  }
	  WA.Interface.expectingLocationFocus = false;
  },

  /**
   * Called when the location bar gains focus.
   * @param e: the focus event.
   */
  locationFocus: function(e) {
    var target = WA.Utils.getTarget(e);

    if(WA.Interface.expectingLocationFocus) {
      WA.Interface.expectingLocationFocus = false;
      getScriptWindow().textBoxFocused = true;

      WA.Sound.resetSounds();

      WA.Sound.addSound("Location field text area:");
      if(target.value) {
        WA.Sound.addSound(target.value);
      }
    } else {
      target.blur();
    }
  },

  locationMouseDown: function(e) {
    var target = WA.Utils.getTarget(e);
    WA.Interface.expectingLocationFocus = true;

    // Prevent WebAnywhere from continuing reading.
    silenceAll();
    WA.Extensions.spotlightNode(null);

    WA.Interface.locationFocus(e);
  },

  /**
   * Sets up the appropriate events for the location field.
   */
   setupLocationBar: function() {
     // Event listeners for the location bar.
     var location_field = document.getElementById('location');
     if(location_field) {
       if(window.attachEvent) location_field.attachEvent('onfocus', WA.Interface.locationFocus);
       else if(window.addEventListener) location_field.addEventListener('focus', WA.Interface.locationFocus, false);
    
       if(window.attachEvent) location_field.attachEvent('onblur', function() { getScriptWindow().textBoxFocused = false; });
       else if(window.addEventListener) location_field.addEventListener('blur', function() { getScriptWindow().textBoxFocused = false; }, false);

       if(window.attachEvent) location_field.attachEvent('onmousedown', WA.Interface.locationMouseDown);
       else if(window.addEventListener) location_field.addEventListener('mousedown', WA.Interface.locationMouseDown, false);
     }
   }
}