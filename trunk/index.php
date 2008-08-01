<?php
error_reporting(E_ALL);
ini_set('display_errors','On');
include('config.php');
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" 
 "http://www.w3.org/TR/html4/frameset.dtd">
<HTML>
<HEAD>
<TITLE>Web Anywhere</TITLE>
<SCRIPT LANGUAGE="Javascript">
/* <![CDATA[ */
var old_open = window.open;
window.open = function() {}
var navLoaded = false;
function navigationLoad() {
  navLoaded = true;
}
var returning = false;

if(window.addEventListener) {
  window.addEventListener('focus', focus_webanywhere, false);
  window.addEventListener('blur', blur_webanywhere, true);
  window.addEventListener('unload', unload_webanywhere, false);
} else if(window.attachEvent) {
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
  if(top.soundPlayerLoaded) {
    window.navigation_frame.newPage();
  }
}
/* ]]> */
</SCRIPT>
</HEAD>
<?php
// Prepare optional argument string.
$arguments = "";
if(isset($_REQUEST['debug'])) {
  $arguments .= 'debug=' . $_REQUEST['debug'];
}
if(isset($_REQUEST['embed'])) {
  if(strlen($arguments) > 0) {
    $arguments .= '&';
  }
  $arguments .= 'embed=' . $_REQUEST['embed'];
}
if(strlen($arguments) > 0) {
  $arguments = '?' . $arguments;
}
$start_url = (isset($_REQUEST['starting_url']) ? str_replace('$url$', base64_encode($_REQUEST['starting_url']), $wp_path) : $root_path . $wp_dir . "/wawp.php?q=aHR0cDovL3dlYmluc2lnaHQuY3Mud2FzaGluZ3Rvbi5lZHUvd2EvY29udGVudC5waHA=");
?>
<FRAMESET ROWS="15%, *" BORDER="0">
     <FRAME SRC="browser.php<?php echo $arguments; ?>" id="navigation_frame" NAME="navigation_frame" onLoad="navigationLoad()" SCROLLING="NO">
     <FRAME SRC=<?php echo $start_url; ?> id="content_frame" NAME="content_frame" onLoad="newPage();">
</FRAMESET>
</HTML>