/**
* This factory produces a worker function that processes an html template with
* an object.
* 1. converts the text to html
* 2. creates a template context, prototype chaining special template properties
*    and the data:
*   - {element}   $element          The element that that is being processed
* 3. processes the root element's children
*   - process tag
*   - process tag's attributes
*   - process tag's children
* 4. returns the root element's children
* @factory
*/
/**[@dependencies({
    "nodeProcessor": ["TruJS.simpleViewSystem._NodeProcessor", []]
})]*/
function _SimpleTemplate(createElement, nodeProcessor) {

    /**
    * Converts the html string into html elements wrapped in a span
    * @function
    */
    function convertHtml(tag, template, context) {
        //convert the tag to an element if it is not
        if (!isElement(tag)) {
            tag = createElement(tag || "div");
        }
        //add the inner html to the tag
        tag.innerHTML = template;

        return tag;
    }

    /**
    * @worker
    */
    return function SimpleTemplate(tag, template, data) {
        if (isNill(data) && isString(tag)) {
            data = template;
            template = tag;
            tag = null;
        }
        //template could be an array
        if(isArray(template)) {
            template = template.join("\n");
        }

        //convert the template to html, creating tag if a string, and
        // adding the template as inner html, the returned element is tag
        var element = convertHtml(tag, template);

        //process the element
        return nodeProcessor(element, data);
    };
}