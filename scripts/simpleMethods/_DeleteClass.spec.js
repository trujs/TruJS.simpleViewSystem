/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteClass: using selector" })]*/
function testDeleteClass1(arrange, act, assert, module) {
    var deleteClass, createElement, element;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteClass = module(["TruJS.simpleViewSystem.simpleMethods._DeleteClass", []]);
        element = createElement("main");
        element.className = "test";
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div class=\"test\"></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        deleteClass(element, "div > div", "test");
    });

    assert(function (test) {
        test("the element should have a class test")
        .value(element, "className")
        .equals("test");

        test("the div element's 1st child should have a class")
        .value(element, "children[0].children[0].className")
        .equals("");

        test("the div element's 2nd child should have a class")
        .value(element, "children[0].children[1].className")
        .equals("");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteClass: root element" })]*/
function testDeleteClass2(arrange, act, assert, module) {
    var deleteClass, createElement, element;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteClass = module(["TruJS.simpleViewSystem.simpleMethods._DeleteClass", []]);
        element = createElement("main");
        element.className = "test";
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div class=\"test\"></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        deleteClass(element, "test");
    });

    assert(function (test) {
        test("the element should have a class test")
        .value(element, "className")
        .equals("");

        test("the div element's 1st child should have a class")
        .value(element, "children[0].children[0].className")
        .equals("");

        test("the div element's 2nd child should have a class")
        .value(element, "children[0].children[1].className")
        .equals("test");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteClass: with event" })]*/
function testDeleteClass3(arrange, act, assert, module) {
    var deleteClass, createElement, element, event;

    arrange(function () {
        event = new Event('test');
        createElement = module([".createElement"]);
        deleteClass = module(["TruJS.simpleViewSystem.simpleMethods._DeleteClass", []]);
        element = createElement("main");
        element.className = "test";
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div class=\"test\"></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        deleteClass(element, "test", event);
    });

    assert(function (test) {
        test("the element should have a class test")
        .value(element, "className")
        .equals("");

        test("the div element's 1st child should have a class")
        .value(element, "children[0].children[0].className")
        .equals("");

        test("the div element's 2nd child should have a class")
        .value(element, "children[0].children[1].className")
        .equals("test");

    });
}