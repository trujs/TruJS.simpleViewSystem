/**[@test({ "title": "TruJS.simpleViewSystem._SimpleStyle: create style" })]*/
function testSimpleStyle1(arrange, act, assert, module) {
    var watcher, simpleStyle, template, context, style, cssText1, cssText2, cssText3;

    arrange(function () {
        watcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        simpleStyle = module(["TruJS.simpleViewSystem._SimpleStyle", []]);
        template = [
            "{:$tagName:} {"
            , "background-color: {:colors.blue:};"
            , "}"
        ].join("\n");
        context = watcher({
            "$tagName": "div"
            , "colors": {
                "blue": "#0000ff"
            }
        });
    });

    act(function () {
        style = simpleStyle(template, context);
        cssText1 = style.innerText;
        context.colors.blue = "blue";
        cssText2 = style.innerText;

        style.$destroy();

        context.$tagName = "span";

        cssText3 = style.innerText;
    });

    assert(function (test) {
        test("cssText1 should equal")
        .value(cssText1)
        .equals("\ndiv {\nbackground-color: #0000ff;\n}\n");

        test("cssText2 should equal")
        .value(cssText2)
        .equals("\ndiv {\nbackground-color: blue;\n}\n");

        test("cssText3 should equal")
        .value(cssText3)
        .equals("\ndiv {\nbackground-color: blue;\n}\n");

    });
}