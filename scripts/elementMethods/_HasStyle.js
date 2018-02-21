/**
*
* @factory
*/
function _HasStyle(styleHelper) {

    /**
    * @worker
    */
    return function HasStyle(element, styleName) {
        return
        ensureArray(styleName)
        .every(function everyName(name) {
            return element.style.cssText.indexOf(name) !== -1;
        });
    };
}