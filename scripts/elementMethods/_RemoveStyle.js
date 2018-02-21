/**
*
* @factory
*/
function _RemoveStyle(styleHelper) {

    /**
    * @worker
    */
    return function RemoveStyle(element, styleName) {
        styleHelper.remove(element, styleName);
    };
}