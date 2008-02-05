<?php include('config.php'); ?>
<html>
  <head>
    <title>Browser Control Window</title>
      <script type="text/javascript">
    <!--
    top.webanywhere_url=String(document.location).replace(/^(https?:\/\/[^\/]*)\/.*$/, '$1')+'<?php echo $root_path; ?>';
    top.sound_url_base='<?php echo $sound_url_base; ?>';
    top.web_proxy_url='<?php echo $wp_path; ?>';
    if(hasConsole) console.log(top.sound_url_base + ' ' + top.web_proxy_url);
    -->
</script>
<?php
// It's about a million times easier to debug Javascript when your source files
// haven't been messed with.  Unfortunately, it's also slower and causes the
// browser to issue many more requests.
if($_REQUEST[debug]==='true') {
?>
<script src="<?php echo $script_path; ?>/wa.js"></script>
<script src="<?php echo $script_path; ?>/helper.js"></script>
<script src="<?php echo $script_path; ?>/soundmanager2.js"></script>
<script src="<?php echo $script_path; ?>/sounds.js"></script>
<script src="<?php echo $script_path; ?>/handlenodes.js"></script>
<script src="<?php echo $script_path; ?>/keyboard.js"></script>
<script src="<?php echo $script_path; ?>/base64.js"></script>
<script src="<?php echo $script_path; ?>/utils.js"></script>
<script scr="<?php echo $script_path; ?>/sound_embed.js"></script>
<?php } else { ?>
<script src="<?php echo $min_script_path; ?>/scripts.php?files=<?php echo $script_path; ?>/helper.js,<?php echo $script_path; ?>/soundmanager2.js,<?php echo $script_path; ?>/sounds.js,<?php echo $script_path; ?>/handlenodes.js,<?php echo $script_path; ?>/wa.js,<?php echo $script_path; ?>/sound_embed.js,<?php echo $script_path; ?>/base64.js,<?php echo $script_path; ?>/utils.js,<?php echo $script_path; ?>/keyboard.js"></script>
<?php } ?>

<style>
body {
  font-family: Georgia, "Times New Roman", Times, serif;
}
#input { font-size: 2em; }
#body { font-family: arial; }
</style>
</head>
<body onload="focusLocation(); prefetchLetters();" bgcolor="#CCCCFF">
<script type="text/javascript">soundManager.createMovie();</script>
<div align="center" valign="bottom" style="font-size: 1em;">
<form onSubmit="javascript:navigate(this);return false;">
<label for="location">Location</label>: <input type="text" size="50" id="location" value="http://webinsight.cs.washington.edu/wa/content.php"/>
<input name="go" type="submit" value="Go" id="location_go" onclick='navigate(this); return false;'/>
</form>
<form>
<input type="text" name="finder_field" id="finder_field" />
<label for="finder"/><input name="find_button" type="submit" value="Find Next" onclick='nextNodeContentFinder(this); return false;'/></label>
<label for="finder"/><input name="find_button" type="submit" value="Find Previous" onclick='prevNodeContentFinder(this); return false;'/></label>
</form>
</div>
<div <?php if($_REQUEST[debug] === 'true') { echo 'style="visibility: display;"'; } else { echo 'style="visibility: hidden"'; } ?>>Playing: <span id="playing_div"></span> Features: <span id="sound_div"></span></div>
<div <?php if($_REQUEST[debug] === 'true') { echo 'style="visibility: hidden;"'; } else { echo 'style="visibility: hidden"'; }?>><span id="test_div"></span></div>
<div <?php if($_REQUEST[debug] === 'true') { echo 'style="visibility: hidden;"'; } else { echo 'style="visibility: hidden"'; }?>><span id="debug_div"></span></div>
<?php
if($_REQUEST[embed]==='true') {
?>
<p id='p_embed'>
<embed src="sounds/blank.mp3" autostart=true hidden=true id="audio_embed" enablejavascript="true" onload="alert('loaded');">
</p>
<?php } ?>
<?php
//if($_REQUEST[debug]==='true') {
?>
<p>
<form name="recorder_form" method="post" action="recorder.php"><br/>
<input name="submit" type="submit" value="submit">
<textarea id="recording" name="recording" rows="30" cols="150"></textarea>
</form>
</p>
<?php
//}
?>
</body>
</html>