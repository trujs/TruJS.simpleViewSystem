/**
*
* @fctory
*/
function _AddNodes($container) {

    /**
    * Sets the default values to the node map
    * @function
    */
    function addDefaults(element, context, nodeMap) {
        nodeMap.context = nodeMap.context || context;
        nodeMap.target = nodeMap.target || element;
        isNill(nodeMap.process) && (nodeMap.process = true);
        isNill(nodeMap.index) && (nodeMap.index = "before");
        if (nodeMap.index === "before") {
            nodeMap.beforeEl = element;
        }
        else if (nodeMap.index === "after") {
            nodeMap.beforeEl = element.nextSibling;
        }
        else if (!isNill(nodeMap.index)) {
            nodeMap.beforeEl = nodeMap.target.childNodes[nodeMap.index];
        }
    }
    /**
    * Processes each node through the element processor if process = true
    * @function
    */
    function processNodes(nodeMap) {
        if (nodeMap.process) {
            nodeMap.nodes
            .forEach(function forEachNode(node) {
                $container(".nodeProcessor")(node, nodeMap.context);
            });
        }
    }
    /**
    * Add the nodes to the target at before el
    * @function
    */
    function insertNodes(nodeMap) {
        ensureArray(nodeMap.nodes)
        .forEach(function forEachNode(node) {
            if (!!nodeMap.beforeEl) {
                nodeMap.target.insertBefore(node, nodeMap.beforeEl);
            }
            else {
                nodeMap.target.appendChild(node);
            }
        });
    }

    /**
    * @worker
    */
    return function AddNodes(element, context, nodeMaps) {
        //process each nodeMap
        ensureArray(nodeMaps)
        .forEach(function forEachNodeMap(nodeMap) {
            addDefaults(element, context, nodeMap);
            insertNodes(nodeMap);
            processNodes(nodeMap);
        });
    };
}