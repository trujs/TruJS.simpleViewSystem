/**
*
* @factory
*/
function _DeleteStyle(styleHelper) {

    /**
    * @worker
    */
    return function DeleteStyle(event, root, styleName, selector) {
        var elements;
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        else {
            elements = [event.target];
        }
        if (!isEmpty(elements)) {
            elements.forEach(function forEachEl(el) {
                styleHelper.remove(el, styleName);
            });
        }
    };
}