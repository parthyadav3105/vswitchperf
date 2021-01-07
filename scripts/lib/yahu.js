
/**
* Reads HTML contents into javascript object
* 
*
* @param {element} element to read, can be input or div element
* @returns {object} New object with values read
*/
function readFromHTML(element){
  var obj = {};
  var el = element.childNodes;
  for(var i in el){

    if(el[i] instanceof HTMLInputElement && el[i].hasAttribute('name')) {


      if(el[i].type == 'text' || el[i].type == 'number'){

          if(el[i].classList.contains('arr')){
              var key = el[i].name;
              var value = objectify(el[i].name, el[i].value);
              if(obj[key] === undefined)
                obj[key] =[];
              obj[key].push(value[key]);

          }else
              obj = mergeDeep(obj, objectify(el[i].name, el[i].value));
      }
      if(el[i].type == 'radio'){
        if(el[i].checked)
          obj = mergeDeep(obj, objectify(el[i].name, el[i].value));
      }
    
    }
    if(el[i] instanceof HTMLSelectElement && el[i].hasAttribute('name')){
      
        if(el[i].classList.contains('arr')){
              var key = el[i].name;
              var value = objectify(el[i].name, el[i].value);
              if(obj[key] === undefined)
                obj[key] =[];
              obj[key].push(value[key]);

          }else
              obj = mergeDeep(obj, objectify(el[i].name, el[i].value));      
    }
    if(el[i] instanceof HTMLDivElement){

      if(el[i].classList.contains('arr')){
        var key = el[i].getAttribute('name');
        var value = readFromHTML(el[i]);
        if(obj[key] === undefined)
          obj[key] =[];
        obj[key].push(value[key]);
      }
      else
        obj = mergeDeep(obj, readFromHTML(el[i]));
      
    }
    if(el[i] instanceof HTMLLabelElement || el[i] instanceof HTMLSpanElement)
      obj = mergeDeep(obj, readFromHTML(el[i]));
  }
  
  if(element.hasAttribute('name')){
    var newobj = {};
    newobj[element.getAttribute('name')] = obj;
    return newobj;
  }
  return obj;
}



function objectify(key, value){
  var obj = {};
  var keys = key.split('.');
  for(var i = keys.length-1; i >= 0; i--){
    obj[keys[i]] = value;
    value = obj;
    obj = {};
  }
  return value;
}
/**
 * This function creates a Json file to support client-side file download
 */

function downloadAsFile(filename, text, mimeType='text/plain') {
    var data = new Blob([text], {type: mimeType});
    var url = window.URL.createObjectURL(data);

    var dummy = document.createElement('a');
  	dummy.setAttribute('href', url);
  	dummy.setAttribute('download', filename);

  	dummy.style.display = 'none';
  	document.body.appendChild(dummy);
  	dummy.click();
  	document.body.removeChild(dummy);
}
function copyToClipboard(text){

	var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();

	try{
	    var successful = document.execCommand('copy');
	    if(!successful)
	    	alert('Error copying to clipboard');
	}catch (err){
		alert('Error copying to clipboard');			   
	}
	document.body.removeChild(dummy);
}
// Settings Handler Utility


function setValue(name, value, options = {'secure': true, 'max-age': 60*60*24}) {

  options = {
    path: '/',
    // add other defaults here if necessary
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteValue(key) {
  setValue(key, "", {'secure': true, 'max-age': -1})
}


// returns the cookie with the given key,
// or undefined if not found
function getValue(key){
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}


function getAllValues() {
        var theCookies = document.cookie.split(';');
        var config = new Object();
        for (var i = 1 ; i <= theCookies.length; i++) {
          var [key, value] = theCookies[i-1].split('=');
          if(key === "")
            continue;
          config[decodeURIComponent(key.trim())] = decodeURIComponent(value.trim());
        }
        return config;
      }

function deleteAllValues(){
  for(key in getAllValues())
    deleteValue(key);
}



function writeToHTML(element, obj){

  shrinkHTML(element)
  _writeToHTML(element, obj);
}


/* Remove all extra arr elements with delete button, i.e. make arr.length=1*/
function shrinkHTML(element){

  var delButtons = element.querySelectorAll('[data-del]');
  if(delButtons.length == 0)
    return;

  for(button of [...delButtons])
    button.click();
  
}


function _writeToHTML(element, obj){

  var el = [...element.childNodes];
  for(var i in el)
  {

      if(el[i] instanceof HTMLInputElement && el[i].hasAttribute('name')){

          if(el[i].type == 'text' || el[i].type == 'number'){

              if(el[i].classList.contains('arr')){

                  var name = el[i].getAttribute('name');
                  var values = readValue(obj, name);

                  if(values !== undefined && (Array.isArray(values) && values.length)){

                      var buttons = element.parentNode.querySelectorAll(`[data-add="${name}"]`);
                      var addButton = buttons[buttons.length -1];
                      for(var j=0; j< values.length-1; j++)
                        addButton.click();
                   
                      // Update value inside all input boxes
                      for(var box of element.parentNode.getElementsByClassName('arr'))
                        if(box.getAttribute("name") === name)
                          box.value =  values.pop();
                  }

              }
              else{
                  var value = readValue(obj, el[i].name);
                  if(value !== undefined)
                    el[i].value = value;
              }
          }

          if(el[i].type == 'radio'){
            var value = readValue(obj, el[i].name);
            if(el[i].value === value){
              el[i].checked = true;
            }
          }

      }
      if(el[i] instanceof HTMLSelectElement && el[i].hasAttribute('name')){

          if(el[i].classList.contains('arr')){

              var name = el[i].getAttribute('name');
              var values = readValue(obj, name);

              if(values !== undefined && (Array.isArray(values) && values.length)){

                  var buttons = element.parentNode.querySelectorAll(`[data-add="${name}"]`);
                  var addButton = buttons[buttons.length -1];
                  for(var j=0; j< values.length-1; j++)
                    addButton.click();
                   
                  // Update value inside all input boxes
                  for(var box of element.parentNode.getElementsByClassName('arr'))
                        if(box.getAttribute("name") === name){
                          var defaultValue = box.value;
                          var option = values.pop();
                          box.value = option;
                          if(box.value !=option)
                            box.value = defaultValue;
                        }
              }

          }
          else{

                var option = readValue(obj, el[i].name);
                var defaultValue = el[i].value;
                el[i].value = option;
                if ( el[i].value != option)
                    el[i].value = defaultValue;
          }

      }
      if(el[i] instanceof HTMLDivElement){

          if(el[i].hasAttribute('name') && el[i].classList.contains('arr'))
          {              
            
              var name = el[i].getAttribute('name');
              var values = readValue(obj, name);

              if(values !== undefined && (Array.isArray(values) && values.length)){

                  var buttons = element.querySelectorAll(`[data-add="${name}"]`);
                  var addButton = buttons[buttons.length -1];
                  for(var j=0; j< values.length-1; j++)
                    addButton.click();
                   
                  // Update value inside all divs
                  for(var div of element.getElementsByClassName('arr'))
                    if(div.getAttribute("name") === name)
                      _writeToHTML(div , values.pop());
              }

          } //else-if single div
          else if(el[i].hasAttribute('name')){
              var value = readValue(obj, el[i].getAttribute('name'));
              if(value !== undefined)
                _writeToHTML(el[i], value);

          }//else-if blank div without attribute name, then simply pass values to next child
          else
              _writeToHTML(el[i], obj);
      }
      if(el[i] instanceof HTMLLabelElement || el[i] instanceof HTMLSpanElement)
          _writeToHTML(el[i], obj);

  }
}


  // Reads value from obj with string 'key1.key2.key3' convention
  function readValue(obj, str) {
    str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    str = str.replace(/^\./, '');           // strip a leading dot
    var a = str.split('.');
    for (var i = 0; i < a.length; ++i) {
        var key = a[i];
        if (key in obj) {
            obj = obj[key];
        } else {
            // alert('Key '+key+ ' not Found');
            return undefined;
        }
    }
    return obj;
  }

// Add button
function duplicate(button){
    if(button.hasAttribute("data-add"))
      var name = button.getAttribute("data-add");

    newdiv = button.previousElementSibling.cloneNode(true);
    if(newdiv instanceof HTMLDivElement || newdiv instanceof HTMLLabelElement || newdiv instanceof HTMLSpanElement)
        if (!newdiv.lastElementChild.classList.contains('del-button')){
          del =`<div data-del="${name}" class="del-button" onclick="remove(this)"></div>`
          newdiv.innerHTML += del;
        }
    button.parentNode.insertBefore(newdiv, button)
  
}

// Delete Button
function remove(button){
  button.parentNode.parentNode.removeChild(button.parentNode);
}


/**
* Performs a deep merge of objects and returns new object. Does not modify
* objects (immutable) and merges arrays via concatenation.
*
* @param {...object} objects - Objects to merge
* @returns {object} New object with merged key/values
*/
function mergeDeep(...objects) {
  const isObject = obj => obj && typeof obj === 'object';
  
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];
      
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      }
      else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      }
      else {
        prev[key] = oVal;
      }
    });
    
    return prev;
  }, {});
}

