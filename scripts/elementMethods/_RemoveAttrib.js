/**
*
* @factory
*/
function _RemoveAttrib() {

    /**
    * @worker
    */
    return function RemoveAttrib(element, attribName) {
        ensureArray(attribName)
        .forEach(function forEachAttr(attr) {
            element.removeAttribute(attr);
        });
    };
}