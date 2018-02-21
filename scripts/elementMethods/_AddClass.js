/**
*
* @factory
*/
function _AddClass(classHelper) {

    /**
    * @worker
    */
    return function AddClass(element, className) {
        ensureArray(className)
        .forEach(function forEachCls(cls) {
            classHelper.add(element, cls);
        });
    };
}