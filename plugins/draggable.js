
  /**
* drag
* DRAG
* @description Make elements dragabble, Example: Surf(myRef).drag({draghandle: '.draggable', contain: '.maindrawn', drop: '.stop', dropfn: dropfn}); - where dropfn exists as:
*   function dropfn({dragee=false, dropee=false} ){  console.log('DROPPED '+Surf(dragee).text());  }
*@return {object}
*/
// set cursor if cursor is true
  function drag({draghandle=false, cursor=false, contain='body', containDistance = 2, dropfn=false, drop=false, over=false, overfn=false, zIndex=1, axis=false} = {} ) {

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
    dragee.active = false;
     dragee.currentX = dragee.currentX || 0;
     dragee.currentY = dragee.currentY || 0;
     dragee.initialX = dragee.inititalX || 0;
     dragee.initialY = dragee.inititalY || 0;
     dragee.xOffset = 0;
     dragee.yOffset = 0;
     dragee.containment = document.querySelector(contain);
    //for debugging in dev tools
    if(dragee.containment){
     Surf(dragee).attr('data-surfcontain', contain);
     }
    const parentContainer = dragee.parentNode || dragee.parentElement; // for dragEnd
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
    //parentContainer.parentNode.addEventListener('mouseup', dragEnd, true);
    document.body.addEventListener('mouseup', dragEnd, true);

    parentContainer.addEventListener('mousemove', doDrag, true);

let first = false;
var curtarget ;
let initialX = 0; 
let  initialY = 0
let z;

//TODO check curtarget against these in doDrag and set curtarget.active to fals or just return to stop dragging


let containRight = 0 ;
let containLeft = 0;
let containTop = 0;
let containBottom = 0;
let containHeight = 0;



function dragStart(e) {

      // here we don't set dragee position to relative or absolute until dragging begins
     if(e.target.classList.contains('surf-draggable')){

       curtarget = e.target;

      containLeft = Surf()._rect(curtarget.containment, 'left', true);
      containRight = Surf()._rect(curtarget.containment, 'width', true)+containLeft;
      containTop = Surf()._rect(curtarget.containment, 'top', true);
      containBottom = Surf()._rect(curtarget.containment, 'height', true);
      containHeight = Surf()._rect(curtarget.containment, 'height', true);
      //console.log(`CR = ${containRight} `)
      //console.log(`CL = ${containLeft} `)
      //console.log(`CT = ${containTop} `)
      //console.log(`CH = ${containHeight} `)
      //console.log(`CB = ${containBottom} `)


        z = curtarget.style.zIndex;
       curtarget.active = true;
       const pos = Surf()._cs(e.target, 'position');
      if (pos !== 'relative') {
      if (pos === 'absolute') { // if it is already absolute then do nothing
      }else{
        Surf(e.target).css('position: relative;');
      }
      }
      if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - e.target.xOffset;
        initialY = e.touches[0].clientY - e.target.yOffset;
      } else {
        if (!first) { // for future use on first click/touch
          first = true;
          initialX = e.clientX - e.target.xOffset;
          initialY = e.clientY - e.target.yOffset;
        curtarget.style.zIndex = 999;
        // console.log(e.target.xOffset);
        } else {
          initialX = e.clientX - e.target.xOffset;
          initialY = e.clientY - e.target.yOffset;
          
        }
      }

      if (e.target.matches(draghandle) || !draghandle) {
        Surf(e.target).css('user-select: none; cursor: pointer;');
        curtarget.active = true;
      }
//      setTranslate(e.target.currentX, e.target.currentY, e.target);

if(axis){
if(axis == 'y'){

        setTranslate(curtarget.initialX, curtarget.currentY, curtarget);
}
if(axis == 'x'){

        setTranslate(curtarget.currentX, curtarget.initialY, curtarget);
}


}else{
        setTranslate(curtarget.currentX, curtarget.currentY, curtarget);
}


    }
    }

/*
// end dragging if on anything but curtarget 
    function dragCheck(e) {
   if(curtarget){
   // TODO this currently allows draggable over other draggablse but we should allow over elements that are children on container
   if(e.target !== curtarget && !e.target.classList.contains('surf-draggable')){
      curtarget.active = false;
   Surf(curtarget).trigger('mouseup')
   }
   }
 }
*/
    function dragEnd(e) {

   if(e.target !== curtarget ){
      curtarget.active = false;
   Surf(curtarget).trigger('mouseup')
   }
   try{
      // console.log('etype '+e.type)
      initialX = Surf()._cs(curtarget, 'left');
      initialY = Surf()._cs(curtarget, 'top');
      if (dropEl && isTouching({el: dropEl}) && active) {
        dropfn({dragee: curtarget, dropee: dropEl} );
        curtarget.active = false;
      }
      curtarget.active = false;
      curtarget.style.zIndex = null

//      setTranslate(curtarget.currentX, curtarget.currentY, curtarget);

if(axis){
if(axis == 'y'){

        setTranslate(curtarget.initialX, curtarget.currentY, curtarget);
}
if(axis == 'x'){

        setTranslate(curtarget.currentX, curtarget.initialY, curtarget);
}


}else{
        setTranslate(curtarget.currentX, curtarget.currentY, curtarget);
}


}catch(e){}
    }

  function doDrag(e) {
        e.preventDefault();
    if(curtarget && curtarget.active && curtarget.classList.contains('surf-draggable')){


        if (e.type === 'touchmove') {
          curtarget.currentX = e.touches[0].clientX - initialX;
          curtarget.currentY = e.touches[0].clientY - initialY;
        } else {
          // console.log('currentX '+currentX)
          curtarget.currentX = e.clientX - initialX;
          curtarget.currentY = e.clientY - initialY;
        }

        if (overEl && isTouching({el: overEl}) && Surf().isFunction(overfn) && active) {
          overfn({dragee: curtarget, dropee: overEl} );
        }



        curtarget.xOffset = curtarget.currentX;

let curtargetLeft = Surf()._rect(curtarget, 'left', true);
let curtargetWidth = Surf()._rect(curtarget, 'width', true);
let curtargetRight = Surf()._rect(curtarget, 'left', true)+curtargetWidth;
let curtargetHeight = Surf()._rect(curtarget, 'height', true);
let curtargetTop = Surf()._rect(curtarget, 'y', true);//  - curtarget.offsetTop + (curtargetHeight*2) ;
let curtargetBottom = Surf()._rect(curtarget, 'y', true)+curtargetHeight;//  - curtarget.offsetTop + (curtargetHeight*2) ;
//console.log(curtargetTop)
//console.log(curtargetRight)
//console.log(containTop)
//console.log(curtarget.offsetTop)
//console.log(curtargetHeight)

  // CONTAIN TOP
  if(curtargetTop < containTop){
    // console.log('hit top')
    curtarget.yOffset = curtarget.currentY+containDistance;
    Surf(curtarget).css(`top: ${Surf()._cs(curtarget, 'top')+containDistance}px;`);

      }else{

        curtarget.yOffset = curtarget.currentY;
      }

  // CONTAIN BOTTOM
   //console.log('bottom is '+ Number(containBottom)+curtarget.containment.offsetTop )
  if(curtargetBottom  > Surf()._rect(curtarget.containment, 'y', true) + Surf()._rect(curtarget.containment, 'height', true)){
    //console.log(curtarget.containment.offsetTop)
  //   console.log('hit bottom')
    curtarget.yOffset = curtarget.currentY-containDistance;
    Surf(curtarget).css(`top: ${Surf()._cs(curtarget, 'top')-containDistance}px;`);

      }else{

        curtarget.yOffset = curtarget.currentY;
      }

  // CONTAIN LEFT
  if(curtargetLeft  < containLeft ){
    //console.log(curtarget.containment.offsetTop)
    // console.log('hit left')
    curtarget.xOffset = curtarget.currentX+containDistance;
    Surf(curtarget).css(`left: ${Surf()._cs(curtarget, 'left')+containDistance}px;`);

      }else{

        curtarget.xOffset = curtarget.currentX;
      }

  // CONTAIN RIGHT
  if(curtargetRight  > containRight ){
    //console.log(curtarget.containment.offsetTop)
    // console.log('hit right')
    curtarget.xOffset = curtarget.currentX-containDistance;
    Surf(curtarget).css(`left: ${Surf()._cs(curtarget, 'left')-containDistance}px;`);

      }else{

        curtarget.xOffset = curtarget.currentX;
      }



if(axis){
if(axis == 'y'){

        setTranslate(curtarget.initialX, curtarget.currentY, curtarget);
}
if(axis == 'x'){

        setTranslate(curtarget.currentX, curtarget.initialY, curtarget);
}


}else{
        setTranslate(curtarget.currentX, curtarget.currentY, curtarget);
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
    container.addEventListener('touchstart', startTouch, {passive: false});
    container.addEventListener('touchmove', moveTouch, {passive: false});

    // Swipe Up / Down / Left / Right
     dragee.inititalX  = null;
     dragee.initialY = null;

    function startTouch(e) {
      e.target.initialX = e.touches[0].clientX;
      e.target.initialY = e.touches[0].clientY;
    };

    function moveTouch(e) {
      e.preventDefault();

      if (e.target.initialX === null) {
        return;
      }

      if (e.target.initialY === null) {
        return;
      }

      e.target.currentX = e.touches[0].clientX;
      e.target.currentY = e.touches[0].clientY;

      const diffX = e.target.initialX - e.target.currentX;
      const diffY = e.target.initialY - e.target.currentY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
      // sliding horizontally
        if (diffX > 0) {
        // swiped left
          if (Surf().isFunction(left)) {
            if(e.target.classList.contains('surf-swipe')){
              left(e.target);
            }
          }
        } else {
        // swiped right
          if (Surf().isFunction(right)) {
            if(e.target.classList.contains('surf-swipe')){
              right(e.target);
            }
          }
        }
      } else {
      // sliding vertically
        if (diffY > 0) {
        // swiped up
          if (Surf().isFunction(up)) {
            if(e.target.classList.contains('surf-swipe')){
            up(e.target);
            }
          }
        } else {
        // swiped down
          if (Surf().isFunction(down)) {
            if(e.target.classList.contains('surf-swipe')){
            down(e.target);
          }
          }
        }
      }

      e.target.initialX = null;
      e.target.initialY = null;

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


