/**
* @factory
*/
function _SetProperty(
    is_array
    , utils_reference
) {

    /**
    * @worker
    */
    return function SetProperty(rootElement, context, propPath, ...newValue) {
        //if there is not a newValue then we ommitted the context variable
        //  and this property update is on the element
        if (newValue.length === 0) {
            newValue = propPath;
            propPath = context;
            context = null;
        }
        else {
            newValue = newValue[0];
        }
        //path to update could be an array, let's force that
        if (!is_array(propPath)) {
            propPath = [propPath];
        }

        for(let index in propPath) {
            //see if we can find the value
            let ref = utils_reference(
                propPath[index]
                , context || rootElement
            );
            //value found
            if (ref.found) {
                ref.parent[ref.index] = newValue;
            }
        }

        return true;
    };
}