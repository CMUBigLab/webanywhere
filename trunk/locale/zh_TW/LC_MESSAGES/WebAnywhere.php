<?php $wa_text = array();
$wa_text[""]="";
$wa_text["Go"]="";
$wa_text["Next"]="";
$wa_text["Previous"]="";

function wa_gettext($text) {
    global $wa_text;
    return $wa_text[$text];
}
?>