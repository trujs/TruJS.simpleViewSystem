/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: selector" })]*/
function testUpdateAttribute1(arrange, act, assert, module) {
    var updateAttribute, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
        target = createElement("main");
        target.onclick = function (e) {
            updateAttribute(e, element, "test", "test1", "div > div");
        };
        element = createElement("main");
        element.setAttribute("test", "test");
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div test=\"test\"></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        target.click();
    });

    assert(function (test) {
        test("the element's test attribute should be")
        .value(element)
        .getAttribute("test")
        .equals("test");

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .getAttribute("test")
        .equals("test1");

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .getAttribute("test")
        .equals("test1");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: target" })]*/
function testUpdateAttribute2(arrange, act, assert, module) {
    var updateAttribute, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
        target = createElement("main");
        target.onclick = function (e) {
            updateAttribute(e, element, "test", "test1");
        };
        element = createElement("main");
        element.setAttribute("test", "test");
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div test=\"test\"></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        target.click();
    });

    assert(function (test) {
        test("the element's test attribute should be")
        .value(target)
        .getAttribute("test")
        .equals("test1");

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .getAttribute("test")
        .isNull();

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .getAttribute("test")
        .equals("test");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: attribute object and selector" })]*/
function testUpdateAttribute3(arrange, act, assert, module) {
    var updateAttribute, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
        target = createElement("main");
        target.onclick = function (e) {
            updateAttribute(e, element, {"test":"test1","bingo":"namo"}, "div > div");
        };
        element = createElement("main");
        element.setAttribute("test", "test");
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div test=\"test\"></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        target.click();
    });

    assert(function (test) {
        test("the element's test attribute should be")
        .value(element)
        .getAttribute("test")
        .equals("test");

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .getAttribute("test")
        .equals("test1");

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .getAttribute("bingo")
        .equals("namo");

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .getAttribute("test")
        .equals("test1");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: attribute object" })]*/
function testUpdateAttribute5(arrange, act, assert, module) {
    var updateAttribute, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
        target = createElement("main");
        target.onclick = function (e) {
            updateAttribute(e, element, {"test":"test1","bingo":"namo"});
        };
        element = createElement("main");
        element.setAttribute("test", "test");
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div test=\"test\"></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        target.click();
    });

    assert(function (test) {
        test("the element's test attribute should be")
        .value(target)
        .getAttribute("test")
        .equals("test1");

        test("the element's test attribute should be")
        .value(target)
        .getAttribute("bingo")
        .equals("namo");

        test("the div element's 1st child's width should be")
        .value(element, "children[0].children[0]")
        .getAttribute("test")
        .isNull();

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .getAttribute("test")
        .equals("test");

    });
}