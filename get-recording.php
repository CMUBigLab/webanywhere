<?php
error_reporting(E_ALL);
ini_set('display_errors','On');


if(!isset($_REQUEST['url'])) {
  exit();
}

$url = $_REQUEST['url'];

$url = preg_replace("@http://@", '', $url);

$echoing = false;

echo "[";
$file_handle = fopen("wp/interactions.rc", "r");
while (!feof($file_handle)) {
  $line = fgets($file_handle);

  if(preg_match('@l\(\d+\)' . $url . '@', $line)) {
    $echoing = true;
  } else if(preg_match('/l\(\d+\)/', $line)) {
     $echoing = false;
  }

  if($echoing) {
    if(preg_match('/sf\(\d+\)(\d\.?\d?\d?),([^,]+)/', $line, $matches)) {
      echo "{weight:'" . $matches[1] . "',xpath:'" . $matches[2] . "'},";
    }  
  }
}
fclose($file_handle);
echo "{}]";
