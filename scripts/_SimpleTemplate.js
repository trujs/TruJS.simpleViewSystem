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
    , expression_interface
    , simpleMethods
    , simpleStyle
    , createSimpleNamespace
    , xmlBindVariableParser
    , app_subsystem_userInterface_userEventManager
    , statenet_common_findStateful
    , dom_createElement
    , dom_createTextNode
    , is_array
    , is_object
    , is_objectValue
    , is_empty
    , is_func
    , is_nill
    , is_string
    , is_upper
    , utils_reference
    , reporter
    , errors
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
    , userEventManager = app_subsystem_userInterface_userEventManager
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
        //if the tag already has children, see if we can destroy them
        if (tag.children.length > 0) {
            Array.from(tag.children)
            .forEach(
                function forEachOldChild(childEl) {
                    if (childEl.hasOwnProperty("$destroy")) {
                        childEl.$destroy();
                    }
                }
            );
        }
        //add the inner html to the tag
        tag.innerHTML = template;

        return tag;
    }
    /**
    *
    * @function
    */
    function processSelfTag(viewNamespace, element, pathExprMap, context) {
        var self = element.children[0]
        , attrs = Array.from(self.attributes)
        , children = Array.from(self.childNodes)
        , removeList = []
        , eventAttributes
        , path = "$.[0]self"
        ;
        //loop through the self tag attributes (non-expression attributes)
        //  and add/append them to the element
        attrs.forEach(
            function forEachAttribute(attr) {
                combineSelfTextAttribute(
                    element
                    , attr
                );
            }
        );
        //add the mapped expressions to the element
        eventAttributes = processMapAttributes(
            element
            , pathExprMap
            , context
            , path
        );
        //process any event attributes
        if (!is_empty(eventAttributes)) {
            processEventAttributes(
                viewNamespace
                , element
                , context
                , eventAttributes
                , pathExprMap[path]
            );
        }
        //update the path map to remove the [0]self from each
        Object.keys(pathExprMap)
        .forEach(
            function forEachMapKey(key) {
                var newKey;
                //remove the leading
                if (key.indexOf("$.[0]self") === 0) {
                    pathExprMap[
                        key.replace("$.[0]self", "$")
                    ] = pathExprMap[key]
                    ;
                    delete pathExprMap[key];
                }
            }
        );
        //move the children
        children.forEach(
            function forEachSelfChild(node) {
                //element or text node that isn't just whitespace
                if (
                    node.nodeType === 1
                    || (node.nodeType === 3
                        && !WSP_PATT.test(node.nodeValue))
                ) {
                    element.insertBefore(node, self);
                }
            }
        );
        //remove the self element from the parent element
        self.parentNode
            .removeChild(self)
        ;
        element.watchers = element.watchers || [];
    }
    /**
    * Combines the attribute with the element, appending with a space if the attribute name exists in element already
    * @function
    */
    function combineSelfTextAttribute(element, attribute) {
        if (element.hasAttribute(attribute.name)) {
            element.setAttribute(
                attribute.name
                , `${element.getAttribute(attribute.name)} ${attribute.value}`
            );
        }
        else {
            element.setAttribute(
                attribute.name
                , attribute.value
            );
        }
    }

    /**
    * Processes the element including special tags, if and repeat, and
    * processes it's shildren
    * @function
    */
    function processElement(parentNamespace, element, pathExprMap, data, path) {
        var eventAttributes
        , namespace
        , context = createContext(
            element
            , data
        );
        //a temporary container for watchers
        element.watchers = [];
        //see if this is a repeat
        if (element.nodeName.toLowerCase() === "repeat") {
            processRepeatElement(
                parentNamespace
                , element
                , pathExprMap
                , context
                , path
            );
        }
        else if (element.nodeName.toLowerCase() === "if") {
            processIfElement(
                parentNamespace
                , element
                , pathExprMap
                , context
                , path
            );
        }
        else if (element.nodeName.toLowerCase() === "else") {
            //remove the else
            element.parentNode.removeChild(element);
        }
        else if (
            element.nodeName.toLowerCase() === "#text"
            && element.parentNode.nodeName.toLowerCase() === "style"
        ) {
            processStyleTextNode(
                element
                , pathExprMap
                , context
                , path
            );
        }
        else if (element.nodeName.toLowerCase() === "#text") {
            processTextNode(
                element
                , pathExprMap
                , context
                , path
            );
        }
        else {
            if (element.hasAttribute("repeat") && element.hasAttribute("if")) {
                processIfAttrib(
                    parentNamespace
                    , element
                    , pathExprMap
                    , context
                    , path
                );
                if (!!element.parentNode) {
                    processRepeatAttrib(
                        parentNamespace
                        , element
                        , pathExprMap
                        , context
                        , path
                    );
                }
                else {
                    element.removeAttribute("repeat");
                }
            }
            else if (element.hasAttribute("repeat")) {
                processRepeatAttrib(
                    parentNamespace
                    , element
                    , pathExprMap
                    , context
                    , path
                );
            }
            else if (element.hasAttribute("if")) {
                processIfAttrib(
                    parentNamespace
                    , element
                    , pathExprMap
                    , context
                    , path
                );
            }
            else {
                //process all non-event attributes, return the event attribute
                //  names
                eventAttributes = processMapAttributes(
                    element
                    , pathExprMap
                    , context
                    , path
                );
                //the namespace can be created after the non-event attributes
                //  have been resolved
                namespace = createSimpleNamespace(
                    parentNamespace
                    , element
                );
                //process any event attributes
                if (!is_empty(eventAttributes)) {
                    processEventAttributes(
                        namespace
                        , element
                        , context
                        , eventAttributes
                        , pathExprMap[path]
                    );
                }

                //process the element's children
                processChildren(
                    namespace
                    , Array.from(element.childNodes)
                    , pathExprMap
                    , context
                    , path
                );

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
        createDestroyMethod(namespace, element);
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

        properties["$state"] = {
            "enumerable": true
            , "value": findStateful(data)
        };

        properties["$"] = {
            "enumerable": true
            , "value": data
        };

        return Object.create(
            data
            , properties
        );
    }
    /**
    * @function
    */
    function processMapAttributes(element, pathExprMap, context, path) {
        var eventAttributes = []
        //get the path expression map for this element's path
        , elPathExprMap = pathExprMap[path]
        , attributeNames
        ;

        //if not found then skip this there aren't any bind variable attributes
        if (!elPathExprMap) {
            return;
        }

        //get the attribute names in a list
        attributeNames = Object.keys(elPathExprMap.attributes);

        //loop through the attribute expressions
        for(let i = 0, l = attributeNames.length; i < l; i++) {
            //if the attribute is an event, save that for later
            if (attributeNames[i].indexOf("on") === 0) {
                eventAttributes.push(attributeNames[i]);
                continue;
            }
            //owtherwise process the attributes
            processMapAttribute(
                element
                , attributeNames[i]
                , context
                , elPathExprMap.attributes[
                    attributeNames[i]
                ]
                , path
            );
        }

        return eventAttributes;
    }
    /**
    * @function
    */
    function processMapAttribute(element, attributeName, context, expressionMap, path) {
        //wire up the state change handlers
        wireAttributeMap(
            element
            , attributeName
            , context
            , expressionMap
        );
        //set the attribute's initial value
        updateAttribute(
            element
            , attributeName
            , context
            , expressionMap
            , path
        );
    }
    /**
    * Adds watchers for the expressions in the expression map
    * @function
    */
    function wireAttributeMap(element, attributeName, context, expressionMap) {
        //loop through the expressions and gather all of the keys to watch
        var keys = Object.keys(expressionMap.expressions)
            .map(
                function mapExpressionKeys(exprKey) {
                    var expression = expressionMap.expressions[exprKey];
                    return expression.variables;
                }
            )
            .flat()
        , updateFn = updateAttribute.bind(
            null
            , element
            , attributeName
            , context
            , expressionMap
        );

        watchKeys(
            element
            , context
            , keys
            , updateFn
        );
    }
    /**
    * Handles updates to the state value for a particular attribute
    * @function
    */
    function updateAttribute(element, attributeName, context, expressionMap, path) {
        var expressionResults = processMapExpression(
            expressionMap
            , context
        )
        , removeAttribute = false
        , attributeText = expressionMap.cleanText
        ;
        //loop through the expression results and append to the attribute text
        Object.keys(expressionResults)
        .reverse()
        .forEach(
            function appendToText(index) {
                var result = expressionResults[index];
                //if the result is nill and this is the only expression, remove the attribute
                if (is_nill(result)) {
                    if (expressionResults.length === 1) {
                        removeAttribute = true;
                    }
                }
                //if non-text value
                else if (
                    is_func(result)
                    || is_objectValue(result)
                    || is_array(result)
                ) {
                    attributeText = cnsts.value;
                    if (!element.hasAttribute(attributeName)) {
                        element.setAttribute(
                            attributeName
                            , attributeText
                        );
                    }
                    element.getAttributeNode(
                        attributeName
                    )[cnsts.value] = result;
                }
                //otherwise add the result to the attribute text at the index position
                else {
                    attributeText =
                        attributeText.substring(0, index)
                        + result
                        + attributeText.substring(index)
                    ;
                }
            }
        );
        //remove the attribute if it had a null or undefined value only
        if (removeAttribute) {
            element.removeAttribute(
                attributeName
            );
            return;
        }
        //if the attribute already has a value
        if (element.hasAttribute(attributeName)) {
            //if this is a self tag then append
            if (path.indexOf("self") !== -1) {
                attributeText =
                    `${element.getAttribute(attributeName).trim()} ${attributeText}`
                ;
            }
        }
        //set the attribute
        element.setAttribute(
            attributeName
            , attributeText
        );
    }
    /**
    * Executes each expression and returns an array of results
    * @function
    */
    function processMapExpression(expressionMap, context) {
        var results = [];
        //looping backwards through the expressions, add each one to the cleanText
        Object.keys(expressionMap.expressions)
        .forEach(
            function executeExpression(index) {
                var expression = expressionMap.expressions[index]
                , result = expression.execute(
                    context
                    , {"quiet":true}
                );
                //if the result is an object then get the first true key
                if (expression.type === "object") {
                    result = getObjectResultKey(
                        result
                    );
                }

                results[index] = result;
            }
        );

        return results;
    }
    /**
    * Finds the first key where the value is truthy
    * @function
    */
    function getObjectResultKey(resultObj) {
        return Object.keys(resultObj)
        .find(
            function chooseKey(key) {
                return resultObj[key];
            }
        );
    }
    /**
    * Resolves the repeat expression, creats a context chain, and then processes
    * the childNodes for each iteration.
    * @function
    */
    function processRepeatElement(parentNamespace, element, pathExprMap, context, path) {
        var expr = element.getAttribute("expr")
        , template = element.innerHTML
        ;

        if (!!expr) {
            doRepeat(
                parentNamespace
                , element.parentNode.tagName
                , element
                , template
                , expr
                , pathExprMap
                , context
                , path
            );
        }
        //remove the repeat
        element.parentNode.removeChild(element);
    }
    /**
    * Processes an element with a repeat attribute
    * @function
    */
    function processRepeatAttrib(parentNamespace, element, pathExprMap, context, path) {
        var parentTag = element.parentNode.tagName
        , template
        , expr = element.getAttribute("repeat")
        , parentPath = path.substring(
            0
            , path.lastIndexOf(".")
        )
        , elPath = path.substring(
            path.lastIndexOf(".") + 1
        )
        , elIndex = elPath.substring(
            0
            , elPath.indexOf("]") + 1
        )
        , elName = elPath.substring(
            elPath.indexOf("]") + 1
        )
        , newPath = `${parentPath}.${elIndex}repeat`
        , newExprPath = `${newPath}.[0]${elName}`
        ;
        //remove the repeat attribute
        element.removeAttribute("repeat");
        //use the outerHTML as the template
        template = element.outerHTML;

        //update the path expression map to use repeat
        Object.keys(pathExprMap)
        .forEach(
            function forEachPathExprMap(exprPath) {
                if (exprPath.indexOf(path) !== -1) {
                    pathExprMap[
                        exprPath.replace(
                            path
                            , newExprPath
                        )
                    ] = pathExprMap[exprPath]
                    ;
                    delete pathExprMap[exprPath];
                }
            }
        );

        //execute the repeat
        doRepeat(
            parentNamespace
            , parentTag
            , element //insert before element
            , template
            , expr
            , pathExprMap
            , context
            , newPath
        );
        //destroy the template element
        element.parentNode.removeChild(element);
    }
    /**
    * Performs the repeat operation
    * @function
    */
    function doRepeat(parentNamespace, parentTag, beforeEl, template, expr, pathExprMap, context, path) {
        //evaluate the expression and get an iterator
        var repeatContext
        , mockParentElement = createElement(parentTag)
        , iter = simpleExpression(expr.replace(TAG_PATT, "$1"), context).iterator
        , nodes
        , repeatGroups = []
        ;
        //if this didn't evaluate to an iterator then skip
        if (!iter.next) {
            return;
        }
        //iterate through the repeat expression
        while(!is_nill(repeatContext = iter.next())) {
            //use the mock parent to generate elements from the template
            mockParentElement.innerHTML = template;
            //move the child nodes to the real parent
            nodes = Array.from(mockParentElement.childNodes);
            insertNodes(
                beforeEl
                , mockParentElement.childNodes
            );
            //record the resulting nodes and their context
            repeatGroups.push(
                {
                    "nodes": nodes
                    , "context": repeatContext
                }
            );
        }
        //process each repeat group
        repeatGroups.forEach(
            function forEachRepeatGroup(repeatGroup) {
                processChildren(
                    parentNamespace
                    , repeatGroup.nodes
                    , pathExprMap
                    , repeatGroup.context
                    , path
                );
            }
        );
    }

    /**
    * Resolves the if expression, if true then inserts the if children
    * @function
    */
    function processIfElement(parentNamespace, element, pathExprMap, context, path) {
        var compiledExpr = getCompiledExpression(
            element
            , "if"
            , pathExprMap
            , path
        )
        , elseEl = element.nextElementSibling
        , elseNodes
        ;

        if (!!elseEl && elseEl.nodeName.toLowerCase() === "else") {
            elseNodes = elseEl.childNodes;
        }

        doIf(
            parentNamespace
            , element
            , compiledExpr
            , pathExprMap
            , element.childNodes
            , elseNodes
            , context
            , path
        );

        //remove the if
        element.parentNode.removeChild(element);
    }
    /**
    * Evaluates the if expression found in the if attribute
    * @function
    */
    function processIfAttrib(parentNamespace, element, pathExprMap, context, path) {
        var compiledExpr = getCompiledExpression(
            element
            , "if"
            , pathExprMap
            , path
        )
        , pass
        , elseEl = element.nextElementSibling
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

        pass = doIf(
            parentNamespace
            , element
            , compiledExpr
            , pathExprMap
            , [element]
            , !!elseEl && [elseEl]
            , context
            , path
        );

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
    function doIf(parentNamespace, element, expr, pathExprMap, ifNodes, elseNodes, context, path) {
        var pass = expr.execute(
            context
            , {"quiet":true}
        )
        , nodes
        , childName
        , offset = 0
        ;

        //if pass then use the if children
        if (pass) {
            nodes = insertNodes(element, ifNodes);
        }
        else if (!!elseNodes) {
            nodes = insertNodes(element, elseNodes);
        }

        //process the nodes
        if (!!nodes) {
            //if the ifNodes[0] IS the element and pass is false
            //  we need to find the index of the else as the offset
            //  so the path matches the expression map
            //  this should only happen when using if/else attributes
            if (!pass && ifNodes[0] === element) {
                offset = [...element.parentElement.children].indexOf(element) + 1;
                path = path.substring(
                    0
                    , path.lastIndexOf(".")
                );
            }

            nodes.forEach(function forEachNode(node, index) {
                if (node.nodeType === 1 || (node.nodeType === 3 && !WSP_PATT.test(node.nodeValue))) {
                    childName = is_upper(node.nodeName)
                        ? node.nodeName.toLowerCase()
                        : node.nodeName
                    ;
                    //if this is the node with the if attribute then don't update the path
                    if (node === element) {
                        processElement(
                            parentNamespace
                            , node
                            , pathExprMap
                            , context
                            , path
                        );
                    }
                    else {
                        processElement(
                            parentNamespace
                            , node
                            , pathExprMap
                            , context
                            , `${path}.[${index + offset}]${childName}`
                        );
                    }
                }
            });
        }

        return pass;
    }
    /**
    * Either gets the compiled expression from the path expression map or create
    * a new compiled expression from the attribute value and add it to the path
    * expression map
    * @function
    */
    function getCompiledExpression(element, attributeName, pathExprMap, path) {
        var expr = element.getAttribute(attributeName)
        , mappedTag = pathExprMap[path]
        , mappedExpr = mappedTag?.attributes[attributeName]
        ;
        //if this tag does not have an expression map entry then create it
        if (!mappedTag) {
            pathExprMap[path] = {
                "type": "tag"
                , "attributes": {}
            };
        }
        //if there isn't an if attribute
        if (!mappedExpr) {
            pathExprMap[path].attributes[attributeName] = {
                "type": "attribute"
                , "expressions": {
                    "0": expression_interface(
                        expr
                    )
                }
                , "cleanText": ""
            };
        }
        //get the compiled expression
        return pathExprMap[path]
            .attributes
            [attributeName]
            .expressions["0"]
        ;
    }
    /**
    * Processes a text node
    * @function
    */
    function processTextNode(textNode, pathExprMap, context, path) {
        //ensure there is an expression map
        if (!pathExprMap[path]) {
            return;
        }
        //reference to the parent element
        var parent = textNode.parentNode
        , expressionMap = pathExprMap[path]
        //if the parent element has only one child, then it becomes the node
        , textElement =
            parent.childNodes.length === 1 && parent
            //otherwise create a span cto contain it
            || createElement('span')
        , variables =
            Object.values(expressionMap.expressions)
            .map(
                function mapExpressionVariables(expression) {
                    return expression.variables
                }
            )
            .flat()
        ;
        //replace the text node with the el
        if (textElement !== parent) {
            textElement.watchers = [];
            parent.replaceChild(
                textElement
                , textNode
            );
        }
        //set the initial value
        setText(
            context
            , expressionMap
            , textElement
        );
        //add the watchers
        if (variables.length > 0) {
            watchKeys(
                textElement
                , context
                , variables
                , setText.bind(
                    null
                    , context
                    , expressionMap
                    , textElement
                )
            );
        }
    }
    /**
    * @function
    */
    function setText(context, expressionMap, element) {
        //run the expressions
        var expressionResults = processMapExpression(
            expressionMap
            , context
        )
        , textValue = expressionMap.cleanText
        ;
        //loop through the text
        Object.keys(expressionResults)
        .reverse()
        .forEach(
            function appendToText(index) {
                var result = expressionResults[index];
                //if the result is nill and this is the only expression, remove the attribute
                if (is_nill(result)) {
                    return;
                }
                //if the result is a funciton then execute it
                else if (
                    is_func(result)
                ) {
                    result = result(
                        context
                    );
                }
                //otherwise add the result to the attribute text at the index position
                else {
                    textValue =
                        textValue.substring(0, index)
                        + result
                        + textValue.substring(index)
                    ;
                }
            }
        );
        //set the node value to the result
        element.innerHTML = textValue
            .replace(LN_END_PATT, "<br>")
            .replace(SPC_PATT, "&nbsp;")
            .replace(TAB_PATT, "&#9;")
        ;
    }
    /**
    * Processes a text node inside a style tag
    * @function
    */
    function processStyleTextNode(textNode, pathExprMap, context, path) {
        var newStyleElement =
            simpleStyle(
                textNode.nodeValue.replace(TRIM_PATT, "$1")
                , context
            )
        , parentStyleElement = textNode.parentNode
        ;
        parentStyleElement.innerHTML = "";
        parentStyleElement.appendChild(
            newStyleElement.childNodes[0]
        );
    }
    /**
    * @function
    */
    function processEventAttributes(namespace, element, context, eventAttributes, expressionMap) {
        element.listenedEvents = [];

        eventAttributes
        .forEach(
            forEachEventAttribute.bind(
                null
                , namespace
                , element
                , context
                , eventAttributes
                , expressionMap
            )
        );
    }
    /**
    * @function
    */
    function forEachEventAttribute(namespace, element, context, eventAttributes, expressionMap, eventAttribName) {
        //get the expression map for this attribute
        var eventAttribExprMap =
            expressionMap.attributes[eventAttribName]
        //there should only be one expression
        , exprKey = Object.keys(eventAttribExprMap.expressions)[0]
        , eventHandlerExpr = eventAttribExprMap.expressions[exprKey]
        , eventName = eventAttribName.substring(2)
        , eventNamespace = `${namespace}.${eventName}`
        , eventHandler = executeHandler.bind(
            null
            , eventHandlerExpr
            , context
        );
        //put the user event manager in the middle
        userEventManager.on(
            eventNamespace
            , eventHandler
        );
        element.listenedEvents.push(
            eventNamespace
        );
    }
    /**
    * @function
    */
    function executeHandler(eventHandlerExpr, context, event) {
        var eventHandler = eventHandlerExpr.execute(
            context
            , {"quiet":true}
        );
        //skip if not a function
        if (!is_func(eventHandler)) {
            return;
        }
        try {
            eventHandler(
                event
            );
        }
        catch(ex) {
            reporter.error(ex);
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

        result.value = value.replace(
            TAG_PATT
            , function forEachMatch(tag, expr) {

                var expr = simpleExpression(expr, context);
                result.keys = result.keys.concat(expr.keys);
                result.values.push(expr.result);
                if (is_object(expr.result) || is_func(expr.result)) {
                    return "";
                }
                return expr.result;
            }
        );

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
    function processChildren(parentNamespace, childNodes, pathExprMap, context, path) {
        var node = childNodes[0]
        , sibling
        , index = 0
        , childName
        ;
        if (!!node) {
            do {
                sibling = node.nextSibling;
                if (node.nodeType === 1 || (node.nodeType === 3 && !WSP_PATT.test(node.nodeValue))) {
                    childName = is_upper(node.nodeName)
                        ? node.nodeName.toLowerCase()
                        : node.nodeName
                    ;
                    //process the child element
                    processElement(
                        parentNamespace
                        , node
                        , pathExprMap
                        , context
                        , `${path}.[${index}]${childName}`
                    );
                    index++;
                }
                else if (!!node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            }
            while((node = sibling) && childNodes.indexOf(node) !== -1);
        }
        return childNodes;
    }
    /**
    * Creates the closure that destroys the element and it's children
    * @function
    */
    function createDestroyMethod(namespace, element) {
        //add the destroy function
        var watchers = element.watchers
        , listenedEvents = element.listenedEvents
        ;
        delete element.watchers;
        delete element.listenedEvents;
        element[cnsts.destroy] = function destroy() {
            //destroy the elements watchers
            if (is_array(watchers)) {
                watchers.forEach(function (watcher) {
                    watcher.parent[cnsts.unwatch](watcher.guids);
                });
            }
            //remove user event listeners
            if (!!listenedEvents) {
                listenedEvents.forEach(
                    function forEachListenedEventName(eventNamespace) {
                        userEventManager.off(eventNamespace);
                    }
                );
            }
            //destroy the children
            destroyChildren(element);
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
    return function SimpleTemplate(viewNamespace, tag, template, data) {
        if (is_nill(data) && is_string(tag)) {
            data = template;
            template = tag;
            tag = null;
        }
        //template could be an array
        if (is_array(template)) {
            template = template.join("\n");
        }

        var element
        , pathExpressionMap
        , cleanMarkup
        , childIndex = 0
        , childNode
        , childPath
        , context
        ;

        //parse the markup and destructure the result
        (
            {pathExpressionMap, cleanMarkup} = xmlBindVariableParser(
                template
                , data
            )
        );

        //create the DOM for the clean markup
        element = convertHtml(
            tag
            , cleanMarkup
        );

        //if there is a self child tag then apply it's attributes to the tag
        if (!!element.children[0] && element.children[0].tagName.toLowerCase() === "self") {
            //get the context now so we can use it on the self tag
            context = createContext(
                element
                , data
            );
            processSelfTag(
                viewNamespace
                , element
                , pathExpressionMap
                , context
            );
        }
        //process each child of the element; the element is either an element
        //  passed using the tag parameter, or a temp element holding the
        //  template contents
        processChildren(
            viewNamespace
            , Array.from(element.childNodes)
            , pathExpressionMap
            , data
            , "$"
        );

        //ensure the element passed as tag has a destroy function
        if (element === tag && !element.hasOwnProperty("$destroy")) {
            //create the destroy method
            createDestroyMethod(
                "$"
                , element
            );
        }

        return element;
    };
}