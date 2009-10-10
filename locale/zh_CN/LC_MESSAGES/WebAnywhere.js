var wa_text = new Array();
wa_text[""]="";
wa_text["Location"]="地址";
wa_text["Go"]="浏览";
wa_text["Next"]="向后";
wa_text["Previous"]="向前";
wa_text["Welcome to WebAnywhere"]="欢迎访问Web Anywhere";
wa_text["Location field text area:"]="地址栏";
wa_text["Text Area "]="文本框";
wa_text["Welcome to Web Anywhere"]="欢迎访问Web Anywhere";
wa_text["Type a string to find in the current page"]="请输入待查字符串";
wa_text["Start of page"]="页面开始";
wa_text["End of page"]="页面结束";
wa_text["Not in a table"]="不在表格中";
wa_text["no "]="没有";
wa_text["Button: "]="按钮：";
wa_text["Checkbox "]="多选框";
wa_text["File Input "]="文件选择按钮";
wa_text["Image Input "]="图片按钮";
wa_text["Password Textarea "]="密码输入栏";
wa_text["Radio Button "]="单选按钮";
wa_text["Reset Button "]="重置按钮：";
wa_text["Submit Button "]="提交按钮：";
wa_text["link "]="链接";
wa_text[" button"]="按钮";
wa_text["Heading 1"]="1级标题";
wa_text["Heading 2"]="2级标题";
wa_text["Heading 3"]="4级标题";
wa_text["Heading 4"]="4级标题";
wa_text["Heading 5"]="5级标题";
wa_text["Heading 6"]="6级标题";
wa_text["Image "]="图片";
wa_text["Selection "]="选择";
wa_text["Table "]="表格";
wa_text[" start "]="开始";
wa_text[" rows "]="行";
wa_text[" columns"]="列";
wa_text["List with "]="列表";
wa_text[" items"]="项";

function wa_gettext(text) {
  if (wa_text[text]) {
    return wa_text[text];
  } else {
    return text;
  }
}