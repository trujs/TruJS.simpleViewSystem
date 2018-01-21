/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: selector" })]*/
function testUpdateAttribute1(arrange, act, assert, module) {
    var updateAttribute, createElement;

    arrange(function () {
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
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
        updateAttribute(element, "div > div", "test", "test1");
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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: root element" })]*/
function testUpdateAttribute2(arrange, act, assert, module) {
    var updateAttribute, createElement;

    arrange(function () {
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
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
        updateAttribute(element, "test", "test1");
    });

    assert(function (test) {
        test("the element's test attribute should be")
        .value(element)
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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: attribute object" })]*/
function testUpdateAttribute3(arrange, act, assert, module) {
    var updateAttribute, createElement;

    arrange(function () {
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
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
        updateAttribute(element, "div > div", {"test":"test1","bingo":"namo"});
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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: selector, attribute object, and event" })]*/
function testUpdateAttribute4(arrange, act, assert, module) {
    var updateAttribute, createElement, event;

    arrange(function () {
        event = new Event('test');
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
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
        updateAttribute(element, "div > div", {"test":"test1","bingo":"namo"}, event);
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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: attr name, attr val, and event" })]*/
function testUpdateAttribute5(arrange, act, assert, module) {
    var updateAttribute, createElement, event;

    arrange(function () {
        event = new Event('test');
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
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
        updateAttribute(element, "test", "test1", event);
    });

    assert(function (test) {
        test("the element's test attribute should be")
        .value(element)
        .getAttribute("test")
        .equals("test1");

        test("the div element's 1st child's test attr should be")
        .value(element, "children[0].children[0]")
        .getAttribute("test")
        .isNull();

        test("the div element's 2nd child's width should be")
        .value(element, "children[0].children[1]")
        .getAttribute("test")
        .equals("test");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._UpdateAttribute: attribute object and event" })]*/
function testUpdateAttribute5(arrange, act, assert, module) {
    var updateAttribute, createElement, event;

    arrange(function () {
        event = new Event('test');
        createElement = module([".createElement"]);
        updateAttribute = module(["TruJS.simpleViewSystem.simpleMethods._UpdateAttribute", []]);
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
        updateAttribute(element, {"test":"test1","bingo":"namo"}, event);
    });

    assert(function (test) {
        test("the element's test attribute should be")
        .value(element)
        .getAttribute("test")
        .equals("test1");

        test("the element's test attribute should be")
        .value(element)
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