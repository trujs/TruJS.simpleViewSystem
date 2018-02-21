/**[@test({ "title": "TruJS.simpleViewSystem._NodeProcessor: tag processor returning halt, and alternate node" })]*/
function testNodeProcessor1(arrange, act, assert, callback, module) {
    var nodeProcessor, simpleMethods, tagProcessor, attributeProcessor
    , mapProcessor, simpleMixin, createElement, element, data, node, alt;

    arrange(function () {
        createElement = module(".createElement");
        alt = createElement("div");
        simpleMethods = {
            "$method": callback()
        };
        tagProcessor = callback({
            "halt": true
            , "node": alt
        });
        attributeProcessor = callback();
        mapProcessor = callback(function (a, b, map) {
            return map.node;
        });
        simpleMixin = callback();

        nodeProcessor = module(["TruJS.simpleViewSystem._NodeProcessor", [
            , simpleMethods
            , tagProcessor
            , attributeProcessor
            , mapProcessor
            , simpleMixin
        ]]);

        element = createElement("div");
        data = {};
    });

    act(function () {
        node = nodeProcessor(element, data);
    });

    assert(function (test) {
        test("node should be alt")
        .value(node)
        .equals(alt);

        test("tagProcessor should be called once")
        .value(tagProcessor)
        .hasBeenCalled(1);

        test("attributeProcessor should not be called")
        .value(attributeProcessor)
        .not()
        .hasBeenCalled();

        test("mapProcessor should be called once")
        .value(mapProcessor)
        .hasBeenCalled(1);

        test("simpleMixin should not be called")
        .value(simpleMixin)
        .not()
        .hasBeenCalled();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._NodeProcessor: tag processor returning AddNodes, attribute processor returning halt" })]*/
function testNodeProcessor2(arrange, act, assert, callback, module) {
    var nodeProcessor, simpleMethods, tagProcessor, attributeProcessor
    , mapProcessor, simpleMixin, createElement, element, data, node, alt;

    arrange(function () {
        createElement = module(".createElement");
        alt = createElement("div");
        element = createElement("div");
        element.setAttribute("attr1", "attr1");
        element.setAttribute("attr2", "attr2");
        simpleMethods = {
            "$method": callback()
        };
        tagProcessor = callback({
            "removeNodes": element
            , "addNodes": []
        });
        attributeProcessor = callback({
            "halt": true
            , "node": alt
        });
        mapProcessor = callback(function (a, b, map) {
            return map.node;
        });
        simpleMixin = callback();

        nodeProcessor = module(["TruJS.simpleViewSystem._NodeProcessor", [
            , simpleMethods
            , tagProcessor
            , attributeProcessor
            , mapProcessor
            , simpleMixin
        ]]);

        data = {};
    });

    act(function () {
        node = nodeProcessor(element, data);
    });

    assert(function (test) {
        test("node should be alt")
        .value(node)
        .equals(alt);

        test("tagProcessor should be called once")
        .value(tagProcessor)
        .hasBeenCalled(1);

        test("attributeProcessor should be called once")
        .value(attributeProcessor)
        .hasBeenCalled(1);

        test("mapProcessor should be called twice")
        .value(mapProcessor)
        .hasBeenCalled(2);

        test("simpleMixin should not be called")
        .value(simpleMixin)
        .not()
        .hasBeenCalled();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._NodeProcessor: children" })]*/
function testNodeProcessor3(arrange, act, assert, callback, module) {
    var nodeProcessor, simpleMethods, tagProcessor, attributeProcessor
    , mapProcessor, simpleMixin, createElement, element, data, node, alt1, alt2;

    arrange(function () {
        createElement = module(".createElement");
        alt1 = createElement("div");
        alt1.setAttribute("alt1attr2", "alt1attr2");
        alt2 = createElement("div");
        alt2.innerHTML = [
            "<div></div>"
            , "<div alt2child2=\"alt2child2\"></div>"
        ].join("\n");
        simpleMethods = {
            "$method": callback()
        };
        tagProcessor = callback(function () {
            if (tagProcessor.callbackCount === 1) {
                return {
                    "remove": true
                    , "node": alt1
                    , "addAttributes": []
                };
            }
        });
        attributeProcessor = callback(function () {
            if (attributeProcessor.callbackCount === 1) {
                return {
                    "node": alt2
                    , "addNodes": []
                };
            }
        });
        mapProcessor = callback(function (a, b, map) {
            return map.node;
        });
        simpleMixin = callback();

        nodeProcessor = module(["TruJS.simpleViewSystem._NodeProcessor", [
            , simpleMethods
            , tagProcessor
            , attributeProcessor
            , mapProcessor
            , simpleMixin
        ]]);

        element = createElement("div");
        element.setAttribute("attr1", "attr1");
        element.setAttribute("attr2", "attr2");
        data = {};
    });

    act(function () {
        node = nodeProcessor(element, data);
    });

    assert(function (test) {
        test("node should be alt2")
        .value(node)
        .equals(alt2);

        test("tagProcessor should be called 3 times")
        .value(tagProcessor)
        .hasBeenCalled(3);

        test("attributeProcessor should be called twice")
        .value(attributeProcessor)
        .hasBeenCalled(2);

        test("mapProcessor should be called twice")
        .value(mapProcessor)
        .hasBeenCalled(2);

        test("simpleMixin should be called 3 times")
        .value(simpleMixin)
        .hasBeenCalled(3);

    });
}