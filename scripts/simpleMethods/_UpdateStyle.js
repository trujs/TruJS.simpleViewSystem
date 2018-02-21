/**
*
* @factory
*/
function _UpdateStyle(styleHelper) {

    /**
    * @worker
    */
    return function UpdateStyle(event, root, style, styleValue, selector) {
        var elements;
        if (isObject(style)) {
            selector = styleValue;
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        else {
            elements = [event.target];
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