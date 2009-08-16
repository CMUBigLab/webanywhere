<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/1999/REC-html401-19991224/loose.dtd">
<html>
<head>
<title>Welcome to WebAnywhere</title>
<style>
.hidden {position: absolute; top: -1000px;}
body {font-family: Georgia, "Times New Roman", Times, serif;}
h1 { text-align: center; width: 400px; height: 142px; background-image: url(images/wa-logo.png); }
.wa-outer-container { width: 50%; min-width: 400px; margin: 0 auto; padding: 0;}
.wa-heading-container {margin: 0 auto 2em auto; padding: 0;}
.wa-content-container {margin: 0; padding-left: 70px;}
li {margin: 0; padding: 0.1em;}
</style>
</head>
<body bgcolor="#FFFFFF">
<?php
if(!isset($_REQUEST['submit'])) {
?>
<?php if($_REQUEST[debug]==='true') { ?>
<a href="">One</a><a href="">Two</a><a href="">Three</a>
<?php } ?>

<div class="wa-outer-container">

<div class="wa-heading-container">
<h1><span class="hidden">WebAnywhere</a></h1>
</div>

<div class="wa-content-container">
<div>
<p>
WebAnywhere has been initialized and is now ready to use.
Press the 'forward slash' key at any time to hear a list of available shortcut keys.
</p>
<p>
<span><a href="http://webinsight.cs.washington.edu/projects/webanywhere/">WebAnywhere</a> is a non-visual interface to the web that requires no new software to be downloaded or installed.</span><span>It works right in the browser, which means you can access it from any computer, even locked-down public computer terminals.</span><span>WebAnywhere enables you to interact with the web in a similar way to how you may have used other screen readers before.</span>
</p>

<p>
For quick access to WebAnywhere type
<b>wa.cs.washington.edu</b>
into your browser.
</p>

<p>
<span>WebAnywhere works best with the Firefox web browser using a recent version of Adobe Flash.</span><span>We're working quickly to fix bugs and add features, so you should expect rapid development in the coming weeks and months.</span><span>Because WebAnywhere is released right on the web, you'll always have the latest version when you visit this site.</span>
</p>
</div>

<h2>Using WebAnywhere</h2>
<div class="dotbox">
<p>
You can interact with WebAnywhere using the keyboard.  A selection of keyboard commands that are currently supported is listed below, and can be accessed at any time by pressing '<span class='hidden'>forward </span>/'.
Pressing SHIFT in combination with them reverses the direction of the search, searching backward from the current cursor position instead of forward from it.<br>
</p>

<?php if($_REQUEST[debug]==='true') { ?>
<input type="hidden" name="dumb"/>
<?php } ?>
<ul>
<li><b>CTRL-L</b> - move the cursor to the location box where you can type a URL to visit.</li>
<li><b>Arrow Down</b> - read the next element on the page.</li>
<li><b>Arrow Up</b> - read the previous element on the page.</li>
<li><b>TAB</b> - skip to the next link or form control.</li>
<li><b>CTRL</b> - silence WebAnywhere and pause the system.</li>
<li><b>CTRL-H</b> - skip to the next heading.</li>
<li><b>CTRL-I</b> - skip to the next input element.</li>
<li><b>CTRL-R</b> - skip to the next row by cell when in a table.</li>
<li><b>CTRL-D</b> - skip to the next column by cell when in a table.</li>
<li><b>Page Down</b> - read continuously from the current position.</li>
<li><b>Home</b> - read continuously, starting over from the beginning of the page.</li>
<li><b>CTRL+Arrow Down</b> - when a selection box is focused, read the next option.</li>
<li><b>CTRL+Arrow Up</b> - when a selection box is focused, read the previous option.</li>
</ul>
</div>

<h2>WebAnywhere in Action</h2>
<div class="dotbox">
<p>
We've recorded a short video with audio narration to introduce you to the system.
<br/>
<input type="button" id="webanywhere-audio-description" value="Play Audio Description">
</p>
<p>
<object width="425" height="350">
<param name="movie" value="http://www.youtube.com/v/wfjD06aOxts"></param>
<script type="text/javascript">
document.write('<embed sr'+'c="http://www.youtube.com/v/wfjD06aOxts" type="application/x-shockwave-flash" width="425" height="350"></embed>');
</script>
</object>
</p>
</div>

</div>

<?php if($_REQUEST[debug]==='true') { ?>
<!--
<h2>Login</h2>
<p>
<form method="post">
<table>
<tr>
<td><label>Username:</label></td><td><input type="text" name="username"></td>
</tr><tr>
<td><label>Password:</label></td><td><input type="password" name="password"></td>
</tr>
</table>
<input name="submit" type="submit" value="Login"></input>
</form>
</p>
-->

<div>
<form>
<input type="text" name="password"><br/>
<input type="password" name="password"><br/>
<select name="state" id="dumb">
<option>Washington</option>
<option>Oregon</option>
</select>
</form>
</div>
<?php } ?>
<?php } else { ?>
<h1>Invalid Login</h1>
<p>
The login name/password that you entered is not valid.  If you should have access to WebAnywhere, please email <a href="mailto:jbigham@cs.washington.edu">jbigham@cs.washington.edu</a> to reset your credentials.
</p>
<?php } ?>
</body>
</html>