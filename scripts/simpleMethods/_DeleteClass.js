/**
*
* @factory
*/
function _DeleteClass(classHelper, is_nill, is_empty, is_event) {

    /**
    * @worker
    */
    return function DeleteClass(root, selector, className, event) {
        var elements = [root];
        if (is_nill(event)) {
            if (is_event(className) || is_nill(className)) {
                event = className;
                className = selector;
                selector = null;
            }
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!is_empty(elements)) {
            elements.forEach(function forEachEl(el) {
                classHelper.remove(el, className);
            });
        }
    };
}