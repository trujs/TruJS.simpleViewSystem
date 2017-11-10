/**[@test({ "title": "TruJS.simpleViewSystem._SimpleMixin: " })]*/
function testSimpleMixin(arrange, act, assert, callback, module) {
    var simpleMixin, handler, mixins, findWatcher, watcher, $container, element, context;

    arrange(function () {
        handler = {};
        mixins = {
            "mixin1": callback([{ "path": "path", "handler": handler }])
        };
        $container = callback(mixins);
        $container.hasDependency = callback(true);
        watcher = {
            "$watch": callback()
        };
        findWatcher = callback(watcher);
        simpleMixin = module([
            "TruJS.simpleViewSystem._SimpleMixin"
            , [$container, findWatcher]
        ]);
        element = {
            "attributes": [{
                "name": "class"
                , "value": "myclass"
            }, {
                "name": "mixin1"
                , "value": "$value"
                , "$value": {}
            }]
            , "watchers": []
        };
        context = {
            "path": {}
        };
    });

    act(function () {
        simpleMixin(element, context);
    });

    assert(function (test) {
        test("mixin1 should be called once")
        .value(mixins.mixin1)
        .hasBeenCalled(1);

        test("mixin1 1st callback arg should be")
        .value(mixins.mixin1)
        .hasBeenCalledWithArg(0, 0, element);

        test("mixin1 2nd callback arg should be")
        .value(mixins.mixin1)
        .getCallbackArg(0, 1)
        .stringify()
        .equals("{\"class\":\"myclass\",\"mixin1\":{}}");

        test("watcher.$watch should be called once")
        .value(watcher.$watch)
        .hasBeenCalled(1);

        test("element.watchers should have one member")
        .value(element.watchers)
        .hasMemberCountOf(1);

    });
}