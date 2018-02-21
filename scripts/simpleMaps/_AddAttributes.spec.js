/**[@test({ "title": "TruJS.simpleViewSystem.simpleMaps._AddAttributes: attribute & key value pair" })]*/
function testAddAttributes1(arrange, act, assert, module) {
    var addAttributes, createElement, element, context, attributeMaps
    , target;

    arrange(function () {
        createElement = module(".createElement");
        addAttributes = module(["TruJS.simpleViewSystem.simpleMaps._AddAttributes", []]);
        element = createElement("div");
        element.setAttribute("test1", "value1");
        element.setAttribute("test2", "value2");
        element.setAttribute("test3", "value3");
        target = createElement("div");
        target.innerHTML = [
            "<span></span>"
        ].join("\n");
        context = {};
        attributeMaps = [{
            "target": target
            , "attributes": [
                element.getAttributeNode("test1")
                , { "key": "test2", "value": element.getAttribute("test2") }
            ]
        }, {
            "target": target.childNodes[0]
            , "attributes": element.getAttributeNode("test3")
            , "process": false
        }];
    });

    act(function () {
        addAttributes(element, context, attributeMaps);
    });

    assert(function (test) {
        test("target.outerHTML should be")
        .value(target, "outerHTML")
        .equals("<div test1=\"value1\" test2=\"value2\"><span test3=\"value3\"></span></div>");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMaps._AddAttributes: missing target" })]*/
function testAddAttributes2(arrange, act, assert, module) {
    var addAttributes, createElement, element, context, attributeMaps
    , target, error;

    arrange(function () {
        createElement = module(".createElement");
        addAttributes = module(["TruJS.simpleViewSystem.simpleMaps._AddAttributes", []]);
        element = createElement("div");
        element.setAttribute("test1", "value1");
        element.setAttribute("test2", "value2");
        element.setAttribute("test3", "value3");
        target = createElement("div");
        target.innerHTML = [
            "<span></span>"
        ].join("\n");
        context = {};
        attributeMaps = [{
            "attributes": [
                element.getAttributeNode("test1")
                , { "key": "test2", "value": element.getAttribute("test2") }
            ]
        }, {
            "target": target.childNodes[0]
            , "attributes": element.getAttributeNode("test3")
            , "process": false
        }];
    });

    act(function () {
        try {
            addAttributes(element, context, attributeMaps);
        }
        catch(ex) {
            error = ex;
        }
    });

    assert(function (test) {
        test("target.outerHTML should be")
        .value(target, "outerHTML")
        .equals("<div><span></span></div>");

        test("error should be an Error")
        .value(error)
        .isError();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleMaps._AddAttributes: same parent" })]*/
function testAddAttributes3(arrange, act, assert, module) {
    var addAttributes, createElement, element, context, attributeMaps
    , target, error;

    arrange(function () {
        createElement = module(".createElement");
        addAttributes = module(["TruJS.simpleViewSystem.simpleMaps._AddAttributes", []]);
        element = createElement("div");
        element.setAttribute("test1", "value1");
        element.setAttribute("test2", "value2");
        element.setAttribute("test3", "value3");
        target = createElement("div");
        target.innerHTML = [
            "<span></span>"
        ].join("\n");
        context = {};
        attributeMaps = [{
            "target": element
            , "attributes": [
                element.getAttributeNode("test1")
                , { "key": "test2", "value": element.getAttribute("test2") }
            ]
        }, {
            "target": element
            , "attributes": element.getAttributeNode("test3")
            , "process": false
        }];
    });

    act(function () {
        try {
            addAttributes(element, context, attributeMaps);
        }
        catch(ex) {
            error = ex;
        }
    });

    assert(function (test) {
        test("target.outerHTML should be")
        .value(target, "outerHTML")
        .equals("<div><span></span></div>");

        test("error should be an Error")
        .value(error)
        .isError();

    });
}