/**
*
* @factory
*/
function _ToggleAttrib() {

    /**
    * @worker
    */
    return function ToggleAttrib(element, attribName) {
        ensureArray(attribName)
        .forEach(function forEachAttr(attrName) {
            element.setAttribute(attrName, !element.getAttribute(attrName));
        });
    };
}