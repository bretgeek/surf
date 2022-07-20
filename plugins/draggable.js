
  /**
* drag
* DRAG
* @description Make elements dragabble, Example: Surf(myRef).drag({draghandle: '.draggable', contain: '.maindrawn', drop: '.stop', dropfn: dropfn}); - where dropfn exists as:
*   function dropfn({dragee=false, dropee=false} ){  console.log('DROPPED '+Surf(dragee).text());  }
*@return {object}
*/
//TODO set cursor if cursor is true
  function drag({draghandle=false, cursor=false, contain='body', dropfn=false, drop=false, over=false, overfn=false, zIndex=1} = {} ) {

  function isTouching({el=false, el2=false}) { // el2 is self if omitted
    if (typeof(el2) !== 'document') { // do not make el2 document! 
      return this;
    }
    if (!el2) {
      el2=this.stk[0];
    }
    const elRect = el.getBoundingClientRect();
    const el2Rect = el2.getBoundingClientRect();

    return !(
      ((elRect.top + elRect.height) < (el2Rect.top)) ||
      (elRect.top > (el2Rect.top + el2Rect.height)) ||
      ((elRect.left + elRect.width) < el2Rect.left) ||
      (elRect.left > (el2Rect.left + el2Rect.width))
    );
  }



    for( let dragee of this.stk){
        Surf(dragee).addClass('surf-draggable');
    if(cursor){
   Surf(dragee).css(`cursor: ${cursor};`);
    }
    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    const containment = document.querySelectorAll(contain)[0];
    const parentContainer = dragee.parentNode || dragee.parentElement; // for dragEnd
    const dragItem = dragee;
    let dropEl;
    if (drop && isString(drop) ) {
      dropEl = document.querySelector(drop);
    }

    let overEl;
    if (over && isString(over) ) {
      overEl = document.querySelector(over);
    }

    parentContainer.addEventListener('touchstart', dragStart, {passive: false});
    parentContainer.addEventListener('touchend', dragEnd, {passive: false});
    parentContainer.addEventListener('touchmove', doDrag, {passive: false});

    parentContainer.addEventListener('mousedown', dragStart, true);
    parentContainer.addEventListener('mouseup', dragEnd, true);
    containment.addEventListener('mouseleave', dragEnd, true);
    parentContainer.addEventListener('mousemove', doDrag, true);
    let first = false;
 function dragStart(e) {
      // here we don't set dragee to absolute until dragging begins
     if(e.target.classList.contains('surf-draggable')){
      const pos = Surf(dragee)._cs('position');
      // console.log(pos);
      if (pos !== 'absolute') {
        Surf(dragee).css('position: absolute;');
      }
      if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        if (!first) { // for future use on first click/touch
          first = true;
          initialX = e.clientX - xOffset;
          initialY = e.clientY - yOffset;
        // console.log(xOffset);
        } else {
          initialX = e.clientX - xOffset;
          initialY = e.clientY - yOffset;
        }
      }

      if (e.target.matches(draghandle) || !draghandle) {
        e.target.style.cssText = 'user-select: none; cursor: pointer;';
        active = true;
      }
      //   setTranslate(xOffset, yOffset, dragItem);
      setTranslate(currentX, currentY, dragItem);
    }
    }

    function dragEnd(e) {
     if(e.target.classList.contains('surf-draggable')){
      // console.log('etype '+e.type)
      initialX = currentX;
      initialY = currentY;
      if (dropEl && isTouching({el: dropEl}) && active) {
        dropfn({dragee: e.target, dropee: dropEl} );
        active = false;
      }
      active = false;

      setTranslate(currentX, currentY, dragItem);
    }
    }
 function doDrag(e) {
     if(e.target.classList.contains('surf-draggable')){
      if (active) {
        e.preventDefault();

        if (e.type === 'touchmove') {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          // console.log('currentX '+currentX)
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        if (overEl && isTouching({el: overEl}) && Surf().isFunction(overfn) && active) {
          overfn({dragee: dragee, dropee: overEl} );
        }


        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, dragItem);
        // setTranslate(xOffset, yOffset, dragItem);
      }
    }
    }

    function setTranslate(xPos, yPos, el) {
      // console.log('xPos '+xPos)
      el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)';
    }
}//end for _stk
    return this;
  } // End drag



function undrag(cursor=false){
    for( const dragee of this.stk){
    if(!cursor){
    Surf(dragee).css('cursor: auto;')
    }
    Surf(dragee).removeClass('surf-draggable')
    }
    return this;
}

function unswipe(){
    for( const dragee of this.stk){
    Surf(dragee).removeClass('surf-swipe')
    }
    return this;
}

function swipe({ up=false, down=false, left=false, right=false} = {}) {
    // for testing
     if(!up && !down && !left && !right){
     right = () => {  console.log('swiped right') } 
     left = () => {  console.log('swiped left') } 
     up = () => {  console.log('swiped up') } 
     down = () => {  console.log('swiped down') } 
     } 
   
    for( let dragee of this.stk){
        Surf(dragee).addClass('surf-swipe');
    const container = dragee;
    container.addEventListener('touchstart', startTouch, {passive: true});
    container.addEventListener('touchmove', moveTouch, {passive: true});

    // Swipe Up / Down / Left / Right
    let initialX = null;
    let initialY = null;

    function startTouch(e) {
      initialX = e.touches[0].clientX;
      initialY = e.touches[0].clientY;
    };

    function moveTouch(e) {
      if (initialX === null) {
        return;
      }

      if (initialY === null) {
        return;
      }

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      const diffX = initialX - currentX;
      const diffY = initialY - currentY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
      // sliding horizontally
        if (diffX > 0) {
        // swiped left
          if (Surf().isFunction(left)) {
            if(dragee.classList.contains('surf-swipe')){
              left(dragee);
            }
          }
        } else {
        // swiped right
          if (Surf().isFunction(right)) {
            if(dragee.classList.contains('surf-swipe')){
              right(dragee);
            }
          }
        }
      } else {
      // sliding vertically
        if (diffY > 0) {
        // swiped up
          if (Surf().isFunction(up)) {
            if(dragee.classList.contains('surf-swipe')){
            up(dragee);
            }
          }
        } else {
        // swiped down
          if (Surf().isFunction(down)) {
            if(dragee.classList.contains('surf-swipe')){
            down(dragee);
          }
          }
        }
      }

      initialX = null;
      initialY = null;

      e.preventDefault();
    };
}
    return this;
  }// End swipe



// Auto initialize plugin on ready
Surf(document).ready( function(){
Surf.plugin.fn.drag = drag;
Surf.plugin.fn.undrag = undrag;
Surf.plugin.fn.swipe = swipe;
Surf.plugin.fn.unswipe = unswipe;
});


