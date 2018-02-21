/**
*
* @factory
*/
function _UpdateAttribute(attributeHelper) {

    /**
    * @worker
    */
    return function UpdateAttribute(event, root, attributes, attributeValue, selector) {
        var elements;
        if (isObject(attributes)) {
            selector = attributeValue;
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        else {
            elements = [event.target];
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                attributeHelper.update(el, attributes, attributeValue);
            });
        }
    };
}