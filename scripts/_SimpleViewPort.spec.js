/**[@test({ "title": "TruJS.simpleViewSystem._SimpleViewPort: success" })]*/
function testSimpleViewPort1(arrange, act, assert, callback, module) {
    var simpleViewPort, templates, controllers, watcher, simpleTemplate, simpleView, viewport, state, renderedCb, elements, err;

    arrange(function () {
        templates = {
        };
        state = {
            "main": {}
        };
        controllers = {
            "main": {}
        };
        watcher = callback(state.main);
        elements = [{}];
        simpleTemplate = callback(elements);
        simpleView = callback(function (a, b, c, cb) {
            cb();
        });
        viewport = {
            "innerHTML": "test"
            , "appendChild": callback()
        };
        simpleViewPort = module(["TruJS.simpleViewSystem._SimpleViewPort", [templates, controllers, watcher, simpleTemplate, simpleView]]);
    });

    act(function (done) {
        renderedCb = callback(function (error) {
            err = error;
            done();
        });
        simpleViewPort(viewport, state, renderedCb);
    });

    assert(function (test) {
        test("err should be undefined")
        .value(err)
        .isUndef();

        test("watcher should be called once")
        .value(watcher)
        .hasBeenCalled(1);

        test("watcher should be called with state.main")
        .value(watcher)
        .hasBeenCalledWithArg(0, 0, state.main);

        test("simpleTemplate should be called once")
        .value(simpleTemplate)
        .hasBeenCalled(1);

        test("simpleTemplate should be called with")
        .value(simpleTemplate)
        .hasBeenCalledWithArg(0, 0, "<main></main>");

        test("simpleView should be called once")
        .value(simpleView)
        .hasBeenCalled(1);

        test("simpleView should be called with")
        .value(simpleView)
        .hasBeenCalledWithArg(0, 0, elements[0]);

        test("simpleView should be called with")
        .value(simpleView)
        .hasBeenCalledWithArg(0, 1, controllers.main);

        test("simpleView should be called with")
        .value(simpleView)
        .hasBeenCalledWithArg(0, 2, state.main);

        test("viewport.innerHTML should be an empty string")
        .value(viewport.innerHTML)
        .equals("");

        test("viewport.appendChild should be called once")
        .value(viewport.appendChild)
        .hasBeenCalled(1);

        test("viewport.appendChild should be called with")
        .value(viewport.appendChild)
        .hasBeenCalledWithArg(0, 0, elements[0]);

        test("renderedCb should be called once")
        .value(renderedCb)
        .hasBeenCalled(1);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleViewPort: missing state" })]*/
function testSimpleViewPort2(arrange, act, assert, callback, module) {
    var simpleViewPort, templates, state, renderedCb, err;

    arrange(function () {
        templates = {
            "main": "template"
        };
        state = {
            "nomain": {}
        };
        simpleViewPort = module(["TruJS.simpleViewSystem._SimpleViewPort", [templates, "", "", "", "", ""]]);
    });

    act(function (done) {
        renderedCb = callback(function (error) {
            err = error;
            done();
        });
        simpleViewPort("", state, renderedCb);
    });

    assert(function (test) {
        test("err should be an error")
        .value(err)
        .isError();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleViewPort: missing controller" })]*/
function testSimpleViewPort3(arrange, act, assert, callback, module) {
    var simpleViewPort, templates, state, controller, renderedCb, err;

    arrange(function () {
        templates = {
            "main": "template"
        };
        state = {
            "nomain": {}
        };
        controller = {
            "nomain": {}
        };
        simpleViewPort = module(["TruJS.simpleViewSystem._SimpleViewPort", [templates, controller, "", "", "", ""]]);
    });

    act(function (done) {
        renderedCb = callback(function (error) {
            err = error;
            done();
        });
        simpleViewPort("", state, renderedCb);
    });

    assert(function (test) {
        test("err should be an error")
        .value(err)
        .isError();

    });
}