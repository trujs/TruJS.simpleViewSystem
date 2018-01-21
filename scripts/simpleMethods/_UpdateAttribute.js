/**
*
* @factory
*/
function _UpdateAttribute() {

    /**
    * @worker
    */
    return function UpdateAttribute(root, selector, attributes, attributeValue, event) {
        var elements = [root];

        if (isEvent(attributeValue)) {
            event = attributeValue
            if (!isObject(attributes)) {
                attributeValue = attributes;
                attributes = selector;
                selector = null;
            }
        }
        if (isNill(attributeValue)) {
            if (!isObject(attributes)) {
                attributeValue = attributes;
                attributes = selector;
                selector = null;
            }
        }
        if (isObject(selector)) {
            if (isEvent(attributes)) {
                event = attributes;
            }
            attributes = selector;
            selector = null;
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                if (isObject(attributes)) {
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