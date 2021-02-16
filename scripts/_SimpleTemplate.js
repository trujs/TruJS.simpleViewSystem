/**
* This factory produces a worker function that processes an html template with
* an object.
* 1. converts the text to html
* 2. creates a template context, prototype chaining special template properties
*    and the data:
*   - {element}   $element          The element that that is being processed
* 3. processes the root element's children
*   - process tag
*   - process tag's attributes
*   - process tag's children
* 4. returns the root element's children
* @factory
*/
function _SimpleTemplate(
    promise
    , simpleExpression
    , statenet_common_findStateful
    , simpleMixin
    , simpleMethods
    , dom_createElement
    , is_array
    , is_object
    , is_empty
    , is_func
    , is_nill
    , is_string
    , utils_reference
) {
    var TAG_PATT = /\{\:(.*?)\:\}/g
    , WSP_PATT = /^[ \t\n\r]+$/
    , TRIM_PATT = /^[\n\r\t ]+(.*?)[\n\r\t ]+$/
    , LN_END_PATT = /\r?\n/g
    , SPC_PATT = /[ ][ ]+/g
    , TAB_PATT = /\t/g
    , INDXR_PATT = /\[\]/g
    , cnsts = {
        "value": "$value"
        , "destroy": "$destroy"
        , "watch": "$addListener"
        , "unwatch": "$removeListener"
    }
    /**
    * @alias
    */
    , createElement = dom_createElement
    /**
    * @alias
    */
    , findStateful = statenet_common_findStateful
    ;

    /**
    * Converts the html string into html elements wrapped in a span
    * @function
    */
    function convertHtml(tag, template, context) {
        //convert the tag to an element if it is not
        if (!tag || is_string(tag)) {
            tag = createElement(tag || "div");
        }
        //add the inner html to the tag
        tag.innerHTML = template;

        return tag;
    }
    /**
    *
    * @function
    */
    function processSelfTag(element, context) {
        var self = element.children[0]
        , attrs = Array.prototype.slice.apply(self.attributes)
        , children = Array.prototype.slice.apply(self.childNodes)
        , removeList = []
        ;
        //bind the attributes and add them to the element
        attrs.forEach(function (attr) {
            self.removeAttributeNode(attr);
            element.setAttributeNode(attr);
            if (processAttribute(element, context, attr)) {
                removeList.push(attr);
            }
        });
        //remove any on attributes that we added handlers for
        removeList.forEach(function forEachRem(attr) {
            element.removeAttributeNode(attr);
        });
        //move the children
        children.forEach(function (node) {
            if (node.nodeType === 1 || (node.nodeType === 3 && !WSP_PATT.test(node.nodeValue))) {
                element.insertBefore(node, self);
            }
        });
        //remove the self element
        self.parentNode.removeChild(self);
    }
    /**
    * Begins the element processing, resolves/rejects the promise
    * @function
    */
    function process(node, data) {
        //create the starting context object and start processing the node
        if (node.nodeType === 1 || (node.nodeType === 3 && !WSP_PATT.test(node.nodeValue))) {
            processElement(node, data);
        }
    }
    /**
    * Create the context object, making data the prototype
    * @function
    */
    function createContext(element, data) {
        var properties = {};

        Object.keys(simpleMethods)
        .forEach(
            function (key) {
                properties[key] = {
                    "enumberable": true
                    , "value": simpleMethods[key].bind(null, element)
                };
            }
        );

        //set the element on the context
        properties["$element"] = {
            "enumerable": true
            , "value": element
        };

        return Object.create(
            data
            , properties
        );
    }
    /**
    * Processes the element including special tags, if and repeat, and
    * processes it's shildren
    * @function
    */
    function processElement(element, data) {
        var context = createContext(element, data);
        //a temporary container for watchers
        element.watchers = [];
        //see if this is a repeat
        if (element.nodeName === "REPEAT") {
            processRepeatElement(element, context);
        }
        else if (element.nodeName === "IF") {
            processIfElement(element, context)
        }
        else if (element.nodeName === "ELSE") {
            //remove the else
            element.parentNode.removeChild(element);
        }
        else if (element.nodeName === "#text") {
            processTextNode(element, context)
        }
        else {
            if (element.hasAttribute("repeat") && element.hasAttribute("if")) {
                processIfAttrib(element, context);
                if (!!element.parentNode) {
                    processRepeatAttrib(element, context);
                }
                else {
                    element.removeAttribute("repeat");
                }
            }
            else if (element.hasAttribute("repeat")) {
                processRepeatAttrib(element, context);
            }
            else if (element.hasAttribute("if")) {
                processIfAttrib(element, context);
            }
            else {
                processAttributes(element, context);
                processChildren(element, context);
                //add any mixins
                simpleMixin(element, context);
                //this is a work around for the proper option to be selected
                if (element.tagName === "SELECT") {
                    var selectedOption = element.querySelector("[selected]");
                    if (!!selectedOption) {
                        element.value = selectedOption.value;
                    }
                    else {
                        element.value = "";
                    }
                }
            }
        }

        //create the destroy method
        createDestroyMethod(element);
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
        , expr = element.getAttribute("repeat")
        ;
        //remove the repeat attribute
        element.removeAttribute("repeat");
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
    function processIfElement(element, context) {
        var expr = element.getAttribute("expr")
        , elseEl = element.nextElementSibling
        , elseNodes
        ;

        if (!!elseEl && elseEl.nodeName === "ELSE") {
            elseNodes = elseEl.childNodes;
        }

        doIf(element, expr, element.childNodes, elseNodes, context);

        //remove the if
        element.parentNode.removeChild(element);
    }
    /**
    * Evaluates the if expression found in the if attribute
    * @function
    */
    function processIfAttrib(element, context) {
        var expr = element.getAttribute("if")
        , elseEl = element.nextElementSibling
        , pass
        ;

        element.removeAttribute("if");

        if (!!elseEl) {
            if (!elseEl.hasAttribute("else")) {
                elseEl = null;
            }
            else {
                elseEl.removeAttribute("else");
            }
        }

        pass = doIf(element, expr, [element], !!elseEl && [elseEl], context);

        if(!pass) {
            element.parentNode.removeChild(element);
        }
        else if (!!elseEl) {
            elseEl.parentNode.removeChild(elseEl);
        }
    }
    /**
    * Evaluates the if expression, if fails, removes the element and all of it's
    * children. If the next sibling is an else, and the if passed, then it and
    * all of it's children
    * @function
    */
    function doIf(element, expr, ifNodes, elseNodes, context) {
        var pass = !!simpleExpression(expr.replace(TAG_PATT, "$1"), context).result
        , nodes;

        //if pass then use the if children
        if (pass) {
            nodes = insertNodes(element, ifNodes);
        }
        else if (!!elseNodes) {
            nodes = insertNodes(element, elseNodes);
        }

        //process the nodes
        if (!!nodes) {
            nodes.forEach(function forEachNode(node) {
                if (node.nodeType === 1 || (node.nodeType === 3 && !WSP_PATT.test(node.nodeValue))) {
                    processElement(node, context);
                }
            });
        }

        return pass;
    }
    /**
    * Processes a text node
    * @function
    */
    function processTextNode(textNode, context) {
        //get the text node's value
        var value =  textNode.nodeValue.replace(TRIM_PATT, "$1")
        //process the value and see if we have any keys
        , result = processValue(value, context)
        //reference to the parent element
        , parent = textNode.parentNode
        //create/get an el tag to hold the text
        , el = is_empty(value) && null
            || parent.childNodes.length === 1 && parent
            || createElement('span')
        ;

        if (!is_empty(value)) {
            //replace the text node with the el
            if (el !== parent) {
                el.watchers = [];
                parent.replaceChild(el, textNode);
            }

            //set the node value to the result
            el.innerHTML = result.value;
                //.replace(LN_END_PATT, "<br>")
                //.replace(SPC_PATT, "&nbsp;")
                //.replace(TAB_PATT, "&#9;");

            //add the watchers
            if (result.keys.length > 0) {
                watchKeys(el, context, result.keys, function () {
                    el.innerHTML = processValue(value, context).value;
                });
            }
        }
    }
    /**
    * Processes each attribute of the element
    * @function
    */
    function processAttributes(element, context) {
        if (!!element.attributes) {
            var removeList = []
            , attribs = Array.prototype.slice.apply(element.attributes)
            ;

            attribs.forEach(function forEachAttr(attr) {
                if (processAttribute(element, context, attr)) {
                    removeList.push(attr);
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
        //check for on{event} attributes
        if (attr.name.indexOf("on") === 0) {
            addEventHandler(element, attr, context);
            return true;
        }

        //process the attrib value and see if we have keys
        var expr = attr.value
        , name = attr.name
        , result = processValue(attr.value, context);

        //add the watch handler for each key
        if(result.keys.length > 0) {
            watchKeys(element, context, result.keys, function watchHandler(key, value) {
                setAttribute(processValue(expr, context));
            });
        }

        setAttribute(result);

        function setAttribute(result) {
            var value = result.value;
            //if the values array has only one, then use that because it will
            // have the actual object or function rather than a string representation
            if (!result.hybrid && result.values.length === 1) {
                value = result.values[0];
            }
            if (is_object(value) || is_func(value) || is_array(value)) {
                element.getAttributeNode(attr.name)[cnsts.value] = value;
                element.setAttribute(name, "$value");
            }
            else if (!is_nill(value)) {
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
        if (is_func(func)) {
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
        , nodes;
        //make sure this evalutated to an iterator
        if (!!iter.next) {
            while(!is_nill(repeatContext = iter.next())) {
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
            //if (node.nodeType !== 3 || !WSP_PATT.test(node.nodeValue)) {
            parent.insertBefore(node, beforeEl);
            //}
        });
        return nodes;
    }
    /**
    * Finds all {:expressions:}, evaluates them, and then replaces the
    * {:expression:} with the result.
    * @function
    */
    function processValue(value, context) {
        var result = {
            "keys": []
            , "values": []
            , "hybrid": !!value.replace(TAG_PATT, "")
        };

        result.value = value.replace(TAG_PATT, function forEachMatch(tag, expr) {
            var expr = simpleExpression(expr, context);
            result.keys = result.keys.concat(expr.keys);
            result.values.push(expr.result);
            if (is_object(expr.result) || is_func(expr.result)) {
                return "";
            }
            return expr.result;
        });

        if (!result.hybrid && result.values.length === 1) {
            if (result.value === "null" || result.value === "undefined") {
                result.values[0] = eval(result.value);
            }
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
            var watcherKey;
            if (INDXR_PATT.test(key)) {
                //set the watcher key
                watcherKey = key.replace(INDXR_PATT,"$every");
                //change the key to before the first indexer
                key = key.substring(0, key.indexOf("[]") - 1);
            }
            var ref = utils_reference(
                key
                , context
            )
            , watcher = ref.found
                && findStateful(ref.parent, ref.index)
            ;

            if (!watcherKey) {
                watcherKey = ref.index;
            }

            if (!!watcher) {
                watchers.push({
                    "key": watcherKey
                    , "parent": watcher
                    , "guids": watcher[cnsts.watch](
                        watcherKey
                        , function stateNetWrap(event, key) {
                            handler(
                                key
                                , event.value
                                , event
                            );
                        }
                    )
                });
            }
        });
        element.watchers = element.watchers || [];
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
                if (node.nodeType === 1 || (node.nodeType === 3 && !WSP_PATT.test(node.nodeValue))) {
                    processElement(node, context);
                }
                else if (!!node.parentNode){
                    node.parentNode.removeChild(node);
                }
            }
            while((node = sibling));
        }
        return element.childNodes;
    }
    /**
    * Creates the closure that destroys the element and it's children
    * @function
    */
    function createDestroyMethod(element) {
        //add the destroy function
        var watchers = element.watchers;
        delete element.watchers;
        element[cnsts.destroy] = function destroy() {
            //destroy the elements watchers
            if (is_array(watchers)) {
                watchers.forEach(function (watcher) {
                    watcher.parent[cnsts.unwatch](watcher.guids);
                });
            }
            //destroy the children
            destroyChildren(element);
            //remove self
            if (!!element.parentNode) {
                element.parentNode.removeChild(element);
            }
        };
    }
    /**
    * Loops through and destroys the child nodes
    * @function
    */
    function destroyChildren(element) {
        //run the destroy on the children or decend
        element.childNodes
            .forEach(function forEachChild(child) {
                if (child.hasOwnProperty(cnsts.destroy)) {
                    child[cnsts.destroy]();
                }
                else {
                    destroyChildren(child);
                }
            });
    }

    /**
    * @worker
    */
    return function SimpleTemplate(tag, template, data) {
        if (is_nill(data) && is_string(tag)) {
            data = template;
            template = tag;
            tag = null;
        }
        //template could be an array
        if(is_array(template)) {
            template = template.join("\n");
        }

        var element = convertHtml(tag, template);

        //if there is a self child tag then apply it's attributes to the tag
        if (!!element.children[0] && element.children[0].tagName === "SELF") {
            processSelfTag(element, data);
        }

        //process the element
        process(element, data);

        return element.childNodes;
    };
}