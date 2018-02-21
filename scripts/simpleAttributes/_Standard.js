/**
*
* @factory
*/
/**[@dependencies({
    "regExHasMatch": [".regEx.hasMatch"]
    , "regExGetFirstMatch": [".regEx.getFirstMatch"]
    , "simpleExpression": ["TruJS.simpleViewSystem._SimpleExpression", []]
    , "processValue": [".simpleUtilities.processValue"]
    , "simpleConstants": ["TruJS.simpleViewSystem.SimpleConstants", [], false]
    , "tagPattern": [".simpleUtilities.tagPattern"]
})]*/
function _Standard(
    regExHasMatch
    , regExGetFirstMatch
    , simpleExpression
    , processValue
    , simpleConstants
    , tagPattern
) {

    /**
    * checks for the tell tell "on" prefix for event attributes
    * @function
    */
    function isEventAttribute(attribute) {
        if (attribute.name.indexOf("on") === 0) {
            if(regExHasMatch(tagPattern, attribute.value)) {
                return true;
            }
        }
        return false;
    }
    /**
    * Adds an event handler to the element using the attribute name for the
    * event and evaluates the attribute value for the handler function.
    * @function
    */
    function addEventHandler(element, attribute, context) {
        //the event name is the attribute name minus the on
        var name = attribute.name.substring(2)
        //extract the expression
        , expr = regExGetFirstMatch(tagPattern, attribute.value), func;
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
    * Processes the attribute, updating the value, adding watchers for any keys
    * @function
    */
    function processAttribute(element, attribute, context) {
        //process the attrib value and see if we have keys
        var expr = attribute.value
        , name = attribute.name
        , result = processValue(attribute.value, context)
        , watchers;

        //add the watch handler for each key
        if (result.keys.length > 0) {
            watchers = {
                "context": context
                , "path": result.keys
                , "target": element
                , "handler": function watchHandler(key, value) {
                    setAttribute(processValue(expr, context));
                }
            };
        }

        setAttribute(result);

        return watchers;

        //closure to process the attribute
        function setAttribute(result) {
            var value = result.value;
            if (isObject(value) || isFunc(value)) {
                element.getAttributeNode(name)[simpleConstants.value] = value;
                element.setAttribute(name, simpleConstants.value);
            }
            else if (!isNill(value)) {
                element.setAttribute(name, value);
            }
            else {
                element.removeAttribute(name);
            }
        }
    }

    /**
    * @worker
    */
    return function Standard(element, attribute, context) {
        if (isEventAttribute(attribute)) {
            //resolve the expression and add the handler
            addEventHandler(element, attribute, context);
            //remove the attribute
            element.removeAttribute(attribute.name);
        }
        else {
            return {
                "addWatchers": processAttribute(element, attribute, context)
            };
        }
    };
}