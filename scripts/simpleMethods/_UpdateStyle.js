/**
*
* @factory
*/
function _UpdateStyle(styleHelper) {

    /**
    * @worker
    */
    return function UpdateStyle(root, selector, style, styleValue, event) {
        var elements = [root];

        if (isEvent(styleValue)) {
            event = styleValue
            if (!isObject(style)) {
                styleValue = style;
                style = selector;
                selector = null;
            }
        }
        if (isNill(styleValue)) {
            if (!isObject(style)) {
                styleValue = style;
                style = selector;
                selector = null;
            }
        }
        if (isObject(selector)) {
            if (isEvent(style)) {
                event = style;
            }
            style = selector;
            selector = null;
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                if (isObject(style)) {
                    styleHelper.update(el, style);
                }
                else {
                    el.style[style] = styleValue;
                }
            });
        }
    };
}