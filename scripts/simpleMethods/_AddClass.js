/**
*
* @factory
*/
function _AddClass(classHelper) {

    /**
    * @worker
    */
    return function AddClass(root, selector, className, event) {
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
                classHelper.add(el, className);
            });
        }
    };
}