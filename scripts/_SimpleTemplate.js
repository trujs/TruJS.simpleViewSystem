/**
* This factory produces a worker function that processes an html template with
* an object.
* 1. The data is merged with the template
* 2. The template is converted to an html element
* 3. If tags are processed
* 4. Repeat tags are processed
* 5. Bind input tags
* @factory
*/
function _SimpleTemplate(promise, createElement, simpleExpression, findWatcher) {
    var TAG_PATT = /\{\:(.*?)\:\}/g
    , WSP_PATT = /^[ \t\n\r]+$/
    , cnsts = {
        "bind": "bind"
        , "input": "INPUT"
        , "select": "SELECT"
        , "value": "value"
        , "repeat": "repeat"
        , "if": "if"
        , "destroy": "$destroy"
        , "watch": "$watch"
        , "unwatch": "$unwatch"
    }
    ;

    /**
    * Converts the html string into html elements wrapped in a span
    * @function
    */
    function convertHtml(template) {
        var el = createElement('div');
        el.innerHTML = template;
        return el;
    }
    /**
    * Begins the element processing, resolves/rejects the promise
    * @function
    */
    function process(element, data) {
        //create the starting context object and start processing the main
        // element
        processElement(element, createContext(data));
    }
    /**
    * Create the context object, making data the prototype
    * @function
    */
    function createContext(data) {
        return Object.create(data);
    }
    /**
    * Processes the element including special tags, if and repeat, and
    * processes it's shildren
    * @function
    */
    function processElement(element, context) {
        //set the element on the context
        context["$element"] = element;
        //a temporary container for watchers
        element.watchers = [];
        //see if this is a repeat
        if (element.nodeName === "REPEAT") {
            processRepeatElement(element, context);
        }
        else if (element.nodeName === "IF") {
            processIf(element, context)
        }
        else if (element.nodeName === "ELSE") {
            //remove the else
            element.parentNode.removeChild(element);
        }
        else if (element.nodeName === "#text") {
            processTextNode(element, context)
        }
        else {
            if (element.hasAttribute(cnsts.repeat)) {
                processRepeatAttrib(element, context);
            }
            else {
                processAttributes(element, context);
                processChildren(element, context);
                //this is a work around for the proper option to be selected
                if (element.tagName === cnsts.select) {
                    element.innerHTML = element.innerHTML;
                }
            }
        }

        //add the destroy function
        var watchers = element.watchers;
        delete element.watchers;
        element[cnsts.destroy] = function destroy() {
            watchers.forEach(function (watcher) {
                watcher.parent[cnsts.unwatch](watcher.guids);
            });
        };

    }
    /**
    * Resolves the repeat expression, creats a context chain, and then processes
    * the childNodes for each iteration.
    * @function
    */
    function processRepeatElement(element, context) {
        var expr = element.getAttribute("expr")
        , template = element.innerHTML
        ;

        if (!!expr) {
            doRepeat(element.parentNode.tagName, element, template, expr, context);
        }
        //remove the repeat
        element.parentNode.removeChild(element);
    }
    /**
    * Processes an element with a repeat attribute
    * @function
    */
    function processRepeatAttrib(element, context) {
        var parentTag = element.parentNode.tagName
        , template
        , expr = element.getAttribute(cnsts.repeat)
        ;
        //remove the repeat attribute
        element.removeAttribute(cnsts.repeat);
        //set the innerHTML
        template = element.outerHTML
        //execute the repeat
        doRepeat(parentTag, element, template, expr, context);
        //destroy the template element
        element.parentNode.removeChild(element);
    }
    /**
    * Resolves the if expression, if true then inserts the if children
    * @function
    */
    function processIf(element, context) {
        var children = element.childNodes
        , expr = element.getAttribute("expr")
        , pass = false
        , elseEl = element.nextElementSibling
        , nodes
        ;

        if (!!expr) {
            pass = !!simpleExpression(expr.replace(TAG_PATT, "$1"), context).result;
        }
        //if pass then use the if children
        if (pass) {
            nodes = processChildren(element, context);
            insertNodes(element, nodes);
        }
        //process the else
        if (!!elseEl && elseEl.nodeName === "ELSE") {
            //if not pass then use the else children
            if (!pass) {
                nodes = processChildren(elseEl, context);
                insertNodes(elseEl, nodes);
            }
        }

        //remove the if
        element.parentNode.removeChild(element);
    }
    /**
    * Processes a text node
    * @function
    */
    function processTextNode(textNode, context) {
        //get the text node's value
        var value =  textNode.nodeValue
        //process the value and see if we have any keys
        , result = processValue(value, context)
        ;

        if (result.keys.length > 0) {
            watchKeys(textNode, context, result.keys, function () {
                textNode.nodeValue = processValue(value, context).value;
            });
        }

        //set the node value to the result
        textNode.nodeValue = result.value;
    }
    /**
    * Processes each attribute of the element
    * @function
    */
    function processAttributes(element, context) {
        if (!!element.attributes) {
            var removeList = []
            , attribs = Array.prototype.slice.apply(element.attributes)
            , repeatExpr
            ;

            attribs.forEach(function forEachAttr(attr) {
                //reset the regex
                TAG_PATT.lastIndex = 0;
                //check for on{event} attributes
                if (attr.name.indexOf("on") === 0 && TAG_PATT.exec(attr.value) !== null) {
                    addEventHandler(element, attr, context);
                    removeList.push(attr);
                }
                else {
                    processAttribute(element, context, attr);
                }
            });
            //remove any on attributes that we added handlers for
            removeList.forEach(function forEachRem(attr) {
                element.removeAttributeNode(attr);
            });
        }
    }
    /**
    * Processes the attribute, evaluating any expressions, adding any watch
    * handlers, and 2 way binding for input elements if the attribute is bind
    * @function
    */
    function processAttribute(element, context, attr) {
        //process the attrib value and see if we have keys
        var expr = attr.value
        , name = attr.name
        , result = processValue(attr.value, context);

        if(result.keys.length > 0 && attr.name !== "value") {
            //if the attributes name is bind and the element is an input
            // then add a change listener
            if (attr.name === cnsts.bind && element.tagName === cnsts.input) {
                //add change listener
                //element.addEventListener("change", function (e) {
                //
                //});
                //add watcher
                watchKeys(element, context, result.keys, function () {
                    setAttribute(processValue(expr, context).value);
                });
            }
            else {
                //add the watch handler for each key
                watchKeys(element, context, result.keys, function watchHandler(key, value) {
                    setAttribute(processValue(expr, context).value);
                });
            }
        }

        setAttribute(result.value);

        function setAttribute(value) {
            if (!isNill(value)) {
                element.setAttribute(name, value);
            }
            else {
                element.removeAttribute(name);
            }
        }
    }
    /**
    * Adds an event handler to the element using the attribute name for the
    * event and evaluates the attribute value for the handler function.
    * @function
    */
    function addEventHandler(element, attr, context) {
        //reset the regEx
        TAG_PATT.lastIndex = 0;
        //the event name is the attribute name minus the on
        var name = attr.name.substring(2)
        //extract the expression
        , expr = TAG_PATT.exec(attr.value)
        , func
        ;
        //if there is a match resove the expression, should resolve a function
        if (!!expr) {
            func = simpleExpression(expr[1], context).result;
        }
        //if func is a function then create the handler
        if (isFunc(func)) {
            element.addEventListener(name, func);
        }
    }
    /**
    * Performs the repeat operation
    * @function
    */
    function doRepeat(parentTag, beforeEl, template, expr, context) {
        //evaluate the expression and get an iterator
        var repeatContext
        , element = createElement(parentTag)
        , iter = simpleExpression(expr.replace(TAG_PATT, "$1"), context).iterator
        , key, nodes;
        //make sure this evalutated to an iterator
        if (!!iter.next) {
            while(!isNill(key = iter.next())) {
                repeatContext = Object.create(context);
                repeatContext[iter.vars.key] = key;
                !!iter.vars.indx && (repeatContext[iter.vars.indx] = iter.index - 1);
                !!iter.vars.val && (repeatContext[iter.vars.val] = iter.collection[key]);
                element.innerHTML = template;
                nodes = processChildren(element, repeatContext);
                insertNodes(beforeEl, nodes);
            }
        }
    }
    /**
    * Inserts the nodes before the beforeEl
    * @function
    */
    function insertNodes(beforeEl, nodes) {
        var parent = beforeEl.parentNode;
        //copy the node array because we are going to move elements from the node collection
        nodes = Array.prototype.slice.apply(nodes);
        //loop over the nodes an insert before
        nodes.forEach(function forEachNode(node) {
            if (node.nodeType !== 3 || !WSP_PATT.test(node.nodeValue)) {
                parent.insertBefore(node, beforeEl);
            }
        });
    }
    /**
    * Finds all {:expressions:}, evaluates them, and then replaces the
    * {:expression:} with the result.
    * @function
    */
    function processValue(value, context) {
        var result = {
            "keys": []
        };

        result.value = value.replace(TAG_PATT, function forEachMatch(tag, expr) {
            var expr = simpleExpression(expr, context);
            result.keys = result.keys.concat(expr.keys);
            return expr.result;
        });

        if (result.value === "null" || result.value === "undefined") {
            result.value = eval(result.value);
        }

        return result;
    }
    /**
    * Adds the watch `handler` for each key, if it's parent is a watcher
    * @function
    */
    function watchKeys(element, context, keys, handler) {
        var watchers = [];

        keys.forEach(function forEachKey(key) {
            var obj = resolvePath(key, context)
            , guids
            , watcher = findWatcher(obj.parent, obj.index);
            if (!!watcher) {
                watchers.push({
                    "key": obj.index
                    , "parent": watcher
                    , "guids": watcher[cnsts.watch](obj.index, handler)
                });
            }
        });

        element.watchers = element.watchers.concat(watchers);
    }
    /**
    * Processes each childNode of the element
    * @function
    */
    function processChildren(element, context) {
        var node = element.firstChild, sibling;
        if (!!node) {
            do {
                sibling = node.nextSibling;
                if (node.nodeType !== 3 || !WSP_PATT.test(node.nodeValue)) {
                    processElement(node, context);
                }
                else {
                    node.parentNode.removeChild(node);
                }
            }
            while((node = sibling));
        }
        return element.childNodes;
    }

    /**
    * @worker
    */
    return function SimpleTemplate(template, data) {
        //template could ben an array
        if(isArray(template)) {
            template = template.join("\n");
        }

        var element = convertHtml(template);

        process(element, data);

        return element.childNodes;
    };
}