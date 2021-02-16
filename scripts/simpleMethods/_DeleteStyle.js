/**
*
* @factory
*/
function _DeleteStyle(styleHelper, is_nill, is_empty, is_event) {

    /**
    * @worker
    */
    return function DeleteStyle(root, selector, styleName, event) {
        var elements = [root];
        if (is_nill(event)) {
            if (is_event(styleName) || is_nill(styleName)) {
                event = styleName;
                styleName = selector;
                selector = null;
            }
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!is_empty(elements)) {
            elements.forEach(function forEachEl(el) {
                styleHelper.remove(el, styleName);
            });
        }
    };
}