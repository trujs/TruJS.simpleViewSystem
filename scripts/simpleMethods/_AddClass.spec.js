/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._AddClass: selector" })]*/
function testAddClass1(arrange, act, assert, module) {
    var addClass, createElement, element;

    arrange(function () {
        createElement = module([".createElement"]);
        addClass = module(["TruJS.simpleViewSystem.simpleMethods._AddClass", []]);
        element = createElement("main");
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        addClass(element, "div > div", "test");
    });

    assert(function (test) {
        test("the element should not have a class")
        .value(element, "className")
        .equals("");

        test("the div element's 1st child should have a class")
        .value(element, "children[0].children[0].className")
        .equals("test");

        test("the div element's 2nd child should have a class")
        .value(element, "children[0].children[1].className")
        .equals("test");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._AddClass: root element" })]*/
function testAddClass2(arrange, act, assert, module) {
    var addClass, createElement, element;

    arrange(function () {
        createElement = module([".createElement"]);
        addClass = module(["TruJS.simpleViewSystem.simpleMethods._AddClass", []]);
        element = createElement("main");
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div class='test'></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        addClass(element, "test");
    });

    assert(function (test) {
        test("the element should not have a class")
        .value(element, "className")
        .equals("test");

        test("the div element's 1st child should have a class")
        .value(element, "children[0].children[0].className")
        .equals("");

        test("the div element's 2nd child should have a class")
        .value(element, "children[0].children[1].className")
        .equals("test");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._AddClass: with event" })]*/
function testAddClass3(arrange, act, assert, module) {
    var addClass, createElement, element, event;

    arrange(function () {
        event = new Event('test');
        createElement = module([".createElement"]);
        addClass = module(["TruJS.simpleViewSystem.simpleMethods._AddClass", []]);
        element = createElement("main");
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div class='test'></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        addClass(element, "test", event);
    });

    assert(function (test) {
        test("the element should not have a class")
        .value(element, "className")
        .equals("test");

        test("the div element's 1st child should have a class")
        .value(element, "children[0].children[0].className")
        .equals("");

        test("the div element's 2nd child should have a class")
        .value(element, "children[0].children[1].className")
        .equals("test");

    });
}