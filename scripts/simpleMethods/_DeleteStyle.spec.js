/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteStyle: selector" })]*/
function testDeleteStyle1(arrange, act, assert, module) {
    var deleteStyle, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteStyle = module(["TruJS.simpleViewSystem.simpleMethods._DeleteStyle", []]);
        target = createElement("main");
        target.onclick = function (e) {
            deleteStyle(e, element, "width", "div > div");
        };
        element = createElement("main");
        element.style.width = "100px";
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div style=\"width:100px;\"></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        target.click();
    });

    assert(function (test) {
        test("the element's width should be")
        .value(element)
        .hasStyle("width")
        .isTrue();

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .hasStyle("width")
        .isFalse();

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .hasStyle("width")
        .isFalse();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteStyle: target" })]*/
function testDeleteStyle2(arrange, act, assert, module) {
    var deleteStyle, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteStyle = module(["TruJS.simpleViewSystem.simpleMethods._DeleteStyle", []]);
        target = createElement("main");
        target.onclick = function (e) {
            deleteStyle(e, element, "width");
        };
        element = createElement("main");
        element.style.width = "100px";
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div style=\"width:100px;\"></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        target.click();
    });

    assert(function (test) {
        test("the element's width should be")
        .value(target)
        .hasStyle("width")
        .isFalse();

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .hasStyle("width")
        .isFalse();

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .hasStyle("width")
        .isTrue();

    });
}