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
function _SimpleWatcher(newGuid, simpleErrors, funcAsync, simpleReporter) {
    var self = {}, selfAr = [], selfFn = emFn
    , cnsts = {
        "nowatch": "__nowatch"
        , "freeze": "__freeze"
        , "seal": "__seal"
        , "extensible": "__ext"
        , "prototype": "__proto"
        , "async": "__async"
        , "watch": "$watch"
        , "unwatch": "$unwatch"
        , "process": "$process"
        , "destroy": "$destroy"
        , "all": "$all"
        , "every": "$every"
    }
    , reserved = Object.keys(cnsts).map(function (k) { return cnsts[k]; })
    , SPLIT_PATT = /[.]/
    , INDXR_PATT = /\[(.+?)\]/g;

    /**
    * Creates a new object whos properties are mapped to those of the original
    * object
    * @function
    */
    function createProperties(obj, options) {
        var properties = {};

        Object.keys(obj).forEach(function forEachKey(key) {
            if (reserved.indexOf(key) === -1) {
                properties[key] = createProperty(key, obj, options);
            }
        });

        return properties;
    }
    /**
    * Creates a watch closure and $watch property
    * @function
    */
    function AddWatchProperty(properties, obj, options) {
        //create the watch closure
        var watch = function watch(paths, handler) {
            var guids = [];

            //process the watcher to ensure new properties are watched
            properties[cnsts.process].value();

            //update the paths to an array
            if(!isArray(paths)) {
                //using the $all path to lookup all properties plus all children
                if (paths.indexOf(cnsts.all) === 0) {
                    paths = Object.keys(obj)
                    .map(function (key) {
                        return key + ((isObject(obj[key]) || isArray(obj[key]))  && ("." + cnsts.all) || "");
                    });
                }
                //using the $every path to lookup all local properties
                else if (paths.indexOf(cnsts.every) === 0) {
                    paths = Object.keys(obj)
                    .map(function (key) {
                        return key + paths.replace(cnsts.every, "");
                    });
                }
                else {
                    paths = [paths];
                }
            }

            //process the paths
            paths.forEach(function forEachPath(path) {
                //convert any indexer patterns to dot notation
                path = path.replace(INDXR_PATT, function(match, val) {
                    return "." + val;
                });
                //split the path by dot notation
                var segments = path.split(SPLIT_PATT)
                , key = segments[0]
                , property = getProperty(key, properties)
                , guid;
                //if there isn't a property then create it if we're not frozen
                if (!property && !(options.freeze || options.seal || !options.extensible)) {
                    obj[key] = segments.length > 1 && {} || null;
                    properties[cnsts.process].value();
                    property = getProperty(key, properties);
                }
                //if there isn't a property then see if the key is on the prototype
                if (!property && !!options.prototype && options.prototype.hasOwnProperty(key)) {
                    options.prototype[cnsts.watch]([path], handler);
                    return;
                }
                //if the property doesn't exist then throw an error
                if (!property) {
                    throw new Error(simpleErrors.missingProperty.replace("{key}", key));
                }
                //if there is only one segment then this is a local property
                if (segments.length === 1) {
                    guid = addHandler(
                        property
                        , handler
                    );
                }
                //otherwise this is a child property
                else {
                    guid = addChildHandler(
                        key
                        , segments.slice(1).join(".")
                        , handler
                        , property
                    );
                }

                guids = guids.concat(guid);
            });

            return guids;
        };

        //create the property
        properties[cnsts.watch] = {
            "enumerable": false
            , "value": watch
        };
    }
    /**
    * Creates an unwatch closure and $unwatch property
    * @function
    */
    function AddUnWatchProperty(properties, obj, options) {
        var unwatch = function unwatch(guids) {
            if (guids === "all") {
                guids = getAllGuids(properties);
            }
            if(!isArray(guids)) {
                guids = [guids];
            }
            guids.forEach(function forEachPath(guid) {
                removeHandler(guid, properties);
            });
            if (!!options.prototype && options.prototype !== self) {
                options.prototype[cnsts.unwatch](guids);
            }
        };

        //create the property
        properties[cnsts.unwatch] = {
            "enumerable": false
            , "value": unwatch
        };
    }
    /**
    * Runs the destroy command on all of the child watchers, removes all of the
    * handlers
    * @function
    */
    function AddDestroyProperty(properties, options, obj) {
        var destroy = function destroy() {
            //destroy all of the child watchers
            Object.keys(properties)
            .forEach(function forEachKey(key) {
                if (reserved.indexOf(key) === -1) {
                    var val = properties[key].get();
                    if (isWatcher(val)) {
                        val[cnsts.destroy]();
                    }
                    properties[key].destroyed = true;
                }
            });
            //remove all the handlers
            properties[cnsts.unwatch].value("all");
            //if this is the prototype own, destroy that also
            if (options.protoOwner === obj) {
                options.prototype[cnsts.destroy]();
            }
        };

        //create the property
        properties[cnsts.destroy] = {
            "enumerable": false
            , "value": destroy
        };
    }
    /**
    * Adds the $process function to the properties
    * @function
    */
    function AddProcessProperty(properties, process) {
        //create the property
        properties[cnsts.process] = {
            "enumerable": false
            , "value": process
        };
    }
    /**
    * Gets all of the guids for all of the handlers
    * @function
    */
    function getAllGuids(properties) {
        var guids = [];

        Object.keys(properties)
        .forEach(function forEachKey(key) {
            if (reserved.indexOf(key) === -1) {
                guids = guids.concat(Object.keys(properties[key].handlers));
            }
        });

        return guids;
    }
    /**
    * Gets the `property` then adds `handler` to the
    * property `handlers` array
    * @function
    */
    function addHandler(property, handler) {
        var handlers = property.handlers
        , guid = newGuid();

        handlers[guid] = handler;

        return guid;
    }
    /**
    * Adds the array of child handers to their associated property if exists
    * @function
    */
    function addChildHandlers(property, childHandlers) {
        //if there isn't a watcher then no need to add any handlers
        if (!property.watcher) {
            return;
        }

        var watcher = property.watcher;

        //loop through each handler to see if there is an associated child to
        // add the handler to
        childHandlers.forEach(function forEachChild(childHandler) {
            //see if the child path exists
            var ref = resolvePath(childHandler.childPath, watcher);
            //if the parent is a watcher then add the handler
            if (isWatcher(ref.parent)) {
                addChildHandler(
                    childHandler.key
                    , childHandler.childPath
                    , childHandler.handler
                    , property
                );
            }

        });
    }
    /**
    * Creates a child handler closure
    * @function
    */
    function addChildHandler(name, childPath, handler, property) {
        //create the child handler closure
        var handlers = property.handlers
        , obj = property.get()
        , childHandler = function childHandler(key, value) {
            handler(name + "." + key, value);
        }
        , guid;

        //add the handler to the child object
        guid = obj[cnsts.watch](childPath, childHandler)[0];

        //add the guid to the property handlers
        handlers[guid] = {
            "key": name
            , "guid": guid
            , "childPath": childPath
            , "handler": handler
        };

        return guid;
    }
    /**
    * Removes and returns any handlers associated with the watched object
    * @function
    */
    function removeChildHandlers(property) {
        var guids = []
        , childHandlers = [];

        //get the handlers
        Object.keys(property.handlers)
        .forEach(function forEachGuid(guid) {
            if (!isFunc(property.handlers[guid])) {
                guids.push(guid);
                childHandlers.push(property.handlers[guid]);
            }
        });

        //remove the handlerList
        guids.forEach(function forEachGuid(guid) {
            delete property.handlers[guid];
        });

        return childHandlers;
    }
    /**
    * Removes the child handler
    * @function
    */
    function removeChildHandler(property, childHandler) {
        if (!!property.watcher) {
            property.watcher[cnsts.unwatch](childHandler.guid);
        }
    }
    /**
    * Gets the `property` then finds the handler, removing it if found
    * @function
    */
    function removeHandler(guid, properties) {
        //find the property with the guid
        Object.keys(properties)
        .every(function forEachKey(key) {
            if (reserved.indexOf(key) === -1) {
                var handlers = properties[key].handlers;
                if (handlers.hasOwnProperty(guid)) {
                    //if the handler is an object then it's the child watcher
                    if (!isFunc(handlers[guid])) {
                        removeChildHandler(properties[key], handlers[guid]);
                    }
                    delete handlers[guid];
                    return false;
                }
            }
            return true;
        });
    }
    /**
    * Fires any handlers
    * @function
    */
    function fireHandlers(handlers, key, value, options) {
        var handlerList = [];

        //loop through the handlers, creating an array
        // this is needed because firing one handler might destroy the next
        Object.keys(handlers).forEach(function forEachHandler(handlerKey) {
            if (isFunc(handlers[handlerKey])) {
                handlerList.push(handlers[handlerKey]);
            }
        });

        if (options.async) {
            funcAsync(executeHandlers);
        }
        else {
            executeHandlers();
        }

        //execute
        function executeHandlers() {
            //fire each handler
            handlerList.forEach(function forEachHandler(handler) {
                try {
                    handler.apply(null, [key, value]);
                }
                catch(ex) {
                    simpleReporter.error(ex);
                }
            });
        }
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
    function createProperty(key, obj, options) {
        //a reference to a possible watcher
        var property = {
            "enumerable": true
            , "handlers": {}
            , "watcher": null
            , "key": key
        }
        , val = obj[key]
        ;
        //if the property is a function then wrap it
        if (isFunc(val)) {
            val = wrapFunction(property, val, options);
        }
        //process the value
        property.watcher = processValue(val, options);
        //the function for setting the value
        property.set = createSetter(property, key, obj, options);
        //the function for getting the value
        property.get = createGetter(property, key, obj);
        //create the property descriptor
        return property;
    }
    /**
    * Creates the setter closure
    * @function
    */
    function createSetter(property, key, obj, options) {
        return function setter(value) {
            var childHandlers;
            //check to see if the watcher has been destroyed
            if (!!property.destroyed) {
                throw new Error(simpleErrors.destroyed.replace("{key}", key));
            }
            //if there is a watcher then destroy it
            if (!!property.watcher) {
                childHandlers = removeChildHandlers(property);
                property.watcher[cnsts.destroy]();
            }
            //create the new watcher
            property.watcher = processValue(value, options);
            //if there are child handlers then add those back
            if (!!childHandlers) {
                addChildHandlers(property, childHandlers);
            }
            //update the value
            obj[key] = value;
            fireHandlers(property.handlers, key, property.watcher||value, options);
        };
    }
    /**
    * Creates the getter closure
    * @function
    */
    function createGetter(property, key, obj) {
        return function getter() {
            //check to see if the watcher has been destroyed
            if (!!property.destroyed) {
                throw new Error(simpleErrors.destroyed.replace("{key}", key));
            }
            return property.watcher || obj[key];
        };
    }
    /**
    * Creates and returns a watcher if the value is an object, does not have a
    * _nowatch property and is not already a watcher. If already a watcher, that
    * is returned
    * @function
    */
    function processValue(value, options) {
        if (!isObject(value) && !isArray(value) && !isFunc(value)) {
            return;
        }
        if (value.hasOwnProperty(cnsts.nowatch)) {
            delete value[cnsts.nowatch];
            return;
        }
        if (isWatcher(value)) {
            return value;
        }
        //create the watcher with the
        return SimpleWatcher(value, options);
    }
    /**
    * Wraps the function to call the property handers when ethe function is
    * called
    * @function
    */
    function wrapFunction(property, func, options) {
        return function wrapped() {
            //run the function and capture the output
            var result = func.apply(this, arguments);
            //fire the handlers
            fireHandlers(property.handlers, property.key, result, options);
            //return the result
            return result;
        };
    }
    /**
    * Checks the watched and original object for additions
    * @function
    */
    function processWatcher(properties, watched, obj, options) {
        //find any properties on the watched object that aren't on the poperties object
        Object.keys(watched)
        .forEach(function forEachKey(key) {
            if (!properties.hasOwnProperty(key)) {
                if (!obj.hasOwnProperty(key)) {
                    obj[key] = watched[key];
                }
                delete watched[key];
            }
        });
        //find any properties on the orig object that aren't on the properties object
        Object.keys(obj)
        .forEach(function forEachKey(key) {
            if (!properties.hasOwnProperty(key)) {
                properties[key] = createProperty(key, obj, options);
                Object.defineProperty(watched, key, properties[key]);
            }
        });
    }
    /**
    * Updates the options with default values
    * @function
    */
    function setOptions(obj, options) {
        //unsure we have an options object
        options = options || {};
        //store the current prototype
        var curProto = options.prototype;
        //create a new options object using the current options and any reserved
        // value from the object
        options = {
            "freeze": obj.hasOwnProperty(cnsts.freeze) ? obj[cnsts.freeze] : options.freeze
            , "seal": obj.hasOwnProperty(cnsts.seal) ? obj[cnsts.seal] : options.seal
            , "extensible": obj.hasOwnProperty(cnsts.ext) ? obj[cnsts.ext] : options.extensible
            , "prototype": obj[cnsts.prototype] || options.prototype
            , "async": !!(obj.hasOwnProperty(cnsts.async) ? obj[cnsts.async] : options.async)
        };
        if (isNill(options.freeze)) {
            options.freeze = true;
        }
        if (isNill(options.seal)) {
            options.seal = false;
        }
        if (isNill(options.extensible)) {
            options.extensible = true;
        }
        //if there is a prototype on the options and it's not a watcher
        // then create a watcher with the prototype object
        if (!isNill(options.prototype) && !isWatcher(options.prototype)) {
            //
            var proto = options.prototype;
            //remove the prototype from the options
            delete options.prototype;
            //pick the prototypes prototype
            if (!!curProto) {
                proto[cnsts.prototype] = curProto;
            }
            else if (isArray(obj)) {
                proto[cnsts.prototype] = selfAr;
            }
            else if (isFunc(obj)) {
                proto[cnsts.prototype] = selfFn;
            }
            else {
                proto[cnsts.prototype] = self;
            }
            //create the prototype watcher
            options.prototype = SimpleWatcher(proto, options);
            options.protoOwner = obj;
        }

        delete obj[cnsts.freeze];
        delete obj[cnsts.seal];
        delete obj[cnsts.ext];
        delete obj[cnsts.prototype];
        delete obj[cnsts.async];

        return options;
    }
    /**
    * Tests a value to see if it's a watcher
    * @function
    * @static
    */
    function isWatcher(obj) {
        return isObject(obj) && Object.getPrototypeOf(obj) === self || obj === self || obj === selfAr || obj === selfFn || false;
    }
    /**
    * Looks through the prototype chain to find the true watcher object and then
    * tests if the key is a property of the watcher
    * @function
    * @static
    */
    function findWatcher(obj, key) {
        //loop through the prototype chain
        while(!isWatcher(obj) && !obj.hasOwnProperty(key)) {
            obj = Object.getPrototypeOf(obj);
            if (!obj) {
                break;
            }
        }
        //if the object has a watch and the key then return the object
        if (!!obj && obj.hasOwnProperty(cnsts.watch) && obj.hasOwnProperty(key)) {
            return obj;
        }

        return null;
    }

    /**
    * @worker
    */
    function SimpleWatcher(obj, options) {
        //set the defaults
        options = setOptions(obj, options);
        //create a property descriptor for each property in obj
        var properties = createProperties(obj, options)
        , watched
        , proto = self
        ;

        if (isArray(obj)) {
            proto = selfAr;
        }
        else if (isFunc(obj)) {
            proto = selfFn;
        }

        //add the $watch property
        AddWatchProperty(properties, obj, options);
        //add the $unwatch property
        AddUnWatchProperty(properties, obj, options);
        //add the $process property
        AddProcessProperty(properties, function process() {
            processWatcher(properties, watched, obj, options);
        });
        //add the $destroy property
        AddDestroyProperty(properties, options, obj);

        //if there is a prototype in the
        if (!!options.prototype) {
            proto = options.prototype;
        }

        //create the watcher
        if (isArray(obj)) {
            watched = [];
        }
        else if (isFunc(obj)) {
            watched = function () {
                return obj.apply(watched, arguments);
            };
        }
        else {
            watched = {};
        }
        Object.defineProperties(watched, properties);
        Object.setPrototypeOf(watched, proto);

        //process the options
        if (options.freeze) {
            Object.freeze(watched);
        }
        else if (options.seal) {
            Object.seal(watched);
        }
        else if (!options.extensible) {
            Object.preventExtensions(watched);
        }

        return watched;
    };

    //add the isWatcher function
    SimpleWatcher.isWatcher = isWatcher;
    //add the find watcher function
    SimpleWatcher.findWatcher = findWatcher;

    //return the watcher
    return SimpleWatcher;
}