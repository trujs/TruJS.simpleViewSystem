/**[@test({ "title": "TruJS.simpleViewSystem.simpleAttributes._Repeat: object with sort" })]*/
function testRepeatAttribute1(arrange, act, assert, module) {
    var repeatAttribute, element, attribute, context, result;

    arrange(function () {
        createElement = module([".createElement"]);
        repeatAttribute = module(["TruJS.simpleViewSystem.simpleAttributes._Repeat",[]]);
        parent = createElement("div");
        parent.innerHTML = [
            "<div repeat=\"$k,$i,$v in obj sort $k desc\">"
            , "{:$k:}"
            , "{:$i:}"
            , "</div>"
        ].join("\n");
        element = parent.children[0];
        attribute = element.getAttributeNode("repeat");
        context = {
            "obj": {
                "key2": "value2"
                , "key3": "value3"
                , "key1": "value1"
            }
        };
    });

    act(function () {
        result = repeatAttribute(element, attribute, context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"addNodes\":[{\"context\":{\"$k\":\"key3\",\"$i\":0,\"$v\":\"value3\"},\"target\":{},\"nodes\":[{}],\"index\":\"before\"},{\"context\":{\"$k\":\"key2\",\"$i\":1,\"$v\":\"value2\"},\"target\":{},\"nodes\":[{}],\"index\":\"before\"},{\"context\":{\"$k\":\"key1\",\"$i\":2,\"$v\":\"value1\"},\"target\":{},\"nodes\":[{}],\"index\":\"before\"}],\"removeNodes\":{}}");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleAttributes._Repeat: array with filter" })]*/
function testRepeatAttribute2(arrange, act, assert, module) {
    var repeatAttribute, element, attribute, context, result;

    arrange(function () {
        createElement = module([".createElement"]);
        repeatAttribute = module(["TruJS.simpleViewSystem.simpleAttributes._Repeat",[]]);
        parent = createElement("div");
        parent.innerHTML = [
            "<div repeat=\"$k,$i,$v in ar filter $i > 0\">"
            , "{:$k:}"
            , "{:$i:}"
            , "</div>"
        ].join("\n");
        element = parent.children[0];
        attribute = element.getAttributeNode("repeat");
        context = {
            "ar": [
                "value2"
                , "value3"
                , "value1"
            ]
        };
    });

    act(function () {
        result = repeatAttribute(element, attribute, context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"addNodes\":[{\"context\":{\"$k\":\"0\",\"$i\":0,\"$v\":\"value3\"},\"target\":{},\"nodes\":[{}],\"index\":\"before\"},{\"context\":{\"$k\":\"1\",\"$i\":1,\"$v\":\"value1\"},\"target\":{},\"nodes\":[{}],\"index\":\"before\"}],\"removeNodes\":{}}");

    });
}