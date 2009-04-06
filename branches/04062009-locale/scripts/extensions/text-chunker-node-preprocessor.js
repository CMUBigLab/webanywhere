/*
 * Text Chunker Node Preprocessor.
 * /extensions/text-chunker-node-preprocessor.js
 *
 * An extension for wrapping chunks of text in a span.
 *
 */

WA.Extensions.TextChunkerNodePreprocessor = function() {
  /**
   * preprocess
   * TextChunker preprocesses the node by splitting it into possibly many
   * pieces and wrapping each in a span.
   * @param node Node to be pre-processed.
   */
  this.preprocess = function(node) {
    if(node.nodeType == 3 && !(WA.Nodes.internalNode(node))) {
      var node_text = node.data;

	    // If there's non-whitespace text in the node.
      if(/\S/.test(node_text)) {
        var doc = node.ownerDocument;
        var parentSpan = doc.createElement('span');

        var phrases = this._splitString(node_text);

        var nodesAdded = [];
        for(var i=0; i<phrases.length; i++) {
          if(/\S/.test(phrases[i])) {
	          var newSpan = doc.createElement('span');
	          var curr_node = doc.createTextNode(phrases[i]);
	          newSpan.appendChild(curr_node);
            nodesAdded.push(newSpan);
          }
        }

        var parentNode = node.parentNode;

        // Insert the new spans in the correct place.
        if(node.nextSibling != null) {
          var next_node = node.nextSibling;
	        for(var i=0; i < nodesAdded.length; i++) {
            parentNode.insertBefore(nodesAdded[i], next_node);
	        }
        } else {
          for(var i=0; i < nodesAdded.length; i++) {
            parentNode.appendChild(nodesAdded[i]);
          }
        }

        parentNode.removeChild(node);        
      }
    }
  };

  // Delimiter string used for splitting.
  this._stringDelimiter = "_}_",

  this._splitRegExp = new RegExp(this._stringDelimiter);

  this._beforeSplitRE = /((([^\.]\s*[^A-Z]\.)|([;,\?!]))($|(?=\s)))/g;
  this._afterSplitRE = /(\s(\s+\-+\s+|that|because|but|instead|and|or|which|according)(\s|$))/gi;

  /**
   * Splits strings into phrases using a number of heuristics.
   * @param str String to split.
   * @return Array of Strings.
   */
  this._splitString = function(str) {
  	if(typeof str != 'string') {
  		return [];
  	}
  	str = str.replace(this._beforeSplitRE, '$1' + this._stringDelimiter);
    str = str.replace(this._afterSplitRE, this._stringDelimiter + '$1');

    var phrases = this._splitByDelim(str, this._stringDelimiter, true);

    return phrases;
  };

  // Ideally, we'd have a POS Tagger, but that's probably overkill.
  this._libSplits = /(\s|^)(between|to|in|except|from|for|from|when|with)(\s|$)/gi;

  this._liberalSplit = function(str) {
  	str = str.replace(this._libSplits, this._stringDelimiter + '$1$2$3');
    return this._splitByDelim(str, this._stringDelimiter, false);
  };

  this._splitByDelim = function(str, delim, lib_recurse) {
    // Construct the initial array of strings.
    var phrases = str.split(this._splitRegExp);

    // Iterate over the phrases that were found, adjusting them
    // based on number of words.    
    for(var i=0; i<phrases.length; i++) {
      var phrase = phrases[i];

      var numWords = WA.Utils.countWords(phrases[i]);

      // If it's too short, combine with one of the phrases around it.
      if(numWords<3 && phrases.length > 1) {
        if(i==0) {
          // Prepend to next one.
          phrases[i+1] = phrase + phrases[i+1];
          phrases[i] = "";
        } else if(i==phrases.length-1) {
          // Append to last one.
          phrases[i] = phrases[i-1] + phrase;
          phrases[i-1] = "";
        } else {
        	// Combine with the smaller of its neighbors.
        	if(phrases[i-1].length < phrases[i+1]) {
            phrases[i] = phrases[i-1] + phrase;
            phrases[i-1] = "";
        	} else {
            phrases[i+1] = phrase + phrases[i+1];
            phrases[i] = "";
        	}
        }
      } else if(numWords > 6 && lib_recurse) {  // Break long strings liberally.
        var newPhrases = this._liberalSplit(phrase);
      	newPhrases.unshift(i, 1);
      	i+= newPhrases.length + 1;
        phrases.splice.apply(phrases, newPhrases);
      }
    }

    return phrases;
  }
};

// Remove the current sound splitter.
//WA.Sound.splitSoundsByBoundary = function(str) { return [str + ""]; }

// Add this extension to the node preprocessor extensions.
WA.Extensions.nodePreprocessors.push(new WA.Extensions.TextChunkerNodePreprocessor());