/**[@test({ "label": "simpleViewHelper", "type": "factory" })]*/
function simpleViewHelper(callback, element, module) {
    var watcher, mainHtml, controllers, mainBodyContext, toolbarWatchers;

    watcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
    mainHtml = [
        "<toolbar id='toolbar1'></toolbar>"
        , "<mainbody></mainbody>"
        , "<div></div>"
    ].join("\n");

    mainBodyContext = {
        "$destroy": callback()
    };

    toolbarWatchers = [{
        "path": "title"
        , "handler": callback()
    }];

    controllers = {
        "main": callback(function (render, state) {
            render(mainHtml, {});
        })
        , "toolbar": callback(function (render, state) {
            render("<div>{:title:}</div>");
            return toolbarWatchers;
        })
        , "mainbody": callback(function (render, state) {
            render("<div>{:name:}</div>", mainBodyContext);
        })
    };

    return {
        "controllers": controllers
        , "mainEl": element('main')()
        , "simpleView": module(["TruJS.simpleViewSystem._SimpleView", [controllers]])
        , "state": watcher({
            "toolbar1": {
                "title": "Title"
            }
            , "mainbody": {
                "name": "Name"
            }
        })
        , "toolbarWatchers": toolbarWatchers
        , "mainBodyContext": mainBodyContext
    };
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleView: simple test" })]*/
function testSimpleView1(arrange, act, assert, callback, simpleViewHelper) {
    var renderCb, err, view;

    arrange(function () {

    });

    act(function (done) {
        renderCb = callback(function (error) {
            err = error;
            simpleViewHelper.state.toolbar1.title = "Sub Title";
            setTimeout(function () {
                view.$destroy();
            }, 10);
            done(20);
        });

        view = simpleViewHelper.simpleView(
            simpleViewHelper.mainEl
            , simpleViewHelper.controllers["main"]
            , simpleViewHelper.state
            , renderCb
        );
    });

    assert(function (test) {
        test("err should be undefined")
        .value(err)
        .isUndef();

        test("controllers.main should be called once")
        .value(simpleViewHelper.controllers.main)
        .hasBeenCalled(1);

        test("controllers.toolbar should be called once")
        .value(simpleViewHelper.controllers.toolbar)
        .hasBeenCalled(1);

        test("controllers.mainbody should be called once")
        .value(simpleViewHelper.controllers.mainbody)
        .hasBeenCalled(1);

        test("toolbarWatchers[0].handler should be called once")
        .value(simpleViewHelper.toolbarWatchers[0].handler)
        .hasBeenCalled(1);

        test("mainBodyContext.$destroy should be called once")
        .value(simpleViewHelper.mainBodyContext.$destroy)
        .hasBeenCalled(1);

    });
}