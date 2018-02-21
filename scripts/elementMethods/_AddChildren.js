/**
*
* @factory
*/
function _AddChildren(elementHelper) {

    /**
    * @worker
    */
    return function AddChildren(element, children, index) {
        isNill(index) && (index = element.childNodes.length - 1);
        ensureArry(children)
        .forEach(function forEachChild(child) {
            child = elementHelper.get(child);
            elementHelper.insert(child, element, index++);
        });
    };
}