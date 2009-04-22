<?php
$locale = $_REQUEST['locale'];
if (empty($locale)) {
  $locale = $default_locale;
}

if (preg_match('/(.*)[.]UTF-8$/', $locale, $matchs)) {
  $locale_utf8 = $locale;
  $locale = $matchs[1];
} else {
  $locale_utf8 = $locale . '.UTF-8';
}

setlocale(LC_ALL, $locale, $locale_utf8);
bindtextdomain('WebAnywhere', 'locale');
textdomain('WebAnywhere');

// set Javascript locale
$js_locale_file = "locale/$locale/LC_MESSAGES/WebAnywhere.js";
if (file_exists($js_locale_file)) {
  echo "<script type='text/javascript' src='$js_locale_file'></script>";
} else {
  echo "<script type='text/javascript'>function gettext(text) { return text; }</script>";
}
?>
