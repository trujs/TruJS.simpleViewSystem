/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateStyle: selector" })]*/
function testUpdateStyle1(arrange, act, assert, module) {
    var updateStyle, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        updateStyle = module(["TruJS.simpleViewSystem.simpleMethods._UpdateStyle", []]);
        target = createElement("main");
        target.onclick = function (e) {
            updateStyle(e, element, "width", "100px", "div > div");
        };
        element = createElement("main");
        element.style.width = "200px";
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div style=\"width:200px;\"></div>"
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
        .getStyle("width")
        .equals("200px");

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .getStyle("width")
        .equals("100px");

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .getStyle("width")
        .equals("100px");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateStyle: target" })]*/
function testUpdateStyle2(arrange, act, assert, module) {
    var updateStyle, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        updateStyle = module(["TruJS.simpleViewSystem.simpleMethods._UpdateStyle", []]);
        target = createElement("main");
        target.onclick = function (e) {
            updateStyle(e, element, "width", "100px");
        };
        element = createElement("main");
        element.style.width = "200px";
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div style=\"width:200px;\"></div>"
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
        .getStyle("width")
        .equals("100px");

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .getStyle("width")
        .equals("");

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .getStyle("width")
        .equals("200px");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateStyle: style object" })]*/
function testUpdateStyle3(arrange, act, assert, module) {
    var updateStyle, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        updateStyle = module(["TruJS.simpleViewSystem.simpleMethods._UpdateStyle", []]);
        target = createElement("main");
        target.onclick = function (e) {
            updateStyle(e, element, {"width":"100px","height":"200px"});
        };
        element = createElement("main");
        element.style.width = "200px";
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div style=\"width:200px;\"></div>"
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
        .getStyle("width")
        .equals("100px");

        test("the element's height should be")
        .value(target)
        .getStyle("height")
        .equals("200px");

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .getStyle("width")
        .equals("");

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .getStyle("width")
        .equals("200px");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateStyle: style object and selector" })]*/
function testUpdateStyle5(arrange, act, assert, module) {
    var updateStyle, createElement, target, element;

    arrange(function () {
        event = new Event('test');
        createElement = module([".createElement"]);
        updateStyle = module(["TruJS.simpleViewSystem.simpleMethods._UpdateStyle", []]);
        target = createElement("main");
        target.onclick = function (e) {
            updateStyle(e, element, {"width":"100px","height":"200px"}, "div > div");
        };
        element = createElement("main");
        element.style.width = "200px";
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div style=\"width:200px;\"></div>"
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
        .getStyle("width")
        .equals("200px");

        test("the element's height should be")
        .value(element)
        .getStyle("height")
        .equals("");

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .getStyle("width")
        .equals("100px");

        test("the div element's 1st child's height should be")
        .value(element, "children[0].children[0]")
        .getStyle("height")
        .equals("200px");

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .getStyle("width")
        .equals("100px");

        test("the div element's 1st child's height should be")
        .value(element, "children[0].children[1]")
        .getStyle("height")
        .equals("200px");

    });
}