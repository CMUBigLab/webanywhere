/*
 * Javascript bridge for configuration variables set in PHP.
 * /scripts/js-config.js
 * 
 * This script sets the main configuration variables for use in WebAnywhere.
 */

<?php include('../config.php'); ?>

// Global variables used by WebAnywhere.
var hasConsole =
    (typeof console != 'undefined' && typeof console.log != 'undefined');
top.webanywhere_domain='<?php echo $webanywhere_domain; ?>';

top.webanywhere_location =
  String(document.location).replace(/^(https?:\/\/[^\/]*)\/.*$/, '$1');
top.webanywhere_url=top.webanywhere_location+'<?php echo $root_path; ?>';

top.script_home='<?php echo $root_path; ?>';

top.sound_url_base='<?php echo $sound_url_base; ?>';
top.web_proxy_url='<?php echo $wp_path; ?>';
top.cross_domain_security = '<?php echo $cross_domain_security; ?>';

if(hasConsole) console.log(top.sound_url_base + ' ' + top.web_proxy_url);