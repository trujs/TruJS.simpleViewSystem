/**
*
* @factory
*/
function _DeleteClass(classHelper) {

    /**
    * @worker
    */
    return function DeleteClass(root, selector, className, event) {
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
                classHelper.remove(el, className);
            });
        }
    };
}