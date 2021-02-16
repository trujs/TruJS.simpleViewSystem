/**
*
* @factory
*/
function _SimpleMixin(
    mixins
    , statenet_common_findStateful
    , utils_reference
) {
    var cnsts = {
        "value": "$value"
        , "watch": "$watch"
    }
    /**
    * @alias
    */
    , findStateful = statenet_common_findStateful
    ;

    /**
    * Creates a key value pair for each attribute
    * @function
    */
    function getAttributes(element) {
        var attributes = {};

        for (var i = 0, l = element.attributes.length; i < l; i++) {
            var attr = element.attributes[i];
            if (!!attr.value && attr.value !== "false")
            attributes[attr.name] = attr[cnsts.value] || attr.value;
        }

        return attributes;
    }
    /**
    * Creates the watcher objects used by the destroy function
    * @function
    */
    function createWatchers(watchers, context) {
        var watcherObjs = [];

        watchers.forEach(function forEachWatcher(watcher) {
            var ref = utils_reference(
                watcher.path
                , context
            )
            , guids
            , handler = watcher.handler;

            watcher = findStateful(ref.parent, ref.index);

            if (!!watcher) {
                watcherObjs.push({
                    "key": ref.index
                    , "parent": watcher
                    , "guids": watcher[cnsts.watch](
                        ref.index
                        , function stateNetWrap(event, key) {
                            handler(
                                key
                                , event.value
                                , event
                            );
                        }
                    )
                });
            }
        });

        return watcherObjs;
    }

    /**
    * @worker
    */
    return function SimpleMixin(element, context) {
        //if there aren't any mixins then leave
        if (!mixins) {
            return;
        }

        //get a key value store for the attributes
        var attribs = getAttributes(element);

        //loop through the attributes looking for the mixins
        Object.keys(attribs).forEach(function forEachAttr(key) {
            if (mixins.hasOwnProperty(key)) {
                var value = attribs[key]
                , watchers =
                    mixins[key](element, attribs, context);
                //add the watchers if there are any
                if (!!watchers) {
                    element.watchers = element.watchers
                        .concat(createWatchers(watchers, context));
                }
            }
        });
    };
}