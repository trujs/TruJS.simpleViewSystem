/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._AddClass: selector" })]*/
function testAddClass1(arrange, act, assert, module) {
    var addClass, createElement, element, target;

    arrange(function () {
        createElement = module([".createElement"]);
        addClass = module(["TruJS.simpleViewSystem.simpleMethods._AddClass", []]);
        target = createElement("main");
        target.onclick = function (e) {
            addClass(e, element, "test", "div > div");
        };
        element = createElement("main");
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div></div>"
            , "</div>"
        ]
        .join("\n");
        event = new Event('test');
    });

    act(function () {
        target.click();
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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._AddClass: target" })]*/
function testAddClass2(arrange, act, assert, module) {
    var addClass, createElement, element, target;

    arrange(function () {
        createElement = module([".createElement"]);
        addClass = module(["TruJS.simpleViewSystem.simpleMethods._AddClass", []]);
        element = createElement("main");
        target = createElement("main");
        target.onclick = function (e) {
            addClass(e, element, "test");
        };
        element.innerHTML = [
            "<div>"
            , "<div></div>"
            , "<div class='test'></div>"
            , "</div>"
        ]
        .join("\n");
    });

    act(function () {
        target.click();
    });

    assert(function (test) {
        test("the element should not have a class")
        .value(target, "className")
        .equals("test");

        test("the div element's 1st child should have a class")
        .value(element, "children[0].children[0].className")
        .equals("");

        test("the div element's 2nd child should have a class")
        .value(element, "children[0].children[1].className")
        .equals("test");

    });
}