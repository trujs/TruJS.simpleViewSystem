/**
*
* @factory
*/
function _DomPrev(simpleElement) {

    /**
    * @worker
    */
    return function DomPrev(element, includeTextNode) {
        if (includeTextNode) {
            return simpleElement(element.previousSibling);
        }
        else {
            return simpleElement(element.previousElementSibling);
        }
    };
}