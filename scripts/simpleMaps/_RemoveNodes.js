/**
* This factory produces a worker function that removes nodes from their
* parentNode
* @factory
*/
function _RemoveNodes() {

    /**
    * @worker
    */
    return function RemoveNodes(element, context, nodes) {
        ensureArray(nodes)
        .forEach(function forEachNode(node) {
            if (!!node.parentNode) {
                node.parentNode.removeChild(node);
            }
        });
    };
}