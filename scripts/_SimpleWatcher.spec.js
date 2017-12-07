/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: simple nested object test" })]*/
function testSimpleWatcher1(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, handler;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        obj = {
            "innerObj": {
                "key1": "value1"
            }
            , "key2": "value2"
        };
        handler = callback();
    });

    act(function () {
        watched = simpleWatcher(obj);
        watched.$watch(["key2", "innerObj.key1"], handler);
        watched.key2 = "newvalue2";
        watched.innerObj.key1 = "newvalue1";
    });

    assert(function (test) {
        test("handler should be called twice")
        .value(handler)
        .hasBeenCalled(2);

        test("The 1st handler callback should be called with")
        .value(handler)
        .hasBeenCalledWith(0, ["key2", "newvalue2"]);

        test("The 2nd handler callback should be called with")
        .value(handler)
        .hasBeenCalledWith(1, ["innerObj.key1", "newvalue1"]);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: unwatch" })]*/
function testSimpleWatcher2(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, handler, guids;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        obj = {
            "outerObj": {
                "key1": "value1"
                , "innerObj": {
                    "key2": "value2"
                }
            }
            , "key2": "value2"
        };
        handler = callback();
    });

    act(function () {
        watched = simpleWatcher(obj);
        guids = watched.$watch(["key2", "outerObj.key1", "outerObj.innerObj.key2"], handler);
        guids.pop();
        watched.$unwatch(guids);
        watched.key2 = "newvalue2";
        watched.outerObj.key1 = "newvalue1";
        watched.outerObj.innerObj.key2 = "newvalue2";
    });

    assert(function (test) {

        test("handler should be called once")
        .value(handler)
        .hasBeenCalled(1);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: destroy" })]*/
function testSimpleWatcher3(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, handler, err, proto;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        obj = {
            "__proto": {
                "proto1": "value1"
            }
            , "innerObj": {
                "key1": "value1"
                , "innerObj": {
                    "key2": "value2"
                }
            }
            , "key2": "value2"
        };
        handler = callback();
    });

    act(function () {
        watched = simpleWatcher(obj);
        proto = Object.getPrototypeOf(watched);
        watched.$watch(["key2", "innerObj.key1", "innerObj.innerObj.key2", "proto1"], handler);
        watched.$destroy();
        try {
            proto.proto1 = "newvalue1";
            watched.key2 = "newvalue2";
        }
        catch(ex) {
            err = ex;
        }
    });

    assert(function (test) {
        test("handler should not be called")
        .value(handler)
        .not()
        .hasBeenCalled();

        test("err should be an error")
        .value(err)
        .isError();

        test("the err message should contain")
        .value(err, "message")
        .contains("Unable to access the key proto1.");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: using the reserved options" })]*/
function testSimpleWatcher4(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, common,  options, watched;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        obj = {
            "inherited": {

            }
            , "frozen": {
                "__freeze": true
            }
            , "sealed": {
                "__seal": true
                , "notextensible": {
                    "__ext": true // since extensible is further on the list the inherited __sealed takes precedence
                }
            }
            , "nowatch": {
                "__nowatch": true
            }
        };
        options = {
            "freeze": false
            , "extensible": true
        };
    });

    act(function () {
        watched = simpleWatcher(obj, options);
    });

    assert(function (test) {
        test("watched should have 4 properties")
        .value(watched)
        .hasPropertyCountOf(4);

        test("watched should be extensible")
        .value(watched)
        .isExtensible();

        test("watched.inherited should be extensible")
        .value(watched.inherited)
        .isExtensible();

        test("watched.frozen should be frozen")
        .value(watched.frozen)
        .isFrozen();

        test("watched.sealed should be sealed")
        .value(watched.sealed)
        .isSealed();

        test("watched.sealed.notextensible should not be extensible")
        .value(watched.sealed.notextensible)
        .not()
        .isExtensible();

        test("watched.nowatch should be not be a watcher")
        .run(simpleWatcher.isWatcher, [watched.nowatch])
        .isFalse();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: swapping object/primitive values " })]*/
function testSimpleWatcher5(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, key2, handler;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        key2 = {
            "value": "value1"
        };
        obj = {
            "key1": "string"
            , "key2": key2
            , "key3": {}
        };
        handler = callback();
    });

    act(function () {
        watched = simpleWatcher(obj);
        watched.$watch(["key1","key2","key3", "key2.value"], handler);
        watched.key1 = {}; //transform the string to an object
        watched.key2 = { "value": "value2", "newval": "newval1" }; //transform the object to another object
        watched.key3 = "string"; //transform the object to a string
        watched.key2.value = "value3"; //the handler should not be called
        watched.key2.newval = "newval1"; //this should not fire the handler
    });

    assert(function (test) {
        test("watched.key1 should be an object")
        .run(simpleWatcher.isWatcher, [watched.key1])
        .isTrue();

        test("watched.key2 should not be")
        .value(watched.key2)
        .not()
        .equals(key2);

        test("watched.key3 should be a string")
        .value(watched.key3)
        .isOfType("string");

        test("handler should be called 4 times")
        .value(handler)
        .hasBeenCalled(4);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: create new property, add handler" })]*/
function testSimpleWatcher6(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, key2, handler;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        key2 = {
            "value": "value1"
        };
        obj = {
            "__freeze": false
            , "key1": "string"
            , "key2": key2
            , "key3": {

            }
        };
        handler = callback();
    });

    act(function () {
        watched = simpleWatcher(obj);
        watched.key3.inner1 = null; //creates a new property
        watched.$watch("key3.inner1", handler); //add handler
        watched.key3.inner1 = "value"; //update value

    });

    assert(function (test) {
        test("handler should be called once")
        .value(handler)
        .hasBeenCalled(1);

        test("handler should be called with")
        .value(handler)
        .hasBeenCalledWith(0, ["key3.inner1", "value"]);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: add value using handler" })]*/
function testSimpleWatcher7(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, key2, handler;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        key2 = {
            "value": "value1"
        };
        obj = {
            "__freeze": false
            , "key1": "string"
            , "key2": key2
            , "key3": {

            }
        };
        handler = callback();
    });

    act(function () {
        watched = simpleWatcher(obj);
        watched.$watch("key4", handler); //add handler
        watched.key4 = "value"; //update value
        watched.$watch("key5.inner", handler); //add handler
        watched.key5.inner = "value"; //update value
    });

    assert(function (test) {
        test("handler should be called 2 times")
        .value(handler)
        .hasBeenCalled(2);

        test("handler should be called with")
        .value(handler)
        .hasBeenCalledWith(0, ["key4", "value"]);

        test("handler should be called with")
        .value(handler)
        .hasBeenCalledWith(1, ["key5.inner", "value"]);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: prototype" })]*/
function testSimpleWatcher8(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, handler, proto1, proto2, innerName, outerName;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        proto1 = {
            "name": "proto1"
            , "key1": "protovalue1"
        };
        proto2 = {
            "name": "proto2"
        };
        obj = {
            "__proto": proto1
            , "outer": {
                "inner": {
                    "__proto": proto2
                }
            }
        };
        handler = callback();
    });

    act(function () {
        watched = simpleWatcher(obj);
        watched.$watch(["name", "outer.inner.name"], handler); //add handler
        innerName = watched.outer.inner.name;
        outerName = watched.outer.name;
        watched.name = "proto1.1";
        watched.outer.inner.name = "proto1.2";
    });

    assert(function (test) {
        test("handler should be called twice")
        .value(handler)
        .hasBeenCalled(2);

        test("outerName should be")
        .value(outerName)
        .equals("proto1");

        test("innerName should be")
        .value(innerName)
        .equals("proto2");

        test("proto1.name should be")
        .value(proto1.name)
        .equals("proto1.1");

        test("proto2.name should be")
        .value(proto2.name)
        .equals("proto1.2");

        test("inner.key1 should be")
        .value(watched, "outer.inner.key1")
        .equals("protovalue1");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: arrays" })]*/
function testSimpleWatcher9(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, handler, len;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        obj = [
            {
                "key1": "value1"
            }
            , "array1"
            , [
                "array2"
                , {
                    "key2": "value2"
                }
            ]
        ];
        handler = callback();
    });

    act(function () {
        watched = simpleWatcher(obj);
        watched.$watch(["0", "0.key1", "2.1.key2"], handler);
        len = watched.length;
        watched[0] = "newvalue";
        watched[2][1].key2 = "newvalue2";
    });

    assert(function (test) {
        test("handler should be called twice")
        .value(handler)
        .hasBeenCalled(2);

        test("the 1st handler should be called with")
        .value(handler)
        .hasBeenCalledWith(0, ["0", "newvalue"]);

        test("the 2nd handler should be called with")
        .value(handler)
        .hasBeenCalledWith(1, ["2.1.key2", "newvalue2"]);

        test("len should be")
        .value(len)
        .equals(3);

        test("watched should have array properties")
        .value(watched, "forEach")
        .isOfType("function");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: functions" })]*/
function testSimpleWatcher10(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, handler;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        obj = {
            "__freeze": false
            , "func1": callback()
            , "nofunc": "value1"
        };
        handler = callback();
    });

    act(function () {
        watched = simpleWatcher(obj);
        watched.$watch(["func1.key1"], handler);
        watched.func1.key1 = "funcValue";
    });

    assert(function (test) {
        test("handler should be called once")
        .value(handler)
        .hasBeenCalled(1);

        test("func1 should have a property key1")
        .value(watched, "func1")
        .hasProperty("key1");

        test("watched should have function properties")
        .value(watched, "func1.bind")
        .isOfType("function");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: function callback" })]*/
function testSimpleWatcher11(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, handler, result, res;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        result = {};
        obj = {
            "func1": callback(result)
        };
        handler = callback(function () {
            return arguments[0];
        });
    });

    act(function () {
        watched = simpleWatcher(obj);
        watched.$watch("func1", handler);
        res = watched.func1("value");
    });

    assert(function (test) {
        test("handler should be called once")
        .value(handler)
        .hasBeenCalled(1);

        test("handler should be called with")
        .value(handler)
        .hasBeenCalledWithArg(0, 0, "func1");

        test("handler should be called with")
        .value(handler)
        .hasBeenCalledWithArg(0, 1, result);

        test("obj.func1 should be called with")
        .value(obj.func1)
        .hasBeenCalledWithArg(0, 0, "value");

        test("res should be")
        .value(res)
        .equals(result);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleWatcher: async" })]*/
function testSimpleWatcher12(arrange, act, assert, callback, module) {
    var simpleWatcher, obj, watched, handler, res;

    arrange(function () {
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        obj = {
            "__async": true
            , "key": "value"
            , "innerObj": {
                "__async": false
                , "key": "value"
            }
        };
        res = "";
    });

    act(function (done) {
        handler = callback(function (key, value) {
            res+= "-";
            if (handler.callbackCount === 2) {
                done(10);
            }
        });
        watched = simpleWatcher(obj);
        watched.$watch(["key", "innerObj.key"], handler);
        watched.key = "value2";
        res+= "1";
        watched.innerObj.key = "value2";
        res+= "2";
    });

    assert(function (test) {
        test("res should be")
        .value(res)
        .equals("1-2-");

    });
}