WA.Interface = {
  /**
   * Focuses the WebAnywhere location bar.
   */
  focusLocation: function() {
	  var location_field = document.getElementById('location');
	  if(location_field) {
	    location_field.blur();
	    location_field.focus();
	    location_field.select();
	  }
  }
}