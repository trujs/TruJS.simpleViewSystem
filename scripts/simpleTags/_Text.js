/**
*
* @factory
*/
/**[@dependencies({
    "processValue": [".simpleUtilities.processValue"]
    , "wspTrimPattern": [".simpleUtilities.wspTrimPattern"]
})]*/
function _Text(createElement, processValue, wspTrimPattern) {

    /**
    * @worker
    */
    return function Text(name, node, context) {
        //get the text node's value
        var value =  node.nodeValue.replace(wspTrimPattern, "$1")
        //process the value and see if we have any keys
        , result = processValue(value, context)
        //reference to the parent element
        , parent = node.parentNode
        //create/get an el tag to hold the text
        , el = isEmpty(value) && null
            || parent.childNodes.length === 1 && parent
            || createElement('span')
        , watchers
        , removeNode
        ;

        if (!isEmpty(value)) {
            //replace the text node with the el
            if (el !== parent) {
                el.watchers = [];
                parent.replaceChild(el, node);
            }

            //set the node value to the result
            el.innerHTML = result.value;

            //add the watchers
            if (result.keys.length > 0) {
                watchers = {
                    "context": context
                    , "path": result.keys
                    , "target": el
                    , "handler": function () {
                        el.innerHTML = processValue(value, context).value;
                    }
                };
            }
        }
        else {
            removeNode = node
        }

        return {
            "addWatchers": watchers
            , "removeNodes": removeNode
        };
    };
}