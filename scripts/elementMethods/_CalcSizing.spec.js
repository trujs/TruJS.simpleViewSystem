/**[@test({ "title": "TruJS.simpleViewSystem.elementMethods._CalcSizing: no-scroll" })]*/
function testCalcSizing1(arrange, act, assert, module) {
    var calcSizing, elementHelper, element;

    arrange(function () {
        elementHelper = module(".elementHelper");
        calcSizing = module(["TruJS.simpleViewSystem.elementMethods._CalcSizing", []]);
        element = elementHelper.create({
            "tag": "div"
            , "style": {

            }
            , "children": [

            ]
        });
    });

    act(function () {

    });

    assert(function (test) {

    });
}

/**[@test({ "title": "TruJS.simpleViewSystem.elementMethods._CalcSizing: scroll" })]*/
function testCalcSizing2(arrange, act, assert, module) {
    var calcSizing, elementHelper, element;

    arrange(function () {
        elementHelper = module(".elementHelper");
        calcSizing = module(["TruJS.simpleViewSystem.elementMethods._CalcSizing", []]);
        element = elementHelper.create({
            "tag": "div"
            , "class": "scroll"
            , "style": {

            }
            , "children": [
                {
                    "tag": "style"
                    , "innerText": [
                        ".scroll::-webkit-scrollbar {"
                        , "    width: 8px;"
                        , "}"
                    ]
                }
            ]
        });
    });

    act(function () {

    });

    assert(function (test) {

    });
}