<?php
// This file contains the configurable paths and options made available by WebAnywhere.

// Email to which errors can be sent.
$admin_email = 'admin@yourdoamin.org';

// The domain where WebAnywhere is located.
// Among other things, this enables the system to check if content has been loaded in its frame
// that the system cannot read due to cross-site scripting concerns.
$webanywhere_domain = 'webanywhere.cs.washington.edu';

// The base path of WebAnywhere, without the preceeding slash.
$root_base = 'wa';

// The relative path to WebAnywhere on the web server.
$root_path = '/wa';

// The path to the script minimizer code.
$min_script_path = $root_path . '/min';

// The path to the scripts directory.
$script_path = $root_base . '/scripts';

// Web Proxy Directory.
$wp_dir = '/wp';

// The path to the web proxy.
// $url$ will be replaced with the URL Escaped URL to fetch.
$wp_path = $root_path . $wp_dir . '/wawp.php?q=$url$';

// The URL from which sounds should be retrieved.
// $text$ will be replaced with the URL Escaped text to fetch.
$sound_url_base = 'http://webanywhere.cs.washington.edu/cgi-bin/getsound.pl?text=$text$&cache=1&mtts=1';

// Sound file that gets played when waiting for something - page to load, etc.
$wait_sound = '/wa/sounds/blinker.mp3';

// Filename to use as SQLite database.
$sql_lite_filename = "C:/webanywhere-accesses.sdb";

// To prevent malicious users from abusing the web proxy that is part of WebAnywhere,
// the system can optionally limit the rate at which users can request content.
$limit_request_rate = true;

// Limit rates per minute and per day.
$limit_rate_day = 20000;
$limit_rate_minute = 250;

// Sets whether subdomain-based separation of Javascript scripts should be implemented.
// Enabling this can cause the system to run more slowly because WebAnywhere,
// including the SoundManger2 Flash movie, needs to be reloaded when navigating
// to a new domain.
// This should be enabled if using a fast connection or when untrusted sites
// may be visited.
$cross_domain_security = false;
?>
