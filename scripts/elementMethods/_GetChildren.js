/**
*
* @factory
*/
function _GetChildren(simpleElement) {

    /**
    * @worker
    */
    return function GetChildren(element, filter, includeAllNodes) {
        var children = !!includeAllNodes && element.childNodes
            || element.children;
            
        return ensureArray(children)
        .filter(function filterNodes(node, indx) {
            if (isArray(filter)) {
                return filter.indexOf(indx) !== -1;
            }
            else if (isString(filter)) {
                if (node.nodeType === 1) {
                    return node.matches(filter);
                }
                return false;
            }
            return true;
        })
        .map(function mapChildren(node) {
            return simpleElement(node);
        });
    };
}