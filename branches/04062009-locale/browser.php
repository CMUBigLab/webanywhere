<?php
session_start();
?>
<?php include('config.php'); ?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<title>WebAnywhere Browser Frame</title>
<script type="text/javascript" src="<?php
echo $script_path;
?>/js-config.php"></script>
<?php
// It's about a million times easier to debug Javascript when your source files
// haven't been messed with.  Unfortunately, it's also slower and causes the
// browser to issue many more requests.
if($_REQUEST[embed]!=='true') { ?>
<?php
}

// Array of scripts used by the system.
// In the future, this may calculate dependencies and only include those
// scripts which are actually needed.
$scripts =
  array(
        '/vars.js',
        '/utils/md5.js',
        '/utils/utils.js',
        '/utils/base64.js',
        '/nodes.js',
        '/sound/sounds.js',
        '/startup/standalone.js',
        '/sound/prefetch.js',
        '/input/keyboard.js',
        '/input/action-queue.js',
        '/interface/interface.js',
        '/extensions/extensions.js',
        '/wa.js',
        '/startup/start.js'
        );

// Depending on the type of sound player used, include the appropriate
// set of routines for playing sounds.
if($_REQUEST[embed]==='true') {
  array_unshift($scripts, '/sound/sound_embed.js');
} else {
  array_unshift($scripts, '/sound/soundmanager2.js');
}

// Add in any system-defined extensions.
foreach($extensions as $extension_path) {
  array_push($scripts, $extension_path);
}

// Optionally include Firebug Lite.
if($_REQUEST[firebug]==='true') {
  echo '<script type="text/javascript" src="' . $script_path .
    '/utils/firebug-lite.js"></script>';
}

// Depending on whether we're in debug mode, either include
// each script separately (better for debugging), or
// combined script using the script minimizer.
if($_REQUEST[debug]==='true') {
  $start = '<script type="text/javascript" src="' . $script_path;
  $end = '"></script>';
  
  // Output script tags individually.
  echo $start . implode($end . "\n" . $start, $scripts) . $end . "\n";
} else {
  //$jsBuild = new Minify_Build($scripts);

  echo '<script type="text/javascript" src="';
  echo $min_script_path . '/scripts.php?files=';

  // Concatenate the individual scripts used into one long string.
  echo $script_path . implode(',' . $script_path, $scripts) . '"></script>';
}
?>
<?php
if(isset($_REQUEST['script'])) {?>
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

<style>
  body {font-family: Georgia, "Times New Roman", Times, serif;}
  #body {font-family: arial;}
  input {border: 1px solid #000; font-size: 1.7em; margin: 0; vertical-align: middle;}
  .inputbox {height: 34px; padding: 0;}
  .inputbutton {height: 36px; padding: 0 3px 3px 3px; font-weight: bold;}
  td { margin: 0; padding: 0; text-align: center;}
  tr { margin: 0; padding: 0;}
  table { margin: 0; padding: 0; width: 100%;}
  #wa_browser_interface {text-align: center; margin: 0; padding: 0;}
  #wa_text_display {text-align: center}
  #wa_finder_field {width: 100%;}
  #location {width: 100%;}
</style>

</head>
<?php
  // Flush what we have so far so the browser can start downloading/processing the scripts.
  // Jeff: Not entirely convinced that this helps.
  flush();
?>
<body bgcolor="#000000" style="margin: 0; padding: 0;" onload="browserOnload();">

<div id="wa_browser_interface" style="">
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

<div <?php if($_REQUEST[debug] === 'true') { echo 'style="visibility: display;"'; } else { echo 'style="visibility: hidden"'; } ?>>Playing: <span id="playing_div"></span> Features: <span id="sound_div"></span></div>
<div <?php if($_REQUEST[debug] === 'true') { echo 'style="visibility: hidden;"'; } else { echo 'style="visibility: hidden"'; }?>>
<span id="test_div"></span>
</div>
<div <?php if($_REQUEST[debug] === 'true') { echo 'style="visibility: hidden;"'; } else { echo 'style="visibility: hidden"'; }?>><span id="debug_div"></span></div>
<?php if($_REQUEST[debug]==='true') { ?>
<p>
<form name="recorder_form" method="post" action="recorder.php"><br/>
<input name="submit" type="submit" value="submit">
<textarea id="recording" name="recording" rows="30" cols="150"></textarea>
</form>
</p>
<?php } ?>
</body>
</html>