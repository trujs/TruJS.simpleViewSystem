/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._ToggleClass: children " })]*/
function testToggleClass1(arrange, act, assert, module) {
    var toggleClass, createElement, element, target;

    arrange(function () {
        createElement = module([".createElement"]);
        toggleClass = module(["TruJS.simpleViewSystem.simpleMethods._ToggleClass", []]);
        target = createElement("main");
        target.onclick = function (e) {
            toggleClass(e, element, "test", "div > div");
        };
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
        target.click();
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
    var toggleClass, createElement, element, target;

    arrange(function () {
        createElement = module([".createElement"]);
        toggleClass = module(["TruJS.simpleViewSystem.simpleMethods._ToggleClass", []]);
        target = createElement("main");
        target.onclick = function (e) {
            toggleClass(e, element, "test");
        };
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
        target.click();
    });

    assert(function (test) {
        test("the element should have a class 'test'")
        .value(target, "className")
        .equals("test");

        test("the element's 1st child should not have a class 'test'")
        .value(element, "children[0].children[0].className")
        .equals("test");

        test("the element's 2nd child should have a class 'test'")
        .value(element, "children[0].children[1].className")
        .equals("");

    });
}