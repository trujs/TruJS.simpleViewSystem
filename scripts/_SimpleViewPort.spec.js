/**[@test({ "title": "TruJS.simpleViewSystem._SimpleViewPort: success" })]*/
function testSimpleViewPort1(arrange, act, assert, callback, module) {
    var simpleViewPort, controller, simpleView, state, renderedCb, element
    , createElement, viewport, err;

    arrange(function () {
        state = {};
        controller = {};
        simpleView = callback(function (a, b, c, cb) {
            cb();
        });
        viewport = {
            "innerHTML": "test"
            , "appendChild": callback()
        };
        element = {};
        createElement = callback(element);
        simpleViewPort = module(["TruJS.simpleViewSystem._SimpleViewPort", [controller, createElement, simpleView]]);
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

        test("simpleView should be called once")
        .value(simpleView)
        .hasBeenCalled(1);

        test("simpleView should be called with")
        .value(simpleView)
        .hasBeenCalledWithArg(0, 1, controller);

        test("simpleView should be called with")
        .value(simpleView)
        .hasBeenCalledWithArg(0, 2, state);

        test("viewport.innerHTML should be an empty string")
        .value(viewport.innerHTML)
        .equals("");

        test("viewport.appendChild should be called once")
        .value(viewport.appendChild)
        .hasBeenCalled(1);

        test("renderedCb should be called once")
        .value(renderedCb)
        .hasBeenCalled(1);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleViewPort: error" })]*/
function testSimpleViewPort3(arrange, act, assert, callback, module) {
    var simpleViewPort, controller, simpleView, state, renderedCb, element
    , createElement, err;

    arrange(function () {
        state = {};
        controller = {};
        simpleView = callback(function (a, b, c, cb) {
            cb();
        });
        element = {};
        createElement = callback(function () {
            throw new Error("Error");
        });
        simpleViewPort = module(["TruJS.simpleViewSystem._SimpleViewPort", [controller, createElement, simpleView]]);
    });

    act(function (done) {
        renderedCb = callback(function (error) {
            err = error;
            done();
        });
        simpleViewPort(null, state, renderedCb);
    });

    assert(function (test) {
        test("err should be an error")
        .value(err)
        .isError();

    });
}