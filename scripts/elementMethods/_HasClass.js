/**
*
* @factory
*/
function _HasClass(classHelper) {

    /**
    * @worker
    */
    return function HasClass(element, className) {
        return
        ensureArray(className)
        .every(function everyCls(cls) {
            return classHelper.has(element, cls);
        });
    };
}