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
    simpleExpression
    , expression_interface
    , simpleMethods
    , simpleMixin
    , createSimpleNamespace
    , xmlBindVariableParser
    , app_subsystem_userInterface_userEventManager
    , statenet_common_findStateful
    , statenet_common_isStateful
    , dom_createElement
    , dom_createTextNode
    , dom_createComment
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
    , TRIM_PATT = /^[\n\r\t ]+(.*?)[\n\r\t ]+$/gm
    , LN_END_PATT = /\r?\n/g
    , SPC_PATT = /[ ][ ]+/g
    , TAB_PATT = /\t/g
    , INDXR_PATT = /\[\]/g
    , TEXT_PLACEHOLDER_PATT = /\<\#text\>/g
    , ESCAPED_TEXT_PLACEHOLDER_PATT = /\#\&lt\;\#text\&gt\;/g
    , EMPTY_STYLE_PATT = /[ \n\t]*[A-z-]+[ \n\t]*[:][ \n\t]*[;]/g
    , EMPTY_STYLE_BLOCK_PATT = /[ \n\t]*[A-z-_#.&0-9]+[ \n\t]*[{][ \n\t]*[}]/g
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
        , elAttrs = Array.from(element.attributes)
        , children = Array.from(self.childNodes)
        , removeList = []
        , eventAttributes
        , path = "$.[0]self"
        , selfExprMap = pathExprMap[path]
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

        //process any mixins last so child elements have already been processed
        if (element.nodeType === 1) {
            simpleMixin(
                element
                , context
            );
        }
        
        //create the destroy method
        createDestroyMethod(namespace, element);
    }
    /**
    * Create the context object, making data the prototype
    * @function
    */
    function createContext(element, data) {
        var properties = {}
        , contextPrototype
        ;
        //add the simple methods property descriptors
        Object.keys(simpleMethods)
        .forEach(
            function (key) {
                properties[key] = {
                    "enumberable": true
                    , "value": simpleMethods[key]
                        .bind(
                            null
                            , element
                        )
                };
            }
        );
        //set the element on the context
        properties["$element"] = {
            "enumerable": true
            , "get": function get() {
                return element;
            }
        };
        properties["$class"] = {
            "enumerable": true
            , "get": function get() {
                return element.className;
            }
        };
        properties["$attributes"] = {
            "enumerable": true
            , "get": function get() {
                return !!element.attributes
                    ? [...element.attributes]
                    : []
            }
        };
        properties["$state"] = properties["$$"] = {
            "enumerable": true
            , "value": findStateful(data)
        };
        properties["$self"] = properties["$"] = {
            "enumerable": true
            , "value": data
        };

        //we don't want to have the previous elements context as the prototype
        contextPrototype = Object.getPrototypeOf(data);
        if (!statenet_common_isStateful(contextPrototype)) {
            contextPrototype = data;
        }

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
        //remove new line and multi-spaces
        attributeText = attributeText
            .replace(TRIM_PATT, " ")
        ;
        //remove the attribute if it had a null or undefined value only
        if (removeAttribute) {
            if (!element.hasAttribute(attributeName)) {
                element.removeAttribute(
                    attributeName
                );
            }
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
        var template = element.innerHTML
        , parentTagName = element.parentNode.tagName
        , compiledExpr = getCompiledExpression(
            element
            , "expr"
            , pathExprMap
            , path
        )
        , placeholderNode = dom_createComment(
            "repeat placeholder node"
        )
        , repeatToken = {
            "parentNamespace": parentNamespace
            , "parentTagName": parentTagName
            , "placeholderNode": placeholderNode
            , "compiledExpr": compiledExpr
            , "template": template
            , "pathExprMap": pathExprMap
            , "context": context
            , "path": path
        };
        //add the placeholder node
        element.parentElement.insertBefore(
            placeholderNode
            , element
        );
        //remove the repeat element from the flow
        element.parentNode.removeChild(element);
        //execute the repeat
        doRepeat(
            repeatToken
        );
        //watch any state variables
        watchCompiledExpression(
            placeholderNode
            , context
            , pathExprMap[path].attributes["expr"]
            , doRepeat.bind(
                null
                , repeatToken
            )
        );
    }
    /**
    * Processes an element with a repeat attribute
    * @function
    */
    function processRepeatAttrib(parentNamespace, element, pathExprMap, context, path) {
        var template
        , parentTagName = element.parentNode.tagName
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
        , compiledExpr = getCompiledExpression(
            element
            , "repeat"
            , pathExprMap
            , path
        )
        , placeholderNode = dom_createComment(
            "repeat placeholder node"
        )
        , repeatToken = {
            "parentNamespace": parentNamespace
            , "parentTagName": parentTagName
            , "placeholderNode": placeholderNode
            , "compiledExpr": compiledExpr
            , "template": null
            , "pathExprMap": pathExprMap
            , "context": context
            , "path": newPath
        };
        //remove the repeat attribute
        element.removeAttribute("repeat");
        //use the outerHTML as the template
        repeatToken.template = element.outerHTML;
        //add the placeholder node
        element.parentElement.insertBefore(
            placeholderNode
            , element
        );
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
            repeatToken
        );
        //remove the template element from the flow
        element.parentNode.removeChild(element);
        //watch any state variables
        watchCompiledExpression(
            placeholderNode
            , context
            , pathExprMap[newExprPath].attributes["repeat"]
            , doRepeat.bind(
                null
                , repeatToken
            )
        );
    }
    /**
    * Performs the repeat operation
    * @function
    */
    function doRepeat(repeatToken) {
        var [
            parentNamespace
            , parentTag
            , beforeEl
            , compiledExpr
            , template
            , pathExprMap
            , context
            , path
        ] = Object.values(repeatToken)
        , repeatContext
        , mockParentElement = createElement(
            parentTag
        )
        //evaluate the expression and get an iterator
        , iter = compiledExpr.execute(
            context
            , {"quiet":true}
        )
        , nodes
        , repeatGroups = []
        , repeatElements = repeatToken.repeatElements
        ;
        //if this didn't evaluate to an iterator then skip
        if (!iter || !iter.next) {
            return;
        }
        //if there are repeat elements then remove ethose
        if (!is_empty(repeatElements)) {
            for (let i = 0, len = repeatElements.length; i < len; i++) {
                repeatElements[i].$destroy();
                repeatElements[i]?.parentElement?.removeChild(
                    repeatElements[i]
                );
            }
            iter.reset();
        }
        else if (!repeatToken.repeatElements) {
            repeatToken.repeatElements = [];
        }
        //iterate through the repeat expression
        while(!is_nill(repeatContext = iter.next())) {
            //use the mock parent to generate elements from the template
            mockParentElement.innerHTML = template;
            //move the child nodes to the real parent
            nodes = Array.from(mockParentElement.childNodes);
            //add the nodes to the list
            repeatToken.repeatElements =
                repeatToken.repeatElements.concat(
                    nodes
                )
            ;
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
    * Uses a compiled expression to get a list of variables and adds watchers
    * for any that are stateful
    * @function
    */
    function watchCompiledExpression(element, context, compiledExpr, handlerFn) {
        //get the list of variables
        var variables =
            Object.values(compiledExpr.expressions)
            .map(
                function mapExpressionVariables(expression) {
                    return expression.variables
                }
            )
            .flat()
        ;
        //add the watchers
        if (variables.length > 0) {
            watchKeys(
                element
                , context
                , variables
                , handlerFn
            );
            return true;
        }
        return false;
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
        //watch any state variables
        watchCompiledExpression(
            textElement
            , context
            , expressionMap
            , setText.bind(
                null
                , context
                , expressionMap
                , textElement
            )
        );
    }
    /**
    * @function
    */
    function setText(context, expressionMap, element) {
        //run the expressions
        var isHybrid = expressionMap.cleanText
            .trim()
            .length > 1
        , textValue = getExpressionText(
            context
            , expressionMap
        )
        ;
        //if this is not a hybrid then
        if (!isHybrid) {
            if (textValue === "null") {
                textValue = null;
            }
            else if (textValue === "undefined") {
                textValue = undefined;
            }
        }
        //set the node value to the result
        element.innerHTML = textValue
            .trim()
            .replace(LN_END_PATT, "<br>")
            .replace(SPC_PATT, "&nbsp;")
            .replace(TAB_PATT, "&#9;")
        ;
    }
    /**
    * @function
    */
    function getExpressionText(context, expressionMap) {
        var expressionResults = processMapExpression(
            expressionMap
            , context
        )
        , textValue = expressionMap.cleanText
            .replace(
                TEXT_PLACEHOLDER_PATT
                , ""
            )
            .replace(
                ESCAPED_TEXT_PLACEHOLDER_PATT
                , ""
            )
        ;
        //loop through the text
        Object.keys(expressionResults)
        .reverse()
        .forEach(
            function appendToText(index) {
                var result = expressionResults[index]
                ;
                //if the result is a function execute it for the real result
                if (
                    is_func(result)
                ) {
                    result = result(
                        context
                    );
                }
                //if the result is nill and this is the only expression, remove the attribute
                if (is_nill(result)) {
                    return;
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

        return textValue;
    }
    /**
    * Processes a text node inside a style tag
    * @function
    */
    function processStyleTextNode(textNode, pathExprMap, context, path) {
        var expressionMap = pathExprMap[path]
        , variables =
            Object.values(expressionMap.expressions)
            .map(
                function mapExpressionVariables(expression) {
                    return expression.variables
                }
            )
            .flat()
        , styleNode = textNode.parentNode
        ;
        //set the initial style text
        setStyleText(
            styleNode
            , expressionMap
            , context
        );
        //add the watchers
        if (variables.length > 0) {
            watchKeys(
                textNode
                , context
                , variables
                , setStyleText.bind(
                    null
                    , styleNode
                    , expressionMap
                    , context
                )
            );
        }
    }
    /**
    * @function
    */
    function setStyleText(styleNode, expressionMap, context) {
        var cssMarkup = getExpressionText(
            context
            , expressionMap
        );
        //remove empty styles
        cssMarkup = cssMarkup
            .replace(
                EMPTY_STYLE_PATT
                , ""
            )
            .replace(
                SPC_PATT
                , ""
            )
            .replace(
                EMPTY_STYLE_BLOCK_PATT
                , ""
            )
        ;

        styleNode.innerHTML = cssMarkup;
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
        //
        element.listenedEvents.push(
            eventNamespace
        );
    }
    /**
    * @function
    */
    function executeHandler(eventHandlerExpr, context, event) {
        var eventHandler = eventHandlerExpr
            .execute(
                context
                , {"quiet":true}
            )
        ;
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
    * Adds the watch `handler` for each key, if it's parent is a watcher
    * @function
    */
    function watchKeys(element, context, keys, handler) {
        var watchers = [];

        keys.forEach(function forEachKey(key) {         
            watchers.push({
                "key": key
                , "parent": context.$state
                , "guids": context.$state[cnsts.watch](
                    key
                    , function stateNetWrap(event, key) {
                        handler(
                            key
                            , event.value
                            , event
                        );
                    }
                )
            });
            
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
                //if the child is an element it can have children
                if (child.nodeType === 1){
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

        //process any mixins last so child elements have already been processed
        simpleMixin(
            element
            , context
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