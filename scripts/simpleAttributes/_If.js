/**
* This factory produces a worker function that processes if attributes.
* @factory
*/
/**[@dependencies({
    "simpleExpression": ["TruJS.simpleViewSystem._SimpleExpression", []]
    , "tagPattern": [".simpleUtilities.tagPattern"]
})]*/
function _If(simpleExpression, tagPattern) {
    var cnsts = {
        "removeAttribute": "ifremove"
        , "elseIfAttribute": "elseif"
        , "elseAttribute": "else"
    };

    /**
    * Runs the attribute value through the simple expression
    * @function
    */
    function testExpression(attribute, context) {
        return !!simpleExpression(attribute.value.replace(tagPattern, "$1"), context).result
    }
    /**
    * Marks successive elements with elseif and else attributes
    * @function
    */
    function markOtherElements(element) {
        var next = element;
        while(!!(next = next.nextSibling)) {
            if (next.nodeType === 1) {
                if (next.hasAttribute(cnsts.elseIfAttribute)) {
                    next.setAttribute(cnsts.removeAttribute, "true");
                }
                else if (next.hasAttribute(cnsts.elseAttribute)) {
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
    return function If(element, attribute, context) {
        var notElse = attribute.name !== cnsts.elseAttribute
        , removeElement;

        //this could be if, elseif, or else
        //if this has a remove attribute then a previous element passed and
        //marked this for removal
        if (element.hasAttribute(cnsts.removeAttribute)) {
            removeElement = element;
        }
        //if this is not an else then we'll need to test the expression
        else if (notElse) {
            //test the expression
            if (testExpression(attribute, context)) {
                //mark the other attributes for removal
                markOtherElements(element);
            }
            else {
                removeElement = element;
            }
        }
        //remove the attribute
        element.removeAttribute(attribute.name);

        return {
            "removeNodes": removeElement
            , "halt": !!removeElement
        };
    };
}