<?php
// load locale from GET
if (empty($fixed_locale)) {
  if (! array_key_exists('locale', $_REQUEST)) {
    if (array_key_exists('userlocale', $_COOKIE)) {
      // load locale from cookie
      $locale = $_COOKIE['userlocale'];
    } else {
      // load locale according to HTTP_ACCEPT_LANGUAGE
      preg_match('/^([a-z]+)-*([a-z]*)/i', $_SERVER['HTTP_ACCEPT_LANGUAGE'], $matches);
      $locale = $matches[1];
      $locale1 = $locale;
      if (! empty($matches[2])) {
        $locale2 = strtoupper($matches[2]);
        $locale .= '_' . $locale2;
      }
    }
  } else {
    $locale = $_REQUEST['locale'];
    // save new locale to cookie
    echo "<meta http-equiv='Set-Cookie' content='userlocale=$locale;expires=Friday, 31-Dec-2099 23:59:59 GMT;'>";    
  }
} else {
  $locale = $fixed_locale;
}

`echo "$locale, $locale1" >> /tmp/wa.log`;
if (empty($locale1)) {
  $locale1 = substr($locale, 0, 2);
}

// set PHP locale
if (file_exists("locale/$locale/LC_MESSAGES/WebAnywhere.php")) {
  include("locale/$locale/LC_MESSAGES/WebAnywhere.php");
} else if (file_exists("locale/$locale1/LC_MESSAGES/WebAnywhere.php")) {
  include("locale/$locale1/LC_MESSAGES/WebAnywhere.php");
} else {
  function wa_gettext($text) {
      return $text;
  }
}

// set Javascript locale
if (file_exists("locale/$locale/LC_MESSAGES/WebAnywhere.js")) {
  echo "<script type='text/javascript' src='locale/$locale/LC_MESSAGES/WebAnywhere.js'></script>";
} else if (file_exists("locale/$locale1/LC_MESSAGES/WebAnywhere.js")) {
  echo "<script type='text/javascript' src='locale/$locale1/LC_MESSAGES/WebAnywhere.js'></script>";
} else {
  echo "<script type='text/javascript'>function wa_gettext(text) { return text; }</script>";
}

// set voice
if (empty($sound_url_base)) {
  if (array_key_exists('voice', $_REQUEST) &&
      array_key_exists($_REQUEST['voice'], $voices)) {
    $sound_url_base = $voices[$_REQUEST['voice']];
  } else if (array_key_exists($locale, $voices)) {
    $sound_url_base = $voices[$locale];
  } else {
    $sound_url_base = $voices["en"];
  }
}

// set home page
`echo "$locale, $locale1" >> /tmp/wa.log`;
if (empty($default_content_url)) {
  if (array_key_exists($locale, $home_pages)) {
    $default_content_url = $home_pages[$locale];
  } else if (array_key_exists($locale1, $home_pages)) {
    $default_content_url = $home_pages[$locale1];
  } else if (array_key_exists('en', $home_pages)) {
    $default_content_url = $home_pages['en'];
  } else {
    $default_content_url = '';
  }
}

echo "<script type='text/javascript'>top.sound_url_base='$sound_url_base';</script>";
?>
