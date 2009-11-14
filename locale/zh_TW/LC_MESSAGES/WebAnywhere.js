var wa_text = new Array();
wa_text[""]="";
wa_text["Go"]="";
wa_text["Next"]="";
wa_text["Previous"]="";
wa_text["Type a string to find in the current page"]="";
wa_text["Start of Page."]="";
wa_text["Location field text area:"]="";
wa_text["Invalid key press"]="";
wa_text["Welcome to Web Anywhere"]="";
wa_text["Headings"]="";
wa_text["Heading"]="";
wa_text["Links"]="";
wa_text["Link"]="";
wa_text["End of Page."]="";
wa_text["End of page"]="";
wa_text["Start of page."]="";
wa_text["Not in a table."]="";
wa_text["no"]="";
wa_text["Start of page"]="";
wa_text["Welcome to WebAnywhere"]="";
wa_text["forward"]="";
wa_text["WebAnywhere has loaded."]="";
wa_text["Page has loaded."]="";
wa_text["Press t at any time for this page to speak to you."]="";
wa_text["link"]="";
wa_text["button"]="";
wa_text["Heading 1"]="";
wa_text["Heading 2"]="";
wa_text["Heading 3"]="";
wa_text["Heading 4"]="";
wa_text["Heading 5"]="";
wa_text["Heading 6"]="";
wa_text["Image"]="";
wa_text["Selection"]="";
wa_text["Table"]="";
wa_text["start"]="";
wa_text["rows"]="";
wa_text["columns"]="";
wa_text["Text Area"]="";
wa_text["List with"]="";
wa_text["items"]="";
wa_text["Select a language to switch to: <br> "]="";
wa_text["Button"]="";
wa_text["Checkbox"]="";
wa_text["File Input"]="";
wa_text["Image Input"]="";
wa_text["Password Textarea"]="";
wa_text["Radio Button"]="";
wa_text["Reset Button"]="";
wa_text["Submit Button"]="";
wa_text["Select a language to switch to"]="";

function wa_gettext(text) {
  if (wa_text[text]) {
    return wa_text[text];
  } else {
    return text;
  }
}