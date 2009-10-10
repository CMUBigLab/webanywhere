var wa_text = new Array();
wa_text[""]="";
wa_text["Go"]="";
wa_text["Next"]="";
wa_text["Previous"]="";

function wa_gettext(text) {
  if (wa_text[text]) {
    return wa_text[text];
  } else {
    return text;
  }
}