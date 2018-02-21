/**
*
* @factory
*/
function _MapProcessor($container) {

    /**
    * @worker
    */
    return function MapProcessor(element, context, maps) {
        var simpleMaps = $container(".simpleMaps");

        //loop through the result keys, see if there is a procecssor, and
        //execute it if found
        Object.keys(maps)
        .forEach(function forEachKey(key) {
            if (simpleMaps.hasOwnProperty(key) && !!maps[key]) {
                simpleMaps[key](element, context, maps[key]);
            }
        });

        return maps.element || element;
    };
}