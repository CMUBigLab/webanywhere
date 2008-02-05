<?php
if($_REQUEST[submit] === "submit") {
  $fp = fopen("recordings_results.txt", "a+");
  fwrite($fp, "\n\n------------------------".date("g:i:s A")."-----------------------\n");    
  foreach($_REQUEST as $key => $value)
    fwrite($fp, $key . " => " . $value . "\n");
  fclose($fp);
}

?>

<html>
<head>
<?php
if($_REQUEST[submit]) { ?>
<title>Web Anywhere Survey</title>
<?php } else {?>
<title>Web Anywhere Survey</title>
<?php } ?>
<style>
li { margin: 0.7em; }
</style>
</head>
<body>

<?php if($_REQUEST[age] && $_REQUEST[submit]) { ?>
<h1>Thanks for Submitting!</h1>
<?php } else { ?>
<h1>Web Anywhere Survey</h1>

<form action="" method="post">

<ol>
<li>
<label for="q1">The program is difficult to use.</label><br>
<select id="q1" name="q1">
<option value="no response">(no response)</option>
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>

<li>
<label for="q2">The program is tedious to use.</label><br>
<select id="q2" name="q2">
<option value="no response">(no response)</option>
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>

<li>
<label for="q3">I could use this screen reader to access the web.</label><br/>
<select id="q3" name="q3">
<option value="no response">(no response)</option
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>

<li>
<label for="q4">I could access the web from more locations using this program.</label><br>
<select id="q4" name="q4">
<option value="no response">(no response)</option>
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>

<li>
<label for="q5">I would use this program to access the web from computers without another screen reader installed.</label><br>
<select id="q5" name="q5">
<option value="no response">(no response)</option>
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>

<li>
<label for="q6">
Technologies that enable mobile access are expensive.
</label><br>
<select id="q6" name="q6">
<option value="no response">(no response)</option>
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>


<li>
<label for="q7">
Other tools provide access to the web in as many locations as this tool.
</label><br>
<select id="q7" name="q7">
<option value="no response">(no response)</option>
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>

<li>
<label for="q8">
I often find myself in locations where a computer is available but it does not have a screen reader installed on it.
</label><br>
<select id="q8" name="q7">
<option value="no response">(no response)</option>
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>


<li>
<label for="q9">
I would use this tool if no other screen reader was available. 
</label><br>
<select id="q9" name="q7">
<option value="no response">(no response)</option>
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>


<li>
<label for="q10">
This program could be useful for someone who cannot afford a traditional screen reader. 
</label><br>
<select id="q10" name="q7">
<option value="no response">(no response)</option>
<option value="5 Strongly Agree">5 Strongly Agree</option>
<option value="4">4</option>
<option value="3">3</option>
<option value="2">2</option>
<option value="1 Strongly Disagree">1 Strongly Disagree</option>
</select>
</li>

<li>
<label for="comments">Other Comments</label><br>
<textarea id="comments" name="comments" rows="10" cols="55"></textarea>
</li>
</ol>

<input name="submit" type="submit" value="Submit Responses">
<?php } ?>
</body>
</html>