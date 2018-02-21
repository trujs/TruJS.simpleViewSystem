/**
*
* @factory
*/
/**[@dependencies({
    "simpleExpression": ["TruJS.simpleViewSystem._SimpleExpression", []]
    , "tagPattern": [".simpleUtilities.tagPattern"]
})]*/
function _If(simpleExpression, tagPattern) {
    var cnsts = {
        "removeAttribute": "ifremove"
        , "expressionAttribute": "expr"
        , "elseIfTag": "elseif"
        , "elseTag": "else"
    };

    /**
    * Runs the attribute value through the simple expression
    * @function
    */
    function testExpression(expression, context) {
        return !!expression &&
        !!simpleExpression(
            expression.replace(tagPattern, "$1")
            , context
        ).result
        || false
        ;
    }
    /**
    * Marks successive elements with elseif and else attributes
    * @function
    */
    function markOtherNodes(node) {
        var next = node;
        while(!!(next = next.nextSibling)) {
            if (next.nodeType === 1) {
                let name = next.tagName.toLowerCase();
                if (name === cnsts.elseIfTag) {
                    next.setAttribute(cnsts.removeAttribute, "true");
                }
                else if (name === cnsts.elseTag) {
                    next.setAttribute(cnsts.removeAttribute, "true");
                    break;
                }
                else {
                    break;
                }
            }
        }
    }

    /**
    * @worker
    */
    return function If(name, node, context) {
        var notElse = name !== cnsts.elseTag
        , addNodes
        , childNodes
        , removed = node.hasAttribute(cnsts.removeAttribute);

        if (!removed) {
            //if this is not an else then we'll need to test the expression
            if (notElse) {
                let expr = node.getAttribute(cnsts.expressionAttribute);
                //test the expression
                if (testExpression(expr, context)) {
                    //mark the sibling nodes for removal
                    markOtherNodes(node);
                    //set the elements to add
                    childNodes = node.childNodes;
                }
            }
            else {
                //set the elements to add
                childNodes = node.childNodes;
            }
        }

        if (!!childNodes) {
            addNodes = {
                "index": "before"
                , "target": node.parentNode
                , "nodes":ensureArray(childNodes)
            };
        }

        return {
            "addNodes": addNodes
            , "removeNodes": node
            , "halt": true

        };
    };
}