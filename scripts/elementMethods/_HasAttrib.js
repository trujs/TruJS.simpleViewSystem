/**
*
* @factory
*/
function _HasAttrib() {

    /**
    * @worker
    */
    return function HasAttrib(element, attribName) {
        return ensureArray(attribName)
        .every(function everyName(name) {
            return element.hasAttribute(name);
        });
    };
}