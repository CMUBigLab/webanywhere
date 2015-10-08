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

  // uncommented following line will change locale to Simplified Chinese
  // $fixed_locale = 'zh_CN';

  // The relative path to WebAnywhere on the web server.
  $root_path = '/WebAnywhere_v1.2';
  // $root_path = '/wa';

  // The path to the script minimizer code.
  $min_script_path = $root_path . '/min';

  // The path to the scripts directory.
  $script_path = $root_path . '/scripts';

  // The path to the web proxy.
  // $url$ will be replaced with the URL Escaped URL to fetch.
  $wp_path = $root_path . '/wp/wawp.php?proxy_url=$url$&$dp$';

  // Path to the sounds folder.
  $sounds_path = $root_path . '/sounds/';

  // The URL from which sounds should be retrieved.
  // $text$ will be replaced with the URL Escaped text to fetch.
  // Currently it is not straightforward to run your own speech server,
  // but you can use the WebAnywhere server for this purpose.

  // if $sound_url_base is not set. It will be automatically set to one of following voices according to the locale.
  $voices["en"] = 'http://webanywhere.cs.washington.edu/cgi-bin/ivona/getsound.pl?text=$text$&cache=1&mtts=1'; // English
  $voices["zh_CN"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=mandarin&text=$text$'; // Simplified Chinese
  $voices["zh_TW"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=mandarin&text=$text$'; // Traditional Chinese
  $voices["de"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=de&text=$text$'; // German
  $voices["hi"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=hi&text=$text$'; // Hindi
  $voices["fr"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=fr&text=$text$'; // French
  $voices["af"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=af&text=$text$'; // Afrikanns
  $voices["bs"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=bs&text=$text$'; // Bosnian
  $voices["ca"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=ca&text=$text$'; // Catalan
  $voices["cs"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=cs&text=$text$'; // Czech
  $voices["el"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=el&text=$text$'; // Greek
  $voices["eo"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=eo&text=$text$'; // Esperanto
  $voices["es"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=es&text=$text$'; // Spanish
  $voices["fi"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=fi&text=$text$'; // Finnish
  $voices["hr"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=hr&text=$text$'; // Croatian
  $voices["hu"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=hu&text=$text$'; // Hungarian
  $voices["it"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=it&text=$text$'; // Italian
  $voices["ku"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=ku&text=$text$'; // Kurdish
  $voices["lv"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=lv&text=$text$'; // Latvian
  $voices["pt"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=pt&text=$text$'; // Portuguese (Brazil)
  $voices["pt-pt"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=pt-pt&text=$text$'; // Portuguese (European)
  $voices["ro"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=ro&text=$text$'; // Romanian
  $voices["sk"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=sk&text=$text$'; // Slovak
  $voices["sr"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=sr&text=$text$'; // Serbian
  $voices["sv"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=sv&text=$text$'; // Swedish
  $voices["sw"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=sw&text=$text$'; // Swahihi
  $voices["ta"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=ta&text=$text$'; // Tamil
  $voices["tr"] = 'http://webanywhere.cs.washington.edu/cgi-bin/espeak/getsound.pl?lang=tr&text=$text$'; // Turkish

  // The URL that will load in WebAnywhere by default.
  if($webanywhere_domain !== 'localhost') 
  {
    $default_content_url = "http://" . $webanywhere_domain . $root_path . '/content.php';
  } 
  else 
  {
    $default_content_url = "http://www.cmu.edu";
    //$default_content_url = "http://webanywhere.cs.washington.edu/beta/content.php";
  }
  // To prevent malicious users from abusing the web proxy that is part of WebAnywhere,
  // the system can optionally limit the rate at which users can request content.
  $limit_request_rate = false;

  // Limit rates per minute and per day.
  $limit_rate_day = 20000;
  $limit_rate_minute = 250;

  // Filename for SQLite database used to limit requests -
  // should not be accessible from the web.
  // Despite the default, a unix-style path will also work on unix systems.
  //$sqlite_filename = "C:/webanywhere-accesses.sdb";
  //$sqlite_filename = "/wa/webanywhere-accesses.sdb";

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

  // Will anonymized interaction histories be recorded?
  // This records only the paths taken through content and not the content itself.
  $record_interactions = false;
  $record_file = "interactions.rc";
  
  // Will visualizations of non-visual interactions be displayable?
  $webtrax = false;

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
    
    // Adds support for detecting content filters
  	//,'extensions/filter-detect.js'
  );

  // Adds support for recording user interactions.
  if($record_interactions) {
    array_push($extensions, 'extensions/recorder-extension.js');
    if($webtrax){
      array_push($extensions, 'extensions/webtrax.js');
    }
  }
?>
