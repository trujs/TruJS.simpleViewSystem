/**
*
* @factory
*/
function _SimpleMixin($container, findWatcher) {
    var mixins = $container.hasDependency("mixins") && $container(".mixins")
    , cnsts = {
        "value": "$value"
        , "watch": "$watch"
    };

    /**
    * Creates a key value pair for each attribute
    * @function
    */
    function getAttributes(element) {
        var attributes = {};

        for (var i = 0, l = element.attributes.length; i < l; i++) {
            var attr = element.attributes[i];
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
            var obj = resolvePath(watcher.path, context)
            , guids
            , handler = watcher.handler;

            watcher = findWatcher(obj.parent, obj.index);

            if (!!watcher) {
                watcherObjs.push({
                    "key": obj.index
                    , "parent": watcher
                    , "guids": watcher[cnsts.watch](obj.index, handler)
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