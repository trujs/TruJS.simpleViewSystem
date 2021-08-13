/**
* @test
*   @title TruJS.simpleViewSystem.scripts._XMLBindVariableParser: functional test
*/
function xmlBindVariableParserTest1(
    controller
    , mock_callback
) {
    var xmlBindVariableParser, mockXml, context, pathExpressionMap, cleanMarkup;

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
    <circle xy='{:shapes[0].xy:}'/>
    Text1 {:item.title:}
    <g onclick="{:(shapes[0].xy, canvas.size.height)=>var.myFunc:}">
        Text2
        <svg>
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
            context = {
                "$tagId": "myTagId"
                , "getHeight": mock_callback(100)
                , "canvas": {
                    "size": {
                        "width": 200
                        , "height": 301
                    }
                }
                , "viewport": {
                    "position": {
                        "x": 30
                        , "y": 45
                    }
                    , "size": {
                        "width": 80
                        , "height": 80
                    }
                }
                , "shapes": [
                    {
                        "xy": "15"
                    }
                ]
                , "shapeFormat": {
                    "effects": {
                        "background-color": "#333333"
                    }
                }
                , "item": {
                    "title": "Item Title"
                    , "subtitle": "Item Sub Title"
                    , "id": "itemId"
                }
                , "var": {
                    "myFunc": mock_callback()
                }
            };
        }
    );

    act(
        function actFn() {
            //destructure the result
            (
                {pathExpressionMap, cleanMarkup} = xmlBindVariableParser(
                    mockXml
                    , context
                )
            );
        }
    );

    assert(
        function assertFn(test) {

            test("The cleanMarkup should be")
            .value(cleanMarkup)
            .equals(`<svg\n    xmlns="http://www.w3.org/2000/svg"\n    id= "myTagId-canvas-itemId"\n    class="diagram-canvas"\n    width ="200"\n    height="301"\n    viewbox = "30 45 80 80">\n    <circle xy='15'/>\n    Text1 {:item.title:}\n    <g onclick="">\n        Text2\n        <svg>\n            {:item.subtitle:} Text3\n        </svg>\n        <style repeat="effectName,index,effect in shapeFormat.effects">\n            > use {\n                {:effectName:}:{:effect:};\n            }\n        </style>\n        {:item.label:}\n    </g>\n    Text4\n</svg>`)
            ;

            test("The path expression map should be")
            .value(pathExpressionMap)
            .stringify()
            .equals(`{"$.[0]svg.id":{"type":"attribute","expressions":{"0":"$tagId","8":"item.id"},"cleanText":"-canvas-"},"$.[0]svg.width":{"type":"attribute","expressions":{"0":"canvas.size.width"},"cleanText":""},"$.[0]svg.height":{"type":"attribute","expressions":{"0":"canvas.size.height"},"cleanText":""},"$.[0]svg.viewbox":{"type":"attribute","expressions":{"0":"viewport.position.x","1":"viewport.position.y","2":"viewport.size.width","3":"viewport.size.height"},"cleanText":"   "},"$.[0]svg.[0]circle.xy":{"type":"attribute","expressions":{"0":"shapes[0].xy"},"cleanText":""},"$.[0]svg.[1]Text":{"type":"text","expressions":{"6":"item.title"},"cleanText":"Text1 "},"$.[0]svg.[2]g.onclick":{"type":"attribute","expressions":{"0":"(shapes[0].xy, canvas.size.height)=>var.myFunc"},"cleanText":""},"$.[0]svg.[2]g.[1]svg.[0]Text":{"type":"text","expressions":{"0":"item.subtitle"},"cleanText":" Text3"},"$.[0]svg.[2]g.[2]style.[0]Text":{"type":"text","expressions":{"24":"effectName","25":"effect"},"cleanText":"> use {\\n                :;\\n            }"},"$.[0]svg.[2]g.[3]Text":{"type":"text","expressions":{"0":"item.label"},"cleanText":""}}`)
            ;
        }
    );
}