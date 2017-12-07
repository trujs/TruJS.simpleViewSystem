/**[@test({ "label": "simpleViewHelper", "type": "factory" })]*/
function simpleViewHelper(callback, module) {
    var watcher, mainHtml, controllers, mainBodyContext, toolbarWatchers, createElement;

    watcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
    createElement = module(".createElement");
    mainHtml = [
        "<toolbar id='toolbar1'></toolbar>"
        , "<mainbody id='mainbody'></mainbody>"
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
        "main": callback(function (render) {
            render(mainHtml, {});
        })
        , "toolbar":  {
            "view": callback(function (render) {
                render(["<div>{:title:}</div>", "{:$tagName:} { background-color: blue; }"]);
                return toolbarWatchers;
            })
        }
        , "mainbody":  {
            "view": callback(function (render) {
                render("<div>{:name:}</div>", mainBodyContext);
            })
        }
    };

    return {
        "controllers": controllers
        , "mainEl": createElement('main')
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
                simpleViewHelper.state.toolbar1.title = "New Title";
                done();
            }, 10);
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
        .value(simpleViewHelper.controllers.toolbar.view)
        .hasBeenCalled(1);

        test("controllers.mainbody should be called once")
        .value(simpleViewHelper.controllers.mainbody.view)
        .hasBeenCalled(1);

        test("toolbarWatchers[0].handler should be called once")
        .value(simpleViewHelper.toolbarWatchers[0].handler)
        .hasBeenCalled(1);

        test("mainBodyContext.$destroy should be called once")
        .value(simpleViewHelper.mainBodyContext.$destroy)
        .hasBeenCalled(1);

        test("mainEl innerHTML should be")
        .value(simpleViewHelper.mainEl.innerHTML)
        .equals("<toolbar id=\"toolbar1\"><div>Sub Title</div><style>\ntoolbar { background-color: blue; }\n</style></toolbar><mainbody id=\"mainbody\"><div>Name</div></mainbody><div></div>");

    });
}