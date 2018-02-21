/**[@test({ "title": "TruJS.simpleViewSystem.simpleMaps._AddNodes: w/ target and context" })]*/
function testAddNodes1(arrange, act, assert, module) {
    var addNodes, sourceEl, targetEl, context, nodeMaps, nodeContext;

    arrange(function () {
        createElement = module([".createElement"]);
        addNodes = module(["TruJS.simpleViewSystem.simpleMaps._AddNodes", []]);
        targetEl = createElement('test');
        targetEl.innerHTML = [
            "<div>"
            , "<span>1</span>"
            , "<span>2</span>"
            , "</div>"
        ].join("\n")
        context = {};
        nodeContext = {};
        sourceEl = createElement('div');
        sourceEl.innerHTML = [
            "<el>Test 3</el>"
            , "Test2"
            , "<span>"
            , "Test1"
            , "</span>"
        ].join("\n");
        nodeMaps = [
            {
                "nodes": sourceEl.childNodes[0]
                , "context": nodeContext
                , "target": targetEl
                , "index": "after"
                , "process": false
            }, {
                "nodes": [sourceEl.childNodes[1],sourceEl.childNodes[2]]
                , "target": targetEl
            }
        ];
    });

    act(function () {
        addNodes(targetEl.children[0], context, nodeMaps);
    });

    assert(function (test) {
        test("targetEl.outerHTML should be")
        .value(targetEl, "outerHTML")
        .equals("<test><span>Test2</span><span>Test1</span><div>\n<span>1</span>\n<span>2</span>\n</div><el>Test 3</el></test>");
        
    });
}