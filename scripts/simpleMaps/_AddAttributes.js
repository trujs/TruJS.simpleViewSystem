/**
* This factory produces a worker function that adds attributes to the target
* element for each attribute map
* @factory
*/
/**[@dependencies({
    "attributeProcessor": ["TruJS.simpleViewSystem._AttributeProcessor", []]
    , "mapProcessor": ["TruJS.simpleViewSystem._MapProcessor", []]
    , "simpleErrors": ["TruJS.simpleViewSystem.SimpleErrors", [], false]
    , "simpleDefaults": ["TruJS.simpleViewSystem.SimpleDefaults", [], false]
})]*/
function _AddAttributes(attributeProcessor, mapProcessor, simpleErrors, simpleDefaults) {

    /**
    * Set the context and target if missing, default process to true
    * @function
    */
    function setDefaults(element, context,  attributeMap) {
        attributeMap.context = attributeMap.context || context;
        attributeMap.target = attributeMap.target || element;
        isNill(attributeMap.process) && (attributeMap.process = true);
    }

    /**
    * Loops through each attribute and attempts to add it to the target,
    * processing it if process=true
    * @function
    */
    function processAttributeMap(element, context, attributeMap) {

        ensureArray(attributeMap.attributes)
        .forEach(function forEachAttrib(attribute) {
            //ensure the target isn't the attribute's current element
            if (attributeMap.target === attribute.ownerElement) {
                if (simpleDefaults.strict) {
                    throw new Error(simpleErrors.attributeSameElement);
                }
                return;
            }
            //add the attr node straight out
            if (getType(attribute) === "attr") {
                if (!!attribute.ownerElement) {
                    attribute.ownerElement.removeAttributeNode(attribute);
                }
                attributeMap.target.setAttributeNode(attribute);
            }
            //or create an attribute using a key value pair
            else {
                attributeMap.target.setAttribute(attribute.key, attribute.value);
                attribute = attributeMap.target.getAttributeNode(attribute.key);
            }

            if (attributeMap.process !== false) {
                let resultMaps = attributeProcessor(attributeMap.target, attribute, context);
                if (!!resultMaps) {
                    element = mapProcessor(element, context, resultMaps);
                }
            }
        });

        return element;
    }

    /**
    * @worker
    */
    return function AddAttributes(element, context, attributeMaps) {
        //ensure the attribute map is an array and then loop through it
        ensureArray(attributeMaps)
        .forEach(function forEachMap(attributeMap) {
            setDefaults(element, context,  attributeMap);
            processAttributeMap(element, context, attributeMap);
        });
    };
}