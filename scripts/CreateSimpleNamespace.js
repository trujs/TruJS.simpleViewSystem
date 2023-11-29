/**
* Creates a namespace for an element in the simple view system
* Uses the parent namespace, the node tagName and id to create a local namespace representative of the node
* @function
*/
function CreateSimpleNamespace(parentNamespace, node, options = {}) {

    if (!!node.hasAttribute) {
        //if this is the view element, don't add anything
        if (node.hasAttribute("view-ns")) {
            return node.getAttribute("view-ns");
        }
        if (node.hasAttribute("view-name")) {
            return `${parentNamespace}.${node.getAttribute("view-name")}`;
        }
        //if there is a view-state-id use that
        if (node.hasAttribute("view-state-id")) {
            return `${parentNamespace}.${node.getAttribute("view-state-id")}`;
        }
    }

    var ordinal = findChildOrdinal(
        node
    )
    , nodeName = node.nodeName.toLowerCase()
    , path = ordinal !== -1
        ? `${parentNamespace}.[${ordinal}]${nodeName}`
        : `${parentNamespace}.${nodeName}`
    ;
    //add the id if there is one
    if (!!node.id && options.noid !== true) {
        path+= `#(${node.id})`;
    }

    return path;

    /**
    * Finds the index of the element within its parnet's children collection
    * @function
    */
    function findChildOrdinal(node) {
        var parentNode = node.parentNode
        , ordinal = -1
        ;

        if (!!parentNode) {
            Array.from(parentNode.children)
            .every(
                function findChild(child, index) {
                    if (child === node) {
                        ordinal = index;
                        return false;
                    }
                    return true;
                }
            );
        }

        return ordinal;
    }
}