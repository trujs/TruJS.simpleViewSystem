/**
* @test
*   @title TruJS.simpleViewSystem.scripts._XMLBindVariableParser: functional test
*/
function xmlBindVariableParserTest1(
    controller
    , mock_callback
) {
    var xmlBindVariableParser, mockXml, pathExpressionMap, cleanMarkup;

    arrange(
        async function arrangeFn() {
            xmlBindVariableParser = await controller(
                [
                    ":TruJS.simpleViewSystem.scripts._XMLBindVariableParser"
                    , []
                ]
            );

            mockXml = `<svg
    xmlns="http://www.w3.org/2000/svg"
    id= "{:$tagId:}-canvas-{:item.id:}"
    class="diagram-canvas"
    width ="{:canvas.size.width:}"
    height="{:canvas.size.height:}"
    viewbox = "{:viewport.position.x:} {:viewport.position.y:} {:viewport.size.width:} {:viewport.size.height:}">
    <circle xy='{:shapes.0.xy:}'/>
    Text1 {:item.title:}
    <g onclick="{:(shapes.0.xy, canvas.size.height)=>var.myFunc:}">
        Text2
        <svg get-height="{:getHeight:}">
            {:item.subtitle:} Text3
        </svg>
        <style repeat="effectName,index,effect in shapeFormat.effects">
            > use {
                {:effectName:}:{:effect:};
            }
        </style>
        {:item.label:}
    </g>
    Text4
</svg>`;
        }
    );

    act(
        function actFn() {
            //destructure the result
            (
                {pathExpressionMap, cleanMarkup} = xmlBindVariableParser(
                    mockXml
                )
            );
        }
    );

    assert(
        function assertFn(test) {

            test("The cleanMarkup should be")
            .value(cleanMarkup)
            .equals(`<svg xmlns="http://www.w3.org/2000/svg" class="diagram-canvas">\n    <circle/>\n    Text1 {:item.title:}\n    <g>\n        Text2\n        <svg>\n            {:item.subtitle:} Text3\n        </svg>\n        <style repeat="effectName,index,effect in shapeFormat.effects">\n            > use {\n                {:effectName:}:{:effect:};\n            }\n        </style>\n        {:item.label:}\n    </g>\n    Text4\n</svg>`)
            ;

            test("The path expression map should be")
            .value(pathExpressionMap)
            .stringify()
            .equals(`{"$.[0]svg":{"type":"tag","attributes":{"id":{"type":"attribute","expressions":{"0":{"variables":["$tagId"],"type":"variable"},"8":{"variables":["item.id"],"type":"variable"}},"cleanText":"-canvas-"},"width":{"type":"attribute","expressions":{"0":{"variables":["canvas.size.width"],"type":"variable"}},"cleanText":""},"height":{"type":"attribute","expressions":{"0":{"variables":["canvas.size.height"],"type":"variable"}},"cleanText":""},"viewbox":{"type":"attribute","expressions":{"0":{"variables":["viewport.position.x"],"type":"variable"},"1":{"variables":["viewport.position.y"],"type":"variable"},"2":{"variables":["viewport.size.width"],"type":"variable"},"3":{"variables":["viewport.size.height"],"type":"variable"}},"cleanText":"   "}}},"$.[0]svg.[0]circle":{"type":"tag","attributes":{"xy":{"type":"attribute","expressions":{"0":{"variables":["shapes.0.xy"],"type":"variable"}},"cleanText":""}}},"$.[0]svg.[1]#text":{"type":"text","expressions":{"6":{"variables":["item.title"],"type":"variable"}},"cleanText":"Text1 "},"$.[0]svg.[2]g":{"type":"tag","attributes":{"onclick":{"type":"attribute","expressions":{"0":{"variables":["var.myFunc","shapes.0.xy","canvas.size.height"],"type":"bind"}},"cleanText":""}}},"$.[0]svg.[2]g.[1]svg":{"type":"tag","attributes":{"get-height":{"type":"attribute","expressions":{"0":{"variables":["getHeight"],"type":"variable"}},"cleanText":""}}},"$.[0]svg.[2]g.[1]svg.[0]#text":{"type":"text","expressions":{"0":{"variables":["item.subtitle"],"type":"variable"}},"cleanText":" Text3"},"$.[0]svg.[2]g.[2]style.[0]#text":{"type":"text","expressions":{"24":{"variables":["effectName"],"type":"variable"},"25":{"variables":["effect"],"type":"variable"}},"cleanText":"> use {\\n                :;\\n            }"},"$.[0]svg.[2]g.[3]#text":{"type":"text","expressions":{"0":{"variables":["item.label"],"type":"variable"}},"cleanText":""}}`)
            ;
        }
    );
}
/**
* @test
*   @title TruJS.simpleViewSystem.scripts._XMLBindVariableParser: functional test with standalone attribute name
*/
function xmlBindVariableParserTest2(
    controller
    , mock_callback
) {
    var xmlBindVariableParser, mockXml, pathExpressionMap, cleanMarkup;

    arrange(
        async function arrangeFn() {
            xmlBindVariableParser = await controller(
                [
                    ":TruJS.simpleViewSystem.scripts._XMLBindVariableParser"
                    , []
                ]
            );

            mockXml = `<form>
    <div
        class="image-comptiaLogo">
    </div>
    <h1>
        {:title:}
    </h1>
    <h3>
        {:subTitle:}
    </h3>
    <repeat expr="$k,$i,$field in fields">
        <div
            id="field{:$k:}"
            class="field-group">
            <label>{:$field.label:}</label>
            <input
                type="{:$field._type:}"
                placeholder="{:$field.placeholder:}"
                name="{:$k:}"
                oninput="{:($element, $k)=>onInput:}"
                onkeydown="{:($element)=>onKeyDown:}"
                autocomplete='{:{"null":"$k === \`password\`"}:}'
                required
                pattern="{:$field.pattern:}">
        </div>
    </repeat>
</form>`;
        }
    );

    act(
        function actFn() {
            //destructure the result
            (
                {pathExpressionMap, cleanMarkup} = xmlBindVariableParser(
                    mockXml
                )
            );
        }
    );

    assert(
        function assertFn(test) {

            test("The cleanMarkup should be")
            .value(cleanMarkup)
            .equals(`<form>\n    <div class="image-comptiaLogo">\n    </div>\n    <h1>\n        {:title:}\n    </h1>\n    <h3>\n        {:subTitle:}\n    </h3>\n    <repeat expr="$k,$i,$field in fields">\n        <div class="field-group">\n            <label>{:$field.label:}</label>\n            <input required>\n        </div>\n    </repeat>\n</form>`)
            ;

            test("The path expression map should be")
            .value(pathExpressionMap)
            .stringify()
            .equals(`{"$.[0]form.[1]h1.[0]#text":{"type":"text","expressions":{"0":{"variables":["title"],"type":"variable"}},"cleanText":""},"$.[0]form.[2]h3.[0]#text":{"type":"text","expressions":{"0":{"variables":["subTitle"],"type":"variable"}},"cleanText":""},"$.[0]form.[3]repeat.[0]div":{"type":"tag","attributes":{"id":{"type":"attribute","expressions":{"5":{"variables":["$k"],"type":"variable"}},"cleanText":"field"}}},"$.[0]form.[3]repeat.[0]div.[0]label.[0]#text":{"type":"text","expressions":{"0":{"variables":["$field.label"],"type":"variable"}},"cleanText":""},"$.[0]form.[3]repeat.[0]div.[1]input":{"type":"tag","attributes":{"type":{"type":"attribute","expressions":{"0":{"variables":["$field._type"],"type":"variable"}},"cleanText":""},"placeholder":{"type":"attribute","expressions":{"0":{"variables":["$field.placeholder"],"type":"variable"}},"cleanText":""},"name":{"type":"attribute","expressions":{"0":{"variables":["$k"],"type":"variable"}},"cleanText":""},"oninput":{"type":"attribute","expressions":{"0":{"variables":["onInput","$element","$k"],"type":"bind"}},"cleanText":""},"onkeydown":{"type":"attribute","expressions":{"0":{"variables":["onKeyDown","$element"],"type":"bind"}},"cleanText":""},"autocomplete":{"type":"attribute","expressions":{"0":{"variables":["$k"],"type":"object"}},"cleanText":""},"pattern":{"type":"attribute","expressions":{"0":{"variables":["$field.pattern"],"type":"variable"}},"cleanText":""}}}}`)
            ;
        }
    );
}
/**
* @test
*   @title TruJS.simpleViewSystem.scripts._XMLBindVariableParser: functional test with comments
*/
function xmlBindVariableParserTest3(
    controller
    , mock_callback
) {
    var xmlBindVariableParser, mockXml, pathExpressionMap, cleanMarkup;

    arrange(
        async function arrangeFn() {
            xmlBindVariableParser = await controller(
                [
                    ":TruJS.simpleViewSystem.scripts._XMLBindVariableParser"
                    , []
                ]
            );

            mockXml = `<self
    id="{:key:}"
    viewbox="0 0 {:shapeFormat.size.width:} {:shapeFormat.size.height:}"
    width="{:shapeFormat.size.width:}"
    height="{:shapeFormat.size.height:}"
    x="{:shapeFormat.position.x:}"
    y="{:shapeFormat.position.y:}"
    fill="{:shapeFormat.fill:}"
    stroke="{:shapeFormat.stroke:}"
    stroke-width="{:shapeFormat.strokeWidth:}">
    <!-- if there is an order add that as a root style -->
    <style
        if="shapeFormat.order !== -1">
        order: {:shapeFormat.order:};
    </style>
    <!-- add the shape -->
    <use
        id="{:key:}-shape"
        href="#{:shapeFormat.shapeNamespace:}"
        width="100%"
        height="100%"
        class="{:shapeFormat.cssClassNames:}">
    </use>
    <!-- add the shape effects as styles -->
    <style
        repeat="effectName,index,effect in shapeFormat.effects">
        > use {
            {:effectName:}:{:effect:};
        }
    </style>
    <!-- this is where the layout content will go -->
    <g id="{:key:}-content"></g>
</self>`;
        }
    );

    act(
        function actFn() {
            //destructure the result
            (
                {pathExpressionMap, cleanMarkup} = xmlBindVariableParser(
                    mockXml
                )
            );
        }
    );

    assert(
        function assertFn(test) {

            test("The cleanMarkup should be")
            .value(cleanMarkup)
            .equals(`<self>\n    \n    <style if="shapeFormat.order !== -1">\n        order: {:shapeFormat.order:};\n    </style>\n    \n    <use width="100%" height="100%">\n    </use>\n    \n    <style repeat="effectName,index,effect in shapeFormat.effects">\n        > use {\n            {:effectName:}:{:effect:};\n        }\n    </style>\n    \n    <g></g>\n</self>`)
            ;

            test("The path expression map should be")
            .value(pathExpressionMap)
            .stringify()
            .equals(`{"$.[0]self":{"type":"tag","attributes":{"id":{"type":"attribute","expressions":{"0":{"variables":["key"],"type":"variable"}},"cleanText":""},"viewbox":{"type":"attribute","expressions":{"4":{"variables":["shapeFormat.size.width"],"type":"variable"},"5":{"variables":["shapeFormat.size.height"],"type":"variable"}},"cleanText":"0 0  "},"width":{"type":"attribute","expressions":{"0":{"variables":["shapeFormat.size.width"],"type":"variable"}},"cleanText":""},"height":{"type":"attribute","expressions":{"0":{"variables":["shapeFormat.size.height"],"type":"variable"}},"cleanText":""},"x":{"type":"attribute","expressions":{"0":{"variables":["shapeFormat.position.x"],"type":"variable"}},"cleanText":""},"y":{"type":"attribute","expressions":{"0":{"variables":["shapeFormat.position.y"],"type":"variable"}},"cleanText":""},"fill":{"type":"attribute","expressions":{"0":{"variables":["shapeFormat.fill"],"type":"variable"}},"cleanText":""},"stroke":{"type":"attribute","expressions":{"0":{"variables":["shapeFormat.stroke"],"type":"variable"}},"cleanText":""},"stroke-width":{"type":"attribute","expressions":{"0":{"variables":["shapeFormat.strokeWidth"],"type":"variable"}},"cleanText":""}}},"$.[0]self.[0]style.[0]#text":{"type":"text","expressions":{"7":{"variables":["shapeFormat.order"],"type":"variable"}},"cleanText":"order: ;"},"$.[0]self.[1]use":{"type":"tag","attributes":{"id":{"type":"attribute","expressions":{"0":{"variables":["key"],"type":"variable"}},"cleanText":"-shape"},"href":{"type":"attribute","expressions":{"1":{"variables":["shapeFormat.shapeNamespace"],"type":"variable"}},"cleanText":"#"},"class":{"type":"attribute","expressions":{"0":{"variables":["shapeFormat.cssClassNames"],"type":"variable"}},"cleanText":""}}},"$.[0]self.[2]style.[0]#text":{"type":"text","expressions":{"20":{"variables":["effectName"],"type":"variable"},"21":{"variables":["effect"],"type":"variable"}},"cleanText":"> use {\\n            :;\\n        }"},"$.[0]self.[3]g":{"type":"tag","attributes":{"id":{"type":"attribute","expressions":{"0":{"variables":["key"],"type":"variable"}},"cleanText":"-content"}}}}`)
            ;
        }
    );
}