/**
* Toggles the class of a root's selected children
* @factory
*/
function _ToggleClass(classHelper, is_nill, is_empty, is_event) {

    /**
    * @worker
    */
    return function ToggleClass(root, selector, className, event) {
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
                classHelper.toggle(el, className);
            });
        }

        return true;
    };
}