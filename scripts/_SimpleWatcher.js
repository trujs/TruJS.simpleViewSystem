/**
* This factory takes an object and wraps its properties with getters and setters
* returning a new object with those wrapped properties. If the property is an
* object itself, it will be ran through the wrapper as well; unless it has a
* _nowatch property.
*
* When new properties are added to the wrapped object or the wrapper object, the
* $process method must be called to add those as wrapped properties.
*
* Use the $watch method to listen to property changes on a per property basis,
* including nested objects; using the dot notation for the path. If the path
* that is being listened to doesn't exist, it will be created and wrapped.
*
* Example:
*   watchedObj.$watch("name", func);
*   watchedObj.$watch("address.street", func);
*   watchedObj.$watch(["my.obj.path1", "my.obj.path2"], func);
*
* @factory
*/
function _SimpleWatcher(newGuid, simpleErrors) {
    var self
    , cnsts = {
        "nowatch": "_nowatch"
        , "watch": "$watch"
        , "unwatch": "$unwatch"
    }
    , SPLIT_PATT = /[.]/;

    /**
    * Creates a new object whos properties are mapped to those of the original
    * object
    * @function
    */
    function createProperties(obj) {
        var properties = {};

        Object.keys(obj).forEach(function forEachKey(key) {
            properties[key] = createProperty(key, obj);
        });

        return properties;
    }
    /**
    * Creates a watch closure and $watch property
    * @function
    */
    function AddWatchProperty(properties, obj) {
        //create the watch closure
        var watch = function watch(paths, handler) {
            var guids = [];

            if(!isArray(paths)) {
                paths = [paths];
            }

            paths.forEach(function forEachPath(path) {
                var segments = path.split(SPLIT_PATT), guid;

                //if there is only one segment then this is a local property
                if (segments.length === 1) {
                    guid = addHandler(
                        path
                        , handler
                        , properties
                    );
                }
                //otherwise this is a child property
                else {
                    guid = addChildHandler(
                        segments[0]
                        , segments.slice(1).join(".")
                        , handler
                        , properties
                    );
                }

                guids = guids.concat(guid);
            });

            return guids;
        };

        //create the property
        properties[cnsts.watch] = {
            "enumerable": true
            , "value": watch
        };
    }
    /**
    * Creates an unwatch closure and $unwatch property
    * @function
    */
    function AddUnWatchProperty(properties, obj) {
        var unwatch = function unwatch(guids) {

            if(!isArray(guids)) {
                guids = [guids];
            }

            guids.forEach(function forEachPath(guid) {
                delHandler(guid, properties);
            });
        };

        //create the property
        properties[cnsts.unwatch] = {
            "enumerable": true
            , "value": unwatch
        };
    }
    /**
    * Gets the `property` then adds `handler` to the
    * property `handlers` array
    * @function
    */
    function addHandler(name, handler, properties) {
        var property = getProperty(name, properties)
        , handlers = !!property && property.handlers
        , guid = newGuid();

        if (!property) {
            throw new Error(simpleErrors.missingProperty.replace("{key}", name));
        }

        handlers[guid] = handler;

        return guid;
    }
    /**
    * Gets the `property` then finds the handler, removing it if found
    * @function
    */
    function delHandler(guid, properties) {

        //find the property with the guid
        Object.keys(properties)
        .every(function forEachKey(key) {
            if (key !== cnsts.watch && key !== cnsts.unwatch) {
                var handlers = properties[key].handlers;

                if (handlers.hasOwnProperty(guid)) {
                    if (isObject(handlers[guid])) {
                        handlers[guid][cnsts.unwatch](guid);
                    }
                    delete handlers[guid];
                    return false;
                }
            }

            return true;
        });

    }
    /**
    * Creates a child handler closure
    * @function
    */
    function addChildHandler(name, childPath, handler, properties) {
        //create the child handler closure
        var property = getProperty(name, properties)
        , handlers = !!property && property.handlers
        , obj = !!property && property.get()
        , childHandler = function childHandler(key, value) {
            handler(name + "." + key, value);
        }
        , guid;

        if (!property) {
            throw new Error(simpleErrors.missingProperty.replace("{key}", name));
        }

        //add the handler to the child object
        guid = obj[cnsts.watch](childPath, childHandler)[0];

        //add the guid to the property handlers
        handlers[guid] = obj;

        return guid;
    }
    /**
    * Looks for a property with `name` in `properties`
    * @function
    */
    function getProperty(name, properties) {
        if (properties.hasOwnProperty(name)) {
            return properties[name];
        }
    }
    /**
    * Create the property descriptor for the `key` in `object`
    * @function
    */
    function createProperty(key, obj) {
        //an array to store the change handlers
        var handlers = {}
        //a reference to a possible watcher
        , watcher = processValue(obj[key], key)
        ;
        //the function for setting the value
        function setter(value) {
            watcher = processValue(value, key);
            obj[key] = value;
            fireHandlers(handlers, key, watcher||value);
        }
        //the function for getting the value
        function getter() {
            return watcher || obj[key];
        };

        //create and return the property descriptor
        return {
            "enumerable": true
            , "get": getter
            , "set": setter
            , "handlers": handlers
        };
    }
    /**
    * Creates and returns a watcher if the value is an object, does not have a
    * _nowatch property and is not already a watcher. If already a watcher, that
    * is returned
    * @function
    */
    function processValue(value, key) {
        if (!isObject(value)) {
            return;
        }
        if (value.hasOwnProperty(cnsts.nowatch)) {
            return;
        }
        if (isWatcher(value)) {
            return value;
        }
        return self(value, key);
    }
    /**
    * Fires any handlers
    * @function
    */
    function fireHandlers(handlers, key, value) {
        Object.keys(handlers).forEach(function forEachHandler(handlerKey) {
            try {
                var handler = handlers[handlerKey];
                handler.apply(null, [key, value]);
            }
            catch(ex) {
                //TODO: add reporter
                console.log(ex);
            }
        });
    }
    /**
    * Tests a value to see if it's a watcher
    * @function
    */
    function isWatcher(obj) {
        return isObject(obj) && Object.getPrototypeOf(obj) === self || false;
    }

    /**
    * @worker
    */
    function SimpleWatcher(obj) {
        //create a property object for each property in obj
        var properties = createProperties(obj)
        //add the $watch property
        AddWatchProperty(properties, obj);
        //add the $unwatch property
        AddUnWatchProperty(properties, obj);
        //create and return the watcher object
        return Object.freeze(Object.create(self, properties));
    };

    //set self to the worker function
    self = SimpleWatcher;
    //add the isWatcher function
    self.isWatcher = isWatcher;

    //return the watcher
    return SimpleWatcher;
}