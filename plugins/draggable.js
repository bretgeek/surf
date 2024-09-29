/**
 * drag
 * DRAG
 * @description Make elements dragabble or swipeable ... does not include a working sortable (maybe you will make one?).
 *, Example: Surf(myRef).drag({draghandle: '.draggable', contain: '.maindrawn', drop: '.stop', dropfn: dropfn}); - where dropfn exists as:
 * axis is either x or y and will constrain dragging to that axis
 * function dropfn({dragee=false, dropee=false} ){  console.log('DROPPED '+Surf(dragee).text());  }
 *@return {object}
 */
// set cursor if cursor is true
let cont = document;
let origY = 0;

function drag({ draghandle = false, cursor = false, contain = 'body', killspeed = 400, containDistance = 20, dropfn = false, drop = false, over = false, overfn = false, zIndex = 1, axis = false } = {}) {

  cont = $(contain).first();

  var timestamp = null;
  var lastMouseX = null;
  var lastMouseY = null;

  // if the mouse or touch is too fast just stop in order to prevent people from swiping elements out of their container
  function tooFast(e) {
    e.screenX = e.screenX || e.touches[0].clientX;
    e.screenY = e.screenY || e.touches[0].clientY;

    if (timestamp === null) {
      timestamp = Date.now();
      lastMouseX = e.screenX;
      lastMouseY = e.screenY;
      return;
    }

    var now = Date.now();
    var dt = now - timestamp;
    var dx = e.screenX - lastMouseX;
    var dy = e.screenY - lastMouseY;
    var speedX = Math.round(dx / dt * 100);
    var speedY = Math.round(dy / dt * 100);

    timestamp = now;
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
    // if too fast return true
    if (Number(speedX.toString().replace(/-/, "")) > killspeed) {
      // console.log(speedX);
      return true;
    }
    return false;
  };




  function isTouching({ el = false, el2 = false }) { // el2 is self if omitted


    const elRect = el.getBoundingClientRect();
    const el2Rect = el2.getBoundingClientRect();
    let t = ((elRect.top + elRect.height) < (el2Rect.top)) ||
      (elRect.top > (el2Rect.top + el2Rect.height)) ||
      ((elRect.left + elRect.width) < el2Rect.left) ||
      (elRect.left > (el2Rect.left + el2Rect.width));
    // console.log(!t);

    return !t;
  }



  for (let dragee of this.stk) {
    Surf(dragee).addClass('surf-draggable');
    if (cursor) {
      Surf(dragee).css(`cursor: ${cursor};`);
    }
    // all settings of dragee must be defined here
    dragee.active = false;
    dragee.currentX = dragee.currentX || 0;
    dragee.currentY = dragee.currentY || 0;
    dragee.initialX = dragee.inititalX || 0;
    dragee.initialY = dragee.inititalY || 0;
    dragee.xOffset = 0;
    dragee.yOffset = 0;
    dragee.containment = document.querySelector(contain);

    if (axis && axis !== "x" && axis !== "y") {
      axis = false;
    }

    if (axis) {
      dragee.axis = axis;
      //  console.log(dragee.axis);
    }


    //for debugging in dev tools
    if (dragee.containment) {
      Surf(dragee).attr('data-surfcontain', contain);
    }
    const parentContainer = dragee.parentNode || dragee.parentElement; // for dragEnd
    if (drop && Surf().isString(drop)) {
      dragee.dropEl = $(`${drop}`).all();
    }

    if (over && Surf().isString(over)) {
      dragee.overEl = $(`${over}`).all();
    }


    parentContainer.addEventListener('touchstart', dragStart, { passive: false });
    document.body.addEventListener('touchend', dragEnd, { passive: false });
    parentContainer.addEventListener('touchend', dragEnd, { passive: false });
    parentContainer.addEventListener('touchmove', doDrag, { passive: false });

    parentContainer.addEventListener('mousedown', dragStart, true);
    parentContainer.addEventListener('mouseup', dragEnd, true);
    parentContainer.parentNode.addEventListener('mouseup', dragEnd, true);

    // trigger mouse up if contain and mouse is out of bounds
    if (cont) {
      // console.log("here");
      function lfn() {
        Surf(dragee).trigger("mouseup");
      }
      parentContainer.addEventListener('mouseleave', lfn, true);
    }



    parentContainer.addEventListener('mousemove', doDrag, true);

    let first = false;
    var curtarget;
    let initialX = 0;
    let initialY = 0
    let z;



    let containRight = 0;
    let containLeft = 0;
    let containTop = 0;
    let containBottom = 0;
    let containHeight = 0;



    function leave(e) {
      curtarget.active = false;
    }

    function dragStart(e) {

      // here we don't set dragee position to relative or absolute until dragging begins
      if (e.target.classList.contains('surf-draggable')) {

        curtarget = e.target;
        containLeft = Surf()._rect(curtarget.containment, 'left', true);
        containRight = Surf()._rect(curtarget.containment, 'width', true) + containLeft;
        containTop = Surf()._rect(curtarget.containment, 'top', true);
        containHeight = Surf()._rect(curtarget.containment, 'height', true);
        containBottom = containTop + containHeight;
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
          } else {
            // only set absolute positioning if there is a containment element
            if (curtarget.containment) {
              Surf(e.target).css('position: absolute;');
            } else {

              Surf(e.target).css('position: relative;');
            }
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

        if (curtarget.axis) {
          if (curtarget.axis === 'y') {

            setTranslate(curtarget.initialX, curtarget.currentY, curtarget);
          }
          if (curtarget.axis === 'x') {

            setTranslate(curtarget.currentX, curtarget.initialY, curtarget);
          }


        } else {
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
      //console.log(cont);
      try {
        if (e.target !== curtarget) {
          curtarget.active = false;
        }
        // console.log('etype '+e.type)
        initialX = Surf()._cs(curtarget, 'left');
        initialY = Surf()._cs(curtarget, 'top');
        if (dragee.dropEl) {
          dragee.dropEl.forEach((d) => {

            if (isTouching({
                el: d,
                el2: e.target
              }) && d != e.target && e.target == curtarget) {
              dropfn({
                dragee: e.target,
                dropee: d
              });
              curtarget.active = false;
            }
            curtarget.active = false;
            curtarget.style.zIndex = zIndex || null
          });
        }




        curtarget.active = false;
        curtarget.style.zIndex = zIndex || null

        origY = curtarget.currentY


        if (curtarget.axis) {
          if (curtarget.axis === 'y') {

            setTranslate(curtarget.initialX, curtarget.currentY, curtarget);
          }
          if (curtarget.axis === 'x') {

            setTranslate(curtarget.currentX, curtarget.initialY, curtarget);
          }


        } else {
          setTranslate(curtarget.currentX, curtarget.currentY, curtarget);
        }


      } catch (e) {}


    } // end dragEnd


    function doDrag(e) {
      e.preventDefault();
      if (curtarget && curtarget.active && curtarget.classList.contains('surf-draggable')) {

        let ms = tooFast(e);
        if (ms) {
          Surf(curtarget).trigger('mouseup');
          return;
        }

        curtarget.xOffset = curtarget.currentX;

        let curtargetLeft = Surf()._rect(curtarget, 'left', true);
        let curtargetWidth = Surf()._rect(curtarget, 'width', true);
        let curtargetRight = Surf()._rect(curtarget, 'left', true) + curtargetWidth;
        let curtargetHeight = Surf()._rect(curtarget, 'height', true);
        let curtargetTop = Surf()._rect(curtarget, 'y', true); //  - curtarget.offsetTop + (curtargetHeight*2) ;
        let curtargetBottom = Surf()._rect(curtarget, 'y', true) + curtargetHeight; //  - curtarget.offsetTop + (curtargetHeight*2) ;
        //console.log(curtargetTop)
        //console.log(curtargetRight)
        //console.log(containTop)
        //console.log(curtarget.offsetTop)
        //console.log(curtargetHeight)

        if (e.type === 'touchmove') {

          curtarget.currentX = Math.round(e.touches[0].clientX - initialX);
          curtarget.currentY = Math.round(e.touches[0].clientY - initialY);
        } else {
          // console.log('currentX '+currentX)
          curtarget.currentX = Math.round(e.clientX - initialX);
          curtarget.currentY = Math.round(e.clientY - initialY);
        }



        // do the same things here as we did for dropEl 
        if (dragee.overEl) {
          Surf(`${over}`).all().forEach((o) => {
            if (isTouching({
                el: o,
                el2: e.target
              }) && o !== e.target && Surf().isFunction(overfn)) {

              overfn({
                dragee: e.target,
                dropee: o
              });

            }
          });
        }




        // CONTAIN TOP
        if (curtargetTop < containTop) {
          // console.log('hit top')
          curtarget.yOffset = curtarget.currentY + containDistance;
          let tp = Surf()._cs(curtarget, 'top', true) + containDistance;  
          Surf(curtarget).css(`top: ${tp}px;`);
 
          return;
        } else {

          curtarget.yOffset = curtarget.currentY;
        }

        // CONTAIN BOTTOM
        //console.log('bottom is '+ Number(containBottom)+curtarget.containment.offsetTop )
        if (curtargetBottom > Surf()._rect(curtarget.containment, 'y', true) + Surf()._rect(curtarget.containment, 'height', true)) {
          //console.log(curtarget.containment.offsetTop)
          //   console.log('hit bottom')
          curtarget.yOffset = curtarget.currentY - containDistance;

          let bt = Surf()._cs(curtarget, 'top', true) - containDistance;  
          Surf(curtarget).css(`top: ${bt}px;`);

          return;

        } else {

          curtarget.yOffset = curtarget.currentY;
        }

        // CONTAIN LEFT
        if (curtargetLeft < containLeft) {
          //console.log(curtarget.containment.offsetTop)
          // console.log('hit left')
          curtarget.xOffset = curtarget.currentX + containDistance;
          //Surf(curtarget).css(`left: ${Surf()._cs(curtarget, 'left')+containDistance}px;`);
          let lt = Surf()._cs(curtarget, 'left', true) + containDistance; 
          Surf(curtarget).css(`left: ${lt}px;`);


          return;
        } else {

          curtarget.xOffset = curtarget.currentX;
        }

        // CONTAIN RIGHT
        if (curtargetRight > containRight) {
          //console.log(curtarget.containment.offsetTop)
          //  console.log('hit right')
          curtarget.xOffset = curtarget.currentX - containDistance;
          let rt = Surf()._cs(curtarget, 'left', true) - containDistance; 
          // console.log(rt);
          Surf(curtarget).css(`left: ${rt}px;`);

// console.log(`${Surf()._cs(curtarget, 'left', true)}`);
          return;
        } else {

          curtarget.xOffset = curtarget.currentX;
        }



        if (curtarget.axis) {
          if (curtarget.axis === 'y') {

            setTranslate(curtarget.initialX, curtarget.currentY, curtarget);
          }
          if (curtarget.axis === 'x') {

            setTranslate(curtarget.currentX, curtarget.initialY, curtarget);
          }


        } else {
          setTranslate(curtarget.currentX, curtarget.currentY, curtarget);
        }

      }
    }


    function setTranslate(xPos, yPos, el) {
      // console.log('xPos '+xPos)
      el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)';
    }
  } //end for _stk
  return this;
} // End drag



function undrag(cursor = false) {
  for (const dragee of this.stk) {
    if (!cursor) {
      Surf(dragee).css('cursor: auto;')
    }
    Surf(dragee).removeClass('surf-draggable')
  }
  return this;
}

function unswipe() {
  for (const dragee of this.stk) {
    Surf(dragee).removeClass('surf-swipe')
  }
  return this;
}

function swipe({ up = false, down = false, left = false, right = false } = {}) {
  // for testing
  if (!up && !down && !left && !right) {
    right = () => { console.log('swiped right') }
    left = () => { console.log('swiped left') }
    up = () => { console.log('swiped up') }
    down = () => { console.log('swiped down') }
  }

  for (let dragee of this.stk) {
    Surf(dragee).addClass('surf-swipe');
    const container = dragee;
    container.addEventListener('touchstart', startTouch, { passive: false });
    container.addEventListener('touchmove', moveTouch, { passive: false });

    // Swipe Up / Down / Left / Right
    dragee.inititalX = null;
    dragee.initialY = null;

    function startTouch(e) {
      $(e.target).css(`left: unset; `);
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
            if (e.target.classList.contains('surf-swipe')) {
              left(e.target);
            }
          }
        } else {
          // swiped right
          if (Surf().isFunction(right)) {
            if (e.target.classList.contains('surf-swipe')) {
              right(e.target);
            }
          }
        }
      } else {
        // sliding vertically
        if (diffY > 0) {
          // swiped up
          if (Surf().isFunction(up)) {
            if (e.target.classList.contains('surf-swipe')) {
              up(e.target);
            }
          }
        } else {
          // swiped down
          if (Surf().isFunction(down)) {
            if (e.target.classList.contains('surf-swipe')) {
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
} // End swipe



// Auto initialize plugin on ready
Surf(document).ready(function() {
  //$("#stage").on("touchend", function(){
  //console.log("left");
  //});
  Surf.plugin.fn.drag = drag;
  Surf.plugin.fn.undrag = undrag;
  Surf.plugin.fn.swipe = swipe;
  Surf.plugin.fn.unswipe = unswipe;
});

