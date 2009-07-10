<?php
// Turn on error reporting.
if(isset($_REQUEST['debug']) && $_REQUEST['debug']==='true') {
  error_reporting(E_ALL);
  ini_set('display_errors','On');
}

// Standard WebAnywhere configuration file.
include('config.php');

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
if(isset($_REQUEST['script'])) {
  if(strlen($arguments) > 0) {
    $arguments .= '&';
  }
  $arguments .= 'script=' . $_REQUEST['script'];
}

if(strlen($arguments) > 0) {
  $arguments = '?' . $arguments;
}

$start_url = (isset($_REQUEST['starting_url']) ? base64_encode($_REQUEST['starting_url']) : base64_encode($default_content_url));
$start_url = str_replace('$url', $start_url, $wp_path);
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" 
 "http://www.w3.org/TR/html4/frameset.dtd">
<HTML>
<HEAD>
<TITLE>WebAnywhere - Your Access Technology Anywhere</TITLE>
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
      window.navigation_frame.WA.Interface.focusLocation();
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

// Called onload and onresize to resize the 
function resizeContentFrame() {
  var newHeight = WA.Utils.contentWidthHeight(top)[1] -
                    (document.getElementById('wa_navigator').offsetHeight);

  document.getElementById('content_frame').style.height = newHeight + 'px';
  document.getElementById('wa_iframe_div').style.height = newHeight + 'px';
}
/* ]]> */
</SCRIPT>

<?php // Start of the WebAnywhere code. ?>
<script type="text/javascript" src="<?php
echo $script_path;
?>/js-config.php"></script>
<?php
// It's about a million times easier to debug Javascript when your source files
// haven't been messed with.  Unfortunately, it's also slower and causes the
// browser to issue many more requests.
if(isset($_REQUEST['embed']) && $_REQUEST['embed']!=='true') { ?>
<?php
}

// Array of scripts used by the system.
// In the future, this may calculate dependencies and only include those
// scripts which are actually needed.
$scripts =
  array(
        'vars.js',
        'utils/md5.js',
        'utils/utils.js',
        'utils/base64.js',
        'nodes.js',
        'sound/sounds.js',
        'startup/standalone.js',
        'sound/prefetch.js',
        'input/keyboard.js',
        'input/action-queue.js',
        'interface/interface.js',
        'extensions/extensions.js',
        'wa.js',
        'startup/start.js'
        );

// Depending on the type of sound player used, include the appropriate
// set of routines for playing sounds.
if(isset($_REQUEST['embed']) && $_REQUEST['embed']==='true') {
  array_unshift($scripts, 'sound/sound_embed.js');
} else {
  array_unshift($scripts, 'sound/soundmanager2.js');
}

// Add in any system-defined extensions.
foreach($extensions as $extension_path) {
  array_push($scripts, $extension_path);
}

// Optionally include Firebug Lite.
if(isset($_REQUEST['firebug']) && $_REQUEST['firebug']==='true') {
  echo '<script type="text/javascript" src="' . $script_path .
    '/utils/firebug-lite.js"></script>';
}

// Depending on whether we're in debug mode, either include
// each script separately (better for debugging), or
// combined script using the script minimizer.
if(isset($_REQUEST['debug']) && $_REQUEST['debug']==='true') {
  $start = '<script type="text/javascript" src="' . $script_path . '/';
  $end = '"></script>';
  
  // Output script tags individually.
  echo $start . implode($end . "\n" . $start, $scripts) . $end . "\n";
} else {
  echo '<script type="text/javascript" src="';
  echo $min_script_path . '/?b=' . trim($script_path, '/') . '&f=';

  // Concatenate the individual scripts used into one long string.
  echo implode(',', $scripts) . '"></script>';
}
?>
<?php
if(isset($_REQUEST['script']) && isset($_REQUEST['script'])) {?>
<script type="text/javascript" src="http://webinsight.cs.washington.edu/wa/repository/getscript.php?scriptnum=<?php
echo $_REQUEST['script'];
?>"></script>
<?php
}
?>
<script type="text/javascript">
WA.sessionid="<?php echo session_id(); ?>";
function browserOnload() {}
</script>
<script type="text/javascript" src="<?php
echo $script_path;
?>/input/keymapping.php"></script>


<STYLE type="text/css">
  html, body { margin:0; padding:0; width: 100%; overflow: hidden; border: none;}
  body {font-family: Georgia, "Times New Roman", Times, serif;}

  table { margin: 0; padding: 0; width: 100%;}
  tr { margin: 0; padding: 0;}
  td { margin: 0; padding: 0; text-align: center;}

  input {border: 1px solid #000; font-size: 1.7em; margin: 0; vertical-align: middle;}
  .inputbox {height: 34px; padding: 0;}
  .inputbutton {height: 36px; padding: 0 3px 3px 3px; font-weight: bold;}
  #location {width: 100%;}

  #wa_browser_interface {text-align: center; margin: 0; padding: 0;}
  #wa_text_display {text-align: center}
  #wa_finder_field {width: 100%;}
  #wa_navigator {background-color: #BBB; padding-bottom: 1px; border-bottom: 1px solid #DDD;}
  #wa_navigator_inner {background-color: #000; padding-bottom: 1px; border-bottom: 1px solid #777;}

  #content_frame {position: absolute; top: 55px; margin: 0; padding:0; height: 100%; display: block; width:100%; border: none; height: 100%; width: 100%;}
  #wa_iframe_div {position: absolute; top: 55px; height: 100%; width: 100%;}
</STYLE>
</HEAD>

<?php
//$start_url = "http://www.yahoo.com";
?>

<BODY onload="resizeContentFrame(); browserOnload();" onresize="resizeContentFrame()">
    <DIV ID="wa_navigator">
      <DIV ID="wa_navigator_inner">

      <div id="wa_browser_interface">
            <form onSubmit="javascript:navigate(this);return false;" style="margin: 0; padding: 0; display: inline;">
                <table width="100%">
                    <tr width="100%">
                        <td width="70%">
                            <label for="location" style="position: absolute; top: -100px">Location:&nbsp;</label>
                            <input class="inputbox" type="text" id="location" value="http://webinsight.cs.washington.edu/wa/content.php"/>
                        </td>
                        <td>
                            <input class="inputbutton" name="go" type="submit" value="Go" id="location_go" onclick='navigate(this); return false;'/>
                            </td>
                            <td width="20%">
                            <input class="inputbox" type="text" name="finder_field" id="wa_finder_field"/>
                        </td>
                        <td>
                            <input class="inputbutton" id="find_next_button" name="find_next_button" type="button" value="Next" onclick='nextNodeContentFinder(this); return false;'/>
                        </td>
                        <td>
                            <input class="inputbutton" id="find_previous_button" name="find_previous_button" type="button" value="Previous" onclick='prevNodeContentFinder(this); return false;'/>
                        </td>
                    </tr>
                </table>
            </form>
        </div>

        <div id="wa_text_display" style="margin: 0; padding: 0.1em; font-size: 3em; color: #FF0; font-weight: bold;">Welcome to WebAnywhere</div>

<div style="display: none;">
        <div <?php if($_REQUEST[debug] === 'true') { echo 'style="visibility: display;"'; } else { echo 'style="visibility: hidden"'; } ?>>
          <p>Playing: <span id="playing_div"></span> Features: <span id="sound_div"></span></p>
        </div>
        <div <?php if($_REQUEST[debug] === 'true') { echo 'style="visibility: hidden;"'; } else { echo 'style="visibility: hidden"'; }?>>
            <span id="test_div"></span>
        </div>
        <div <?php if($_REQUEST[debug] === 'true') { echo 'style="visibility: hidden;"'; } else { echo 'style="visibility: hidden"'; }?>>
          <p><span id="debug_div"></span></p>
        </div>
        <?php if($_REQUEST[debug]==='true') { ?>
        <p>
            <form name="recorder_form" method="post" action="recorder.php"><br/>
                <input name="submit" type="submit" value="submit">
                <textarea id="recording" name="recording" rows="30" cols="150"></textarea>
            </form>
        </p>
        <?php } ?>
</div>

       </DIV>
    </DIV>
    <DIV ID="wa_iframe_div">
        <IFRAME  id="content_frame" NAME="content_frame" onLoad="newPage();" WIDTH="100%" HEIGHT="100%" BORDER="0" SRC="<?php echo $start_url; ?>" id="content_frame" NAME="content_frame" onLoad="newPage();">
            <p><a href="<?php echo $start_url; ?>">example</a></p>
         </IFRAME>
    </DIV>
</BODY>
</HTML>