/**[@test({ "label":"ifAttribHelper", "type": "factory" })]*/
function ifAttribHelper(module) {
    var createElement, context;

    createElement = module([".createElement"]);
    element = createElement('main');
    element.innerHTML = [
        "<span if=\"value === 1\">If</span>"
        , "<span elseif=\"value === 2\">Else If</span>"
        , "<span else=\"value === 3\">Else</span>"
    ].join("\n");

    context = {
        "value": 1
    };

    return {
        "element": element
        , "context": context
    };
};

/**[@test({ "title": "TruJS.simpleViewSystem.simpleAttributes._If: if" })]*/
function testIfAttribute1(arrange, act, assert, module, ifAttribHelper) {
    var ifAttrib, attribute, result, ifElement;

    arrange(function () {
        ifAttrib = module(["TruJS.simpleViewSystem.simpleAttributes._If", []]);
        ifElement = ifAttribHelper.element.children[0];
        attribute = ifElement.getAttributeNode("if");
    });

    act(function () {
        result = ifAttrib(ifElement, attribute, ifAttribHelper.context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"halt\":false}");

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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleAttributes._If: else if" })]*/
function testIfAttribute2(arrange, act, assert, module, ifAttribHelper) {
    var ifAttrib, attribute, result, elseIfElement;

    arrange(function () {
        ifAttrib = module(["TruJS.simpleViewSystem.simpleAttributes._If", []]);
        elseIfElement = ifAttribHelper.element.children[1];
        attribute = elseIfElement.getAttributeNode("elseif");
    });

    act(function () {
        ifAttribHelper.context.value = 2;
        result = ifAttrib(elseIfElement, attribute, ifAttribHelper.context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"halt\":false}");

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

/**[@test({ "title": "TruJS.simpleViewSystem.simpleAttributes._If: else" })]*/
function testIfAttribute3(arrange, act, assert, module, ifAttribHelper) {
    var ifAttrib, attribute, result, elseElement;

    arrange(function () {
        ifAttrib = module(["TruJS.simpleViewSystem.simpleAttributes._If", []]);
        elseElement = ifAttribHelper.element.children[2];
        attribute = elseElement.getAttributeNode("else");
    });

    act(function () {
        ifAttribHelper.context.value = 3;
        result = ifAttrib(elseElement, attribute, ifAttribHelper.context);
    });

    assert(function (test) {
        test("result should be")
        .value(result)
        .stringify()
        .equals("{\"halt\":false}");

        test("elseif should not be removed")
        .value(elseElement, "parentNode")
        .not()
        .isUndef();

    });
}