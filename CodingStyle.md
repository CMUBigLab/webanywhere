# Introduction #

This document describes the coding style used throughout the WebAnywhere project.  Coding style preference is personal and no choice is right or wrong.  But, projects without consistent style appear sloppy and can be difficult to read, so please follow these guidlines.


# Coding Style Details #

The coding style used in this project is a tight style.  For now, I'll illustrate through examples:

## Lines are 80 characters max ##
I know, I have a super-wide display too, but keeping lines short improves readability.


## Indents should be 2 spaces (not tab) ##
```
if(true) {
  while(notDone()) {
    alert('hello!');
  }
}
```

## No blank lines before code blocks ##
```
function foobar() {
  if(foo) {
    bar();
  }
}
```
## Use spaces to make code clearer but don't use more than necessary ##
```
for(var i=0; i<doneYet(myarray.length); i++) {
...
```

## Spaces should not end lines ##
There are should be no spaces at the end of lines.

This also means that no line should contain only spaces.

## Comments ##
functions should follow the JavaDoc format, for example:
```
  /**
   * Return true if we should treat this node as a leaf, false otherwise.
   * The only nodes that possibly aren't leaves are the element nodes (type 3).
   * @param node Node to see if it's a leaf node or not.
   * @return Boolean Boolean indicating whether this is a leaf node.
   */
  leafNode: function(node) {
    if(!node || !node.nodeType || node.nodeType == 3) {
      return true;
    } else {
        return this.leafElement(node);
    }
  },
```

inline comments should just use //, for example:
```
  // First check to see if the DOM2 hasAttribute is available.
  if(node.hasAttribute) {
    return node.hasAttribute(attrib);
  }
```