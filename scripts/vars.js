/*
 * vars.js
 * 
 * Contains global namespace declarations, including configuration directives.
 * 
 * Should be included before other WebAnywhere components.
 *
 */
 
  var WA = {
    // References to the other major components used in the system.
    // These are instantiated in files of the same name.
    Base64: null,
    Initialize: null,  // Currently in wa.js
    Keyboard: null,
    Navigation: null,  // Currently in wa.js
    Nodes: null,
    PageLoad: null,    // Currently in wa.js
    Prefetcher: null,  // Currently in sounds.js
    Utils: null,
    Sounds: null,

    // Should WebAnywhere run in site-specific mode?
    // This option means that the location bar and other
    // browser-like features will not be available.
    sitespecific: false,
  
    // Should WebAnywhere spotlight (highlight) the node 
    // currently being read?
    spotlighting: false
  };