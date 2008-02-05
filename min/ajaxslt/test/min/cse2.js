function m (img,action) {
  if(document.images) {
    if(action == 1) {
      document.images[img].src = '/pics/wsarrow.gif';
    } else {
      document.images[img].src = '/pics/wharrow.gif';
    }
  }
}

function mIn (img, doA) {
  if (document.images) {
    if (doA) {
      document.images[img].src = "/pics/arrow.gif";
      if(document.images[img+'_']) {
        document.images[img + '_'].src = "/pics/rarrow.gif";
      }     
    }
  }

} // mIn()


function mOut (img, doA) {
  if (document.images) {
    if (doA) {
      document.images[img].src = "/pics/noarrow.gif";
      if(document.images[img+'_']) {
        document.images[img + '_'].src = "/pics/noarrow.gif";
      }
    }
  }

} // mOut()
