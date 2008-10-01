<?php
Header('Content-Type: application/x-javascript');
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

?>
// The base object for all key mappings.
WA.Keyboard.Keymapping = {
  // Forms mode.
  formsModeToggle: '<?php echo $formsModeToggle; ?>',
  useFormsMode: <?php echo $useFormsMode; ?>,
	
  // Basic navigation.
  nextHeading: '<?php echo $nextHeading; ?>',
  previousHeading: '<?php echo $previousHeading; ?>',
	
  nextInputElement: '<?php echo $nextInputElement; ?>',
  previousInputElement: '<?php echo $previousInputElement; ?>',
	
  nextFocusableElement: '<?php echo $nextFocusableElement; ?>',
  previousFocusableElement: '<?php echo $previousFocusableElement; ?>'
}