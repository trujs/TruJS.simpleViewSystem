/**
*
* @factory
*/
function _DeleteAttribute() {

    /**
    * @worker
    */
    return function DeleteAttribute(root, selector, attributeName, event) {
        var elements = [root];
        if (isNill(event)) {
            if (isEvent(attributeName) || isNill(attributeName)) {
                event = attributeName;
                attributeName = selector;
                selector = null;
            }
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                el.removeAttribute(attributeName);
            });
        }
    };
}