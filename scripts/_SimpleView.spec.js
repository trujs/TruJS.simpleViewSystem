/**[@test({ "title": "TruJS.view._SimpleView: " })]*/
function testSimpleView(arrange, act, assert, callback, element, module) {
    var mainState, mainHtml, controllers, simpleView, el, controller, context, renderCb, err;

    arrange(function () {
        mainHtml = [
            "<toolbar id='toolbar1'></toolbar>"
            , "<mainbody></mainbody>"
            , "<div></div>"
        ].join("\n");
        mainState = {};
        controllers = {
            "main": callback(function (render, state) {
                render(mainHtml, mainState);
            })
            , "toolbar": callback(function (render, state) {
                render("<div>{:title:}</div>");
            })
            , "mainbody": callback(function (render, state) {
                render("<div>{:name:}</div>");
            })
        };
        simpleView = module(["TruJS.view._SimpleView", [controllers]]);
        el = element('main')();
        controller = controllers["main"] ;
        context = {
            "toolbar1": {
                "title": "Title"
            }
            , "mainbody": {
                "name": "Name"
            }
        };
    });

    act(function (done) {
        renderCb = callback(function (error) {
            err = error;
            done();
        });

        simpleView(el, controller, context, renderCb);
    });

    assert(function (test) {
        test("err should be undefined")
        .value(err)
        .isUndef();

        test("controllers.main should be called once")
        .value(controllers.main)
        .hasBeenCalled(1);

        test("controllers.toolbar should be called once")
        .value(controllers.toolbar)
        .hasBeenCalled(1);

        test("controllers.mainbody should be called once")
        .value(controllers.mainbody)
        .hasBeenCalled(1);

        console.log(el);

    });
}