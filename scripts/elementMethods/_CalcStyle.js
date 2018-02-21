/**
*
* @factory
*/
function _CalcStyle(getComputedStyle) {
    var DASH_PATT = /-/g;

    /**
    * Convert any style names with dashes to camel case; border-width = borderWidth
    * @function
    */
    function convertStyleName(style) {
        return style.split(DASH_PATT)
        .map(function mapStyle(seg, indx) {
            if (indx > 0) {
                return seg.substring(0, 1).toUppercase() + seg.substring(1);
            }
            return seg;
        })
        .join("");
    }

    /**
    * @worker
    */
    return function CalcStyle(element, styleName) {
        var calcStyles = getComputedStyle(element)
        , styleObj = {};
        ensureArray(styleName)
        .forEach(function forEachStyle(style) {
            var styleName = convertStyleName(style);
            styleObj[style] = calcStyles[styleName];
        });
        return styleObj;
    };
}