/**[@test({ "title": "TruJS.simpleViewSystem._SimpleElement: kitchen sink" })]*/
function testSimpleElement(arrange, act, assert, module) {
    var simpleElement, createElement, element, el, attr1, el1class
    , el1Child2Attr1, el1Child1Color, el1Sizing, body;

    arrange(function () {
        body = module(".document.body");
        createElement = module(".createElement");
        simpleElement = module(["TruJS.simpleViewSystem._SimpleElement", []]);
        element = createElement("main");
        element.style.cssText = "display:flex;position:absolute;top:200px;left:100px;width:400px;height:300px;";
        element.innerHTML = [
              "<el1 class='child-1' style='flex:1;border:1px solid green;margin:2px;padding:4px;border-top:2px;padding-left:1px;margin-bottom:4px;'>"
            , "    <div class='child-1-1' style='color:blue;'>"
            , "    </div>"
            , "    <div class='child-1-2' attr1='attr1'>"
            , "         Text 1"
            , "    </div>"
            , "</el1>"
            , "<el2 class='child-2' style='flex:1;'>"
            , "    <div class='child-2-1'>"
            , "        Text 2"
            , "    </div>"
            , "    <div class='child-2-2'>"
            , "    </div>"
            , "</el2>"
        ].join("\n");

        el1Child2Attr1 =
        element.children[0]
            .children[1]
            .getAttributeNode("attr1");
        el1Child2Attr1.$value = attr1 = {};
        el1Child2Attr1.value = "$value";
    });

    act(function () {
        body.appendChild(element);
        el = simpleElement(element.children[1].children[0]);

        el1class =
        el.dom.up("main")
          .get.children("el1")[0]
          .get.class();

        el.dom.up("el2")
          .dom.prev()
          .get.children([0])[0]
          .dom.next()
          .toggle.class("child-1-2")
          .update.attrib("attr2", attr1);

        el1Child2Attr =
        el.dom.up("main")
          .dom.down("el1 > *:last-child")[0]
          .get.attrib(["attr1","attr2"]);

        el.dom.up("main")
          .dom.down([0], true)[0]
          .dom.down([1], true)[0]
          .add.class("adtl-child-1-1")
          .add.style({"color": "green","border":"1px solid blue"});

        el1Child1Style =
        el.dom.up("el2")
          .dom.prev()
          .get.children([0])[0]
          .get.style(["color","border","width"]);

        el1Sizing =
        el.dom.up("main")
          .dom.down("el1")[0]
          .calc.sizing();

        body.removeChild(element);
    });

    assert(function (test) {
        test("el1class[0] should be")
        .value(el1class, "[0]")
        .equals("child-1");

        test("el1Child2Attr.attr1 should be")
        .value(el1Child2Attr, "attr1")
        .equals(attr1);

        test("el1Child2Attr.attr2 should be")
        .value(el1Child2Attr, "attr2")
        .equals(attr1);

        test("el1Child1Style should be")
        .value(el1Child1Style)
        .stringify()
        .equals("{\"color\":\"green\",\"border\":\"1px solid blue\",\"width\":\"\"}");

        test("el1Sizing should be")
        .value(el1Sizing)
        .stringify()
        .equals("{\"display\":\"block\",\"boxSizing\":\"border-box\",\"offset\":{\"parent\":{},\"height\":294,\"width\":202,\"top\":2,\"left\":2},\"margin\":{\"left\":2,\"right\":2,\"top\":2,\"bottom\":4},\"border\":{\"left\":1,\"right\":1,\"top\":0,\"bottom\":1},\"padding\":{\"left\":1,\"right\":4,\"top\":4,\"bottom\":4},\"scroll\":{\"barWidth\":{\"horiz\":15,\"vert\":15},\"height\":293,\"width\":200,\"left\":0,\"top\":0},\"innerWidth\":194,\"innerHeight\":285,\"width\":199,\"height\":293,\"outerWidth\":201,\"outerHeight\":294,\"totalWidth\":205,\"totalHeight\":300,\"ttlHeight\":null,\"hidden\":{\"height\":0,\"width\":1,\"top\":0,\"bottom\":0,\"left\":0,\"right\":1}}");

    });
}