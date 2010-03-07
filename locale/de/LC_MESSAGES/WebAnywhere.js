var wa_text = new Array();
wa_text[""]="";
wa_text["Go"]="Grasen";
wa_text["Next"]="Zurück";
wa_text["Previous"]="Vor";
wa_text["Welcome to WebAnywhere"]="Willkommen zu Webüberall";
wa_text["Invalid key press"]="Ungültige Taste";
wa_text["Welcome to Web Anywhere"]="Willkommen zu Webüberall";
wa_text["End of page"]="Ende der Seite";
wa_text["Page has loaded."]="Seite wurde geladen.";
wa_text["WebAnywhere has loaded."]="Webüberall wurde geladen.";
wa_text["Headings"]="Überschriften";
wa_text["Heading"]="Überschrift";
wa_text["Links"]="Links";
wa_text["Link"]="Link";
wa_text["Type a string to find in the current page"]="Geben Sie eine Zeichenfolge in dieser Seite zu finden";
wa_text["Start of page"]="Beginn der Seite";
wa_text["Not in a table."]="Nicht in einer Tabelle";
wa_text["no"]="nein";
wa_text["Location field text area:"]="Textbereich des Standorts";
wa_text["Select a language to switch to"]="Wählen Sie eine Sprache, um zu wechseln";
wa_text["Button"]="Schaltfläche";
wa_text["Checkbox"]="Kontrollkästchen";
wa_text["File Input"]="Datei Input";
wa_text["Image Input"]="Bild Input";
wa_text["Password Textarea"]="Passwort Textbereich";
wa_text["Radio Button"]="Radio Button";
wa_text["Reset Button"]="Reset Button";
wa_text["Submit Button"]="Submit Button";
wa_text["Text Area"]="Textbereich";
wa_text["link"]="Link";
wa_text["button"]="Schaltfläche";
wa_text["Heading 1"]="Überschrift 1";
wa_text["Heading 2"]="Überschrift 2";
wa_text["Heading 3"]="Überschrift 3";
wa_text["Heading 4"]="Überschrift 4";
wa_text["Heading 5"]="Überschrift 5";
wa_text["Heading 6"]="Überschrift 6";
wa_text["Image"]="Bild";
wa_text["Selection"]="Auswahl";
wa_text["Table"]="Tabelle";
wa_text["start"]="Beginn";
wa_text["rows"]="Reihen";
wa_text["columns"]="Spalten";
wa_text["List with"]="Liste mit";
wa_text["items"]="Elemente";

function wa_gettext(text) {
  if (wa_text[text]) {
    return wa_text[text];
  } else {
    return text;
  }
}