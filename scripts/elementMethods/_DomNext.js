/**
*
* @factory
*/
function _DomNext(simpleElement) {

    /**
    * @worker
    */
    return function DomNext(element, includeAllNodes) {
        if (includeAllNodes) {
            return simpleElement(element.nextSibling);
        }
        else {
            return simpleElement(element.nextElementSibling);
        }
    };
}