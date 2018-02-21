/**
* Toggles the attribute of an element
* @factory
*/
function _ToggleAttribute(attributeHelper) {

    /**
    * @worker
    */
    return function ToggleAttribute(event, root, attributeName, selector) {
        var elements;
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        else {
            elements = [event.target];
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                attributeHelper.toggle(el, attributeName);
            });
        }
    };
}