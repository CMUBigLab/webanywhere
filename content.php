<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/1999/REC-html401-19991224/loose.dtd">
<html>
<head>
<title>Welcome to WebAnywhere</title>
<style>
body {
  font-family: Georgia, "Times New Roman", Times, serif;
}
</style>
</head>
<body bgcolor="#FFFFFF">
<?php
if(!isset($_REQUEST['submit'])) {
?>
<?php if($_REQUEST[debug]==='true') { ?>
<a href="">One</a><a href="">Two</a><a href="">Three</a>
<?php } ?>

<div style="width: 50%; margin: auto;">

<h1>WebAnywhere</h1>

<p>
The system is initialized and is ready to use.
</p>
<h2>Introduction</h2>
<p>
<a href="http://webinsight.cs.washington.edu/projects/webanywhere/">WebAnywhere</a>
works much like screen readers that you may have used before, such as JAWS or Window-Eyes.
WebAnywhere has been developed targeting the Firefox web browser with Adobe Flash installed -
the system will also work with other browsers (Internet Explorer, Safari, etc.) and
with embedded sound players (Quicktime, Windows Media Player, etc.) but
the system's response may be less predictable.
A main focus of continued development is full support of these other browsers and sound players.
If you'd like to help with development, please see our <a href="http;//webanywhere.googlecode.com">Google Code Project Page</a>.
</p>

<h2>Keyboard Commands</h2>
<p>
A selection of keyboard commands that are currently supported is listed below.
Pressing SHIFT in combination with them, searches backward from the current cursor position.<br>
</p>

<?php if($_REQUEST[debug]==='true') { ?>
<input type="hidden" name="dumb"/>
<?php } ?>
<ul>
<li><b>CTRL-L</b> - move the cursor to the location box where you can type a URL to visit.</li>
<li><b>Arrow Down</b> - read the next element on the page.</li>
<li><b>Arrow Up</b> - read the previous element on the page.</li>
<li><b>CTRL-H</b> - skip to the next heading.</li>
<li><b>CTRL-I</b> - skip to the next input element.</li>
<li><b>CTRL-R</b> - skip to the next row by cell when in a table.</li>
<li><b>CTRL-D</b> - skip to the next column by cell when in a table.</li>
<li><b>Page Down</b> - read continuously from the current position.</li>
<li><b>Home</b> - read continuously, starting over from the beginning of the page.</li>
</ul>

<h2>News</h2>
<p>
We are quickly adding new features that will improve the usefulness of WebAnywhere and make it suitable for everyday use by anyone.
Please check back over the coming weeks and months for exciting improvements.
</p>
</div>

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
<?php if($_REQUEST[debug]==='true') { ?>
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
   That login name/password that you entered is not valid.  If you should have access to WebAnywhere, please email <a href="mailto:jbigham@cs.washington.edu">jbigham@cs.washington.edu</a> to reset your credentials.
</p>
<?php } ?>
</body>
</html>
