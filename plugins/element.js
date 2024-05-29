/*
// Element - A generic re-usable Element of any type component
// send in events, css, data attributes, 
*/


function Element(
  { 
    kind="div",
    events = {},
    css = false,
    content = "content",
    templateName = false,
    to = "body",
    where = "append",
    className = "surf",
    clsprefix = false,
    attr = {},  }){
  
  if(clsprefix){
    className = `${clsprefix}-${className}`;
  }
  
  const node = $().createNode(kind);
  $(node).html(`{{content}}`).addClass(className);

  $(node).set({content: `${content}`});

  // Add the event to the node
  for (const [key, fn] of Object.entries(events)) {
    if($().isFunction(fn)){
   // console.log(fn);
      
        $(node).on(`${key}`, fn );

    }
  }

  for (const [key, dat] of Object.entries(attr)) {
   $(node).attr(`${key}`, dat);
  }

  // Add CSS
  if(css){
    $(node).css(css);
  }

  // templateName - use a custom {{template}} passed in via templateName 
  if(templateName){
    // console.log(node.content);
    node[templateName] = node.content;
  }

  switch(where){

  case "before":
   $(node).insertBefore(to);
  break;

  case "after":
   $(node).insertAfter(to);
  break;

  case "prepend":
   $(node).prependTo(to);
  break;

  case "append":
   $(node).appendTo(to);
  break;

  default:
   $(node).appendTo(to);
  break

   }

  // A component must return an element
  return node;
}

// Register the component
$().register(Element);

