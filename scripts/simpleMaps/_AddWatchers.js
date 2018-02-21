/**
* This factory produces a worker function that creates watchers, for each
* watcher map, and appends them to the element's watcher array
* @factory
*/
/**[@dependencies({
    "findWatcher": [".simpleWatcher.findWatcher"]
    , "simpleConstants": ["TruJS.simpleViewSystem.SimpleConstants", [], false]
})]*/
function _AddWatchers(findWatcher, simpleConstants) {

    /**
    * Adds the watch `handler` for each key, if it's parent is a watcher
    * @function
    */
    function watchKeys(element, context, watcherMap) {
        var paths = ensureArray(watcherMap.path)
        , context = watcherMap.context || context
        , handler = watcherMap.handler
        , watchers = []
        , targetEl = watcherMap.target || element;

        if (!!watcherMap.scope) {
            handler = handler.bind(watcherMap.scope);
        }

        paths.forEach(function forEachKey(path) {
            var obj = resolvePath(path, context)
            , guids
            , watcher = findWatcher(obj.parent, obj.index);
            if (!!watcher) {
                watcher = {
                    "index": obj.index
                    , "parent": watcher
                    , "guids": watcher[simpleConstants.watch](obj.index, handler)
                    , "$destroy": function () {
                        watcher.parent[simpleConstants.unwatch](watcher.guids);
                    }
                };
                watchers.push(watcher);
            }
        });

        //add the watchers to the target
        if (isElement(targetEl)) {
            targetEl.watchers = (targetEl.watchers || []).concat(watchers);
        }
    }

    /**
    * @worker
    */
    return function AddWatchers(element, context, watcherMaps) {
        //make sure the watcherMaps is an array
        watcherMaps = ensureArray(watcherMaps);
        //loop through each watcher map, create the watcher and add it to the
        // target's watchers array
        watcherMaps.forEach(function forEachMap(watcherMap) {
            watchKeys(element, context, watcherMap);
        });
    };
}