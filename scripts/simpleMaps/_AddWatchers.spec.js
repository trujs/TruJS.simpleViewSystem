/**[@test({ "title": "TruJS.simpleViewSystem.simpleMaps._AddWatchers: " })]*/
function testAddWatchers1(arrange, act, assert, callback, module) {
    var addWatchers, watcher, element, context, watcherMaps, targetEl;

    arrange(function () {
        createElement = module(".createElement");
        addWatchers = module(["TruJS.simpleViewSystem.simpleMaps._AddWatchers", []]);
        simpleWatcher = module(".simpleWatcher");
        element = createElement("div");
        targetEl = createElement("div");
        targetEl.watchers = [];
        context = simpleWatcher({
            "obj": {
                "key1": "value1"
                , "key2": "value2"
            }
            , "key3": "value3"
        });
        watcherMaps = [
            {
                "path": "key3"
                , "handler": {}
                , "context": simpleWatcher({
                    "key3": "other3"
                })
                , "target": targetEl
            }
            , {
                "path": ["obj.key2","obj.key1"]
                , "handler": {}
            }
        ];
    });

    act(function () {
        addWatchers(element, context, watcherMaps);
    });

    assert(function (test) {
        test("targetEl should have 1 watcher")
        .value(targetEl, "watchers")
        .hasPropertyCountOf(1);

        test("the 1st watcher should be")
        .value(targetEl, "watchers[0]")
        .stringify()
        .beginsWith("{\"index\":\"key3\",\"parent\":{\"key3\":\"other3\"},\"guids\":[");

        test("element should have 2 watchers")
        .value(element, "watchers")
        .hasPropertyCountOf(2);

        test("the 1st watcher should be")
        .value(element, "watchers[0]")
        .stringify()
        .beginsWith("{\"index\":\"key2\",\"parent\":{\"key1\":\"value1\",\"key2\":\"value2\"},\"guids\":[");

        test("the 2d watcher should be")
        .value(element, "watchers[1]")
        .stringify()
        .beginsWith("{\"index\":\"key1\",\"parent\":{\"key1\":\"value1\",\"key2\":\"value2\"},\"guids\":[");

    });
}
