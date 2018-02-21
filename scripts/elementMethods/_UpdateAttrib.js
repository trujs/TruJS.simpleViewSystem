/**
*
* @factory
*/
function _UpdateAttrib(simpleConstants) {

    /**
    * @worker
    */
    return function UpdateAttrib(element, attrib, attribValue) {
        var attrObj = attrib;
        if (isString(attrib)) {
            attrObj = {};
            attrObj[attrib] = attribValue;
        }
        Object.keys(attrObj)
        .forEach(function forEachKey(key) {
            var value = attrObj[key]
            , obj
            , attr;
            if (typeof value === "object") {
                obj = value;
                value = simpleConstants.value;
            }
            element.setAttribute(key, value);
            if (!!obj) {
                element.getAttributeNode(key)[simpleConstants.value] = obj;
            }
        });
    };
}