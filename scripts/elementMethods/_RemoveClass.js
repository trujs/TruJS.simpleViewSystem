/**
*
* @factory
*/
function _RemoveClass(classHelper) {

    /**
    * @worker
    */
    return function RemoveClass(element, className) {
        ensureArray(className)
        .forEach(function forEachCls(cls) {
            classHelper.remove(element, cls);
        });
    };
}