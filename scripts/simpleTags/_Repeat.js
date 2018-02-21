/**
*
* @factory
*/
/**[@dependencies({
    "simpleExpression": ["TruJS.simpleViewSystem._SimpleExpression", []]
})]*/
function _Repeat(createElement, simpleExpression) {
    var cnsts = {
        "expressionAttribute": "expr"
    };

    /**
    * @worker
    */
    return function Repeat(name, node, context) {
        //get the name of the parent tag so we can mimic it
        var parentTag = node.parentNode.tagName
        , template
        , expr = node.getAttribute(cnsts.expressionAttribute)
        , parent = createElement(parentTag)
        , repeatContext
        , iter = simpleExpression(expr, context).iterator
        , nodes, i
        , addNodes = [];

        //set the template after the repeat attribute is removed
        template = node.outerHTML;

        //make sure this evalutated to an iterator
        if (!!iter.next) {
            //iterate, adding a copy of the template
            while(!isNill(repeatContext = iter.next())) {
                parent.innerHTML = template;
                addNodes.push({
                    "context": repeatContext
                    , "target": node.parentNode
                    , "nodes": ensureArray(parent.childNodes)
                    , "process": true
                });
            }
        }

        return {
            "addNodes": addNodes
            , "removeNodes": node
            , "halt": true
        };
    };
}