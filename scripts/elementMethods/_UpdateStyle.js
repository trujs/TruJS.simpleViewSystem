/**
*
* @factory
*/
function _UpdateStyle(styleHelper) {

    /**
    * @worker
    */
    return function UpdateStyle(element, style, styleValue) {
        var styleObj = style;
        if (isString(style)) {
            styleObj = {};
            styleObj[style] = styleValue;
        }
        styleHelper.update(element, styleObj);
    };
}