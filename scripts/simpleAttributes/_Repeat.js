/**
*
* @factory
*/
/**[@dependencies({
    "simpleExpression": ["TruJS.simpleViewSystem._SimpleExpression", []]
})]*/
function _Repeat(createElement, simpleExpression) {

    /**
    * @worker
    */
    return function Repeat(element, attribute, context) {
        //get the name of the parent tag so we can mimic it
        var parentTag = element.parentNode.tagName
        , template
        , expr = attribute.value
        , parent = createElement(parentTag)
        , repeatContext
        , iter = simpleExpression(expr, context).iterator
        , nodes, i
        , addNodes = [];

        //remove the repeat attribute
        element.removeAttribute("repeat");

        //set the template after the repeat attribute is removed
        template = element.outerHTML;

        //make sure this evalutated to an iterator
        if (!!iter.next) {
            //iterate, adding a copy of the template
            while(!isNill(repeatContext = iter.next())) {
                parent.innerHTML = template;
                addNodes.push({
                    "context": repeatContext
                    , "target": element.parentNode
                    , "nodes": ensureArray(parent.childNodes)
                    , "index": "before"
                });
            }
        }

        return {
            "addNodes": addNodes
            , "removeNodes": element
        };
    };
}