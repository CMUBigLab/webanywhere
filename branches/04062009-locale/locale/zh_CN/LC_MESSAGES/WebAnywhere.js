var wa_jstext = new Array();
wa_jstext[""]="";
wa_jstext["Location"]="地址";
wa_jstext["Go"]="浏览";
wa_jstext["Next"]="向后";
wa_jstext["Previous"]="向前";
wa_jstext["Welcome to WebAnywhere"]="欢迎访问WebAnywhere";
wa_jstext["Location field text area:"]="地址栏";
wa_jstext["Text Area "]="文本框";

function gettext(text) {
  if (wa_jstext[text]) {
    return wa_jstext[text];
  } else {
    return text;
  }
}