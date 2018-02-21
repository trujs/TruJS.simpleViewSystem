/**
*
* @factory
*/
function _HasChildren() {

    /**
    * @worker
    */
    return function HasChildren(element, filter, includeAllNodes) {
        var children = !!includeAllNodes && element.childNodes
            || element.children;

        return
        ensureArray(children)
        .filter(function filterChildren(node) {
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
        .length > 0;
    };
}