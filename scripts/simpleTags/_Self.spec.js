/**[@test({ "title": "TruJS.simpleViewSystem.simpleTags._Self: no children" })]*/
function testSelfTag1(arrange, act, assert, module) {
    var selfTag, createElement, element, context, results, self;

    arrange(function () {
        createElement = module([".createElement"]);
        selfTag = module(["TruJS.simpleViewSystem.simpleTags._Self", []]);
        element = createElement("div");
        element.innerHTML = [
            "<self test1=\"self1\" test3=\"self3\"></self>"
        ].join("\n");
        self = element.childNodes[0];
        context = {};
    });

    act(function () {
        results = selfTag("self", self, context);
    });

    assert(function (test) {
        test("results should be")
        .value(results)
        .stringify()
        .equals("{\"addNodes\":{\"context\":{},\"nodes\":[],\"target\":{},\"index\":\"before\"},\"addAttributes\":{\"context\":{},\"attributes\":[{},{}],\"target\":{}},\"removeNodes\":{},\"halt\":true}");

        test("results.addAttributes.target should be")
        .value(results, "addAttributes.target")
        .equals(element);

        test("results.addAttributes.attributes should be")
        .value(results, "addAttributes.attributes")
        .hasMemberCountOf(2);

        test("results.addNodes.nodes should be")
        .value(results, "addNodes.nodes")
        .hasMemberCountOf(0);

        test("results.removeNodes should be")
        .value(results, "removeNodes")
        .equals(self);

        test("results.halt should be")
        .value(results, "halt")
        .isTrue();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleTags._Self: with children" })]*/
function testSelfTag2(arrange, act, assert, module) {
    var selfTag, createElement, element, context, results;

    arrange(function () {
        createElement = module([".createElement"]);
        selfTag = module(["TruJS.simpleViewSystem.simpleTags._Self", []]);
        element = createElement("div");
        element.innerHTML = [
            "<self test3=\"self3\"><div>1</div><div>2</div></self>"
        ].join("\n");
        context = {};
    });

    act(function () {
        results = selfTag("self", element.childNodes[0], context);
    });

    assert(function (test) {
        test("results should be")
        .value(results)
        .stringify()
        .equals("{\"addNodes\":{\"context\":{},\"nodes\":[{},{}],\"target\":{},\"index\":\"before\"},\"addAttributes\":{\"context\":{},\"attributes\":[{}],\"target\":{}},\"removeNodes\":{},\"halt\":true}");

        test("results.addAttributes.target should be")
        .value(results, "addAttributes.target")
        .equals(element);

        test("results.addAttributes.attributes should be")
        .value(results, "addAttributes.attributes")
        .hasMemberCountOf(1);

        test("results.addNodes.nodes should be")
        .value(results, "addNodes.nodes")
        .hasMemberCountOf(2);

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleTags._Self: with processing" })]*/
function testSelfTag3(arrange, act, assert, module) {
    var selfTag, createElement, element, context, results, outputEl;

    arrange(function () {
        createElement = module([".createElement"]);
        selfTag = module(["TruJS.simpleViewSystem.simpleTags._Self", []]);
        mapProcessor = module(["TruJS.simpleViewSystem._MapProcessor", []]);
        element = createElement("div");
        element.innerHTML = [
            "<self test3=\"self3\"><div>1</div><div>2</div></self>"
        ].join("\n");
        context = {};
    });

    act(function () {
        results = selfTag("self", element.childNodes[0], context);
        outputEl = mapProcessor(element.childNodes[0], context, results);
    });

    assert(function (test) {
        test("element outerHTML should be")
        .value(element, "outerHTML")
        .equals("<div test3=\"self3\"><div>1</div><div>2</div></div>");
        
    });
}