<?php $wa_text = array();
$wa_text[""]="";
$wa_text["Go"]="Grasen";
$wa_text["Next"]="Zurück";
$wa_text["Previous"]="Vor";
$wa_text["Welcome to WebAnywhere"]="Willkommen auf webanyhwere";
$wa_text["Invalid key press"]="Ungültige Taste";
$wa_text["Welcome to Web Anywhere"]="Willkommen auf Web Anyhwere";
$wa_text["End of page"]="Ende der Seite";
$wa_text["Page has loaded."]="Seite geladen wurde.";
$wa_text["WebAnywhere has loaded."]="WebAnywhere geladen wurde.";
$wa_text["Headings"]="Überschriften";
$wa_text["Heading"]="Überschrift";
$wa_text["Links"]="Links";
$wa_text["Link"]="Link";
$wa_text["Type a string to find in the current page"]="Geben Sie eine Zeichenfolge in die aktuelle Seite zu finden";
$wa_text["Start of page"]="Beginn der Seite";
$wa_text["Not in a table."]="nicht in einer Tabelle";
$wa_text["no"]="nein";
$wa_text["Location field text area:"]="Textbereich des Standorts";
$wa_text["Select a language to switch to"]="Wählen Sie eine Sprache zu wechseln";
$wa_text["Button"]="Schaltfläche";
$wa_text["Checkbox"]="Kontrollkästchen";
$wa_text["File Input"]="Input-Datei";
$wa_text["Image Input"]="Input-Bild";
$wa_text["Password Textarea"]="Textbereich Passwort";
$wa_text["Radio Button"]="Radio-Button";
$wa_text["Reset Button"]="Reset-Button";
$wa_text["Submit Button"]="Submit-Button";
$wa_text["Text Area"]="Textbereich";
$wa_text["link"]="Link";
$wa_text["button"]="Schaltfläche";
$wa_text["Heading 1"]="Überschrift erste";
$wa_text["Heading 2"]="Überschrift zweite";
$wa_text["Heading 3"]="Überschrift dritte";
$wa_text["Heading 4"]="Überschrift vierte";
$wa_text["Heading 5"]="Überschrift fünfte";
$wa_text["Heading 6"]="Überschrift sechste";
$wa_text["Image"]="Bild";
$wa_text["Selection"]="Auswahl";
$wa_text["Table"]="Tabelle";
$wa_text["start"]="Beginn";
$wa_text["rows"]="Reihen";
$wa_text["columns"]="Spalten";
$wa_text["List with"]="Liste mit";
$wa_text["items"]="Elemente";

function wa_gettext($text) {
    global $wa_text;
    return $wa_text[$text];
}
?>