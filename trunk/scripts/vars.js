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
    Initialize: null,  // Currently in wa.js
    Keyboard: null,
    Navigation: null,  // Currently in wa.js
    Nodes: null,
    PageLoad: null,    // Currently in wa.js
    Prefetcher: null,  // Currently in sounds.js
    Utils: null,
    Sound: null,

    // Constants.
    // BrowseMode sound playback states.
    READ: 1,
    KEYBOARD: 2,
    PAUSED: 3,
    PLAY_ONE: 4,
    PLAY_ONE_BACKWARD: 5,
    PLAY_TWO_BACKWARD: 6,
    PREV_CHAR: 7,
    PREV_CHAR_BACKONE: 8,

    // Set the initial browseMode to READ.
    browseMode: this.READ,

    // Should WebAnywhere run in site-specific mode?
    // This option means that the location bar and other
    // browser-like features will not be available.
    sitespecific: false,
  
    // Should WebAnywhere spotlight (highlight) the node 
    // currently being read?
    spotlighting: false,
    
    // Prefetch strategy.
    // 0 == none, 1 == parallel dom, 2 == next node, 3 == markov
    // 0 can be slow.
    // 1 degrades ungracefully.
    // 2 should offer the best performance for now.
    // 3 is a bit unstable.
    prefetchStrategy: 1,

    // Times loaded.
    timesLoaded: 0
  };