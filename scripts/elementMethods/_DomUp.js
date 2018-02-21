/**
*
* @factory
*/
function _DomUp(simpleElement) {

    /**
    * @worker
    */
    return function DomUp(element, selector) {
        var parent = element;
        while((parent = parent.parentNode)) {
            if (parent.matches(selector)) {
                return simpleElement(parent);
            }
            if (parent.tagName === "BODY") {
                break;
            }
        }
        return null;
    };
}