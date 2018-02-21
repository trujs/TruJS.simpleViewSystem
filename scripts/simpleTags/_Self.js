/**
*
* @factory
*/
function _Self() {

    /**
    * @worker
    */
    return function Self(name, node, context) {
        var attrs = ensureArray(node.attributes)
        , childNodes = ensureArray(node.childNodes)
        , addNodes = {
            "context": context
            , "nodes": childNodes
            , "target": node.parentNode
            , "index": "before"
        }
        , addAttributes = {
            "context": context
            , "attributes": attrs
            , "target": node.parentNode
        }
        ;

        return {
            "addNodes": addNodes
            , "addAttributes": addAttributes
            , "removeNodes": node
            , "halt": true
        };
    };
}