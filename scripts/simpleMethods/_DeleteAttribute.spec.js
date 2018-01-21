/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteAttribute: selector" })]*/
function testDeleteAttribute1(arrange, act, assert, module) {
    var deleteAttribute, createElement;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteAttribute = module(["TruJS.simpleViewSystem.simpleMethods._DeleteAttribute", []]);
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
        deleteAttribute(element, "div > div", "test");
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

        test("the div element's 1st child should not have a 'test' attribute")
        .value(element, "children[0].children[1]")
        .hasAttribute("test")
        .isFalse();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteAttribute: root" })]*/
function testDeleteAttribute2(arrange, act, assert, module) {
    var deleteAttribute, createElement;

    arrange(function () {
        createElement = module([".createElement"]);
        deleteAttribute = module(["TruJS.simpleViewSystem.simpleMethods._DeleteAttribute", []]);
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
        deleteAttribute(element, "test");
    });

    assert(function (test) {
        test("the element should have a 'test' attribute")
        .value(element)
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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMethods._DeleteAttribute: with event" })]*/
function testDeleteAttribute3(arrange, act, assert, module) {
    var deleteAttribute, createElement, event;

    arrange(function () {
        event = new Event('test');
        createElement = module([".createElement"]);
        deleteAttribute = module(["TruJS.simpleViewSystem.simpleMethods._DeleteAttribute", []]);
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
        deleteAttribute(element, "test", event);
    });

    assert(function (test) {
        test("the element should have a 'test' attribute")
        .value(element)
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