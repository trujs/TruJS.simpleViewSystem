/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteClass: using selector" })]*/
function testDeleteClass1(arrange, act, assert, module) {
    var deleteClass, createElement, element, target;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteClass = module(["TruJS.simpleViewSystem.simpleMethods._DeleteClass", []]);
        target = createElement("main");
        target.onclick = function (e) {
            deleteClass(e, element, "test", "div > div");
        };
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
        target.click();
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
    var deleteClass, createElement, element, target;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteClass = module(["TruJS.simpleViewSystem.simpleMethods._DeleteClass", []]);
        target = createElement("main");
        target.onclick = function (e) {
            deleteClass(e, element, "test");
        };
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
        target.click();
    });

    assert(function (test) {
        test("the element should have a class test")
        .value(target, "className")
        .equals("");

        test("the div element's 1st child should have a class")
        .value(element, "children[0].children[0].className")
        .equals("");

        test("the div element's 2nd child should have a class")
        .value(element, "children[0].children[1].className")
        .equals("test");

    });
}