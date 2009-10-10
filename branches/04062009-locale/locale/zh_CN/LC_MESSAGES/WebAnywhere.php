<?php $wa_text = array();
$wa_text[""]="";
$wa_text["Go"]="浏览";
$wa_text["Next"]="前进";
$wa_text["Previous"]="后退";

function wa_gettext($text) {
    global $wa_text;
    return $wa_text[$text];
}
?>