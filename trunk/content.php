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
The system is initialized and is ready to use.  <a href="http://webinsight.cs.washington.edu/projects/webanywhere/">WebAnywhere</a> works much like screen readers that you may have used before, such as JAWS or Window-Eyes.  The keyboard commands that are currently available are as follows:<br>
</p>

<?php if($_REQUEST[debug]==='true') { ?>
<input type="hidden" name="dumb"/>
<?php } ?>

<ul>
<li><b>CTRL-L</b> - move the cursor to the location box where you can type a URL to visit.</li>
<li><b>Page Down</b> - read from the current position.</li>
<li><b>Arrow Down</b> - read the next element on the page.</li>
<li><b>Arrow Up</b> - read the previous element on the page.</li>
<li><b>Arrow Left</b> - read the previous character.</li>
<li><b>Arrow Right</b> - read the next character.</li>
<li><b>CTRL-H</b> - skip to the next heading.</li>
<li><b>CTRL-I</b> - skip to the next input element.</li>
</ul>

<p>
Please send comments using our <a href="content/feedback.html">feedback form</a>.
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
