/**
*
* @factory
*/
function _SimpleMixin(
    mixins
    , statenet_common_findStateful
    , utils_reference
    , is_promise
) {
    var cnsts = {
        "value": "$value"
        , "watch": "$addListener"
    }
    /**
    * A regular expression pattern for replacing dashes
    * @property
    */
    , DASH_PATT = /[-]/g
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
            if (attr.value !== "false") {
                if (!!attr.value) {
                    attributes[attr.name] = attr[cnsts.value] || attr.value;
                }
                else  {
                    attributes[attr.name] = "";
                }
            }
        }

        return attributes;
    }
    /**
    * Creates the watcher objects used by the destroy function
    * @function
    */
    function createWatchers(watchers, context) {
        var watcherObjs = []
        ;

        watchers.forEach(function forEachWatcher(watcher) {
            watcherObjs = watcherObjs.concat(
                context.$addListener(
                    watcher.path
                    , function stateNetWrap(event, key) {
                        return watcher.handler(
                            key
                            , event.value
                            , event
                        );
                    }
                )
            );
        });

        return watcherObjs;
    }

    return SimpleMixin;

    /**
    * @worker
    */
    function SimpleMixin(element, context) {
        //if there aren't any mixins then leave
        if (!mixins) {
            return;
        }

        //get a key value store for the attributes
        var attribs = getAttributes(element)
        , watchers = []
        ;

        //loop through the attributes looking for the mixins
        Object.keys(attribs).forEach(
            function forEachAttr(key) {
                var path = key.replace(DASH_PATT, ".")
                , ref = utils_reference(
                    path
                    , mixins
                );
                //if we found a mixin controller proceed
                if (ref.found === true) {
                    var value = attribs[key]
                    //execute the mixin worker
                    , watchers =
                        ref.value(
                            element
                            , attribs
                            , context
                        )
                    ;
                    if (!!watchers) {
                        if (!element.watchers) {
                            element.watchers = [];
                        }
                        element.watchers = element.watchers
                            .concat(
                                createWatchers(watchers, context)
                            );
                    }
                }
            }
        );
    }
}