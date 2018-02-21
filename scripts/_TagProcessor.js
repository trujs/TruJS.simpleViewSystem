/**
*
* @factory
*/
function _TagProcessor(simpleTags) {
    var NODE_NAME_PATT = /\#([A-z_-]+)/;

    /**
    * Gets the name name of the node that will be used to lookup the tag handler
    * , if an element the tag name, otherwise it's the node name without the #
    * prefix
    * name
    * @function
    */
    function getNodeName(node) {
        return (node.tagName || node.nodeName.replace(NODE_NAME_PATT, "$1"))
        .toLowerCase();
    }

    /**
    * @worker
    */
    return function TagProcessor(element, context) {
        var name = getNodeName(element)
        , tagHandler = simpleTags[name], results, watchers;

        //if there isn't a handler for the attribute, use standard
        if (!!tagHandler) {
            //run the tag handler
            return tagHandler(name, element, context);
        }
    };
}