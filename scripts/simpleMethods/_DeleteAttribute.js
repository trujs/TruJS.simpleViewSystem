/**
*
* @factory
*/
function _DeleteAttribute(attributeHelper) {

    /**
    * @worker
    */
    return function DeleteAttribute(event, root, attributeName, selector) {
        var elements;
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        else {
            elements = [event.target];
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                attributeHelper.remove(el, attributeName);
            });
        }
    };
}