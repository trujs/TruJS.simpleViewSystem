/**
*
* @factory
*/
function _SetValue(
    utils_reference
    , is_event
    , is_nill
    , is_empty
) {

    /**
    * @worker
    */
    return function SetValue(rootElement, selector, value, event) {
        var elements = [root];
        if (is_nill(event)) {
            event = value;
            value = selector;
        }
        if (!!selector) {
            elements = root.querySelectorAll(selector);
        }
        if (!is_empty(elements)) {
            elements.forEach(function forEachEl(el) {
                el.value = value;
            });
        }
    };
}