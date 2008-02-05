<?php
// This file contains the configurable paths and options made available by WebAnywhere.

// The domain where WebAnywhere is located.
// Among other things, this enables the system to check if content has been loaded in its frame
// that the system cannot read due to cross-site scripting concerns.
$domain = 'localhost';

// The base path of WebAnywhere, without the preceeding slash.
$root_base = 'wa';

// The relative path to WebAnywhere on the web server.
$root_path = '/wa';

// The path to the script minimizer code.
$min_script_path = $root_path . '/min';

// The path to the scripts directory.
$script_path = $root_base . '/scripts';

// The path to the web proxy.
// $url$ will be replaced with the URL Escaped URL to fetch.
$wp_path = $root_path . '/wp/wawp.php?q=$url$';

// The URL from which sounds should be retrieved.
// $text$ will be replaced with the URL Escaped text to fetch.
$sound_url_base = 'http://webinsight.cs.washington.edu/cgi-bin/getsound.pl?text=$text$';

// Sound file that gets played when waiting for something - page to load, etc.
$wait_sound = '/wa/sounds/blinker.mp3';
?>