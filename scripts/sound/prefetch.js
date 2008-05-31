/*
 * /sound/prefetch.js
 *
 * Contains functions used for prefetching speech sounds.
 *
 */

WA.Sound.Prefetch = {
  Sound: WA.Sound,

  qLock: false,
  domQ: new Array(),
  N: 0,

  // Initial priority values.
  startPriority: 30000,
  basePriority: this.startPriority,

  // Initialize the prefetcher components.
  initPrefetch: function() {
    this.startPriority = 30000;
    this.basePriority = this.startPriority;

    this.setPrefetchType();
    this.prefetch_array[0] = new Array();
  },

  // Sets the type of prefetching to be performed based on the URL.
  setPrefetchType: function() {
    var top_location = top.location + '';
  
    if(/prefetch=\d+/.test(top_location)) {
      top_location = top_location.replace(/^.*prefetch=(\d+).*$/, "$1");
      WA.prefetchStrategy = parseInt(top_location);
    }
  },

  // A queueu element that can be prefetched.
  domQueue: function(text, url, playdone, bm, val) {
    this.text = text;
    this.sid = WA.Sound.getSoundID(text);
    this.val = val;
    this.url = url;
    this.playdone = playdone;
    this.bm = bm;
    this.alertMe = function() {alert(text + ' ' + url + ' ' + playdone + ' ' + bm + ' ' + val)};
  },

  // Add the specified string and accompanying url to the prefetch queue.
  // TODO:  This appears not to bed used.
  addToPrefetchDOMQ: function(string, url, playdone, bm) {
    var p = new this.domQueue(string, url, playdone, bm, this.basePriority);
    this.basePriority++;
    this.pushQ(p);
  },
  
  // Do upHeap operation on the queue.
  upHeap: function(child) {
    var newElt = this.domQ[child];
    var parenti = Math.floor(child/2);
    while(parenti >= 1) {
      if(this.domQ[parenti].val < newElt.val) {
        this.domQ[child] = this.domQ[parenti]; // move parent down
        child  = parenti;
        parenti = Math.floor(child/2);
      } else break;
    }
    this.domQ[child] = newElt;
  },

  // Adds an element to the priority queue.
  pushQ: function(elem) {
    qLock = true;
    this.N++;
    this.domQ[this.N] = elem;
    this.upHeap(this.N);
    qLock = false;
  },

  // Do downHeap operation on the queue.
  downHeap: function(parent) {
    var newElt = this.domQ[parent];
    var child = 2*parent;
    while(child <= this.N) {
      if(child < this.N)
        if(this.domQ[child+1].val > this.domQ[child].val)
    child++;
      if(newElt.val < this.domQ[child].val) {
        this.domQ[parent] = this.domQ[child];
        parent = child;
        child = 2*parent;
      } else break;
    }
    this.domQ[parent] = newElt;
  },

  // To remove highest priority element
  popQ: function() {
    qLock = true;
    var highest = this.domQ[1];
    this.domQ[1] = this.domQ[this.N]; this.N--;
    this.downHeap(1);
    return highest;
    qLock = false;
  },

  // Peaks at next element in the queue without modifying it.
  peakQ: function() {
    return this.domQ[1];
  },

  // Gets called to prefetch strings waiting in the queue.
  prefetchNext: function() {
    switch(WA.prefetchStrategy) {
      case -1:
        if(this.N > 0) {
          var p = this.peakQ();
          this.prefetchSound(p.url, p.text, p.playdone);
        } else {}
        break;
      case 0:
        break;
      // For all of the prefetch stratgies,
      // we just retrieve elements from the queue.
      case 1:
      case 2:
      case 3:
        var text_to_fetch = this.getFromPrefetchQ();
        if(text_to_fetch) {
          // A little hack to give the speech being played more bandwidth.
          // TODO:  Make this more systematic.
          if(WA.browseMode == WA.READ && Math.random() > 0.7)
            setTimeout("WA.Sound.Prefetch.prefetchNext();", 250);
          if(/\S/.test(text_to_fetch)) {
            var pred = this.prefetchText(text_to_fetch);
            if(!pred) setTimeout("WA.Sound.Prefetch.prefetchNext();", 0);
          } else {
            setTimeout("WA.Sound.Prefetch.prefetchNext();", 500);
          }
        } else {
          // Nothing in the prefetch queue.  Wait longer before trying again.
          setTimeout("WA.Sound.Prefetch.prefetchNext();", 3000);
        }
        break;
      default: // Do nothing.
    }
  },

  // The prefetch queue is set up as a queue of caches,
  // each with its own priority.
  // prefetch_array: is the array holding each cache, which is itself
  //                 an array of strings.
  // prefetch_curr_index:  the index of the current cache.
  prefetch_array: new Array(),
  prefetch_curr_index: 0,

  // Record of what has been previously prefetched by the system
  // during this session.
  prefetchRecords: new Object(),

  // Adds an array of sounds to the prefetch queue.
  addArrayToPrefetchQ: function(sarray) {
    this.prefetch_array[this.prefetch_curr_index + 1] = new Array();
    for(var i=0, sl=sarray.length; i<sl; i++) {
      var sid = sarray[i];
      //var poor_hash = getSoundID(sid);
      // If changed to !poor_hash would indicate that sounds should not be
      // prefetched twice.  Generally, it's more trouble than it's worth to
      // keep track of this, considering prefetching from the cache requires
      // little overhead and sounds can be evicted from the browser cache.
      if(true) { //!poor_hash) {
        this.prefetch_array[this.prefetch_curr_index + 1].push(sid);
      } else {
        //alert('sid ' + sid + ' already fetched.');
      }
    }
    this.prefetch_curr_index++;
  },

  // Move to another prefetch row.
  incPrefetchIndex: function() {
    this.prefetch_curr_index++;
    this.prefetch_array[this.prefetch_curr_index] = new Array();
  },

  // Adds the sid (sound ID) to the prefetch queue.
  addToPrefetchQ: function(sid) {
    if(this.Sound.splitSoundsByBoundaries) {
      var matches = this.Sound.splitSoundsByBoundary(sid);
      if(matches && matches.length > 0) {
        for(var match_i=0, ml=matches.length; match_i<ml; match_i++) {
          if(!WA.Sound.boundarySplitterRegExp.test(matches[match_i])) {
            this._addIndividualToPrefetchQ(matches[match_i]);
          }
        }
      }
    } else { // TODO:  Is this needed?
      this._addIndividualToPrefetchQ(sid);
    }
  },

  // Adds the sid (sound ID) to the prefetch queue.
  _addIndividualToPrefetchQ: function(sid) {
    sid = this.Sound.prepareSound(sid);
    this.prefetch_array[this.prefetch_curr_index].push(sid);
  },

  // Returns the next sound to be prefetched from the queue.
  getFromPrefetchQ: function() {
    var sid = null;
    if(this.prefetch_array && this.prefetch_array[this.prefetch_curr_index].length < 1
      && this.prefetch_curr_index > 0) {
      WA.Utils.log('moving from queue: ' + this.prefetch_curr_index + ' to ' + (this.prefetch_curr_index-1));
      this.prefetch_curr_index--;
      sid = this.getFromPrefetchQ();
    } else {
      WA.Utils.log('fetching from: ' + this.prefetch_curr_index);
      sid = this.prefetch_array[this.prefetch_curr_index].shift();
    }
  
    return sid;
  },
  
  // The XMLHttpRequest object for prefetching.
  prefetch_req: null,

  // Prefetch a sound using an AJAX request.
  // This also lets us know how long the sound is, ideally.
  prefetchSound: function(url, text, playdone) {
    // Try to reuse the prefetch_req object is possible.
    if(true) { //!WA.Sound.Prefetch.prefetch_req) {
      // Branch for native XMLHttpRequest object
      if(window.XMLHttpRequest) {
        WA.Sound.Prefetch.prefetch_req = new XMLHttpRequest();
        // branch for IE/Windows ActiveX version
      } else if(window.ActiveXObject) {
        WA.Sound.Prefetch.prefetch_req = new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
  
    WA.Sound.Prefetch.prefetch_req.text = text;
    WA.Sound.Prefetch.prefetch_req.sid = WA.Sound.getSoundID(text);
    WA.Sound.Prefetch.prefetch_req.playdone = playdone;
  
    // Setup the request and the make the request.
    WA.Sound.Prefetch.prefetch_req.onreadystatechange = WA.Sound.Prefetch.processReqChangePrefetchSound;
    WA.Sound.Prefetch.prefetch_req.open("GET", url, true);
    WA.Sound.Prefetch.prefetch_req.send(null);
  },

  // Handle onreadystatechange event of httpreq object.
  processReqChangePrefetchSound: function() {
    if(WA.Sound.Prefetch.prefetch_req.readyState == 4) {
      if(WA.Sound.Prefetch.prefetch_req.status == 200) {      
        var soundLength = WA.Sound.Prefetch.prefetch_req.getResponseHeader('sound-length');
        if(soundLength) {  // Not all TTS have lengths.
          WA.Utils.log('got sound ' + WA.Sound.Prefetch.prefetch_req.text + ' ' + soundLength);
          WA.Sound.Prefetch.prefetchRecords[WA.Sound.Prefetch.prefetch_req.sid].soundlength = soundLength;
        } else {
          // This TTS doesn't support the length header.
        }
        var contentLength = WA.Sound.Prefetch.prefetch_req.getResponseHeader('content-length');
        if(contentLength) {  // Not all TTS have lengths.
          WA.Utils.log('got sound ' + WA.Sound.Prefetch.prefetch_req.text + ' ' + contentLength);
          WA.Sound.Prefetch.prefetchRecords[WA.Sound.Prefetch.prefetch_req.sid].contentlength = contentLength;
        } else {
          // This TTS doesn't support the length header.
        }
  
        if(WA.Sound.Prefetch.prefetch_req.playdone) {
          WA.Utils.log("playing after supposed fetching");
          this.Sound.playSOund(WA.Sound.Prefetch.prefetch_req.text, false);
        }
  
        //prefetch_req = null;    
      } else {}
  
      // Requests that the next sound be prefetched, assuming there is one.
      WA.Sound.Prefetch.prefetchNext();
    }
  },

  // Defines the types of predictive prefetching that the system can do.
  prefetchTypes: {
    NEXTNODE: 1,
    PREVNODE: 2,
    NEXTFOCUS: 3,
    PREVFOCUS: 4,
    NEXTINPUT: 5,
    PREVINPUT: 6,
    NEXTHEADING: 7,
    PREVHEADING: 8,
    OTHER: 9
  },

  // Matches key presses to the supported kinds of predictive prefetching.
  keyToAction: function(key_string) {
    var action;
    switch(key_string) {
      case "arrowdown": action = this.prefetchTypes.NEXTNODE; break;
      case "arrowup": action = this.prefetchTypes.PREVNODE; break;
      case "tab": action = this.prefetchTypes.NEXTFOCUS; break;
      case "shift tab": action = this.prefetchTypes.PREVFOCUS; break;
      case "ctrl i": action = this.prefetchTypes.NEXTINPUT; break;
      case "ctrl shift i": action = this.prefetchTypes.PREVINPUT; break;
      case "ctrl h": action = this.prefetchTypes.NEXTHEADING; break;
      case "ctrl shift h": action = this.prefetchTypes.PREVHEADING; break;
      default: action = this.prefetchTypes.OTHER; break;
    }
  },

  // Holds counts of observations of user actions to build the Markov model.
  prefetchObservations: new Object(),

  // Records the specified observation to the predictive prefetching model.
  addObservation: function(currAction, currNode, prevAction) {
    var obs_string = String(prevAction) + " " + String(this.nodeToString(currNode));
    if(this.prefetchObservations[obs_string] == null) {
      this.prefetchObservations[obs_string] = new Array(this.prefetchTypes.OTHER + 1);
      for(var i=0; i<this.prefetchTypes.OTHER + 1; i++) {
        this.prefetchObservations[obs_string][i] = 0;
      }
    }
    this.prefetchObservations[obs_string][currAction]++;
    this.prefetchObservations[obs_string][0]++;
  },

  // Converts node to a descriptive type/name for predictive prefetching.
  nodeToString: function(currNode) {
    if(currNode) {
      return currNode.nodeName;
    } else {
      return null;
    }
  },

  // Returns a normalized probability array of possible actions
  // that could be taken.
  predictNext: function(currNode, prevAction) {
    var possActions = new Array(this.prefetchTypes.OTHER + 1);
    var obs_string = String(prevAction) + " " + String(this.nodeToString(currNode));
    WA.Utils.log('pfetch for ' + obs_string);
    if(this.prefetchObservations[obs_string] != null) {
      var totalObs = this.prefetchObservations[obs_string][0] +
        this.prefetchObservations[obs_string].length;
      for(var i=0, pal=possActions.length; i<pal; i++) {
        possActions[i] = (prefetchObservations[obs_string][i] + 1)/(totalObs);
      }
    } else {
      this.uniformArray(possActions);
    }
    return possActions;
  },

  // Makes the input array of numbers into a uniform array in which all
  // elements add to one.
  uniformArray: function(array) {
    var val = 1.0 / (array.length);
    for(var i=0; i<array.length; i++) {
      array[i] = val;
    }
  },

  // Alerts information about the current state of the prefetching algorithm.
  alertPrefetching: function() {
    var string = "";
    for(obs in this.prefetchObservations) {
      string += obs + ": " + this.prefetchObservations[obs].join(", ") + " \n";
    }
    
    var predictN = this.predictNext(lastNode, WA.Keyboard.last_action);
  
    string += "\n" + lastNode + "  " + WA.Keyboard.last_action;
    string += "\n\n" + predictN.join(", ");
  
    alert(string);
    return;
  },
  
  // Prefetch a the sound for the supplied text.
  numPrefetched: 0,
  prefetchText: function(text) {
    var string = this.Sound.prepareSound(text);
    var url = this.Sound.urlForString(string);
    var sid = WA.Sound.getSoundID(text);
  
    if(!this.prefetchRecords[sid]) {
      this.prefetchRecords[sid] = new Object();
      this.prefetchRecords[sid].soundlength = -1;
      this.numPrefetched++;
      this.prefetchSound(url, text, false);
      return true;
    } else {
      return false;
    }
  },

  // Adds the textual representation of the node to the prefetch queue.
  prefetchNode: function(node) {
    if(node) {
      var text = WA.Nodes.handleNode(node, true);
      addToPrefetchQ(text);
    }
  },

  prefetchNextOnes: function(node, num) {
    for(i=0; i<num; i++) {
      node = firstNodeNoSound(node);
      node = nextBySpeaks(node);
      this.prefetchNode(node);
    }
  },

  // Prediction-based prefetching.
  prefetchPrediction: function() {
    var predictions = this.predictNext(lastNode, WA.Keyboard.last_action);
  
    var impl = [1, 3, 5, 7];
    var highest = 1;
    var high_val = 0.0;
    for(var i=0, il=impl.length; i<il; i++) {
      var pred = predictions[impl[i]];
      if(pred > high_val) {
        high_val = pred;
        highest = impl[i];
      }
    }
  
    WA.Utils.log('highest is ' + highest);
  
    var next_node = null;
  
    this.incPrefetchIndex();
  
    switch(highest) {
      case this.prefetchTypes.NEXTFOCUS:
        next_node = nextByFocus(currentNode); this.prefetchNode(next_node);
        var best_node = next_node;
        this.prefetchNextOnes(currentNode, 2);
        best_node = firstNodeNoSound(best_node);    
        next_node = nextByFocus(best_node); this.prefetchNode(next_node);
        this.prefetchNextOnes(best_node, 1);
        break;
      case this.prefetchTypes.NEXTHEADING:
        next_node = nextByTag(currentNode, "H"); this.prefetchNode(next_node);
        var best_node = next_node;
        this.prefetchNextOnes(currentNode, 2);
        best_node = firstNodeNoSound(best_node);    
        next_node = nextByTag(best_node, "H"); this.prefetchNode(next_node);
        this.prefetchNextOnes(best_node, 1);
        break;
      case this.prefetchTypes.NEXTINPUT:
        next_node = nextByTag(currentNode, "INPUT|SELECT|TEXTAREA"); this.prefetchNode(next_node);
        var best_node = next_node;
        this.prefetchNextOnes(currentNode, 2);
        best_node = firstNodeNoSound(best_node);    
        next_node = nextByTag(best_node, "INPUT|SELECT|TEXTAREA"); this.prefetchNode(next_node);
        this.prefetchNextOnes(best_node, 1);
        break;
      case this.prefetchTypes.NEXTNODE:
      default:
        this.prefetchNextOnes(currentNode, 3);
        break;
    }
  },

  // Initialize the system to prefetch letters and common symbols.
  // Letters are ordered according to a guess of their popularity in the web context.
  lettersNotFetched: ['w','.','h','t','p','/','g','o','e','l','b','f','c','i','j','k','m','n','d','q','r','s','u','v','a','x','y','z','go'],

  // Prefetches the letters, so that when the user begins typing,
  // they do not experience as much latency in echoing.
  prefetchLetters: function() {
    if(this.prefetch_array && this.prefetch_array[0]) {
      for(i=0, lnfl=this.lettersNotFetched.length; i<lnfl; i++) {
        this.prefetch_array[0].push(this.lettersNotFetched[i]);
      }
    }
  }
};

// Initialize the Prefetcher.
WA.Sound.Prefetch.initPrefetch();