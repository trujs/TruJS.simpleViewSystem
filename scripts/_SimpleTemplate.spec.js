/**[@test({ "title": "TruJS.simpleViewSystem._SimpleTemplate: simple multi children template "})]*/
function testSimpleTemplate1(arrange, act, assert, callback, module) {
    var simpleTemplate, template, data, res;

    arrange(function () {
        simpleTemplate = module(["TruJS.simpleViewSystem._SimpleTemplate", []]);
        template = [
            "<div class='{:getTitleClass($element):}'>"
            , "{:title:}"
            , "<span onclick='{:click.subTitle:}'>{:subTitle:}</span>"
            , "<span test=\"{:getTestValue($element):}\"></span>"
            , "</div>"
        ].join("\n");
        data = {
            "title": "TITLE"
            , "subTitle": "sub title"
            , "getTitleClass": callback("title-class")
            , "click": {
                "subTitle": callback()
            }
            , "getTestValue": callback("Test Value")
        };
    });

    act(function () {
        try {
            res = simpleTemplate(template, data);
            res[0].childNodes[1].click();
        }
        catch(ex) {
            res = ex;
        }
    });

    assert(function (test) {
        test("res should not be an error")
        .value(res)
        .not()
        .isError();

        test("res should have 1 member")
        .value(res, "length")
        .equals(1);

        test("res[0] should be")
        .value(res, "[0].outerHTML")
        .equals("<div class=\"title-class\"><span>TITLE</span><span>sub title</span><span test=\"Test Value\"></span></div>");

        test("data.click.subTitle should be called once")
        .value(data.click.subTitle)
        .hasBeenCalled(1);

        test("getTitleClass should be called once")
        .value(data.getTitleClass)
        .hasBeenCalled(1);

        test("getTitleClass should be called with")
        .value(data.getTitleClass)
        .getCallbackArg(0, 0)
        .isOfType("htmldivelement");

        test("getTestValue should be called with")
        .value(data.getTestValue)
        .getCallbackArg(0, 0)
        .isOfType("htmlspanelement");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleTemplate: conditional statements "})]*/
function testSimpleTemplate2(arrange, act, assert, callback, module) {
    var simpleTemplate, template, data, res;

    arrange(function () {
        simpleTemplate = module(["TruJS.simpleViewSystem._SimpleTemplate", []]);
        template = [
            "<div>"
            , "<if expr=\"{:obj is [object]:}\">"
            , "First If"
            , "</if>"
            , "<if expr=\"{:str1 = str2:}\">"
            , "Second If"
            , "</if>"
            , "<else>"
            , "Else"
            , "</else>"
            , "</div>"
        ].join("\n");
        data = {
            "obj": {}
            , "str1": "1"
            , "str2": "2"
        };
    });

    act(function () {
        try {
            res = simpleTemplate(template, data);
        }
        catch(ex) {
            res = ex;
        }
    });

    assert(function (test) {
        test("res should not be an error")
        .value(res)
        .not()
        .isError();

        test("res[0] should be")
        .value(res, "[0].outerHTML")
        .equals("<div><span>First If</span><span>Else</span></div>");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleTemplate: destroy "})]*/
function testSimpleTemplate3(arrange, act, assert, callback, module) {
    var watcher, simpleTemplate, template, context, elements;

    arrange(function () {
        watcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        simpleTemplate = module(["TruJS.simpleViewSystem._SimpleTemplate", []]);
        template = [
            "<div class=\"{:str2:}\">"
            , "{:str1:}"
            , "</div>"
        ].join("\n");
        context = watcher({
            "obj": {}
            , "str1": "Title"
            , "str2": "card"
        });
    });

    act(function () {
        try {
            elements = simpleTemplate(template, context);

            elements[0].$destroy();
            context.str1 = "Sub Title";
            context.str2 = "table";
        }
        catch(ex) {
            elements = ex;
        }
    });

    assert(function (test) {
        test("elements should not be an error")
        .value(elements)
        .not()
        .isError();

        test("elements[0] should be")
        .value(elements, "[0].outerHTML")
        .equals("<div class=\"card\">Title</div>");

    });
}