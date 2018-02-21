/**[@test({ "title": "TruJS.simpleViewSystem._SimpleUtilities.processValue: try null and value" })]*/
function testSimpleUtilities1(arrange, act, assert, module) {
    var processValue, value, context, result1, result2;

    arrange(function () {
        processValue = module(["TruJS.simpleViewSystem._SimpleUtilities", []])
        .processValue;
        value = "{:value:}";
        context = {
            "value": null
        };
    });

    act(function () {
        result1 = processValue(value, context);
        context.value = "test";
        result2 = processValue(value, context);
    });

    assert(function (test) {
        test("result1 should be")
        .value(result1)
        .stringify()
        .equals("{\"keys\":[\"value\"],\"values\":[null],\"hybrid\":false,\"value\":null}");

        test("result2 should be")
        .value(result2)
        .stringify()
        .equals("{\"keys\":[\"value\"],\"values\":[\"test\"],\"hybrid\":false,\"value\":\"test\"}");
    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleUtilities.processValue: hybrid value" })]*/
function testSimpleUtilities2(arrange, act, assert, module) {
    var processValue, value, context, result1, result2;

    arrange(function () {
        processValue = module(["TruJS.simpleViewSystem._SimpleUtilities", []])
        .processValue;
        value = "test-1 {:value:}";
        context = {
            "value": null
        };
    });

    act(function () {
        result1 = processValue(value, context);
        context.value = "test2";
        result2 = processValue(value, context);
    });

    assert(function (test) {
        test("result1 should be")
        .value(result1)
        .stringify()
        .equals("{\"keys\":[\"value\"],\"values\":[null],\"hybrid\":true,\"value\":\"test-1 null\"}");

        test("result2 should be")
        .value(result2)
        .stringify()
        .equals("{\"keys\":[\"value\"],\"values\":[\"test2\"],\"hybrid\":true,\"value\":\"test-1 test2\"}");
    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleUtilities.processValue: object value" })]*/
function testSimpleUtilities3(arrange, act, assert, module) {
    var processValue, value, context, result;

    arrange(function () {
        processValue = module(["TruJS.simpleViewSystem._SimpleUtilities", []])
        .processValue;
        value = "{:value:}";
        context = {
            "value": {}
        };
    });

    act(function () {
        result = processValue(value, context);
    });

    assert(function (test) {
        test("result should be")
        .value(result, "value")
        .equals(context.value);

    });
}