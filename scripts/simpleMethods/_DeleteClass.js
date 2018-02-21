/**
*
* @factory
*/
function _DeleteClass(classHelper) {

    /**
    * @worker
    */
    return function DeleteClass(event, root, className, selector) {
        var elements;
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        else {
            elements = [event.target];
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                classHelper.remove(el, className);
            });
        }
    };
}