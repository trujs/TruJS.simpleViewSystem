/**[@test({ "title": "TruJS.simpleViewSystem.simpleTags._Text: only child" })]*/
function testTextTag1(arrange, act, assert, module) {
    var textTag, simpleWatcher, createElement, element, node, context, result;

    arrange(function () {
        createElement = module(".createElement");
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        textTag = module(["TruJS.simpleViewSystem.simpleTags._Text", []]);
        element = createElement("div");
        element.innerHTML = [
            "{:key:}"
        ].join("\n");
        context = simpleWatcher({
            "key": "value"
        });
        node = element.childNodes[0];
    });

    act(function () {
        result = textTag("text", node, context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"addWatchers\":{\"context\":{\"key\":\"value\"},\"path\":[\"key\"],\"target\":{}}}");

        test("element innerHTML should be")
        .value(element, "innerHTML")
        .equals("value");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleTags._Text: other elements" })]*/
function testTextTag2(arrange, act, assert, module) {
    var textTag, simpleWatcher, createElement, element, node, context, result;

    arrange(function () {
        createElement = module(".createElement");
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        textTag = module(["TruJS.simpleViewSystem.simpleTags._Text", []]);
        element = createElement("div");
        element.innerHTML = [
            "<div></div>"
            , "{:key:}"
        ].join("\n");
        context = simpleWatcher({
            "key": "value"
        });
        node = element.childNodes[1];
    });

    act(function () {
        result = textTag("text", node, context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"addWatchers\":{\"context\":{\"key\":\"value\"},\"path\":[\"key\"],\"target\":{\"watchers\":[]}}}");

        test("element innerHTML should be")
        .value(element, "innerHTML")
        .equals("<div></div><span>value</span>");
    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleTags._Text: only white space" })]*/
function testTextTag3(arrange, act, assert, module) {
    var textTag, simpleWatcher, createElement, element, node, context, result;

    arrange(function () {
        createElement = module(".createElement");
        simpleWatcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        textTag = module(["TruJS.simpleViewSystem.simpleTags._Text", []]);
        element = createElement("div");
        element.innerHTML = [
            "   "
        ].join("\n");
        context = simpleWatcher({
            "key": ""
        });
        node = element.childNodes[0];
    });

    act(function () {
        result = textTag("text", node, context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"removeNodes\":{}}");

    });
}