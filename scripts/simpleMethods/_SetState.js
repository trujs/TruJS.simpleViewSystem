/**
* @factory
*/
function _SetState(
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
    return function SetState(rootElement, context, pathToUpdate, valueToSet) {
        if (!context) {
            return;
        }
        //path to update could be an array, let's force that
        if (!is_array(pathToUpdate)) {
            pathToUpdate = [pathToUpdate];
        }

        for(let index in pathToUpdate) {
            //see if we can find the value
            let ref = utils_reference(
                pathToUpdate[index]
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
                    stateful[ref.index] = valueToSet;
                }
            }
        }

        return true;
    };
}