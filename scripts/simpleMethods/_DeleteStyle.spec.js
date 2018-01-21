/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteStyle: selector" })]*/
function testDeleteStyle1(arrange, act, assert, module) {
    var deleteStyle, createElement;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteStyle = module(["TruJS.simpleViewSystem.simpleMethods._DeleteStyle", []]);
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
        deleteStyle(element, "div > div", "width");
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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteStyle: root element" })]*/
function testDeleteStyle2(arrange, act, assert, module) {
    var deleteStyle, createElement;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteStyle = module(["TruJS.simpleViewSystem.simpleMethods._DeleteStyle", []]);
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
        deleteStyle(element, "width");
    });

    assert(function (test) {
        test("the element's width should be")
        .value(element)
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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteStyle: with event" })]*/
function testDeleteStyle2(arrange, act, assert, module) {
    var deleteStyle, createElement, event;

    arrange(function () {
        event = new Event('test');
        createElement = module([".createElement"]);
        deleteStyle = module(["TruJS.simpleViewSystem.simpleMethods._DeleteStyle", []]);
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
        deleteStyle(element, "width", event);
    });

    assert(function (test) {
        test("the element's width should be")
        .value(element)
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