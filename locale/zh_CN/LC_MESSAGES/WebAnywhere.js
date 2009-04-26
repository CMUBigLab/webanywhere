var wa_jstext = new Array();
wa_jstext[""]="";
wa_jstext["Location"]="地址";
wa_jstext["Go"]="浏览";
wa_jstext["Next"]="向后";
wa_jstext["Previous"]="向前";
wa_jstext["Welcome to WebAnywhere"]="欢迎访问Web Anywhere";
wa_jstext["Location field text area:"]="地址栏";
wa_jstext["Text Area "]="文本框";
wa_jstext["Welcome to Web Anywhere"]="欢迎访问Web Anywhere";
wa_jstext["Type a string to find in the current page"]="请输入待查字符串";
wa_jstext["Start of page"]="页面开始";
wa_jstext["End of page"]="页面结束";
wa_jstext["Not in a table"]="不在表格中";
wa_jstext["no "]="没有";
wa_jstext["Button: "]="按钮：";
wa_jstext["Checkbox "]="多选框";
wa_jstext["File Input "]="文件选择按钮";
wa_jstext["Image Input "]="图片按钮";
wa_jstext["Password Textarea "]="密码输入栏";
wa_jstext["Radio Button "]="单选按钮";
wa_jstext["Reset Button "]="重置按钮：";
wa_jstext["Submit Button "]="提交按钮：";
wa_jstext["link "]="链接";
wa_jstext[" button"]="按钮";
wa_jstext["Heading 1"]="1级标题";
wa_jstext["Heading 2"]="2级标题";
wa_jstext["Heading 3"]="4级标题";
wa_jstext["Heading 4"]="4级标题";
wa_jstext["Heading 5"]="5级标题";
wa_jstext["Heading 6"]="6级标题";
wa_jstext["Image "]="图片";
wa_jstext["Selection "]="选择";
wa_jstext["Table "]="表格";
wa_jstext[" start "]="开始";
wa_jstext[" rows "]="行";
wa_jstext[" columns"]="列";
wa_jstext["List with "]="列表";
wa_jstext[" items"]="项";

function gettext(text) {
  if (wa_jstext[text]) {
    return wa_jstext[text];
  } else {
    return text;
  }
}