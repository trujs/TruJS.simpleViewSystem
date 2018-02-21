/**
*
* @factory
*/
function _GetStyle() {

    /**
    * @worker
    */
    return function GetStyle(element, styleName) {
        var styleObj = {};
        ensureArray(styleName)
        .forEach(function forEachStyle(style) {
            styleObj[style] = element.style[style];
        });
        return styleObj;
    };
}