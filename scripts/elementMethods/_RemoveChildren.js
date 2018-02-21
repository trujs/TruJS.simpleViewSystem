/**
*
* @factory
*/
function _RemoveChildren() {

    /**
    * @worker
    */
    return function RemoveChildren(element, filter, includeAllNodes) {
        var children = !!includeAllNodes && element.childNodes
            || element.children;
            
        ensureArray(children)
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
        .forEach(function forEachChild(node) {
            if(!!node.parentNode) {
                node.parentNode.removeChild(node);
            }
        });
    };
}