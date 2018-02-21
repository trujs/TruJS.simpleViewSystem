/**[@test({ "title": "TruJS.simpleViewSystem.simpleAttributes._Standard: event attribute" })]*/
function testStandardAttribute1(arrange, act, assert, module, callback) {
    var standardAttribute, createElement, element, attribute, context, result
    , simpleWatcher, func;

    arrange(function () {
        createElement = module([".createElement"]);
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        standardAttribute = module(["TruJS.simpleViewSystem.simpleAttributes._Standard", []]);
        element = createElement("div");
        element.setAttribute("onclick", "{:func:}");
        attribute = element.attributes[0];
        func = callback();
        context = simpleWatcher({
            "func": func
        });
    });

    act(function () {
        result = standardAttribute(element, attribute, context);
        element.click();
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .isNill();

        test("element should not have attribute")
        .value(element)
        .hasAttribute("onclick");

        test("func should be called once")
        .value(func)
        .hasBeenCalled(1);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleAttributes._Standard: non-event object attributes" })]*/
function testStandardAttribute2(arrange, act, assert, module, callback) {
    var standardAttribute, createElement, element, attribute, context, result
    , simpleWatcher, obj;

    arrange(function () {
        createElement = module([".createElement"]);
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        standardAttribute = module(["TruJS.simpleViewSystem.simpleAttributes._Standard", []]);
        element = createElement("div");
        element.setAttribute("object", "{:obj:}");
        attribute = element.attributes[0];
        obj = { "test": "value" };
        context = simpleWatcher({
            "obj": obj
        });
    });

    act(function () {
        result = standardAttribute(element, attribute, context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"addWatchers\":{\"context\":{\"obj\":{\"test\":\"value\"}},\"path\":[\"obj\"],\"target\":{}}}");

        test("object attribute value should be")
        .value(element)
        .getAttribute("object")
        .equals("$value");

        test("attribute.$value should be")
        .value(element)
        .getAttributeNode("object")
        .value("{value}", "$value")
        .equals(context.obj);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleAttributes._Standard: non-event primitive attributes" })]*/
function testStandardAttribute3(arrange, act, assert, module, callback) {
    var standardAttribute, createElement, element, attribute, context, result
    , simpleWatcher, watchKeys, watcher;

    arrange(function () {
        createElement = module([".createElement"]);
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        watchers = {};
        watchKeys = callback(watchers);
        standardAttribute = module(["TruJS.simpleViewSystem.simpleAttributes._Standard", [,,,,watchKeys]]);
        element = createElement("div");
        element.setAttribute("string", "{:string:}");
        attribute = element.attributes[0];
        context = simpleWatcher({
            "string": "value1"
        });
    });

    act(function () {
        result = standardAttribute(element, attribute, context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"addWatchers\":{\"context\":{\"string\":\"value1\"},\"path\":[\"string\"],\"target\":{}}}");

        test("string attribute value should be")
        .value(element)
        .getAttribute("string")
        .equals("value1");

        test("attribute.$value should be")
        .value(element)
        .getAttributeNode("string")
        .value("{value}", "$value")
        .isNill();

    });
}