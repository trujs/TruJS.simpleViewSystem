/**
*
* @factory
*/
/**[
@dependencies({
    "simpleConstants": ["TruJS.simpleViewSystem.SimpleConstants", [], false]
})]*/
function _AttributeProcessor(simpleAttributes, simpleConstants) {

    /**
    * @worker
    */
    return function AttributeProcessor(element, attribute, context) {
        var attrHandler = simpleAttributes[attribute.name], results, watchers;

        //if there isn't a handler for the attribute, use standard
        if (!attrHandler) {
            attrHandler = simpleAttributes[simpleConstants.standardAttribute];
        }

        //run the attribute handler
        return attrHandler(element, attribute, context);
    };
}