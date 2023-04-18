/**
* @factory
*/
function _ToggleState(
    utils_reference
    , statenet_common_findStateful
    , is_array
) {
    /**
    * @alias
    */
    const findStateful = statenet_common_findStateful
    ;

    /**
    * @worker
    */
    return function ToggleState(rootElement, context, pathToToggle) {
        if (!context) {
            return;
        }
        //pathToToggle can be an array of paths, let's force that
        if (!is_array(pathToToggle)) {
            pathToToggle = [pathToToggle];
        }

        for(let index in pathToToggle) {
            //see if we can find the value
            let ref = utils_reference(
                pathToToggle[index]
                , context
            )
            , stateful
            ;
            //value found
            if (ref.found) {
                stateful = findStateful(
                    ref.parent
                    , ref.index
                );
                if (!!stateful) {
                    stateful[ref.index] = !ref.parent[ref.index];
                }
            }
        }

        return true;
    };
}