# Overview of Extensions #
WebAnywhere has three types of extensions:
  * Node Spotlighters
  * Preprocessors
  * Once Per Document

# API #

# Extension development checklist #
  1. Javascript file is in the Extensions directory.
  1. Last line in Javascript adds the extension to the appropriate extension array. e.g., `WA.Extensions.nodePreprocessors.push(new WA.Extensions.IFrameNodePreprocessor());`
  1. Add the extension to the extensions array in config.php. e.g., ` ,'/extensions/iframe-node-preprocessor.js' `

# Example #