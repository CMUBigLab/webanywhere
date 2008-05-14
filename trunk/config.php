<?php
// This file contains the configurable paths and options made available by WebAnywhere.

// Email to which errors can be sent.
$admin_email = 'jbigham@cs.washington.edu';

// The domain where WebAnywhere is located.
// Among other things, this enables the system to check if content has been loaded in its frame
// that the system cannot read due to cross-site scripting concerns.
$webanywhere_domain = 'localhost';

// The base path of WebAnywhere, without the preceeding slash.
$root_base = 'wag';

// The relative path to WebAnywhere on the web server.
$root_path = '/wag';

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

// To prevent malicious users from abusing the web proxy that is part of WebAnywhere,
// the system can optionally limit the rate at which users can request content.
$limit_request_rate = false;

// Sets whether subdomain-based separation of Javascript scripts should be implemented.
// Enabling this can cause the system to run more slowly because WebAnywhere,
// including the SoundManger2 Flash movie, needs to be reloaded when navigating
// to a new domain.
// This should be enabled if using a fast connection or when untrusted sites
// may be visited.
$cross_domain_security = false;

// Database information for functionality that requires it.
// Currently, this is primarily the IP-based limiting of requests.
$db_user = '';
$db_password = '';
?>