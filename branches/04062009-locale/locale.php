<?php
// load locale from GET
$locale = $_REQUEST['locale'];
if (empty($locale)) {
  if (isset($_COOKIE['userlocale'])) {
    // load locale from cookie
    $locale = $_COOKIE['userlocale'];
  } else {
    // load locale from default defined in config.php
    $locale = $default_locale;
  }
} else {
  // save new locale to cookie
  echo "<meta http-equiv='Set-Cookie' content='userlocale=$locale;expires=Friday, 31-Dec-2099 23:59:59 GMT;'>";    
}

if (preg_match('/(.*)[.]UTF(-*)8$/i', $locale, $matchs)) {
  $locale = $matchs[1];
}

$result = setlocale(LC_ALL, $locale,
	$locale . '.utf8',
	$locale . '.UTF8',
	$locale . '.utf-8',
	$locale . '.UTF-8');
#`echo "setlocale($locale)" >> /tmp/wa.log`;
#`echo "locale: $result" >> /tmp/wa.log`;
bindtextdomain('WebAnywhere', 'locale');
bind_textdomain_codeset('WebAnywhere', 'UTF-8');
textdomain('WebAnywhere');

// set Javascript locale
$js_locale_file = "locale/$locale/LC_MESSAGES/WebAnywhere.js";
if (file_exists($js_locale_file)) {
  echo "<script type='text/javascript' src='$js_locale_file'></script>";
} else {
  echo "<script type='text/javascript'>function gettext(text) { return text; }</script>";
}
?>
