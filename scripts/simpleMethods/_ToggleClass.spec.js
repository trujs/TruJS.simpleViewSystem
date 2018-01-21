/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._ToggleClass: children " })]*/
function testToggleClass1(arrange, act, assert, module) {
    var toggleClass, createElement, element;

    arrange(function () {
        createElement = module([".createElement"]);
        toggleClass = module(["TruJS.simpleViewSystem.simpleMethods._ToggleClass", []]);
        element = createElement("main");
        element.innerHTML = [
            "<div>"
            , "<div class='test'></div>"
            , "<div></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        toggleClass(element, 'div > div', "test");
    });

    assert(function (test) {
        test("the element's 1st child should not have a class 'test'")
        .value(element, "children[0].children[0].className")
        .equals("");

        test("the element's 2nd child should have a class 'test'")
        .value(element, "children[0].children[1].className")
        .equals("test");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._ToggleClass: root " })]*/
function testToggleClass2(arrange, act, assert, module) {
    var toggleClass, createElement, element;

    arrange(function () {
        createElement = module([".createElement"]);
        toggleClass = module(["TruJS.simpleViewSystem.simpleMethods._ToggleClass", []]);
        element = createElement("main");
        element.innerHTML = [
            "<div>"
            , "<div class='test'></div>"
            , "<div></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        toggleClass(element, "test");
    });

    assert(function (test) {
        test("the element should have a class 'test'")
        .value(element, "className")
        .equals("test");

        test("the element's 1st child should not have a class 'test'")
        .value(element, "children[0].children[0].className")
        .equals("test");

        test("the element's 2nd child should have a class 'test'")
        .value(element, "children[0].children[1].className")
        .equals("");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._ToggleClass: with event " })]*/
function testToggleClass2(arrange, act, assert, module) {
    var toggleClass, createElement, element, event;

    arrange(function () {
        event = new Event('test');
        createElement = module([".createElement"]);
        toggleClass = module(["TruJS.simpleViewSystem.simpleMethods._ToggleClass", []]);
        element = createElement("main");
        element.innerHTML = [
            "<div>"
            , "<div class='test'></div>"
            , "<div></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        toggleClass(element, "test", event);
    });

    assert(function (test) {
        test("the element should have a class 'test'")
        .value(element, "className")
        .equals("test");

        test("the element's 1st child should not have a class 'test'")
        .value(element, "children[0].children[0].className")
        .equals("test");

        test("the element's 2nd child should have a class 'test'")
        .value(element, "children[0].children[1].className")
        .equals("");

    });
}