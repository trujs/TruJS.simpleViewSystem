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
function _SimpleWatcher() {
    var self
    , cnsts = {
        "nowatch": "_nowatch"
        , "process": "$process"
        , "watch": "$watch"
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
            if(!isArray(paths)) {
                paths = [paths];
            }
            paths.forEach(function forEachPath(path) {
                var segments = path.split(SPLIT_PATT)
                , childPath, property
                ;

                if (segments.length === 1) {
                    addPropertyHandler(path, handler, properties, obj);
                }
                else {
                    childPath = segments.slice(1).join(".");
                    path = segments[0];
                    property = getProperty(path, properties, obj);
                    addChildHandler(path, childPath, property, handler);
                }
            });
        };

        //create the property
        properties[cnsts.watch] = {
            "enumerable": true
            , "value": watch
        };
    }
    /**
    * Gets the `property`, creating it if needed, then adds `handler` to the
    * property `handlers` array
    * @function
    */
    function addPropertyHandler(name, handler, properties, obj) {
        var property = getProperty(name, properties, obj)
        , handlers = property.handlers
        ;
        if (handlers.indexOf(handler) === -1) {
            handlers.push(handler);
        }
    }
    /**
    * Creates a child handler closure
    * @function
    */
    function addChildHandler(path, childPath, property, handler) {
        //create the child handler closure
        var childHandler = function childHandler(key, value) {
            var newPath = path + "." + key;
            handler(newPath, value);
        }
        , watcher = property.get()
        ;

        //add the handler to the child object
        watcher[cnsts.watch](childPath, childHandler);
    }
    /**
    * Adds a $process property for the `process` function
    * @function
    */
    function AddProcessProperty(properties, process) {
        properties[cnsts.process] = {
            "enumerable": true
            , "value": process
        };
    }
    /**
    * Looks for a property with `name` in `properties`, if not found it Creates
    * one.
    * @function
    */
    function getProperty(name, properties, obj) {
        if (properties.hasOwnProperty(name)) {
            return properties[name];
        }
        var property = createProperty(name, obj);
        property.set({});
        return property;
    }
    /**
    * Create the property descriptor for the `key` in `object`
    * @function
    */
    function createProperty(key, obj) {
        //an array to store the change handlers
        var handlers = []
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
        handlers.forEach(function forEachHandler(handler) {
            try {
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
    function SimpleWatcher(obj, key) {
        //create a property object for each property in obj
        var properties = createProperties(obj)
        //reference to the watcher object created at the end
        , watcher
        //function for processing new properties on either the obj or watcher
        , process = function () {
            //add any watcher keys that don't exist
            Object.keys(watcher).forEach(function forEachKey(key) {
                if (!(key in properties)) {
                    if (!(key in obj)) {
                        obj[key] = watcher[key];
                    }
                }
            });
            //create watcher properties for any obj key not in properties
            Object.keys(obj).forEach(function forEachKey(key) {
                if (!(key in properties)) {
                    var property = createProperty(key, obj);
                    //add the properties to the properties collection
                    properties[key] = property;
                    //add the property to the watcher object
                    Object.defineProperty(watcher, key, property);
                }
            });

        };
        //add the $watch property
        AddWatchProperty(properties, obj);
        //add the $process property
        AddProcessProperty(properties, process);
        //create and return the watcher object
        return watcher = Object.create(self, properties);
    };

    //set self to the worker function
    self = SimpleWatcher;
    //add the isWatcher function
    self.isWatcher = isWatcher;

    //return the watcher
    return SimpleWatcher;
}