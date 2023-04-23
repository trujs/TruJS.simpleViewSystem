/**
*
* @factory
*/
function _DeleteAttribute(is_nill, is_empty, is_event) {

    /**
    * @worker
    */
    return function DeleteAttribute(root, selector, attributeName, event) {
        var elements = [root];
        if (is_nill(event)) {
            if (is_event(attributeName) || is_nill(attributeName)) {
                event = attributeName;
                attributeName = selector;
                selector = null;
            }
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!is_empty(elements)) {
            elements.forEach(function forEachEl(el) {
                el.removeAttribute(attributeName);
            });
        }

        return true;
    };
}