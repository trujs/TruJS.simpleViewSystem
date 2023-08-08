/**
*
* @factory
*/
function _GetAttribute(is_nill, is_empty, is_event) {

    /**
    * @worker
    */
    return function GetAttribute(root, selector, attributeName, event) {
        var element = root;
        if (is_nill(event)) {
            if (is_event(attributeName) || is_nill(attributeName)) {
                event = attributeName;
                attributeName = selector;
                selector = null;
            }
        }
        if (!!selector) {
            element = root.querySelector(selector);
        }
        if (!!element) {
            return element.getAttribute(attributeName);
        }

        return true;
    };
}