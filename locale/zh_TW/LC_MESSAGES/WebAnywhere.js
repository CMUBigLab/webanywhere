var wa_jstext = new Array();
wa_jstext[""]="";
wa_jstext["Location"]="地址";
wa_jstext["Go"]="瀏覽";
wa_jstext["Next"]="向后";
wa_jstext["Previous"]="向前";
wa_jstext["Welcome to WebAnywhere"]="歡迎訪問Web Anywhere";
wa_jstext["Location field text area:"]="地址欄";
wa_jstext["Text Area "]="文本框";
wa_jstext["Welcome to Web Anywhere"]="歡迎訪問Web Anywhere";
wa_jstext["Type a string to find in the current page"]="請輸入待查字符串";
wa_jstext["Start of page"]="頁面開始";
wa_jstext["End of page"]="頁面結束";
wa_jstext["Not in a table"]="不在表格中";
wa_jstext["no "]="沒有";
wa_jstext["Button: "]="按鈕：";
wa_jstext["Checkbox "]="多選框";
wa_jstext["File Input "]="文件選擇按鈕";
wa_jstext["Image Input "]="圖片按鈕";
wa_jstext["Password Textarea "]="密碼輸入欄";
wa_jstext["Radio Button "]="單選按鈕";
wa_jstext["Reset Button "]="重置按鈕：";
wa_jstext["Submit Button "]="提交按鈕：";
wa_jstext["link "]="鏈接";
wa_jstext[" button"]="按鈕";
wa_jstext["Heading 1"]="1級標題";
wa_jstext["Heading 2"]="2級標題";
wa_jstext["Heading 3"]="4級標題";
wa_jstext["Heading 4"]="4級標題";
wa_jstext["Heading 5"]="5級標題";
wa_jstext["Heading 6"]="6級標題";
wa_jstext["Image "]="圖片";
wa_jstext["Selection "]="選擇";
wa_jstext["Table "]="表格";
wa_jstext[" start "]="開始";
wa_jstext[" rows "]="行";
wa_jstext[" columns"]="列";
wa_jstext["List with "]="列表";
wa_jstext[" items"]="項";

function gettext(text) {
  if (wa_jstext[text]) {
    return wa_jstext[text];
  } else {
    return text;
  }
}