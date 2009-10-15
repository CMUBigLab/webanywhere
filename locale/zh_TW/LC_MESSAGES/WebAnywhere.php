<?php $wa_text = array();
$wa_text[""]="";
$wa_text["Go"]="";
$wa_text["Next"]="";
$wa_text["Previous"]="";
$wa_text["Type a string to find in the current page"]="";
$wa_text["Start of Page."]="";
$wa_text["Location field text area:"]="";
$wa_text["Invalid key press"]="";
$wa_text["Welcome to Web Anywhere"]="";
$wa_text["Headings"]="";
$wa_text["Heading"]="";
$wa_text["Links"]="";
$wa_text["Link"]="";
$wa_text["End of Page."]="";
$wa_text["End of page"]="";
$wa_text["Start of page."]="";
$wa_text["Not in a table."]="";
$wa_text["no"]="";
$wa_text["Start of page"]="";
$wa_text["Welcome to WebAnywhere"]="";

function wa_gettext($text) {
    global $wa_text;
    return $wa_text[$text];
}
?>