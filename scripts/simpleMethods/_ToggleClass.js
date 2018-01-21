/**
* Toggles the class of a root's selected children
* @factory
*/
function _ToggleClass(classHelper) {

    /**
    * @worker
    */
    return function ToggleClass(root, selector, className, event) {
        var elements = [root];
        if (isNill(event)) {
            if (isEvent(className) || isNill(className)) {
                event = className;
                className = selector;
                selector = null;
            }
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                classHelper.toggle(el, className);
            });
        }
    };
}