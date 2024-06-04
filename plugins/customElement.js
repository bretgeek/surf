 /*
  * SURF - customElement
  * (c) 2022 Bret Lowry
  * @license MIT
  * @description Surf JS is a JavaScript Library for Reactive Element Templates with component based rendering and an insanely small JQuery clone.
  * Create custom HTML elements/components like <my-component></my-component> with associated events.
  * @author BRET LOWRY <bretgeek@gmail.com>
  * @return object
  * Example usage:
  * $().customElement({
  *   name: "c-name", // if name has no dash it will become prefixed with s-
  *   mount: function(el) {  console.log(el); $(el).set({ bret: "I AM BRET" }) },
  *  clsprefix: "surf",// if this exists then css is scoped to clsprefix-className || name
  *  template: "tid", // use element with this id as a template
  *  css: "p {color: green; }",
  *  className: "myel", // if className not provided then name will be used
  *  shadow: false, // if set to true (not recommended)  template will append to a shadowRoot and you'll have to drop down to JS el.shadowRoot.querySelector to access it's children and Reactive templates won't work here.
  *  events: {
  *     click: chk,
  *  },

  *  attrFn: (name, newvalue, oldvalue)=> { if(name === "data-z") { console.log(name+ "  "+ newvalue); }   },
  * });
  
  * An element tag can exist in the document i.e <c-name></c-name> or can be created dynamically like:
  * let cname = $("<c-name>{{bret}}</c-name").prependTo("body").attr("data-z" , "blue").first();
  * The tag can be used an infinite amount of times like any other HTML tag and each one will have its own events. 
  * If used with SurfJS and none shadowed reactive templates work too!

  
 */
 function customElement({ name = "name", events = {}, attr = ["data-z"], attrFn = () => {}, id = false, shadow = false, mount = false, remove = false, css = false, clsprefix = false, className = false, template = false }) {
   class Element extends HTMLElement {

     static observedAttributes = attr;

     constructor() {
       // Always call super first in constructor
       super();
       if (template) {
         let t = document.getElementById(template);
         if (!t) {
           t = document.createElement("template");
           t.innerHTML = "<span>none content</span>";
         }
         // console.log(t.content);

         if (shadow) {
           const shadowRoot = this.attachShadow({ mode: "open" });
           if (css) {
             let style = document.createElement("style");
             style.append(css);
             shadowRoot.appendChild(style);
           }
           shadowRoot.appendChild(t.content.cloneNode(true));
         }
       }
     }

     // connectedCallback
     connectedCallback() {
       //  console.log("Custom element added to page.");
       // Add the events to the node
       for (const [key, fn] of Object.entries(events)) {
         if (typeof(fn) === "function") {
           // console.log(fn);
           this.addEventListener(key, fn, { capture: false });
         }
       }


       let t;
       if (!shadow) {

         if (template) {
           t = document.getElementById(template);
         }
         if (!t) {
           t = document.createElement("template");
           t.innerHTML = "<span>none content</span>";
         }

         if (css) {
           let style = document.createElement("style");
           if (clsprefix) {
             style.append(`.${clsprefix}-${className||name} {  ${css} }`);
           } else {
             style.append(css);
           }
           document.head.append(style);
         }

         this.appendChild(t.content.cloneNode(true));
       }

       if (mount && typeof(mount === "function")) {
         mount(this);
       }
       if (id) {
         this.id = id;
       }
       this.classList.add(`${clsprefix}-${className||name}`);

       /* for future use   
        // attributes check
         for (var key in this.attributes) {
           var element = this.attributes[key];
           if (typeof element === "object") {
             console.log(element.name);
             console.log(element.value);
           }
         }
       */


     } // end connectedCallback



     // disconnectedCallback
     disconnectedCallback() {
       // console.log("Custom element removed from page.");
       if (remove && typeof(remove === "function")) {
         remove(this);
       }
     }

     // adoptedCallback
     // Not implemented yet
     adoptedCallback() {
       //  console.log("Custom element moved to new page, document/iframe");
     }


     // attributeChangedCallback
     attributeChangedCallback(name, oldValue, newValue) {
       // console.log(`Attribute ${name} has changed.`);
       attrFn(name, newValue, oldValue);
     }
   }

   let zname = name;
   if (!name.match(/-/)) {
     name = "s-" + name;
   }

   customElements.define(`${name}`, Element);

 }
 $().register(customElement);
