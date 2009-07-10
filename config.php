<?php
	// This file contains the configurable paths and options
	// made available by WebAnywhere.
	// The default configuration assumes installation on your local machine:
	// http://localhost/wa/
	//
	// Appropriate changes can be made to localize to your preference.

	// Email to which errors can be sent.
	$admin_email = 'admin@yourdomain.org';

	// The domain where WebAnywhere is located.
	// Among other things, this enables the system to check if content has been
	// loaded in its frame that the system cannot read due to cross-site
	// scripting concerns.
	$webanywhere_domain = 'localhost';

	// The relative path to WebAnywhere on the web server.
	$root_path = '/wa';

	// The path to the script minimizer code.
	$min_script_path = $root_path . '/min';

	// The path to the scripts directory.
	$script_path = $root_path . '/scripts';

	// The path to the web proxy.
	// $url$ will be replaced with the URL Escaped URL to fetch.
	$wp_path = $root_path . '/wp/wawp.php?q=$url$';

	// The URL from which sounds should be retrieved.
	// $text$ will be replaced with the URL Escaped text to fetch.
	// Currently it is not straightforward to run your own speech server,
	// but you can use the WebAnywhere server for this purpose.
	$sound_url_base = 'http://webanywhere.cs.washington.edu/cgi-bin/getsound.pl?text=$text$&cache=1&mtts=1';
    //$sound_url_base = 'http://127.0.0.1:8000/$text$';


    // The URL that will load in WebAnywhere by default.
    $default_content_url = "http://" . $webanywhere_domain . $root_path . '/content.php';

	// To prevent malicious users from abusing the web proxy that is part of WebAnywhere,
	// the system can optionally limit the rate at which users can request content.
	$limit_request_rate = false;

      // Limit rates per minute and per day.
	  $limit_rate_day = 20000;
	  $limit_rate_minute = 250;

	  // Filename for SQLite database used to limit requests -
	  // should not be accessible from the web.
	  // Despite the default, a unix-style path will also work on unix systems.
	  // $sql_lite_filename = "C:/webanywhere-accesses.sdb";
	  $sql_lite_filename = "/wa/webanywhere-accesses.sdb";

    // Temporary directory where the cache of minimized scripts is stored.
    // Defaults to the default temporary directory on your system, which may
    // or may not work for you.
    $min_temp_dir = sys_get_temp_dir();

	// Sets whether subdomain-based separation of Javascript scripts should
	// be implemented.  Enabling this can cause the system to run more slowly
	// because WebAnywhere, including the SoundManger2 Flash movie, needs to be
	// reloaded when navigating to a new domain.
	// This should be enabled if using a fast connection or when untrusted sites
	// may be visited.
	$cross_domain_security = false;

    // Extensions files.
    // Comment individual extensions out to prevent their inclusion.
    $extensions = array(
      // Visually spotlights each node as it is being read.
      'extensions/visual-spotlighter.js'

      // Scrolls each node into view as it is being read.
      ,'extensions/scroll-into-view-spotlighter.js'

      // Wraps phrases in SPAN tags so they will be read and highlighted
      // in small, logical chunks.
      ,'extensions/text-chunker-node-preprocessor.js'

      // Turns off auto-complete for forms on the page.
      ,'extensions/autocomplete-off-node-preprocessor.js'

      // Adds label for properties to input elements so the correct name
      // is read.
      ,'extensions/label-for-node-preprocessor.js'

      // Adds support for in-page links.
      ,'extensions/inpage-link-preprocessor.js'

      // Adds support for tab-index.
      ,'extensions/tabindex-preprocessor.js'

      // Adds support for speaking selected text.
      ,'extensions/selection-reading-extension.js'
    );
?>