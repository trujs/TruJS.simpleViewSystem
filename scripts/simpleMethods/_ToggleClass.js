/**
* Toggles the class of a root's selected children
* @factory
*/
function _ToggleClass(classHelper) {

    /**
    * @worker
    */
    return function ToggleClass(event, root, className, selector) {
        var elements;
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        else {
            elements = [event.target];
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                classHelper.toggle(el, className);
            });
        }
    };
}