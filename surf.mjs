  /**
  * SURF for use with deno
  * (c) 2022 Bret Lowry
  * @license MIT
  * @description Surf JS (for Deno)is a JavaScript Library for Reactive Element Templates with component based rendering and an insanely small JQuery clone.
  * Note: INTERNAL tools begin with double underscores  __ and are located near where they are first used or by their use.
  * Note: Methods that begin with single underscore _  do not return this and return something else that will break a chain. The createNode method an exception to because it is used most frequently but it does break the chain.
  * Note: Similarly Methods that begin with is* return a boolean not this and will break the chain.
  * Note: To make searching for methods easier, Search for method names using all caps example: CSS or ISFUNCTION
  * @usage
  * In some other file where you want to do work:
  * Import Surf

   import { Surf } from "./surf.mjs";

  * You need to load the data you want to work on which could come from enywhere i.e. a web scrape
  * but for example: 

  let str = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Hello from Deno</title>
      </head>
      <body>
        <h1 data-h="hey there">Hello from Deno {{msg}}</h1>
      </body>
    </html>`;
 
  let $ = Surf; // to use $ like JQuery :)

  // For surf to work on anything it needs to load a document

  $().load(str); // you can call this again with different parameters to load new data. 

  // some example queries:

  p = $("h1")[0]; 
  
  let attr = $(p).attr("data-h");
  console.log(attr);
 

  * @author BRET LOWRY <bretgeek@gmail.com>
  * @constructor
  * @return object
  */

// for deno you must set up the DOMparser - see obj.load
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
globalThis.DOMParser = DOMParser;

export function Surf(itr, { allowConfig = true, allowPlugins = true } = {}) {

  // First we need to do some setup before we can hit the narly waves.


  // For setState Proxy to el.state
  const handler = {
        get: (target, key) => {
          if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], handler)
          }
          return target[key]
        },
        set: (target, prop, value) => {
          target[prop] = value
          // console.log("We have changed! "+ prop + value)
          return true
        }
      };



  // THE STACK
  let _stk = [];

  const obj = {
    first: () => {
      return _stk[0];
    },
    grab: grab,
    all: () => {
      return Surf(_stk).grab({ all: true });
    },
    stk: _stk,
    load: function(str) {globalThis.document =  new DOMParser().parseFromString( str,  "text/html");   return document  },

    createNode: _createNode,
    clone: clone,
    wrap: wrap,
    sleep: sleep,
    hidekbd: hidekbd,
    submit: submit,
    css: css,
    data: data,
    domDelay: 100,
    parents: parents,
    register: register,
    parent: parent,
    addEvent: addEvent,
    on: addEvent,
    click: click,
    off: removeEvent,
    removeEvent: removeEvent,
    isFunction: isFunction,
    isEmpty: isEmpty,
    isNumber: isNumber,
    isString: isString,
    isObject: isObject,
    isElement: isElement,
    isArray: isArray,
    scroller: scroller,
    scroll: scroll,
    scrollTo: scrollTo,
    text: text,
    html: html,
    outerHTML: outerHTML,
    attr: attr,
    addClass: addClass,
    hasClass: hasClass,
    removeClass: removeClass,
    classToggle: classToggle,
    toggle: toggle,
    removeAttr: removeAttr,
    before: before,
    insertBefore: insertBefore,
    insertAfter: insertAfter,
    after: after,
    append: append,
    prepend: prepend,
    appendTo: appendTo,
    prependTo: prependTo,
    forEvery: forEvery,
    each: each,
    detach: detach,
    ready: ready,
    delay: delay,
    applyEase: applyEase,
    animate: delay,
    trigger: trigger,
    find: find,
    children: children,
    copyright: copyright,
    reset: reset,
    set: set,
    setState: setState,
    removeState: removeState,
    startTemplate: "{{",
    endTemplate: "}}",
    _eventDispatch: _eventDispatch,
    _rpx: _rpx,
    _rect: _rect,
    _cs: _cs,
    _singleDash: _singleDash,
    _camelDash: _camelDash,
    _getAtPt: _getAtPt,
    _: _stk,
    _getstack: _getstack,
    _isTouch: _isTouch,
    _createEvent: _createEvent,
    _sfilter: _sfilter,
    _uuidv4: _uuidv4,
  };


  // Plugins
  if (allowPlugins) {
    Surf.plugin = Surf.prototype; // plugin is just a friendlier reference to prototype :)
    Surf.plugin.fn = Surf.plugin.fn || {};

    // add everything from Surf.plugin.fn  (Surf.prototype) to obj
    for (const key in Surf.plugin.fn) {
      obj[key] = obj[key] || Surf.plugin.fn[key].bind(obj); // does not overwrite existing obj keys you won't get an error so if your plugin doesn't work re-name it!
    }
  }

  // Config - so you can configure Surf external and replace anything you want!
  if (allowConfig) {
    Surf.config = Surf.prototype; // plugin is just a friendlier reference to prototype :)
    Surf.config.conf = Surf.config.conf || {};

    Surf.config.conf.loadDelay = obj.domDelay + 100;

    // add everything from Surf.config.conf (Surf.prototype) to obj
    for (const key in Surf.config.conf) {
      obj[key] = Surf.config.conf[key]; // Overwrites existing obj keys! You won't get an error so if your reak Surf it's your fault!
    }
  }

  // Debug log - Do not move! This must exist here as it is based off of conf being set
  let log = function () {
    return;
  };
  if (obj.debug) {
    log = function (str) {
      console.log(str);
    };
  }

  // Keep a list of registered components
  Surf.registered = Surf.prototype; // registered is just a friendlier reference to prototype :)
  Surf.registered.list = Surf.registered.list || {};

  // add everything from Surf.registered.list  (Surf.prototype) to obj
  for (const key in Surf.registered.list) {
    obj[key] = obj[key] || Surf.registered.list[key]; // Overwrites existing obj keys! You won't get an error so if your freak Surf it's your fault!
  }


  /* ITR */
  // itr is things to iterate over. 

  // If a function is passed in as itr then it will run once the document is ready.
  if (isFunction(itr)) {
   if(Surf.registered.list[itr.name]){
    // console.log(itr.name)
    return itr();
   }
    Surf(document).ready(itr);
    return this;
   }


  if (itr) {
    // if itr is a collection
    if (Array.isArray(itr)) {
      for (const a of itr) {
        if (a.nodeType === 1) {
          _stk.push(a);
        }
      }
    }

    // if a single element is passed
    if (itr.nodeType == 1) {
      _stk.push(itr);
    }

      // check for document
    if (itr.nodeName === "#document") {
      // log('selector name is '+itr.nodeName);
      var surfloaded = false; // yes var
      (function ready() {
        if (document.readyState != "loading") {
          surfloaded = true;
          // log('ready state');
        } else if (document.addEventListener) {
          document.addEventListener("DOMContentLoaded", function () {
            surfloaded = true;
            // log('DOM Loaded');
          });
        } else {
          document.attachEvent("onreadystatechange", function () {
            if (document.readyState != "loading") {
              surfloaded = true;
              // log('ready state');
            }
          });
        }
      })();
    }

    // Check for css selectors as strings
    if (isString(itr)) {
      itr = itr.split(",");
      itr = itr.filter((x, i, a) => a.indexOf(x) == i);
      for (const s of itr) {
        // log('s type is '+typeof(s));
        if (__isHTML(s)) {
          // log('s is html '+s);
          // log('the tagname is  '+__isHTML(s, true));
          // create the element from an html tag name which was parsed
          __procHTML(__isHTML(s, true)); // returns element from html string
        } else {
          let els;
          // if just sending in an ID this would be faster
          if (s.startsWith("#")) {
            const id = s.replace(/#/, "");
            els = document.getElementById(id);
            // log('s is '+s);
    if (els) {
            _stk.push(els);
          }
          }
          // handle classes as live HTML collection
          else if (s.startsWith(".")) {
            const cn = s.replace(/./, "");
            els = document.getElementsByClassName(cn);
            // log('cn is '+s);
            for (const el of els) {
    if (el.nodeType == 1) {
              _stk.push(el);
            }
            }
          } else {
            els = document.querySelectorAll(s);
            for (const el of els) {
    if (el.nodeType == 1) {
              _stk.push(el);
            }
            }
          }
        }
      }
    }
  } // end if itr

  /* END THE STACK */



  /* START LIBRARY FUNCTIONS */


  /**
   * sleep
   * SLEEP
   * @description sleep for ms for helping with internal browser queue
   * @return object
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }




  /**
   * setState
   * SETSTATE
   * @description set the elements named state (will add to existing html) ex. $(app).setState("hat", " I AM HAT "); clear existing html with $(app).setState("html", "");
   * @return object
   */
 function setState(name, str) { // str can be html
  for(const y of _stk){
if(isFunction(str)){
str = str(y)
 }
    y.setState.html = y.state.html || Surf(y).html();
     y.setState[name] = str;
   
        update(y);
         }
    return this;
    }

/**
   * removeState
   * REMOVESTATE
   * @description remove a named state (will update html) ex. $(app).removeState("name");
   * @return object
   */
 function removeState(st) {
  for(const y of _stk){
       delete y.state[st];
       update(y)
         }
    return this;
    }

   /** 
   * update
   * UPDATE
   * @description helper function for setState and removeState to update html with entries in el.state object (will update and overwrite existing html) ;
   * @return null
   */

      function update (y) {
        let ht = ""; 
        for (const key in y.state) {
        if(y.state.hasOwnProperty(key)){
          ht += y.state[key];
        }  
      //  console.log(key)
        }
    // console.log("ht is "+ht);
        if(ht.length){
        Surf(y).html(ht);
        }
      }


   
  let docint;

  /**
   * ready
   * READY
   * @description Run function when document is ready - it's pretty important so it's the first method.
   * @return object
   */
   function ready(fn, fallbacktime = 3000) {
    let tout;
    let inc = 1;
      docint =  setInterval( () => {
      if (surfloaded) {
        clearInterval(docint);
        clearTimeout(tout);
        // log('ran and cleared in Intv and cleared timeout');
        if (fn && isFunction(fn) && inc <= 1) {
          // dont run more than once per call
          try {
            fn();
            inc++;
          } catch (e) {
            log(e);
            throw e;
          } // throwing error here so we can troubleshoot the error
        } else {
          // should also be able to use to check if docready is true
          return true;
        }
      }
    }, 6);
    // if all else fails set surfloaded after fallbacktime (can pass it in too)
    tout = setTimeout(() => {
      // log('ran in Timeout');
      surfloaded = true;
    }, fallbacktime);
  } // end ready

  /* PUBLIC METHODS that don't return this */

  /**
   * _isTouch
   * _IStOUCH
   * @description Check if we are on a touch device.
   * @return boolean
   */
  function _isTouch() {
    return window.matchMedia("(pointer: coarse)").matches || false;
  }

  /**
   * _rect
   * _RECT
   * @description Return the number of an elements properties.
   * @return number
   */
  function _rect(el, st = false, round = false) {
    let e = el; // if el is object
    if (isString(el)) {
      e = document.querySelector(el);
    }

    const allow = [
      "x",
      "y",
      "width",
      "height",
      "right",
      "left",
      "top",
      "bottom",
    ];
    if (!allow.includes(st)) {
      return null;
    }

    const ret = e.getBoundingClientRect()[st];

    if (round) {
      return Math.round(ret);
    } else {
      return ret;
    }
  }

  /**
   * _cs
   * _CS
   * @description Return computed Styles of el.
   * @return string or number
   */
  function _cs(el, prop, trim = true) {
    if (isString(el)) {
      el = document.querySelector(el);
    }
    if (el) {
      let cs = getComputedStyle(el).getPropertyValue(prop) || null;
      if (trim) {
        try {
          cs = _rpx(cs);
        } catch (e) {
         // log(e);
          throw e;
        }
      }
      return cs;
    }
  }

  /**
   * _sfilter
   * _SFILTER
   * @description Filter out non printing chars from a string.
   * @return string
   */
  function _sfilter(str, strict = false) {
    str = str.replace(/[^\x20-\x7E]+/g, "");
    if (strict) {
      str = str.replace(/[^a-z0-9-#]+|\s+/gim, "");
    }
    str = str.trim();
    return str;
  }

  /**
   * _createNode
   * _CREATENODE
   * @description  Create a new Element and return it.
   * @return Element
   */
  function _createNode(nodetype = "div", override = true) {
    const allowedNodes = [
      "html",
      "head",
      "link",
      "meta",
      "script",
      "style",
      "title",
      "body",
      "article",
      "aside",
      "footer",
      "header",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "main",
      "nav",
      "section",
      "blockquote",
      "div",
      "figure",
      "hr",
      "li",
      "ol",
      "p",
      "pre",
      "ul",
      "a",
      "code",
      "data",
      "time",
      "em",
      "i",
      "span",
      "strong",
      "audio",
      "source",
      "img",
      "track",
      "video",
      "iframe",
      "svg",
      "canvas",
      "noscript",
      "col",
      "colgroup",
      "button",
      "option",
      "fieldset",
      "label",
      "form",
      "input",
      "select",
      "textarea",
      "menu",
      "template",
    ];

    if (!allowedNodes.includes(nodetype)) {
      if (!override) {
        // you can send in an element not in the list by setting override to true (think custom elements that are properly defined)
        nodetype = "div";
      }
    }

    const newnode = document.createElement(nodetype);
    return newnode;
  }

  /**
   * _uuidv4
   * _UUIDV4
   * @description  Create a unique uuid version 4.
   * @return string
   */
  function _uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  /**
   * hidekbd
   * HIDEKBD
   * @description Hide keyboard on touch devices.
   * @return none
   */
  function hidekbd(el) {
    if (!el) {
      for (const el of _stk) {
        setTimeout(function () {
          el.onfocus = blur(); // close the keyboard
        }, 100);
      }
    }
  }

  /**
   * _rpx
   * _RPX
   * @description Remove px, %, em from a number.
   * @return  number
   */
  function _rpx(s) {
    s = s.toString();
    s = s.replace(/px/g, "");
    s = s.replace(/%/g, "");
    s = s.replace(/em/g, "");

    s = Math.round(Number(s));

    return s;
  }

  /**
   * _getAtPt
   * _GETATPT
   * @description Get element under mouse cursor.
   * @return Element
   */
  function _getAtPt(x, y) {
    return document.elementFromPoint(x, y);
  }

  /**
   * _singleDash
   * _SINGLEDASH
   * @description Replace multiple dashes with one.
   * @return String
   */
  function _singleDash(str) {
    str = str.trim().replace(/\s/g, "-");
    str = str.replace(/-$/, "");
    str = str.replace(/^-/, "");
    str = str.replace(/-+/g, "-");
    str = str.replace(/[^a-z0-9-]+/gi, "");
    return str;
  }

  /**
   * _camelDash
   * _CAMELDASH
   * @description Return hyphenated names as camel case foo-foo becomes fooFoo.
   * @return String
   */
  function _camelDash(str) {
    str = _singleDash(str);
    return str
      .split("-")
      .reduce((a, b) => a + b.charAt(0).toUpperCase() + b.slice(1));
  }

  /**
   * _getstack
   * _GETSTACK
   * @description Return Element at stack specified by num as param.
   * @return Element
   */
  function _getstack(num) {
    // use like Surf('.butt').getstack(0);
    if (num === "all") {
      return _stk;
    } else {
      return _stk[num];
    }
  }

  /**
   * _createEvent
   * _CREATEvent
   * @description Create events.
   * @return Event
   */
  function _createEvent(str, bubbles = false, cancelable = false) {
    const evt = new Event(str, { bubbles: bubbles, cancelable: cancelable });
    // log('the event was '+evt);
    return evt;
  }

  /**
   * _dispatchEvent
   * _DISPATCHEVENt
   * @description Dispatch events - this will dispatch the event for the specified element must be valid string name for e element reference for el.
   */
  function _eventDispatch(e, el) {
    el.dispatchEvent(e);
  }

  /* END PUBLIC METHODS that don't return this */

  /* PUBLIC METHODS / TOOLS that don't break chains - may include Internal __Methods */

  /**
   * outerHTML
   * OUTERHTML
   * @description Set or return the html of an element.
   * @return html
   */
  function outerHTML() {
    let res = "";
    for (const y of _stk) {
      log(y.outerHTML);
      res += y.outerHTML;
    }
    return res;
  }

  /**
   * html
   * HTML
   * @description Set or return the html of an element.
   * @return html
   */
  function html(str = false, limit = "all") {
    // log(str)
    let res = "";
    if(isNumber(str)){
    str = str.toString();
    }
    if (!isString(str) && limit === "all") {
      // log('stk len' + _stk.length);
      for (const y of _stk) {
        res += y.innerHTML;
      }
      return res;
    }
    __htxt(str, "all");
    return this;
  }

  /**
   * text
   * TEXT
   * @description Set or return the text of an element.
   * @return text
   */
  function text(str, limit = "all") {
    let res = "";
    if(isNumber(str)){
    str = str.toString();
    }
    if (!isString(str) && limit === "all") {
      // log('stk len' + _stk.length);
      for (const y of _stk) {
        res += y.textContent;
      }
    res = res.replace(/(<([^>]+)>)/gim, "");
      return res;
    }

    __htxt(str, "all", true);
    return this;
  }

  /**
   * __htxt
   * __HTXT
   * @description Internal function to set or return the html or text of an element -  if limit is set then only do for that many times.
   * @return object
   */
  function __htxt(str, limit = "all", t = false) {
    let inc = 0;
    for (const y of _stk) {
      // because html will blow away and templates on first use we will init it
      if (!y.templateHTML) {
        __init(y);
      }
      if (isNumber(limit) && inc <= limit) {
        // log('limit '+ inc);
        inc++;
        if (t) {
          y.textContent = str;
        } else {
          y.innerHTML = str;
        }
      }
      if (limit === "all") {
        if (t) {
          y.textContent = str;
        } else {
          y.innerHTML = str;
        }
      }
    }
    return this;
  }

  /**
   * _procHTML
   * @description INTERNAL tool to turn HTML string into nodes and push them onto the stack takes an array s of [tagname, innerHTML].
   * @return none
   */
  function __procHTML(s, r = false) {
    // create a wrapper so we can turn HTML string into a node
    // log('tag name is '+ s[0]);
    const el = document.createElement(s[0]);
    el.innerHTML = s[1];
    // get the class
    let s2 = s[2];
    if (s[2] ) {
    // console.log('s2 is '+ s[2]);
    // console.log("s2 len "+s2.length);
    if(s2.length == 1){ // added this fix to prevent a singular empty class attribute from appearing in the dom when no class is passed with html strings.
      el.classList = s[2];
    }
    }
    //get the id
    if (s[3]) {
     console.log('s3 is '+ s[3]);
      el.id = s[3];
    }

    if (r) {
      return el;
    } else {
      _stk.push(el); // push el onto stack
    }
  }

  /**
   *  __isHTML
   * @description Internal too for checking if string is HTML.
   * @return object
   */
  function __isHTML(str, t = false) {
    // if t is true return the tag name
    const doc = new DOMParser().parseFromString(str, "text/html");
    if (t) {
      return [
        doc.body.childNodes[0].tagName.toLowerCase(),
        doc.body.childNodes[0].innerHTML,
        doc.body.childNodes[0].classList,
        doc.body.childNodes[0].id,
      ];
    } else {
      return Array.from(doc.body.childNodes).some(
        (node) => node.nodeType === 1
      );
    }
  }

  /**
   * data
   * DATA
   * @description Get or set data attributes of a node.
   * @return String
   */
  function data(a, b = false, r = "set") {
    b = _singleDash(b);
    for (const y of _stk) {
      if (r === "remove") {
        y.removeAttribute("data-" + a);
      }
      if (r === "set") {
        y.setAttribute("data-" + a, `${b}`);
      }

      if (r === "get") {
        return y.getAttribute("data-" + a);
      }
    }
  }

  /**
   * click
   * CLICK
   * @description click event only.
   */
  function click(fn) {
    for (const y of _stk) {
      Surf(y).on("click", function (e) {
          fn = fn.bind(y);// this can be used from fn
        fn(e);
      });
    }
    return this;
  }

  /**
   * addEvent
   * ADDEVENT
   * @description Add events to an elements on the stack.
   */
  function addEvent(etype = "mousedown", handler, cap = false) {
    let userCap = cap;
    // log(typeof(cap));
    // if cap is sent in as boolean then set capture to true
    if (typeof cap === "boolean") {
      if (cap) {
        userCap = { capture: true };
      } else {
        userCap = { capture: false };
      }
    }
    
     if(cap === 'passive'){

        userCap = { passive: true };
     }
     if(cap === 'notpassive'){

        userCap = { passive: false };
     }


    // note do e.preventDefault() in the handlier
    const types = etype.split(",");
    for (const y of _stk) {
      // log('stack');
      for (let t of types) {
        // let here instead of const because t is immediately mutated
        t = t.trim();
        y.addEventListener(t, handler, userCap);

        // In order for clone  recreate the events when we save
        // the events to _e {}  on the element itself
        // These are deleted in  off()
        y._e = y._e || {};
        y._e[t] = y._e[t] || [];
        y._e[t].push({
          //selector: y, // not sure if we even need  this
          cap: userCap,
          evt: t,
          callback: handler,
        });
        // log('added event object '+ y._e)
      }
    }
    return this;
  }

  /**
   * removeEvent
   * REMOVEEVENT
   * @description Remove events from elements on the stack -  removes all occurrences of etype i.e 'click'.
   */
  function removeEvent(etype = "mousedown") {
    const types = etype.split(",");
    for (const y of _stk) {
      for (let t of types) {
        t = t.trim();

        // key the events off of clonee
        if (isObject(y._e)) {
          const keys = Object.keys(y._e);
          for (let k of keys) {
            //  log(k)
            //  log('off '+y._e[k][0])
            //  log('click '+ y._e[k][0].evt)
            //  log(y._e[k][0].callback)
            delete y._e[k][t];
            y.removeEventListener(t, y._e[k][0].callback, y._e[k][0].cap);
          }
        }
      }
    }
    return this;
  }

  /**
   * trigger
   * TRIGGER
   * @description Trigger the event e for all of the stack.
   * @return Object
   */
  function trigger(e) {
    for (const y of _stk) {
      const ev = new Event(e);
      y.dispatchEvent(ev, { bubbles: true, cancelable: true });
    }
    return this;
  }

  /**
   * register
   * REGISTER
   * @description Register a component.
   * @return Boolean
   */
  function register(fn, props) {
    props = props || {};
    let name = props.name || fn.name; // if props.name is sent in then use that as the component name otherwise use fn.name
    if (fn.name) {
      Surf.registered.list[name] =
        Surf.registered.list[name] ||
        function (props) {
          let f = fn(props);
          return f;
        }; // does not overwrite existing
    }
    return true;
  }

  /**
   * scroller
   * SCROLLER
   * @description Scroll to bottom of el.
   */
  function scroller(el) {
    el.scrollTop = el.scrollHeight;
  }

  /**
   * scrollTo
   * SCROLLtO
   * @description Scroll to element "to".
   * @return Object
   */
  function scrollTo(to) {
    if (isString(to)) {
      to = document.querySelectorAll(to)[0];
    } else {
      to = _stk[0];
    }
    to.scrollIntoView();
    return this;
  }

     /**
   * scroll
   * SCROLL
   * @description Run fn on window load
   * @return this
   */
  function scroll(fn) {
    if (isFunction(fn)) {
      window.addEventListener("scroll", fn, true);
    }
    return this;
  }


  
  /**
   * removeAttr
   * REMOVEAttr
   * @description Remove attribute str.
   * @return Object
   */
  function removeAttr(str) {
    attr(str, false, true);
    return this;
  }

  /**
   * attr
   * ATTR
   * @description Set or get attribute.
   * @return String
   */
  function attr(str, s = false, r = false) {
    if (str && isString(str)) {
      if (r) {
        for (const y of _stk) {
          y.removeAttribute(str);
        }
        return this;
      }

      if (isString(s) || typeof s === "number") {
        for (const y of _stk) {
          y.setAttribute(str, s);
        }
        return this;
      }
      if (!s) {
        const a = _stk[0].getAttribute(str);
        return a;
      }
    }
  }



  /**
   * submit
   * SUBMIT
   * @description Submit a form.
   * @return Object
   */
  function submit() {
        for (const y of _stk) {
          if(y.tagName === 'FORM'){
            y.submit();
           } 
        }
        return this;
      }



  /**
   * __dumpCSS
   * @description Internal function to get CSS of el.
   * @return String
   */
  function __dumpCSS(el) {
    let s = "";
    const o = getComputedStyle(el);
    for (let i = 0; i < o.length; i++) {
      if (o.getPropertyValue(o[i]).length) {
        s += o[i] + ":" + o.getPropertyValue(o[i]) + ";";
      }
    }
    return s;
  }

  /**
   * css
   * CSS
   * @description Set or Get CSS of elements of stack.
   * @return String or Object
   */
  function css(str, overwrite = false) {
    // set 2nd param to true to over write the css
    if (!overwrite && !str) {
      let style;
      for (const y of _stk) {
        style += __dumpCSS(y);
        // log('css for '+y);
      }
      return style;
    }

    if (!overwrite) {
      // log(str);
      for (const y of _stk) {
        y.style.cssText = y.style.cssText + str;
      }
    } else {
      for (const y of _stk) {
        y.style.cssText = str;
      }
    }
    return this;
  }



  /**
   * runq
   * RUNQ
   * @description Run the delay queue - i.e. run all queued functions in individual elements.q delay array.
  */  
  function runq(el, done){
    // console.log('el.len = '+ el.q.length)

    // if a subsequent cancel request comes in clear the q
    if(el.cancel){
     //  console.log('cancelled')
      el.cancel = false; // so next calls to delay can run
      el.q = [];
      if(isFunction(done)){
       done(el);
      }
    return;
    }

    if(!el.qisrun){
      if(el.q.length){
        el.qisrun = true;
        el.q[0]();
      
      }

         // frame number is only useful when using fps and can be accessed on element.frame
        el.frame = el.frame + 1 || 1;

 
      if(el.q.length == 0){
      el.frame = 1;
      if(isFunction(done)){
      done(el);
      }
      }
    }
 }



  /**
   * delay
   * DELAY
   * @description Execute function for every element in _stk after a delay.
   * @return {object}
   * @usage

   New delay with iteratations and queue.

   Iteration Example: $().delay({time: 1000, itr: 3, fn: ()=> {   console.log('I ill run every second for 3 times ' )  } });
   OR: to get the iterator and element - $().delay({time: 1000, itr: 3, fn: (e,i)=> {   console.log(i )  } })

   USING THE DELAY QUEUE

   If a delay fn sets cancel , delay will cancel future calls within a chain after first run of delay that is called. If delay is cancelled in the chain then delay queue will empty and die after first run of first chained delay

   Example: - runs until after first iteration of second delay because fn calls delay with a cancel flag
   $('#app').delay({time: 1000, itr: 3, fn: (e,i)=> {   console.log(i )  } }).delay({time: 500, itr: 4, fn: (e,i)=> {  $(e).delay({cancel: true });  console.log(i +' in delay two' )  } })

   Example: runs first delay once despite what second call to delay does because delay is canclled on the chain
   $('#app').delay({time: 1000, itr: 3, fn: (e,i)=> {   console.log(i )  } }).delay({time: 500, itr: 4, fn: (e,i)=> {  $(e).delay({cancel: true });  console.log(i +' in delay two' )  } }) . delay({cancel: true });
   */

  function delay({time = 300, itr = 1, infinity=false, fps=false, endTime=false, fn = ()=>{ }, done = false, cancel=false } = {}  ){

    // if no element passed in create a dummy
    let dum = false ;
    if(_stk.length == 0){
      let dum = Surf().createNode('div');
      _stk.push(dum)
    }
    let inc = 0
    for(const y of _stk){
      y.q = y.q || [];
      y.qisrun = y.qisrun || false;

      // If an endTime passed in (with no fps) caclulate approximated iterations based time. For instance if you only want to run delay for a period of time. It's up to the user to mkae sure endTime is divisible evenly by time.
      if(isNumber(endTime)){
        infinity = false;// no infinity while using endTime
        // calculate iterations based on endTime 
        if(endTime < time){ // endTime must be >= time
          endTime = time;
        }
        let newitr = Math.round(endTime / time);
        if(newitr < 1){
          itr = 1;
        }else{
          itr = newitr
             }
      }
  
       if(infinity){
       itr = 1;
       }



    // FPS and FPS with endTime  
    // exampless : $('#app').delay({ fps: 24, endTime: 2000, fn: (e,i,inc)=> {   console.log('foo'+inc )  } });
    // OR:  $('#app2').delay({ fps: 24, endTime: 5000, fn: (e,i,inc)=> {   console.log('foo 2 '+inc )  } }); 
    // Using fps - if fps is passed in means this delay call will run until cancelled fps (N frames per second)
    if(isNumber(fps)){
      infinity = true; 
      time = Math.round(1000/fps);
      itr = 1;
       // If endTime is used with fps then cancel after endTime
      if(isNumber(endTime)){
       // Cancel and clear queue after endTime 
       let et = setInterval(() => { Surf(y).delay({cancel: true, fps: false, endTime: false}); clearInterval(et)}, endTime);
       }
    }

    


     // If a subsequent cancel request comes in clear the q
       if(cancel){
         y.cancel = true;
         runq(y, done);
       }
   for( let i = 1; i <= itr; i++){
    
    if(!cancel){ 
      y.q.push(
        () => {    
          let inv;
            inv = setInterval( function() {
              // run until cancel flag is truthy  - so send in a string name here to keep unique
              inc++;
             let options = {el: y, i: i, inc: inc};  // el is the element of stack (y) - i is iterator passed to fn - inc for total times ran .
                // call with fnName(options), anotherParam='foo' { // use options.el, options.i, options.inc    } 
                // To send in additional dynamically changing  parameters after options, wrap the function call like    fn: (options) => { afunc(options, anotherDynamicParam) } }) 
             fn = fn.bind(y);
               fn(options);
                  y.qisrun = false;
                  if(!infinity){
                  y.q.shift();
                   }
                  runq(y, done);
                  //inv.clear();
                  clearInterval(inv);
                  }, time);

              }
      );// end q.push
   }


    if(!y.qisrun){
     runq(y, done);
    }

      }// end for
    } // end stk for
  if(dum){
    dum.remove();
  }
  return this
  }


   /**
   * applyEase
   * APPLYEASE
   * @description Easing utility function
   * @return {number}
   */

    /*
    // EXAMPLE USAGE
     function ez(e){
       let flux = $().applyEase(e, {ease: 'bow', time: 1700}); // raise or lower time for different speeds of effect - the higher the number the slower it moves

       $(e).css(`position: relative; left:  ${ 1 + Math.round(flux * 100)}px; `)
     }

     let logo = $('.logo')[0];
     $(logo).delay({ time: 10, itr: 100, done: stagedone,  fn: ez });
     */
   
   function applyEase(e, { ease='backInOut', speed=1000}={}){
     //console.log(e)
     let easer = getEase(ease);
     let curtime = performance.now();
     let start = e.start || performance.now();
     e.start = e.start || start
     let timeFraction = (curtime - e.start) / speed;
        if (timeFraction > 1) {
          e.start = performance.now();
          timeFraction = 1;
        }
     let flux = easer(timeFraction);
        //console.log('flux '+flux);
      

       /**
       * getEase
       * @description Easing utility function
       * @return {number}
       */
      function getEase(str) {
        const ease = {
          quad: quad,
          quadIn: quadIn,
          linear: linear,
          bounceOut: bounceOut,
          bounceInOut: bounceInOut,
          bounceIn: bounce,
          quadOut: quadOut,
          quadInOut: quadInOut,
          quinticIn: quinticIn,
          easeOutBounce: easeOutBounce,
          quinticOut: quinticOut,
          quinticInOut: quinticInOut,
          exponentialIn: exponentialIn,
          exponentialOut: exponentialOut,
          exponentialInOut: exponentialInOut,
          elasticInOut: elasticInOut,
          elasticIn: elasticIn,
          elasticOut: elasticOut,
          cubic: cubic,
          circularIn: circularIn,
          circularOut: circularOut,
          circularInOut: circularInOut,
          backIn: backIn,
          backOut: backOut,
          backInOut: backInOut,
          bow: bow.bind(null, 5.5),
        };

        return ease[str] || linear;
      } //end getEase

       /**
       * quad
       * @description Easing utility function
       * @return {number}
       */
      function quad(timeFraction) {
        return Math.pow(timeFraction, 2);
      }




       /**
       * easeOutBounce
       * @description Easing utility function
       * @return {number}
       * https://easings.net/
       */
      function easeOutBounce(timeFraction) {
        //return Math.pow(timeFraction, 2);
        let x = timeFraction
          const n1 = 7.5625;
          const d1 = 2.75;

        if (x < 1 / d1) {
          return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
          return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
          return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
      }



       /**
       * makeEaseOut
       * @description Easing utility function
       * @return {number}
       */       
      function makeEaseOut(timing) {
        return function (amt) {
          return 1 - timing(1 - amt);
        };
      }

       /**
       * bounce
       * @description Easing utility function
       * @return {number}
       */
      function bounce(amt) {
        /* eslint-disable */ 
        for (let a = 0, b = 1; 1; a += b, b /= 2) {
          if (amt >= (7 - 4 * a) / 11) {
            return -Math.pow((11 - 6 * a - 11 * amt) / 4, 2) + Math.pow(b, 2);
          }
        }
        /* eslint-enable */ 
      }

      var bounceOut = makeEaseOut(bounce);// must hoist

       /**
       * makeEaseInOut
       * @description Easing utility function
       * @return {number}
       */
      function makeEaseInOut(timing) {
        return function (amt) {
          if (amt < 0.5) {
            return timing(2 * amt) / 2;
          } else {
            return (2 - timing(2 * (1 - amt))) / 2;
          }
        };
      }

      var bounceInOut = makeEaseInOut(bounce);

      /**
       * bow
       * @description Easing utility function
       * @return {number}
       */
      function bow(x, amt) {
        return Math.pow(amt, 2) * ((x + 1) * amt - x);
      }

      /**
       * cubic
       * @description Easing utility function
       * @return {number}
       */
      function cubic(amt) {
        return Math.pow(amt, 5);
      }

      /**
       * quadIn
       * @description Easing utility function
       * @return {number}
       */
      function quadIn(amt) {
        return amt * amt;
      }

   /**
       * quadOut
       * @description Easing utility function
       * @return {number}
       */
      function quadOut(amt) {
        return amt * (2 - amt);
      }

    /**
       * quadInOut
       * @description Easing utility function
       * @return {number}
       */
      function quadInOut(amt) {
        if ((amt *= 2) < 1) {
          return 0.5 * amt * amt;
        }
        return -0.5 * (--amt * (amt - 2) - 1);
      }

      /**
       * exponentialIn
       * @description Easing utility function
       * @return {number}
       */
      function exponentialIn(amt) {
        return amt === 0 ? 0 : Math.pow(1024, amt - 1);
      }

      /**
       * exponentialOut
       * @description Easing utility function
       * @return {number}
       */
      function exponentialOut(amt) {
        return amt === 1 ? 1 : 1 - Math.pow(2, -10 * amt);
      }
 /**
       * exponentialInOut
       * @description Easing utility function
       * @return {number}
       */
      function exponentialInOut(amt) {
        if (amt === 0) {
          return 0;
        }
        if (amt === 1) {
          return 1;
        }

        if ((amt *= 2) < 1) {
          return 0.5 * Math.pow(1024, amt - 1);
        }
        return 0.5 * (-Math.pow(2, -10 * (amt - 1)) + 2);
      }

      /**
       * elasticOut
       * @description Easing utility function
       * @return {number}
       */
      function elasticOut(amt) {
        if (amt === 0) {
          return 0;
        }

        if (amt === 1) {
          return 1;
        }
        return Math.pow(2, -10 * amt) * Math.sin((amt - 0.1) * 5 * Math.PI) + 1;
      }

      /**
       * elasticIn
       * @description Easing utility function
       * @return {number}
       */
      function elasticIn(amt) {
        if (amt === 0) {
          return 0;
        }
        if (amt === 1) {
          return 1;
        }

        return (
          -Math.pow(2, 10 * (amt - 1)) * Math.sin((amt - 1.1) * 5 * Math.PI)
        );
      }

     /**
       * elasticInOut
       * @description Easing utility function
       * @return {number}
       */
      function elasticInOut(amt) {
        if (amt === 0) {
          return 0;
        }

        if (amt === 1) {
          return 1;
        }

        amt *= 2;
        if (amt < 1) {
          return (
            -0.5 *
            Math.pow(2, 10 * (amt - 1)) *
            Math.sin((amt - 1.1) * 5 * Math.PI)
          );
        }

        return (
          0.5 *
            Math.pow(2, -10 * (amt - 1)) *
            Math.sin((amt - 1.1) * 5 * Math.PI) +
          1
        );
      }

      /**
       * backIn
       * @description Easing utility function
       * @return {number}
       */
      function backIn(amt) {
        const s = 1.70158;
        return amt === 1 ? 1 : amt * amt * ((s + 1) * amt - s);
      }

 /**
       * backOut
       * @description Easing utility function
       * @return {number}
       */
      function backOut(amt) {
        const s = 1.70158;
        return amt === 0 ? 0 : --amt * amt * ((s + 1) * amt + s) + 1;
      }

      /**
       * backInOut
       * @description Easing utility function
       * @return {number}
       */
      function backInOut(amt) {
        const s = 1.70158 * 1.525;
        if ((amt *= 2) < 1) {
          return 0.5 * (amt * amt * ((s + 1) * amt - s));
        }
        return 0.5 * ((amt -= 2) * amt * ((s + 1) * amt + s) + 2);
      }

      /**
       * circularIn
       * @description Easing utility function
       * @return {number}
       */
      function circularIn(amt) {
        return 1 - Math.sqrt(1 - amt * amt);
      }

      /**
       * circularOut
       * @description Easing utility function
       * @return {number}
       */
      function circularOut(amt) {
        return Math.sqrt(1 - --amt * amt);
      }
 /**
       * circularInOut
       * @description Easing utility function
       * @return {number}
       */
      function circularInOut(amt) {
        if ((amt *= 2) < 1) {
          return -0.5 * (Math.sqrt(1 - amt * amt) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (amt -= 2) * amt) + 1);
      }

      /**
       * quinticIn
       * @description Easing utility function
       * @return {number}
       */
      function quinticIn(amt) {
        return amt * amt * amt * amt * amt;
      }

      /**
       * quinticOut
       * @description Easing utility function
       * @return {number}
       */
      function quinticOut(amt) {
        return --amt * amt * amt * amt * amt + 1;
      }

      /**
       * quinticInOut
       * @description Easing utility function
       * @return {number}
       */
      function quinticInOut(amt) {
        if ((amt *= 2) < 1) {
          return 0.5 * amt * amt * amt * amt * amt;
        }
        return 0.5 * ((amt -= 2) * amt * amt * amt * amt + 2);
      }


      /**
       * linear
       * @description Easing utility function
       * @return {number}
       */
 
    function linear(amt) {
        return amt;
      }

  return flux;
  } // end applyEase



  /**
   *  classToggle
   *  CLASSToggle
   * @description Toggle class (add or remove) on elements of stack.
   * @return Object
   */
  function classToggle(str) {
    if (isString(str)) {
      for (const y of _stk) {
        y.classList.toggle(str);
      }
    }
    return this;
  }

  /**
   * toggle
   * TOGGLE
   * @description Toggle visibility of elements on stack.
   * @return Object
   */
  function toggle(dtype = false) {
    for (const s of _stk) {
      if (!s.matches("body")) {
        // no toggling on the body in case the selector is invalid
        let hid = false;

        if (s.style.opacity && Number(s.style.opacity) < 0.1) {
          hid = true;
        }

        if (s.style.visibility === "hidden") {
          hid = true;
        }

        const disp = getComputedStyle(s).display;
        if (s.style.display === "none" || disp === "none") {
          hid = true;
        }

        if (hid) {
          s.style.visibility = "visible";
          s.style.opacity = 1;
          s.style.display = disp;
        }

        if (!hid) {
          s.style.opacity = 0;
          s.style.visibility = "hidden";
          s.style.display = disp;
            
        }
        // dtype with be forced if set
        if(dtype){
          s.style.display = dtype;
         }
      }
    }

    return this;
  }

  /**
   * after
   * AFTER
   * @description Insert elements or html strings after elements in stack using internal __beforeOrAfter method.
   * @return Object
   */

  function after(str) {
    __beforeOrAfter(str);
    return this;
  }

  /**
   * before
   * BEFORE
   * @description Insert elements in stack before str using internal __beforeOrAfter method.
   * @return Object
   */
  function before(str) {
    __beforeOrAfter(str, true);
    return this;
  }

  /**
   * insertBefore
   * INSERTBEFORE
   * @description Insert elements or html strings before elements in stack using internal __beforeOrAfter method.
   * @return Object
   */
  function insertBefore(str) {
    __beforeOrAfter(str, true, true);
    return this;
  }

  /**
   * insertAfter
   * INSERTAFTER
   * @description Insert elements or html strings after elements in stack using internal __beforeOrAfter method.
   * @return Object
   */
  function insertAfter(str) {
    __beforeOrAfter(str, false, true);
    return this;
  }

  /**
   * __beforeOrAfter
   * @description  Internal method for positional DOM insertion
   * @return Object
   */
  function __beforeOrAfter(str, p = false, I = false) {
    for (const y of _stk) {
      if (isString(str)) {
        // only append to first one found
        let to;
        if (__isHTML(str)) {
          to = __procHTML(__isHTML(str, true), true);
          if (!to) {
            break;
          } // break out of for if to does not exist
        } else {
          to = document.querySelectorAll(str)[0];
          if (!to) {
            break;
          } // break out of for if to does not exist
        }
        if (p) {
          if (I) {
            to.before(y);
          } else {
            y.before(to);
          }
        } else {
          if (I) {
            to.after(y);
          } else {
            log(to);
            y.after(to);
          }
        }
      }
      if (str.nodeType && str.nodeType == 1) {
        if (p) {
          if (I) {
            str.before(y);
          } else {
            y.before(str);
          }
        } else {
          if (I) {
            str.after(y);
          } else {
            y.after(str);
          }
        }
      }
      return this;
    }
  }

  /**
   * append
   * APPEND
   * @description Append elements or html strings to elements of stack.
   * @return Object
   */
  function append(str, p = false) {
    if (!str) {
      return this;
    }
    // log('type of str '+ typeof(str));
    for (const y of _stk) {
      if (isString(str)) {
        // only append to first one found
        let el;
        if (__isHTML(str)) {
          el = __procHTML(__isHTML(str, true), true);
        } else {
          el = str;
        }
        if (p) {
          y.prepend(el);
        } else {
          y.append(el);
        }
      } else {
        if (p) {
          y.prepend(str);
          // log('prepending');
        } else {
          y.append(str);
          // log('not prepending');
        }
      }
    }
    return this;
  }

  /**
   * prepend
   * PREPEND
   * @description Prepend elements or html strings to elements of stack.
   * @return Object
   */
  function prepend(str) {
    if (!str) {
      return this;
    }
    append(str, true);
    return this;
  }

  /**
   * prependTo
   * PREPENDTO
   * @description Append elements or html strings to first element of param.
   * @return Object
   */
  function prependTo(str) {
    if (!str) {
      return this;
    }

    __To(str, true);
    return this;
  }

  /**
   * appendTo
   * APPENDTO
   * @description Append elements or html strings to first element of param.
   * @return Object
   */
  function appendTo(str) {
    if (!str) {
      return this;
    }

    __To(str);
    return this;
  }

  /**
   *  __To
   * @description Internal function for DOM insertion.
   * @return Object
   */
  function __To(str, p = false) {
    for (const y of _stk) {
      if (isString(str)) {
        // only append to first one found
        const to = document.querySelectorAll(str)[0];
        if (!to) {
          return this;
        }
        if (p) {
          to.prepend(y);
        } else {
          to.append(y);
        }
      }
      if (str.nodeType && str.nodeType == 1) {
        if (p) {
          str.prepend(y);
        } else {
          str.append(y);
        }
      }
      return this;
    }
  }

  /**
   * parent
   * PARENT
   * @description PARENT for each element in the stack put each direct parent on the stack and subsequent chains will act on the parents - if You want to return the collection chain with ._ or .first or all() to return the first parent of the stack.
   * @return Object
   */
  function parent() {
    let nstk = []; // the new stack
    for (const y of _stk) {
      nstk.push(y.parentElement);
      // log(y.parentElement.classList);
    }
    if (nstk.length) {
      // log('GOT nstk');
      nstk = nstk.filter((x, i, a) => a.indexOf(x) == i);
      _stk = nstk.slice(0);
      obj._ = _stk;
      obj.first = _stk[0];
      // make stack unique  since elements could have the same parent
    }
   _restack();
    return this;
  }

  /**
   * parents
   * PARENTS
   * @description Run fn against parents of elements on stack or that match matchsel param then push all found parents to new stack.
   * @return Object
   */
  function parents(fn = false, matchsel = false) {
    // if matchsel then only operate on matches
    // if fn is a function run fn against all parents[done];
    // if fn is not a function(maybe bool) push all parents to an array and replace the _stk with the new array (nstk)  of parents so that we the next chained functions will operate on them (like css or text or html etc)
    const nstk = []; // the new stack

    if (matchsel) {
      for (const y of _stk) {
        let els = y;
        while ((els = els.parentElement)) {
          if (els.matches(matchsel)) {
            nstk.push(els);
          }
        }
      }
    }

    if (!matchsel) {
      for (const y of _stk) {
        let els = y;
        while ((els = els.parentElement)) {
          nstk.push(els);
        }
      }
    }
    // if nstk has anything in it then replace the _stk with the new stack of parents so that subsequent chains act upon the parents
    if (nstk.length) {
      _stk = nstk.slice(0);

      // make stack unique  since elements could have the same parent
      _stk = _stk.filter((x, i, a) => a.indexOf(x) == i);
      obj._ = _stk; // update _ function to reflect new _stk
      obj.first = _stk[0];
      if (isFunction(fn)) {
        for (const y of _stk) {
          fn = fn.bind(y);// this can be used from fn
          fn(y);
        }
      }
    }
    return this;
  }

  /**
   * children
   * CHILDREN
   * @description Finds only direct children of elements on stack but children.children will keep going if first in chain is true.
   * str can be singular selector, nothing or comma delim list of selectors, fn if passed in will run on each found child
   * @return Object
   */
  function children(str = false, fn = false) {
    // str can be comma delim list of selectors to match
    let starr = [];
    if (isString(str)) {
      starr = str.split(",");
    }
    // log('starr is '+starr);
    const carr = []; // the children array
    for (const y of _stk) {
      const c = y.children; // a collections of child nodes for each item on the stack;
      // each item on the stacks children are pushed to carr array
      for (let i = 0; i < c.length; i++) {
        if (starr.length) {
          for (const a of starr) {
            if (c[i].matches(a)) {
              carr.push(c[i]);
              // log(c[i].classList);
            }
          }
        }
        // no selectors just get all children
        else {
          carr.push(c[i]);
        }
      }
    } // end outer for

    // we got some so change the stack
    if (carr.length) {
      _stk = carr.slice(0);

      // if a function was passed execute it for every element of the new stack
      if (isFunction(fn)) {
        for (const y of _stk) {
          fn = fn.bind(y);// this can be used from fn
          fn(y);
        }
      }
    }

    if (!carr.length) {
      // return false; // this was set to stop the stack being changed when no children were found but that causes errors so..
      // instead of returning false create a fake node but never add it to the document it so chaining still works
      const faux = _createNode("span");
      _stk = [faux];
      faux.remove();
    }

   _restack();
    return this;
  }

  /**
   * find
   * FIND
   * @description  Find elements within elements of stack...can pass in a selector that is valid to querySelectorAll or a singular element
   * @return Object
   */
  function find(str, fn = false) {
    const farr = []; // the found array
    let type = "s";
    if (isElement(str)) {
      type = "o";
    }
    for (const y of _stk) {
      // fn(y);
      if (type != "o") {
        const sel = y.querySelectorAll(str);
        for (const s of sel) {
          // log(s.classList);
          farr.push(s);
        }
      } // end is selector
      // if an actual object element was sent in
      else {
        for (const y of _stk) {
          if (y.contains(str)) {
            farr.push(str);
          }
        }
      }
    } // end for

    // we got some so change the stack
    if (farr.length) {
      _stk = farr.slice(0);
      obj._ = _stk;
      obj.first = _stk[0];
      // if a function was passed execute it for every element of the new stack
      if (isFunction(fn)) {
        for (const y of _stk) {
          fn = fn.bind(y);// this can be used from fn
          fn(y);
        }
      }
    }

    if (!farr.length) {
      // return false; // this was set to stop the stack being changed when no children were found but that causes errors so..
      // instead of returning false create a fake node but never add it to the document it so chaining still works
      const faux = _createNode("span");
      _stk = [faux];
      obj._ = _stk;
      obj.first = _stk[0];
      faux.remove();
    }
   _restack();
    return this;
  }

  /**
   * forEvery
   * FOREVERY
   * @description Run fn against every element in stack that matches str.
   * @return Object
   */
  // FOREVERY
  function forEvery(str, fn) {
    for (const y of _stk) {
      // log(str);
      if (y.matches(str)) {
        if (isFunction(fn)) {
          fn = fn.bind(y);// this can be used from fn
          fn(y);
        }
      }
    }
    return this;
  }

  /**
   * grab
   * GRAB
   * @description Return either all or singular elements from stack to retain a reference usually by variable assignment.
   * @return Object
   */
  function grab({ all = false, fn = false } = {}) {
    if (isFunction(fn)) {
      for (const y of _stk) {
          fn = fn.bind(y);// this can be used from fn
        fn(y);
      }
    }

    if (all) {
      return _stk;
    } else {
      return _stk[0];
    }
  }

  /**
   * each
   * EACH
   * @description Run fn against every element in stack.
   * @return Object
   */
  function each(fn) {
    if (isFunction(fn)) {
      for (const y of _stk) {
          fn = fn.bind(y);// this can be used from fn
        fn(y);
      }
    }
    return this;
  }

  /**
   * detach
   * DETACH
   * @description Remove elements of stack from DOM.
   * @return Object
   */
  function detach() {
    for (const y of _stk) {
     if(y){  y.remove(); }
    }
    return this;
  }



  /**
   * hasClass
   * HASCLASS
   * @description Does first element have str as class?.
   * @return Boolean
   */
  function hasClass(str){
    if(_stk[0].classList.contains(str)){
      return true;
    }else{
      return false;
    }
  }


  /**
   * addClass
   * ADDCLASS
   * @description Add class of param s to all elements of stack.
   * @return Object
   */
  function addClass(s, r = false) {
    for (const y of _stk) {
      if (!r) {
        y.classList.add(s);
      } else {
        // log('I should remove class');
        y.classList.remove(s);
      }
    }
    return this;
  }

  /**
   * removeClass
   * REMOVECLASS
   * @description remove class of param s from all elements of stack.
   * @return Object
   */
  // removeClass
  function removeClass(s) {
    addClass(s, true); // call addClass with remove option
    return this;
  }

  /**
   * clone
   * CLONE
   * @description Clone what is on the stack - if true clone events too.
   * @return object
   */
  function clone(deep = false, { events = false } = {}) {
    let newstk = [];
    for (const y of _stk) {
      let newel = y.cloneNode(deep);

      if (events) {
        // key the events off of clonee
        if (isObject(y._e)) {
          const keys = Object.keys(y._e);
          for (let k of keys) {
            // log(k)
            // log(y._e[k][0])
            // log(y._e[k][0].evt)
            // log(y._e[k][0].callback)
            Surf(newel).on(y._e[k][0].evt, y._e[k][0].callback, y._e[k][0].cap);
          }
        }
      } // end if events

      if (newel.id) {
        // then you must change it
        let newid = _uuidv4();
        newel.id = newel.id + "-clone-" + newid;
      }
      newstk.push(newel);
    }
    _stk = newstk; // now future chains will be operate on the new stack
    // log(newstk)
    return this;
  }

  /**
   * wrap
   * WRAP
   * @description wrap elements in html strings.
   * @return object
   */
  function wrap(str) {
    for (const y of _stk) {
      let ins = Surf(str).first();
      Surf(ins).insertAfter(y);
      Surf(y).appendTo(ins);
    }
    return this;
  }

  /**
   * isString
   * ISSTRING
   * @description Check if param is of type string.
   * @return Boolean
   */
  function isString(thing) {
    return typeof thing === "string";
  }

  /**
   * isFunction
   * ISFUNCTION
   * @description Check if param is of type function.
   * @return Boolean
   */
  function isFunction(thing) {
    return typeof thing === "function";
  }

  /**
   * isNumber
   * ISNUMBER
   * @description Check if param is of type Number.
   * @return boolean
   */
  function isNumber(value) {
    return /^-{0,1}\d+$/.test(value);
  }

  /**
   * isEmpty
   * ISEMPTY
   * @description Check if param is an empty opject.
   * @return  boolean
   *
   */
  function isEmpty(obj) {
    if (Object.keys(obj).length === 0 && obj.constructor === Object) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * isObject
   * ISOBJECT
   * @description Check if parameter is an object.
   * @return boolean
   */
  function isObject(thing) {
    if (Object.prototype.toString.call(thing).slice(8, -1) === "Object") {
      return true;
    } else {
      return false;
    }
  }

  /**
   * copyright
   * COPYRIGHT
   * @description Console log the copyright.
   * @return this
   */
  function copyright() {
    log("COPYRIGHT Bret Lowry 6/6/2022");
    return true;
  }

  /**
   * isElement
   * ISELEMENT
   * @description Check if parameter is a DOM element.
   * @return boolean
   */
  function isElement(thing) {
    return thing.nodeType == 1;
  }

  /**
   * isArray
   * ISARRAY
   * @description Check if param is of type Array.
   * @return Object
   */
  function isArray(thing) {
    if (Array.isArray(thing)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * set
   * SET
   * @description Set template string in object opts to new values.
   * @return Object
   */
  function set(opts, concat = false) {
    for (let y of _stk) {
      if (isObject(opts)) {
        const keys = Object.keys(opts);
        for (let k of keys) {
          // re-init just incase it hasn't been initted yet
          if (!y[k]) {
            __init(y);
          }
          if (isFunction(y[k])) {
            // if passed in set change is a node from a registered component then add it to the spot the template is
            if (opts[k].nodeType == 1) {
              let thisnode = opts[k];
              // log('replace template with node '+thisnode)
              let tnodeid = Surf()._uuidv4();
              let tnode = `<span id='${tnodeid}'>tid</span>`;
              // log('tnode is '+tnode)
              y[k](tnode, concat);
              // A delay is needed to make this work!
              Surf().delay({
                time: obj.domDelay,
                fn: () => {
                  Surf(`#${tnodeid}`)
                    .first()
                    .replaceWith(Surf(thisnode).first());
                },
              });
            } else {
              y[k](opts[k], concat);
            }
          }
          //  log('keys  is '+opts[k])
          //  log('k is '+k)
        }
      }
    }
    return this;
  }

  /**
   * reset
   * RESET
   * @description Reset templates back to what they were.
   */
  function reset(forcenew=false) {
    for (let y of _stk) {
     if(forcenew){
        delete y.templateHTML;
        __init(y);
     }else{
      if (y.templateHTML) {
        Surf(y).html(y.templateHTML);
        delete y.templateHTML;
        __init(y);
      }
    }
    }
    return this;
  }


  /* END PUBLIC METHODS / TOOLS */

  /* INTERNAL METHODS / TOOLS for templates */

  /**
   *_init
   * INIT
   * @description Parse elements for templates and convert them to functions.
   */
  /* Internal  Methods / TOOLS for templates */
  function __init() {
    for (let e of _stk) {
         if (e.nodeName !== "#document") {
        let vdata = __templateParser(e);
        if (!isEmpty(vdata)) {
          // dont let vdata overwrite exisiting properties
          if (e.vdata) {
            for (const i in e.vdata) {
              if (i in e) {
                delete vdata.i;
              }
            }
          }

          // Make each property a function
          const vkeys = Object.keys(vdata);
          e.vdata = vdata; // The passed in vdata obj
          __templateReplacer(e, vdata);
          for (const k of vkeys) {
            const st = k;
            e[st] = function (s = false, concat = false) {
              if (s) {
                e.vdata[st] = s;
                __templateReplacer(e, e.vdata, { concat: concat });
              }
            };
          }
        } // end isEmpty vdata

        for (const i in vdata) {
          // keep track of vdata properties in e.dat
          e.dat += i + ",";
        }
      } // end not document
    } //end stk
  } //end init

  /**
   * __templateParser
   * __TEMPLATEPARSER
   * @description Parse element for template strings.
   * @return object
   */
  function __templateParser(e) {
    const allText = e.textContent;
    let startTag = obj.startTemplate;
    let endTag = obj.endTemplate;
    const re = new RegExp(startTag + "(.*?)" + endTag, "g");
    const m = allText.matchAll(re);
    const matches = Array.from(m);
    const results = [];
    for (const match of matches) {
      //  log(match[1]);
      if (!/^\d/.test(match[1]) && match[1].length) {
        // identifier can't start with a number
        results.push(match[1].trim());
      }
    }
    const autoObj = {};
    if (results.length) {
      for (const key of results) {
        autoObj[key] = key;
      }
    }
    // log("autoObj " + autoObj);
    return autoObj;
  }

  /**
   * __templateReplacer
   * __TEMPLATEREPLACER
   * @description Replace {{ strings }} with replacement strings in obj.
   */
  function __templateReplacer(e, obj, { concat = false } = {}) {
    // If we have already been here operate on original template - i.e. subsequent calls with new data in obj
    // log('OBJ is ' + JSON.stringify(obj))
    if (e.templateHTML) {
      if (concat) {
        const htm = Surf(e).html() + e.templateHTML;
        Surf(e).html(htm);
      } else {
        Surf(e).html(e.templateHTML);
      }
    }

    const orightml = Surf(e).html();
    e.templateHTML = orightml;

    const keys = Object.keys(obj);
    for (const r of keys) {
      let elText = Surf(e).text();
      if (html) {
        elText = Surf(e).html();
      }
      elText = elText.replace(/\{\{\s*/g, "{{");
      elText = elText.replace(/\s*\}\}/g, "}}");

      if (obj[r]) {
        const pat = `{{${r}}}`;
        const re = new RegExp(pat, "g");
        let newtext = elText.replace(re, `${obj[r]}`);
        if (html) {
          Surf(e).html(newtext);
        } else {
          Surf(e).text(newtext);
        }
      }
    }
  }



  /* END INTERNAL METHODS / TOOLS for templates */


  /**
   * _restack
   * _RESTACK
   * @description  Internal function to make everything in the _stk available on obj as $('.element')[0]  named indexed elements. 
   */
   function _restack(){
     // first clear existing numeric keys from obj
     let keys = Object.keys(obj);

       for(let k of keys){
         if(isNumber(k)){
           delete obj[k];
           // console.log(k)
         }
       }

      if(_stk.length){
        let i = 0;
        _stk.forEach((y) => {
 y.state = y.state ||  {};
 y.setState =  new Proxy(y.state, handler);

           obj[i] = y;
           i++;
             });
      }
    }//end _restack

// must call for first run
_restack();




  return obj;
}

// if $ or b is already defined then make your own reference or use Surf
var $ = $ || Surf; // you don't have to use $, you can use whatever you want
var b = b || Surf; // you don't have to use b, you can use whatever you want
