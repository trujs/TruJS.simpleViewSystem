/**
*
* @factory
*/
function _DomDown(simpleElement) {

    /**
    * @worker
    */
    return function DomDown(element, filter, includeAllNodes) {
        var children;

        if (isArray(filter)) {
            children = !!includeAllNodes && element.childNodes
                || element.children;
            children =
            ensureArray(children)
            .filter(function filterChildren(child, indx) {
                return filter.indexOf(indx) !== -1;
            });
        }
        else {
            children = element.querySelectorAll(filter);
        }

        return ensureArray(children)
        .map(function mapNodeList(node) {
            return simpleElement(node);
        });
    };
}