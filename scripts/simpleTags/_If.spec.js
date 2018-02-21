/**[@test({ "label": "ifTagHelper", "type": "factory" })]*/
function ifTagHelper (module) {
    var createElement, context;

    createElement = module([".createElement"]);
    element = createElement('main');
    element.innerHTML = [
        "<if expr=\"value === 1\">If</if>"
        , "<elseif expr=\"value === 2\">Else If</elseif>"
        , "<else expr=\"value === 3\">Else</else>"
    ].join("\n");

    context = {
        "value": 1
    };

    return {
        "element": element
        , "context": context
    };
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleTags._If: if" })]*/
function testIfTag1(arrange, act, assert, module, ifTagHelper) {
    var ifTag, ifElement, result;

    arrange(function () {
        ifTag = module(["TruJS.simpleViewSystem.simpleTags._If",[]]);
        ifElement = ifTagHelper.element.children[0];
    });

    act(function () {
        result = ifTag("if", ifElement, ifTagHelper.context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"addNodes\":{\"index\":\"before\",\"target\":{},\"nodes\":[{}]},\"removeNodes\":{},\"halt\":true}");

        test("if should not be removed")
        .value(ifElement, "parentNode")
        .not()
        .isUndef();

        test("if should not have a remove attribute")
        .value(ifElement)
        .hasAttribute("ifremove")
        .not()
        .isTrue();

        test("elseif should have a remove attribute")
        .value(ifElement, "nextElementSibling")
        .hasAttribute("ifremove")
        .isTrue();

        test("else should have a remove attribute")
        .value(ifElement, "nextElementSibling.nextElementSibling")
        .hasAttribute("ifremove")
        .isTrue();
    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleTags._If: elseif" })]*/
function testIfTag2(arrange, act, assert, module, ifTagHelper) {
    var ifTag, elseIfElement, result;

    arrange(function () {
        ifTag = module(["TruJS.simpleViewSystem.simpleTags._If",[]]);
        elseIfElement = ifTagHelper.element.children[1];
    });

    act(function () {
        ifTagHelper.context.value = 2;
        result = ifTag("elseif", elseIfElement, ifTagHelper.context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"addNodes\":{\"index\":\"before\",\"target\":{},\"nodes\":[{}]},\"removeNodes\":{},\"halt\":true}");

        test("elseif should not have a remove attribute")
        .value(elseIfElement)
        .hasAttribute("ifremove")
        .not()
        .isTrue();

        test("else should have a remove attribute")
        .value(elseIfElement, "nextElementSibling")
        .hasAttribute("ifremove")
        .isTrue();
    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.simpleTags._If: else" })]*/
function testIfTag3(arrange, act, assert, module, ifTagHelper) {
    var ifTag, elseElement, result;

    arrange(function () {
        ifTag = module(["TruJS.simpleViewSystem.simpleTags._If",[]]);
        elseElement = ifTagHelper.element.children[2];
    });

    act(function () {
        ifTagHelper.context.value = 3;
        result = ifTag("else", elseElement, ifTagHelper.context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"addNodes\":{\"index\":\"before\",\"target\":{},\"nodes\":[{}]},\"removeNodes\":{},\"halt\":true}");

        test("elseif should not be removed")
        .value(elseElement, "parentNode")
        .not()
        .isUndef();
    });
}