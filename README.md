
# Surf JS
  
    
[<img alt="Surf JS"  src="imgs/logo1.png" />](https://surf.monster/)
## A Small Plugin Extendable Animation, Reactive Element Template Library and JQuery Alternative.


 

### What is it?

**Surf JS** is a small ~16kb plugin extendable JavaScript utility and animation library _as well as_ a component library for building user interfaces (UI).



### Where To Get It?
**Get it from Github:** https://github.com/bretgeek/surf/   

**Unminified:** https://surf.monster/js/surf.js


**Minified:** https://surf.monster/js/surf.min.js
 (right click save as)


**Visit:** https://surf.monster for updates and working examples.


**For use with Deno:** - use surf.mjs in this repo.



### Features

* **Super Small!** - currently at around  ~18KB minified (smaller if gzipped).

* **Build with Components** - Optional component based syntax allowing you to build your UI with components without using JSX. (See customElement plugin to make your own custom component tags like &lt;my-tag>&lt;/my-tag> too);


* **Reactive Element Templates** - Reactive element templates are strings in your HTML that look like  {{msg}}  and once initialized can become ANYTHING you desire when you desire. When your data changes you can set the template to your new data, new HTML or even new components!


* **Easy Familiar Syntax** - familiar chainable syntax with built-in DOM manipulation methods.

* **Extendable** - Highly configurable (you can change anything you want about the base functionality with a run time config) and it's extendable with plugins.

* **A Delay/Animation Queue** - An iteratable and cancellable delay queue for building custom effects and animations.

* **Timelines and MovieClips - Timelines for frame based animations.

* **Lightweight JQuery Clone** - Optionally, can be used as a general purpose JQuery like library.

* **Versatile** - It's intended to give you power and not lock you down into any one way of doing things. You can probably find ways to use it that the author has not even thought of yet. Use it in ways that you and your team define!






### Getting Started
Basic usage for manually adding and using **Surf JS** to a web page.


### Add **Surf JS** to your page before your closing body tag:

```html


<script src='https://yoururl.com/surf.min.js'></script>



```

### First make sure it works
So we can do more interesting things later but first let's use **Surf JS** similar to how we would use JQuery to make sure our setup is working.

### In an html file:



```js

// Somewhere in your HTML

<div id='app'> I am an App </div>


```


### In a script tag after surf.min.js:

```js

// Create kickoff function that will run once the document is ready.

function kickoff(){

// There are many options to "grab" but this minimal use returns the first element of #app by default

$('#app').css('color: red;');

}


// Run your function when the document is ready...

$(document).ready(kickoff);


```


### Is it working? 

**You should now see "I am an App" in red.**










### Reactive Element Templates
**Surf JS** has a really powerful feature called **"Reactive Element Templates"** that allows you to manipulate your HTML with changing data defined by {{templates}}. Since Reactive Templates resolve to functions (once they are activated) there is no DOM querying...changes are live! 
The main takeaway here is that...when your data changes, templates can be used to display your data as text, HTML or even components! 

### Lets start with a basic example to see how Reactive Templates work
In your html file add: 

```js

// Somewhere in your HTML

<div id='msgapp'> This is a {{msg}} </div>


```





In your script file somewhere in your kickoff function add: 

```js

// Somewhere in your kickoff function of your JS script

// Use set to change msg and CSS to color #msgapp green so we can see it;
$('#msgapp').set({msg: ' my narly note!'}); // We can send in HTML, text or components here;
$('#msgapp').css('color: green;');


```

**You should now see:**
**This is a  my narly note!**


If you are lucky enough to catch a glimpse you should see the msg in the template change when the browser is done loading.
Keep in mind this is setting the templates via HTML in a textual based JQuery like way, but templates give you even more power when setting them to or from components!




### Components
Creating a re-usable component is as easy as writing a function (a named function or an arrow function and a name parameter) that returns an element then registering it by calling a special function **$().register(componentName)** to register it. Once registered it can be used over and over by it's name.

Let's give it a try:

First we will need a place to put our component in.
### In your HTML file:

```js

// Somewhere in your HTML

<div id='comp1'> COMPONENT  </div>



```



 Now lets make the component - a button that increments a counter when clicked.

Somewhere in your kickoff script file (or where it will be called by ready) define a function for your component:

```js


// A button component that counts when clicked

function buttonCounter(props={}){
  let color = props.color || 'green';

   // The component with create a node each time it's used

   const node = $().createNode('button');

   // This node's CSS, attributes, reactive template and html

   $(node).html('Count is:  {{cnt}}  ').attr('data-count', 0).css('cursor: pointer;').css(`color: ${color};`); // color from props;


   // initialize cnt template to 0

   $(node).set({cnt: '0'});

// Add a click event to the node
$(node).on('click', function(){
let cnt = parseFloat($(this).attr('data-count'))+1;
$(this).attr('data-count', cnt);
$(this).set({cnt: cnt});
});


 // A component must return an element
return node;
}



// Register the component
$().register(buttonCounter); 


```



To make sure our component works we will use **Surf JS's** "append" method to add it to the DOM... but keep in mind you can add components to other components with a special syntaxt which we will get to later.
```js


// create a reference to a component

const abutton = $().buttonCounter(); // OR const abutton = $(buttonCounter);


// Create a reference to the place we want to put our component

const comp1 = $('#comp1').first();


// Finally append the component to the element in DOM

$(comp1).append(abutton);  // OR without a reference: $(comp1).append($().buttonCounter());


```



### See if it works!

**You should now see a button with this text:**

(check https://surf.monster for live demo)

Count is: 0 




### Syntax to render components to other components
 The most useful thing about components is their re-use. In this section we will go over how to add a component to another component.
Here we will make a **containerBox** component and add our **buttonCounter** we made earlier to it. We will add buttonCounter twice to show different ways to do it.




Make a place to in the DOM to hold our containerbox component.
### In your HTML file add:

```js

// Somewhere in your HTML

<div id='comp2'> some random place holder text not required  </div>


```






 In your kickoff script file add the code below for the containerBox component:

```js

// A component for a container box

function containerBox(){

  // The kind of element this component will be...

  const node = $().createNode('div');
  
  // Some HTML with a reactive template for demonstration purposes.

  $(node).html(' {{ button }} ')


  // Some CSS to add a border so we can see it.

  $(node).css('border: 2px solid blue; padding: 9px; width: 120px;'); 


  // There are two ways to add a component - use the Set method on templates or DOM insertion.
  // If using both ways in the same component the Set method on templates must come first.


  // First way: Set a template to another component

  $(node).set({ button: $().buttonCounter() }); // OR $(node).set({ button: $(buttonCounter) }); 


  // Second way: Use DOM manipulation methods to add a component to this component

  $(node).prepend( $().buttonCounter() ); // OR $(node).prepend( $(buttonCounter) );

  return node; // compontents must return an element
}

// Don't forget to register it somewhere in your script file
$().register(containerBox);



```


###  Test it to see if adding components to another works.
Somewhere else in your kickoff script add:

```js

// create a new instance  

const abox = $().containerBox(); // OR const abox = $(containerBox);

$('#comp2').append(abox); // add to somewhere in the DOM OR with variable instance do $('#comp2').append($().containerBox());



```




** You should now see three components - 1 containerBox component containing 2 buttonCounter components!**

(check https://surf.monster for live demo)

Count is:0
Count is: 0 

We covered a lot of ground introducing the basics of **Surf JS** but the possibilities are endless!

I hope you have enjoyed this short tutorial on getting started with **Surf JS** and would love to see what you will build.



## Delay/Timelines/Movieclips
**See:** https://surf.monster details and examples.


## Extending Surf JS

### You can add your own functionality and make plugins to extend Surf JS
Let's make a plugin. In your kickoff script file from above add:

```js

// A simple plugin function that you can write.


// A plugin must be a normal function and not an arrow function.
function plugme(){
//the stack can be accessed by this.stk; which is everything in $('.app');

//console.log(this.stk)
for( const y of this.stk){
Surf(y).css('color: brown;');
}
return this; // plugins must return this to be chainable
}



// Now tell Surf to use the plugin: 
// *** Note you must add plugins at the top of your script file before using them. 

Surf.plugin.fn.plug = plugme;

// Use the new plugin:

$('#app').plugme();

// OR

//Surf('#app').plugme();

```




### Public Methods
Here is a list of **Surf JS's** public methods all of which can be used from within components or like you would for DOM manipulation as with JQuery:

* **outerHTML** - Set or return the html of an element.

* **html** - Set or return the html of an element.

* **text** - Set or return the text of an element.

* **data** - Get or set data attributes of a node.

* **click** - click event only.

* **addEvent** - Add events to an elements on the stack.

* **removeEvent** - Remove events from elements on the stack - removes all occurrences of etype i.e 'click'.

* **trigger** - Trigger the event e for all of the stack.

* **register** - Register a component.

* **scroller** - Scroll to bottom of el.

* **scrollTo** - Scroll to element "to".

* **removeAttr** - Remove attribute str.

* **attr** - Set or get attribute.

* **css** - Set or Get CSS of elements of stack.

* **requestInterval** - Replacement for setInterval for smooth animations.

* **delay** - Execute function for every element in _stk after a delay with optional iterations.

* **fadein** - fade in an element with speed in milliseconds and an option display setting to end with.

* **fadeOut** - fade out an element with speed in milliseconds and an option display setting to end with.

* **classToggle** - Toggle class (add or remove) on elements of stack.

* **toggle** - Toggle visibility of elements on stack.

* **after** - Insert elements or html strings after elements in stack using internal __beforeOrAfter method.

* **before** - Insert elements in stack before str using internal __beforeOrAfter method.

* **insertBefore** - Insert elements or html strings before elements in stack using internal __beforeOrAfter method.

* **insertAfter** - Insert elements or html strings after elements in stack using internal __beforeOrAfter method.

* **append** - Append elements or html strings to elements of stack.

* **prepend** - Prepend elements or html strings to elements of stack.

* **prependTo** - Append elements or html strings to first element of param.

* **appendTo** - Append elements or html strings to first element of param.

* **parent** - PARENT for each element in the stack put each direct parent on the stack and subsequent chains will act on the parents - if You want to return the collection chain with ._ or .first or all() to return the first parent of the stack.

* **parents** - Run fn against parents of elements on stack or that match matchsel param then push all found parents to new stack.

* **children** - Finds only direct children of elements on stack but children.children will keep going if first in chain is true.

* **find** -  Find elements within elements of stack...can pass in a selector that is valid to querySelectorAll or a singular element.

* **forEvery** - Run fn against every element in stack that matches str.

* **grab** - Return either all or singular elements from stack to retain a reference usually by variable assignment.

* **each** - Run fn against every element in stack.

* **detach** - Remove elements of stack from DOM.

* **addClass** - Add class of param s to all elements of stack.

* **removeClass** - remove class of param s from all elements of stack.

* **clone** - Clone what is on the stack - if true clone events too.

* **wrap** - wrap elements in html strings.

* **isString** - Check if param is of type string.

* **isFunction** - Check if param is of type function.

* **isNumber** - Check if param is of type Number.

* **isEmpty** - Check if param is an empty opject.

* **isObject** - Check if parameter is an object.
   
* **isElement** - Check if parameter is a DOM element.

* **isArray** - Check if param is of type Array.

* **set** - Set template string in object opts to new values.

* **submit** - Submit forms.

* **reset** - Reset templates back to what they were.

* **setState** - Set named states on elements and update HTML.

* **removeState** - Remove named states on elements and update HTML.

* **_init** - Parse elements for templates and convert them to functions.

* **ready** - Run function when document is ready - it's pretty important so it's the first method.

* **_isTouch** - Check if we are on a touch device.

* **_rect** - Return the number of an elements properties.

* **_cs** - Return computed Styles of el.

* **_sfilter** - Filter out non printing chars from a string.

* **_createNode** -  Create a new Element and return it.

* **_uuidv4** -  Create a unique uuid version 4.

* **hidekbd** - Hide keyboard on touch devices.

* **_rpx** - Remove px, %, em from a number.

* **_getAtPt** - Get element under mouse cursor.

* **_singleDash** - Replace multiple dashes with one.

* **_camelDash** - Return hyphenated names as camel case foo-foo becomes fooFoo.

* **_getstack** - Return Element at stack specified by num as param.

* **_createEvent** - Create events.

* **_dispatchEvent** - Dispatch events - this will dispatch the event for the specified element must be valid string name for e element reference for el.



















   
   

