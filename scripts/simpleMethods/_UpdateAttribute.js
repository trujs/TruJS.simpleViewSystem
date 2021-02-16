/**
*
* @factory
*/
function _UpdateAttribute(is_event, is_object, is_nill, is_empty) {

    /**
    * @worker
    */
    return function UpdateAttribute(root, selector, attributes, attributeValue, event) {
        var elements = [root];

        if (is_event(attributeValue)) {
            event = attributeValue
            if (!is_object(attributes)) {
                attributeValue = attributes;
                attributes = selector;
                selector = null;
            }
        }
        if (is_nill(attributeValue)) {
            if (!is_object(attributes)) {
                attributeValue = attributes;
                attributes = selector;
                selector = null;
            }
        }
        if (is_object(selector)) {
            if (is_event(attributes)) {
                event = attributes;
            }
            attributes = selector;
            selector = null;
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!is_empty(elements)) {
            elements.forEach(function forEachEl(el) {
                if (is_object(attributes)) {
                    Object.keys(attributes)
                    .forEach(function forEachAttr(key) {
                        el.setAttribute(key, attributes[key]);
                    });
                }
                else {
                    el.setAttribute(attributes, attributeValue);
                }
            });
        }
    };
}