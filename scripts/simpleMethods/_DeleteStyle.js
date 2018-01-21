/**
*
* @factory
*/
function _DeleteStyle(styleHelper) {

    /**
    * @worker
    */
    return function DeleteStyle(root, selector, styleName, event) {
        var elements = [root];
        if (isNill(event)) {
            if (isEvent(styleName) || isNill(styleName)) {
                event = styleName;
                styleName = selector;
                selector = null;
            }
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                styleHelper.remove(el, styleName);
            });
        }
    };
}