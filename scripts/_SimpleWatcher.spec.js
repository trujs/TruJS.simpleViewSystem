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
            "innerObj": {
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
        guids = watched.$watch(["key2", "innerObj.key1", "innerObj.innerObj.key2"], handler);
        guids.pop();
        watched.$unwatch(guids);
        watched.key2 = "newvalue2";
        watched.innerObj.key1 = "newvalue1";
        watched.innerObj.innerObj.key2 = "newvalue2";
    });

    assert(function (test) {

        test("handler should be called once")
        .value(handler)
        .hasBeenCalled(1);

    });
}