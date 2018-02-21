/**
*
* @factory
*/
function _ToggleClass(classHelper) {

    /**
    * @worker
    */
    return function ToggleClass(element, className) {
        ensureArray(className)
        .forEach(function forEachCls(cls) {
            classHelper.toggle(element, cls);
        });
    };
}