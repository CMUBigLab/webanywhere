var wa_text = new Array();
wa_text[""]="";
wa_text["Go"]="浏览";
wa_text["Next"]="前进";
wa_text["Previous"]="后退";

function wa_gettext(text) {
  if (wa_text[text]) {
    return wa_text[text];
  } else {
    return text;
  }
}