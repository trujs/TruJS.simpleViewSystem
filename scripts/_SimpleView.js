/**
* This factory produces a worker function that generates the needed assets and
* calls the controller
* @factory
*/
function _SimpleView(controllers, simpleTemplate, simpleErrors, simpleStyle) {
    var LD_PATH = /[_]/g
    , simpleView
    ;

    /**
    * Gets the tag name, in lower case with the underscores replaced with dots
    * @function
    */
    function getElementName(element) {
        return element.nodeName.toLowerCase().replace(LD_PATH, ".");
    }
    /**
    * Creates the render function and closure
    * @function
    */
    function createRenderClosure(element, state, renderCb) {
        var stateContext, htmlTemplate, cssTemplate;

        return function render(template, context) {
            var elements;
            try {
                //if a template was passed then use it
                if (!!template) {
                    //if template is an array then it's html + css
                    if (isArray(template)) {
                        cssTemplate = template[1];
                        htmlTemplate = template[0];
                    }
                    else {
                        htmlTemplate = template;
                    }
                }

                //we might not have a template at this time
                if (!!htmlTemplate) {
                    //if there is a context then get the property descriptors
                    if (!!context) {
                        context = Object.getOwnPropertyDescriptors(context);
                    }
                    //first pass without a context, create a blank context
                    else if (!stateContext){
                        context = {};
                    }

                    if(!!context) {
                        //add the $tagName property to the descriptors
                        context["$tagName"] = {
                            "enumerable": true
                            , "value": element.tagName.toLowerCase()
                        };
                        //create the stateContext which is the state as a prototype
                        //and the context property descriptors
                        stateContext = Object.create(state, context);
                    }

                    //process the html and get the elements
                    elements = simpleTemplate(htmlTemplate, stateContext);

                    elements = Array.prototype.slice.apply(elements);

                    if (!!cssTemplate) {
                        elements.push(simpleStyle(cssTemplate, stateContext));
                    }

                    element.innerHTML = "";

                    appendElements(element, elements);

                    processElements(elements, stateContext, renderCb);
                }
                else {
                    renderCb();
                }
            }
            catch(ex) {
                renderCb(ex);
            }
        };
    }
    /**
    * Loops through the elements and processes any tags that appear in the
    * controllers collection
    * @function
    */
    function processElements(elements, context, renderedCb) {
        var error, renderCnt = elements.length;

        function renderCb(err) {
            renderCnt--;
            if (!!err && !error) {
                error = err;
            }
            if (renderCnt <= 0) {
                renderedCb(error);
            }
        }

        elements.every(function forEachElement(element) {
            var name = getElementName(element)
            , id = element.id || name
            , controller = resolvePath(name, controllers).value
            , childContext = getContext(id, context)
            ;

            if (!!controller) {
                if (!childContext) {
                    renderedCb(new Error(simpleErrors.missingChildState.replace("{name}", id)));
                    return false;
                }
                simpleView(element, controller, childContext, renderCb);
            }
            else {
                //if there are children then process those
                if (element.childNodes.length > 0) {
                    var children = Array.prototype.slice.apply(element.childNodes);
                    processElements(children, context, renderCb);
                }
                else {
                    renderCb();
                }
            }

            return true;
        });
    }
    /**
    * Appends the elements to the element parent
    * @function
    */
    function appendElements(parent, elements) {
        elements.forEach(function forEachElement(element) {
            parent.appendChild(element);
        });
    }
    /**
    * Gets the property from the context that matches the id
    * @function
    */
    function getContext(id, context) {
        return resolvePath(id, context).value;
    }

    /**
    * @worker
    */
    return simpleView = function SimpleView(element, controller, context, renderCb) {
        var name, attributes, controller, render;
        try {
            name = getElementName(element);

            attributes = Array.prototype.slice.apply(element.attributes);

            render = createRenderClosure(element, context, renderCb);

            controller(render, attributes, context);
        }
        catch(ex) {
            renderCb(ex);
        }
    };
}