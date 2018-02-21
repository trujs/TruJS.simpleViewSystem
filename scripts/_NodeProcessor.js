/**
*
* @factory
*/
/**[@dependencies({
    "arrayFromArguments": [".array.fromArguments"]
    , "tagProcessor": ["TruJS.simpleViewSystem._TagProcessor", []]
    , "attributeProcessor": ["TruJS.simpleViewSystem._AttributeProcessor", []]
    , "mapProcessor": ["TruJS.simpleViewSystem._MapProcessor", []]
    , "simpleMixin": ["TruJS.simpleViewSystem._SimpleMixin", []]
    , "wspPattern": [".simpleUtilities.wspPattern"]
    , "simpleConstants": ["TruJS.simpleViewSystem.SimpleConstants",[],false]
})]*/
function _NodeProcessor(
    arrayFromArguments
    , simpleMethods
    , tagProcessor
    , attributeProcessor
    , mapProcessor
    , simpleMixin
    , wspPattern
    , simpleConstants
) {

    /**
    * Processes the element including special tags, if and repeat, and
    * processes it's shildren
    * @function
    */
    function processNode(node, data) {
        //create a context that adds the standard methods and properties
        var context = createContext(node, data)
        , tagResult, attribResult;

        //process the tag and capture the result
        tagResult = processTag(node, context);
        //if we have a result, update the node and context
        !!tagResult
            && (node = tagResult.node)
            && (context = tagResult.context);
        //see if we are halting
        if (!!tagResult && tagResult.halt === true) {
            return node;
        }

        //process the attributes for element types only
        if (node.nodeType === 1 && node.hasAttributes()) {
            // , by default
            if (!tagResult || tagResult.processAttributes !== false) {
                //process the attributes and capture the results
                attribResult = processAttributes(node, context);
                //if we have a result, update the node and context
                !!attribResult
                    && (node = attribResult.node)
                    && (context = attribResult.context);
                //see if we are halting
                if (!!attribResult && attribResult.halt === true) {
                    return node;
                }
                tagResult = apply(attribResult, tagResult);
            }
        }

        //process the children unless a tag or attribute sets the flag to false
        if (!tagResult || tagResult.processChildren !== false) {
            processChildren(node, context);
            fixSelected(node);
        }

        //add any mixins unless a tag or attribute sets the flag to false
        if (!tagResult || tagResult.processMixins !== false) {
            if (node.nodeType === 1) {
                simpleMixin(node, context);
            }
        }

        if (!!node) {
            createDestroyMethod(node);
        }

        return node;
    }
    /**
    * Creates the context object, adding the simple methds and element
    * properties, making the data object the prototype
    * @function
    */
    function createContext(node, data) {
        var context = Object.create(data);

        Object.keys(simpleMethods)
        .forEach(function (key) {
            context[key] = runMethod.bind(context);
            function runMethod() {
                var args = arrayFromArguments(arguments)
                , event = args.pop();
                simpleMethods[key].apply(this, [event, node].concat(args));
                event.stopPropagation();
            }
        });

        //set the element on the context
        context["$element"] = node;
        context["$context"] = context;

        return context;
    }
    /**
    * Runs the tag processor, if a process map is returned then run the map
    * processor, switch out the node, and update the context
    * @function
    */
    function processTag(node, context) {
        //run the tag processor
        var processMap = tagProcessor(node, context);

        //process the processMap, switch out the
        if (!!processMap) {
            let switchNode = mapProcessor(node, context, processMap);
            processMap.node = switchOutNode(node, switchNode);
            processMap.context = createContext(node, Object.getPrototypeOf(context));
            postProcessMap(node, processMap)
            return processMap;
        }
    }
    /**
    * Process each attribute, if a process map is returned then run the map
    * processor, switch out the node, and update the context. Halt if the halt
    * attribute is true.
    * @function
    */
    function processAttributes(node, context) {
        var processMap;

        ensureArray(node.attributes)
        .every(function forEachAttr(attr) {
            var attribResult = attributeProcessor(node, attr, context);
            if (!!attribResult) {
                let switchNode = mapProcessor(node, context, attribResult);
                processMap = apply(attribResult, processMap);
                processMap.node = switchOutNode(node, switchNode);
                processMap.context = createContext(node, Object.getPrototypeOf(context));
                postProcessMap(node, processMap);
                node = processMap.node;
                context = processMap.context;
                if (processMap.halt === true) {
                    return false;
                }
            }
            return true;
        });

        return processMap;
    }
    /**
    * Adds the switchElement before element and removes element from the parent
    * @function
    */
    function switchOutNode(node, switchNode) {
        if (!!switchNode && node !== switchNode) {
            if (!!node.parentNode) {
                node.parentNode.insertBefore(switchNode, node);
                node.parentNode.removeChild(node);
            }
            node = switchNode;
        }
        return node;
    }
    /**
    * Checks to see if the node needs to be cleared and the process halted
    * @function
    */
    function postProcessMap(node, processMap) {
        //if we removed the element and a node was not specified, halt
        if (processMap.node === node) {
            if (processMap.remove === true || processMap.remove === node || (isArray(processMap.remove) && processMap.remove.indexOf(node) !== -1)) {
                processMap.halt = true;
                processMap.node = null;
            }
        }
    }
    /**
    * Processes each childNode of the node
    * @function
    */
    function processChildren(node, context) {
        var curNode = node.firstChild, sibling;
        if (!!curNode) {
            do {
                sibling = curNode.nextSibling;
                if (curNode.nodeType === 1 || (curNode.nodeType === 3 && !wspPattern.test(curNode.nodeValue))) {
                    processNode(curNode, context);
                }
                else if (!!curNode.parentNode){
                    curNode.parentNode.removeChild(curNode);
                }
            }
            while((curNode = sibling));
        }
        return node.childNodes;
    }
    /**
    * Creates the closure that destroys the element and it's children
    * @function
    */
    function createDestroyMethod(node) {
        //add the destroy function
        var watchers = node.watchers;
        delete node.watchers;
        node[simpleConstants.destroy] = function destroy() {
            //destroy the elements watchers
            if (isArray(watchers)) {
                watchers.forEach(function (watcher) {
                    watcher.parent[simpleConstants.unwatch](watcher.guids);
                });
            }
            //destroy the children
            destroyChildren(node);
        };
    }
    /**
    * Loops through and destroys the child nodes
    * @function
    */
    function destroyChildren(node) {
        //run the destroy on the children or decend
        for (var i = 0, l = node.childNodes.length; i < l; i++) {
            if (node.childNodes[i].hasOwnProperty(simpleConstants.destroy)) {
                node.childNodes[i][simpleConstants.destroy]();
            }
            else {
                destroyChildren(node.childNodes[i]);
            }
        }
    }
    /**
    * Re-sets the select tags selected value.
    * This is a work around for the proper option to be selected if options
    * were added one at a time with a repeat
    * @function
    */
    function fixSelected(node) {
        if (node.tagName === "SELECT") {
            let selectedOption = node.querySelector("[selected]");
            if (!!selectedOption) {
                node.value = selectedOption.value;
            }
            else {
                node.value = "";
            }
        }
    }

    /**
    * @worker
    */
    return function NodeProcessor(node, data) {
        return processNode(node, data);
    };
}