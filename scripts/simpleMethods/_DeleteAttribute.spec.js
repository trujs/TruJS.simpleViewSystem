/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteAttribute: selector" })]*/
function testDeleteAttribute1(arrange, act, assert, module) {
    var deleteAttribute, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteAttribute = module(["TruJS.simpleViewSystem.simpleMethods._DeleteAttribute", []]);
        target = createElement("main");
        target.onclick = function (e) {
            deleteAttribute(e, element, "test", "div > div");
        };
        element = createElement("main");
        element.innerHTML = [
            "<div test=\"test\">"
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
        test("the div element should have a 'test' attribute")
        .value(element, "children[0]")
        .hasAttribute("test")
        .isTrue();

        test("the div element's 1st child should not have a 'test' attribute")
        .value(element, "children[0].children[0]")
        .hasAttribute("test")
        .isFalse();

        test("the div element's 2nd child should not have a 'test' attribute")
        .value(element, "children[0].children[1]")
        .hasAttribute("test")
        .isFalse();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteAttribute: target" })]*/
function testDeleteAttribute2(arrange, act, assert, module) {
    var deleteAttribute, createElement, target, element;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteAttribute = module(["TruJS.simpleViewSystem.simpleMethods._DeleteAttribute", []]);
        target = createElement("main");
        target.onclick = function (e) {
            deleteAttribute(e, element, "test");
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
        test("the element should have a 'test' attribute")
        .value(target)
        .hasAttribute("test")
        .isFalse();

        test("the div element's 1st child should not have a 'test' attribute")
        .value(element, "children[0].children[0]")
        .hasAttribute("test")
        .isFalse();

        test("the div element's 2nd child should not have a 'test' attribute")
        .value(element, "children[0].children[1]")
        .hasAttribute("test")
        .isTrue();

    });
}