/**[@test({ "label": "smplExprHelper", "type": "factory" })]*/
function smplExprHelper(callback) {
    return {
        "num1": 1
        , "num2": 2
        , "num3": callback(3)
        , "str": ["str1", "str2", "str3"]
        , "objAr": [{ "num": 1 },{ "num": 0 },{ "num": 2 }]
        , "obj1": {
            "key1": "str1"
            , "key2": "str2"
            , "key3": "str0"
        }
        , "obj2": { }
    };
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: conditional expressions w/ functions" })]*/
function testSimpleExpression1(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = [
            "num3() === str.length"
            , "str[1] == obj1.key2"
            , "num1 !== num2"
            , "num2 > num1"
            , "num1 < num2"
            , "num3() >= num2"
            , "num2 <= num3()"
            , "str[0] is [string]"
            , "obj1 === obj1"
            , "obj1 !== obj2"
        ];
        res = [];
    });

    act(function () {
        res[0] = simpleExpression(expr[0], smplExprHelper);
        res[1] = simpleExpression(expr[1], smplExprHelper);
        res[2] = simpleExpression(expr[2], smplExprHelper);
        res[3] = simpleExpression(expr[3], smplExprHelper);
        res[4] = simpleExpression(expr[4], smplExprHelper);
        res[5] = simpleExpression(expr[5], smplExprHelper);
        res[6] = simpleExpression(expr[6], smplExprHelper);
        res[7] = simpleExpression(expr[7], smplExprHelper);
        res[8] = simpleExpression(expr[8], smplExprHelper);
    });

    assert(function (test) {
        test("res[0].keys should be")
          .value(res, "[0].keys")
          .stringify()
          .equals("[\"str.length\"]");

        test("res[0].type should be 'conditional'")
          .value(res, "[0].type")
          .equals("conditional");

        test("res[0].result should be true")
          .value(res, "[0].result")
          .isTrue();

        test("res[1].keys should be")
          .value(res, "[1].keys")
          .stringify()
          .equals("[\"str[1]\",\"obj1.key2\"]");

        test("res[1].result should be true")
          .value(res, "[1].result")
          .isTrue();

        test("res[2].result should be true")
          .value(res, "[2].result")
          .isTrue();

        test("res[3].result should be true")
          .value(res, "[3].result")
          .isTrue();

        test("res[4].result should be true")
          .value(res, "[4].result")
          .isTrue();

        test("res[5].result should be true")
          .value(res, "[5].result")
          .isTrue();

        test("res[6].result should be true")
          .value(res, "[6].result")
          .isTrue();

        test("res[7].result should be true")
          .value(res, "[7].result")
          .isTrue();

        test("res[7].keys should be")
          .value(res, "[7].keys")
          .stringify()
          .equals("[\"str[0]\"]");

        test("res[8].result should be true")
          .value(res, "[8].result")
          .isTrue();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: iterator for array" })]*/
function testSimpleExpression2(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, iter, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "val in str";
        res = [];
    });

    act(function () {
        iter = simpleExpression(expr, smplExprHelper);
        res[0] = iter.iterator.next();
        res[1] = iter.iterator.next();
        res[2] = iter.iterator.next();
        res[3] = iter.iterator.next();
    });

    assert(function (test) {
        test("res[0] should be")
          .value(res, "[0].val")
          .equals("0");

        test("res[0] should be")
          .value(res, "[1].val")
          .equals("1");

        test("res[0] should be")
          .value(res, "[2].val")
          .equals("2");

        test("res[0] should be")
          .value(res, "[3].val")
          .isUndef();

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: iterator for array w/ sort by key desc" })]*/
function testSimpleExpression3(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, iter, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "val in str sort val desc";
        res = [];
    });

    act(function () {
        iter = simpleExpression(expr, smplExprHelper);
        res[0] = iter.iterator.next();
        res[1] = iter.iterator.next();
        res[2] = iter.iterator.next();
    });

    assert(function (test) {
        test("res[0] should be")
          .value(res, "[0].val")
          .equals("2");

        test("res[1] should be")
          .value(res, "[1].val")
          .equals("1");

        test("res[2] should be")
          .value(res, "[2].val")
          .equals("0");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: iterator for array w/ sort by value" })]*/
function testSimpleExpression4(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, iter, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "$key in objAr sort num";
        res = [];
    });

    act(function () {
        iter = simpleExpression(expr, smplExprHelper);
        res[0] = iter.iterator.next();
        res[1] = iter.iterator.next();
        res[2] = iter.iterator.next();
    });

    assert(function (test) {
        test("res[0] should be")
          .value(res, "[0].$key")
          .equals("1");

        test("res[1] should be")
          .value(res, "[1].$key")
          .equals("0");

        test("res[2] should be")
          .value(res, "[2].$key")
          .equals("2");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: iterator for object" })]*/
function testSimpleExpression5(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, iter, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "$key in obj1 sort $key desc";
        res = [];
    });

    act(function () {
        iter = simpleExpression(expr, smplExprHelper);
        res[0] = iter.iterator.next();
        res[1] = iter.iterator.next();
        res[2] = iter.iterator.next();
    });

    assert(function (test) {
        test("res[0] should be")
          .value(res, "[0].$key")
          .equals("key3");

        test("res[1] should be")
          .value(res, "[1].$key")
          .equals("key2");

        test("res[2] should be")
          .value(res, "[2].$key")
          .equals("key1");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: function, no parentheses" })]*/
function testSimpleExpression6(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "num3";
    });

    act(function () {
        res = simpleExpression(expr, smplExprHelper);
    });

    assert(function (test) {
        test("res should be a function")
          .value(res, "result")
          .isOfType("function");


    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: function with parameter binding" })]*/
function testSimpleExpression7(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "('test', 10)=>num3";
    });

    act(function () {
        res = simpleExpression(expr, smplExprHelper);
        res.result("string");
    });

    assert(function (test) {
        test("num3 should be called once")
        .value(smplExprHelper.num3)
        .hasBeenCalled(1);

        test("num3 should be called with 3 parameters")
        .value(smplExprHelper.num3)
        .getCallbackArgs(0)
        .hasMemberCountOf(3);

        test("num3 should be called with 3 parameters")
        .value(smplExprHelper.num3)
        .getCallbackArgs(0)
        .stringify()
        .equals("[\"test\",10,\"string\"]");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: json" })]*/
function testSimpleExpression8(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "{ \"test1\": \"num3() === 3\", \"test2\": \"objAr[1] === 1\", \"test3\": \"obj1\" }";
    });

    act(function () {
        res = simpleExpression(expr, smplExprHelper);
    });

    assert(function (test) {
        test("res should be")
        .value(res.result)
        .equals("test1test3");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: iterator using multiple vars" })]*/
function testSimpleExpression9(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, iter, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "$k,$i, $v in obj1 sort $k desc";
        res = [];
    });

    act(function () {
        iter = simpleExpression(expr, smplExprHelper);
        res[0] = iter.iterator.next();
        res[1] = iter.iterator.next();
        res[2] = iter.iterator.next();
    });

    assert(function (test) {
        test("res[0] should be")
        .value(res, "[0].$k")
        .equals("key3");

        test("res[0] should be")
        .value(res, "[0].$i")
        .equals(0);

        test("res[0] should be")
        .value(res, "[0].$v")
        .equals("str0");

        test("res[1] should be")
        .value(res, "[1].$k")
        .equals("key2");

        test("res[1] should be")
        .value(res, "[1].$i")
        .equals(1);

        test("res[1] should be")
        .value(res, "[1].$v")
        .equals("str2");

        test("res[2] should be")
        .value(res, "[2].$k")
        .equals("key1");

        test("res[2] should be")
        .value(res, "[2].$i")
        .equals(2);

        test("res[2] should be")
        .value(res, "[2].$v")
        .equals("str1");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: iterator with filter" })]*/
function testSimpleExpression10(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, iter, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "$key in obj1 filter $key === 'key2'";
    });

    act(function () {
        iter = simpleExpression(expr, smplExprHelper);
        res = iter.iterator.next();
    });

    assert(function (test) {
        test("the iterator length should be")
        .value(iter, "iterator.length")
        .equals(1);

        test("res should be")
        .value(res, "$key")
        .equals("key2");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleExpression: iterator with array literal" })]*/
function testSimpleExpression10(arrange, act, assert, smplExprHelper, module) {
    var simpleExpression, expr, iter, res;

    arrange(function () {
        simpleExpression = module(["TruJS.simpleViewSystem._SimpleExpression", []]);
        expr = "$k,$i,$v in [1,2,3,'4'] sort $v asc";
    });

    act(function () {
        iter = simpleExpression(expr, smplExprHelper);
        res = iter.iterator.next();
    });

    assert(function (test) {
        test("res should be")
        .value(res)
        .stringify()
        .equals("{\"$k\":\"0\",\"$i\":0,\"$v\":1}");

    });
}