<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" 
 "http://www.w3.org/TR/html4/frameset.dtd">
<html>
<head>
<title>Web Anywhere</title>
<script>

var old_open = window.open;
window.open = function() {}

var navLoaded = false;
function navigationLoad() {
  navLoaded = true;

  if(/embed=true/.test(document.location + "")) {
    window.navigation_frame.soundMethod = 2;
  } else {
    window.navigation_frame.soundMethod = 1;  
  }

  if(/embed=true/.test(document.location + "")) {
    window.navigation_frame.soundMethod = 2;
  } else {
    window.navigation_frame.soundMethod = 1;  
  }
}

var returning = false;

if (window.addEventListener) {
  window.addEventListener('focus', focus_webanywhere, false);
  window.addEventListener('blur', blur_webanywhere, true);
  window.addEventListener('unload', unload_webanywhere, false);
} else if (window.attachEvent) {
  window.attachEvent('onfocus', focus_webanywhere);
  window.attachEvent('onblur', blur_webanywhere);
  window.attachEvent('onunload', unload_webanywhere);
}

function announce_in_focus() {
  if(returning && navLoaded) {
    if(window.navigation_frame) {
      window.navigation_frame.prefetch("Web Anywhere is now in focus.", true, false);
      window.navigation_frame.focusLocation();
    } else {
      setTimeout("announce_in_focus", 1000);
    }
  }
}

function focus_webanywhere() {
  //announce_in_focus();
  returning = false;
}
function blur_webanywhere() {
  //alert('webanywhere has been blurred!');
  //window.navigation_frame.prefetch("Another window has tried to replace the focus of Web Anywhere.  If the system is not responding, please try hitting alt-tab to return to this window.", true, false);
  //window.navigation_frame.focus();
  returning = true;
}
function unload_webanywhere() {
  //window.navigation_frame.prefetch("Web Anywhere is being unloaded.  If the system stops responding, try pressing either backspace or alt + left arrow to return to this page.", true, false);
  //returning = true;
}

var pageLoaded = false;
function newPage() {
  pageLoaded = true;
  if(navLoaded) {
    window.navigation_frame.newPage();
  }
}


</script>
</head>

<FRAMESET ROWS="15%, *" BORDER="0">
     <FRAME SRC="browser.php?embed=<?php echo $_REQUEST[embed]; ?>&debug=<?php echo $_REQUEST[debug]; ?>" id="navigation_frame" NAME="navigation_frame" onLoad="navigationLoad()">
     <FRAME SRC="content.php?debug=<?php echo $_REQUEST[debug]; ?>&starting_url=<?php echo $_REQUEST[starting_url]; ?>" id="content_frame" NAME="content_frame" onLoad="newPage();">
</FRAMESET>

</html>
