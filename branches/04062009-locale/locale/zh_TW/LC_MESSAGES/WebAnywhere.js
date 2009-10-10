var wa_text = new Array();
wa_text[""]="";
wa_text["Location"]="地址";
wa_text["Go"]="瀏覽";
wa_text["Next"]="向后";
wa_text["Previous"]="向前";
wa_text["Welcome to WebAnywhere"]="歡迎訪問Web Anywhere";
wa_text["Location field text area:"]="地址欄";
wa_text["Text Area "]="文本框";
wa_text["Welcome to Web Anywhere"]="歡迎訪問Web Anywhere";
wa_text["Type a string to find in the current page"]="請輸入待查字符串";
wa_text["Start of page"]="頁面開始";
wa_text["End of page"]="頁面結束";
wa_text["Not in a table"]="不在表格中";
wa_text["no "]="沒有";
wa_text["Button: "]="按鈕：";
wa_text["Checkbox "]="多選框";
wa_text["File Input "]="文件選擇按鈕";
wa_text["Image Input "]="圖片按鈕";
wa_text["Password Textarea "]="密碼輸入欄";
wa_text["Radio Button "]="單選按鈕";
wa_text["Reset Button "]="重置按鈕：";
wa_text["Submit Button "]="提交按鈕：";
wa_text["link "]="鏈接";
wa_text[" button"]="按鈕";
wa_text["Heading 1"]="1級標題";
wa_text["Heading 2"]="2級標題";
wa_text["Heading 3"]="4級標題";
wa_text["Heading 4"]="4級標題";
wa_text["Heading 5"]="5級標題";
wa_text["Heading 6"]="6級標題";
wa_text["Image "]="圖片";
wa_text["Selection "]="選擇";
wa_text["Table "]="表格";
wa_text[" start "]="開始";
wa_text[" rows "]="行";
wa_text[" columns"]="列";
wa_text["List with "]="列表";
wa_text[" items"]="項";

function wa_gettext(text) {
  if (wa_text[text]) {
    return wa_text[text];
  } else {
    return text;
  }
}