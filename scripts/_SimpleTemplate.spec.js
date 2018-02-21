/**[@test({ "title": "TruJS.simpleViewSystem._SimpleTemplate: simple multi children template ","format":"browser"})]*/
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
            res = simpleTemplate(template, data).childNodes;
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

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleTemplate: conditional statements ","format":"browser"})]*/
function testSimpleTemplate2(arrange, act, assert, callback, module) {
    var simpleTemplate, template, data, res, createElement, main;

    arrange(function () {
        createElement = module(".createElement");
        simpleTemplate = module(["TruJS.simpleViewSystem._SimpleTemplate", []]);
        main = createElement("main");
        template = [
            "<div>"
            , "<if expr=\"{:obj is [object]:}\">"
            , "    First If"
            , "</if>"
            , "<if expr=\"{:str1 = str2:}\">"
            , "    Second If"
            , "</if>"
            , "<else>"
            , "    Else"
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
            res = simpleTemplate(main, template, data).childNodes;
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

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleTemplate: conditional attribs ","format":"browser"})]*/
function testSimpleTemplate3(arrange, act, assert, callback, module) {
    var simpleTemplate, template, data, res;

    arrange(function () {
        simpleTemplate = module(["TruJS.simpleViewSystem._SimpleTemplate", []]);
        template = [
            "<div>"
            , "<span if=\"str1 === '1'\">"
            , "1ST IF"
            , "</span>"
            , "<span if=\"str2 === '1'\">"
            , "2ND IF"
            , "</span>"
            , "<span else>"
            , "Else"
            , "</span>"
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
            res = simpleTemplate(template, data).childNodes;
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
        .equals("<div><span>1ST IF</span><span>Else</span></div>");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleTemplate: destroy ","format":"browser"})]*/
function testSimpleTemplate4(arrange, act, assert, callback, module) {
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
            elements = simpleTemplate(template, context).childNodes;

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

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleTemplate: if and repeat attributes ","format":"browser"})]*/
function testSimpleTemplate5(arrange, act, assert, callback, module) {
    var watcher, createElement, simpleTemplate, template, context, elements;

    arrange(function () {
        watcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        createElement = module([".createElement"]);
        simpleTemplate = module(["TruJS.simpleViewSystem._SimpleTemplate", []]);
        parent = createElement("main");
        template = [
            "<div if='$show' repeat='$i in rows'>"
            , "ARepeat{:$i:}"
            , "</div>"
            , "<div repeat='$i in rows' if='$i != 1'>"
            , "BRepeat{:$i:}"
            , "</div>"
        ].join("\n");
        context = watcher({
            "$show": false
            , "rows": ["1","2","3"]
        });
    });

    act(function () {
        element = simpleTemplate(parent, template, context);
    });

    assert(function (test) {
        test("elements should have 3 members")
        .value(Array.prototype.slice.apply(element.childNodes))
        .hasMemberCountOf(2)

        test("element.outerHTML should be")
        .value(element,"outerHTML")
        .equals("<main><div>BRepeat0</div><div>BRepeat2</div></main>");

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem._SimpleTemplate: self ","format":"browser"})]*/
function testSimpleTemplate6(arrange, act, assert, callback, module) {
    var createElement, watcher, simpleTemplate, template, context, elements, root, func;

    arrange(function () {
        createElement = module([".createElement"]);
        watcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        simpleTemplate = module(["TruJS.simpleViewSystem._SimpleTemplate", []]);
        template = [
            "<self myattr1=\"{:rows[0]:}\" attr2=\"{:$show:}\" onclick=\"{:func:}\">"
            , "<div if='$show' repeat='$i in rows'>"
            , "</div>"
            , "<div repeat='$i in rows' if='$show'>"
            , "</div>"
            , "</self>"
        ].join("\n");
        func = callback();
        context = Object.create(watcher({
            "$show": false
            , "rows": ["1","2","3"]
            , "func": func
        }));
        root = createElement("main");
    });

    act(function (done) {
        elements = simpleTemplate(root, template, context).childNodes;
        context.rows[0] = "4";
        context.$show = true;
        root.click();
        done(100);
    });

    assert(function (test) {
        test("the parent node should have 2 attributes") //the onclick attrib
        .value(root.attributes.length)                   // should be removed
        .equals(2);

        test("the parent 1st attribute shoud be")
        .value(root.attributes[0], "value")
        .equals("4");

        test("the parent 2nd attribute shoud be")
        .value(root.attributes[1], "value")
        .equals("true");

        test("func should be called once")
        .value(func)
        .hasBeenCalled(1);

    });
}

/**[@test({"title":"TTruJS.simpleViewSystem._SimpleTemplate: class built-in methods"})]*/
function testSimpleTemplate7(arrange, act, assert, module) {
    var simpleTemplate, data, main, template, element;

    arrange(function () {
        simpleTemplate = module(["TruJS.simpleViewSystem._SimpleTemplate", []]);
        createElement = module([".createElement"]);
        main = createElement('main');
        template = [
            , "<div onclick=\"{:($screen,'div')=>$toggleClass:}\">"
            , "    <div class=\"login\"></div>"
            , "    <div onclick=\"{:('test-class1')=>$addClass:}\"></div>"
            , "    <div onclick=\"{:('$screen','main')=>$setValue:}\"></div>"
            , "</div>"
        ]
        .join("\n");
        data = {
            "$screen": "login"
        };
    });

    act(function () {
        element = simpleTemplate(main, template, data).childNodes[0];
        element.children[0].click(); //this bubbles up to the parent handler since we didn't add a handler to it
        element.children[1].click();
        element.children[2].click();
    });

    assert(function (test) {
        test("the div element's 1st child should not have a class")
        .value(element, "children[0].className")
        .equals("");

        test("the div element's 1st child should have a class")
        .value(element, "children[1].className")
        .equals("login test-class1");

        test("$screen should be")
        .value(data, "$screen")
        .equals("main");

    });
}