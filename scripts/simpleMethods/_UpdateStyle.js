/**
*
* @factory
*/
function _UpdateStyle(styleHelper, is_object, is_nill, is_event, is_empty) {

    /**
    * @worker
    */
    return function UpdateStyle(root, selector, style, styleValue, event) {
        var elements = [root];

        if (is_event(styleValue)) {
            event = styleValue
            if (!is_object(style)) {
                styleValue = style;
                style = selector;
                selector = null;
            }
        }
        if (is_nill(styleValue)) {
            if (!is_object(style)) {
                styleValue = style;
                style = selector;
                selector = null;
            }
        }
        if (is_object(selector)) {
            if (is_event(style)) {
                event = style;
            }
            style = selector;
            selector = null;
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!is_empty(elements)) {
            elements.forEach(function forEachEl(el) {
                if (is_object(style)) {
                    styleHelper.update(el, style);
                }
                else {
                    el.style[style] = styleValue;
                }
            });
        }

        return true;
    };
}