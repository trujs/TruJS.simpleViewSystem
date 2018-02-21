/**
*
* @factory
*/
function _GetAttrib(simpleConstants) {

    /**
    * @worker
    */
    return function GetAttrib(element, attribName) {
        var attrVals = {};
        ensureArray(attribName)
        .forEach(function forEachAttr(attr) {
            attrVals[attr] = element.getAttributeNode(attr);
            if (attrVals[attr].value === simpleConstants.value) {
                attrVals[attr] = attrVals[attr][simpleConstants.value];
            }
            else {
                attrVals[attr] = attrVals[attr].value;
            }
        });
        return attrVals;
    };
}