/*
 * Javascript bridge for configuration variables set in PHP.
 * /scripts/js-config.js
 * 
 * This script sets the main configuration variables for use in WebAnywhere.
 */

<?php
session_start();
include('../config.php');
?>

// Global variables used by WebAnywhere.
var hasConsole =
    (typeof console != 'undefined' && typeof console.log != 'undefined');
top.webanywhere_domain='<?php echo $webanywhere_domain; ?>';

top.webanywhere_location =
  String(document.location).replace(/^(https?:\/\/[^\/]*)\/.*$/, '$1');
top.webanywhere_url=top.webanywhere_location+'<?php echo $root_path; ?>';

top.script_home='<?php echo $root_path; ?>';

top.web_proxy_url='<?php echo $wp_path; ?>';
top.cross_domain_security = '<?php echo $cross_domain_security; ?>';

top.sounds_path='<?php echo $sounds_path; ?>';

if(hasConsole) console.log(top.sound_url_base + ' ' + top.web_proxy_url);

top.sessionid = "<?php echo strtoupper(substr(session_id(), 0, 10)); ?>";
