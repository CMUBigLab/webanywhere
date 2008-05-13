<?php Header('Content-Type: application/x-javascript')?>
// The base object for all key mappings.
var KEYMAPPING = new Object();
<?php
session_start();

// Forms mode.
$formsModeToggle = isset($_SESSION['formsModeToggle']) ? $_SESSION['formsModeToggle'] : "enter";
$useFormsMode = isset($_SESSION['useFormsMode']) ? $_SESSION['useFormsMode'] : "false";

// Basic navigation keys.
$nextHeading = isset($_SESSION['nextHeading']) ? $_SESSION['nextHeading'] : "ctrl h";
$previousHeading = isset($_SESSION['prevoiusHeading']) ? $_SESSION['previousHeading'] : "ctrl shift h";

$nextInputElement =
 isset($_SESSION['nextInputElement']) ? $_SESSION['nextInputElement'] : "ctrl i";
$previousInputElement =
 isset($_SESSION['previousInputElement']) ? $_SESSION['previousInputElement'] : "ctrl shift i";

$nextFocusableElement =
 isset($_SESSION['nextFocusableElement']) ? $_SESSION['nextFocusableElement'] : "tab";
$previousFocusableElement =
 isset($_SESSION['previousFocusableElement']) ? $_SESSION['previousFocusableElement'] : "shift tab";

// Keys related to forms mode.
//KEYMAPPING.useFormsMode = false;
?>

// Forms mode.
KEYMAPPING.formsModeToggle = '<?php echo $formsModeToggle; ?>';
KEYMAPPING.useFormsMode = <?php echo $useFormsMode; ?>;

// Basic navigation.
KEYMAPPING.nextHeading = '<?php echo $nextHeading; ?>';
KEYMAPPING.previousHeading = '<?php echo $previousHeading; ?>';

KEYMAPPING.nextInputElement = '<?php echo $nextInputElement; ?>';
KEYMAPPING.previousInputElement = '<?php echo $previousInputElement; ?>';

KEYMAPPING.nextFocusableElement = '<?php echo $nextFocusableElement; ?>';
KEYMAPPING.previousFocusableElement = '<?php echo $previousFocusableElement; ?>';

