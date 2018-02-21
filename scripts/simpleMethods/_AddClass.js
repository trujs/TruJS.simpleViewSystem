/**
*
* @factory
*/
function _AddClass(classHelper) {

    /**
    * @worker
    */
    return function AddClass(event, root, className, selector) {
        var elements;
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        else {
            elements = [event.target];
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                classHelper.add(el, className);
            });
        }
    };
}