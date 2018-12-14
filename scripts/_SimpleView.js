/**
* This factory produces a worker function that generates the needed assets and
* calls the controller
* @factory
*/
function _SimpleView($container, simpleTemplate, simpleErrors, simpleStyle, funcAsync, newGuid, funcInspector, simpleReporter) {
    var LD_PATH = /[_]/g
    , TAG_PATT = /\{([^}]+)\}/g
    , simpleView
    , cnsts = {
        "destroy": "$destroy"
        , "watch": "$watch"
        , "unwatch": "$unwatch"
        , "value": "$value"
        , "content": "$content"
        , "tagTemplate": "<{name} id=\"{id}\"{attributes}></{name}>"
    }
    ;

    /**
    * Gets the tag name, in lower case with the underscores replaced with dots
    * @function
    */
    function getElementName(element) {
        return element.nodeName.toLowerCase().replace(LD_PATH, ".");
    }
    /**
    * Creates the state context object, starting with adding the state as the
    * context prototype, then uses the context as the prototype for the state
    * context, adding the additional state context properties
    * @function
    */
    function createStateContext(view) {
        if (!!view.state) {
            Object.setPrototypeOf(view.context, view.state);
        }
        return Object.create(view.context, {
            "$tagName": {
                "enumerable": true
                , "value": view.name
            }
            , "$tagId": {
                "enumerable": true
                , "value": !!view.element.id && view.element.id || (view.element.id = newGuid(true))
            }
            , "$tagClass": {
                "enumerable": true
                , "value": view.element.className
            }
            , "$attributes": {
                "enumerable": true
                , "value": view.attributes
            }
            , "$attrs": {
                "enumerable": true
                , "value": view.attributes
            }
        });
    }
    /**
    * Creates the render function and closure
    * @function
    */
    function createRenderClosure(view) {

        //the render function
        function render(template, context) {
            try {

                //set or reset the view
                resetView(view, template, context)

                //create the state context
                view.stateContext = createStateContext(view);

                //clear the element contents
                view.element.innerHTML = "";

                //process the html and css templates
                processTemplates(view);

                //if we have elements then process them
                if (!isEmpty(view.children)) {
                    appendElements(view);
                    view.views = processElements(
                        view.children
                        , view.state
                        , view.renderCb
                    );
                }

                //if there is a $render function on the context then fire it
                if (view.context.hasOwnProperty("$render")) {
                    funcAsync(view.context["$render"], [view]);
                }

                //if there isn't an html template then we'll need to fire the
                // the render callback
                if (!view.htmlTemplate) {
                    view.renderCb();
                }
            }
            catch(ex) {
                view.renderCb(ex);
            }
        };

        //add the view object to the render function
        render.view = view;

        return render;
    }
    /**
    * Sets or resets the view context and template along with destroying any
    * child elements and child views
    * @function
    */
    function resetView(view, template, context) {
        //destroy the old context if we have a new one
        if (!!context) {
            if (!!view.context) {
                destroyContext(view);
            }
            view.context = context;
        }
        else if (!view.context) {
            view.context = {};
        }

        //destroy the current children
        destroyChildren(view);

        //destroy the current child views
        destroyViews(view);

        //if a template was passed then use it
        if (!!template) {
            //if template is an array then it's html + css
            if (isArray(template)) {
                view.cssTemplate = template[1];
                view.htmlTemplate = template[0];
            }
            else {
                view.htmlTemplate = template;
            }
        }

        //convert the css and html template arrays
        if (isArray(view.cssTemplate)) {
            view.cssTemplate = view.cssTemplate.join("\n\n");
        }
        if (isArray(view.htmlTemplate)) {
            view.htmlTemplate = view.htmlTemplate.join("\n\n");
        }
    }
    /**
    * Processes the html and css templates
    * @function
    */
    function processTemplates(view) {
        //if we have am html template then process it
        if (!!view.htmlTemplate) {
            //process the html and get the elements
            view.children = Array.prototype.slice.apply(
                simpleTemplate(view.element, view.htmlTemplate, view.stateContext)
            );
        }

        //add the style element
        if (!!view.cssTemplate) {
            view.children.push(
                simpleStyle(view.cssTemplate, view.stateContext)
            );
        }
    }
    /**
    * Loops through the elements and processes any tags that appear in the
    * controllers collection
    * @function
    */
    function processElements(elements, state, renderedCb) {
        var error, renderCnt = elements.length, views = [];

        //loop through the elements until finished or an error occurs
        elements.every(function forEachElement(element) {
            //if this is a text node, skip all of this
            if (element.nodeType !== 1) {
                renderCb();
                return true;
            }

            //process the element
            var name = getElementName(element)
            , id = element.id || generateId(name)
            , isStateless = element.hasAttribute("stateless")
            , ctrlName = ".controllers." + name.replace(/-/g, ".")
            , controller = getController(ctrlName)
            , childState = getChildState(id, state)
            ;

            //if there is a controller then run the view
            if (!!controller) {
                //see if the controller is stateless
                if (!isStateless) {
                    isStateless = funcInspector(controller).params.length < 3;
                }
                //if this is not stateless and we are missing a state, throw an error
                if (!childState && !isStateless) {
                    renderedCb(new Error(simpleErrors.missingChildState.replace("{name}", id)));
                    return false;
                }
                //replace dots with underscores
                element.id = id = id.replace(/[.]/g, "-");
                //create the view
                views.push(
                    simpleView(element, controller, childState, renderCb)
                );
            }
            //otherwise process the children, or execute the render callback
            else {
                //if there are children then process those
                if (element.childNodes.length > 0) {
                    var children = Array.prototype.slice.apply(element.childNodes);
                    views = views.concat(
                        processElements(children, state, renderCb)
                    );
                }
                else {
                    renderCb();
                }
            }
            //continue the loop
            return true;
        });

        //render callback aggrigator
        function renderCb(err) {
            renderCnt--;
            if (!!err && !error) {
                error = err;
            }
            if (renderCnt <= 0) {
                renderedCb(error);
            }
        }

        return views;
    }
    /**
    * Converts the tag name to camal case
    * @function
    */
    function generateId(name) {
        var segs = name.split("-")
        , id = segs[0];

        for(var i = 1, l = segs.length; i < l; i++) {
            var seg = segs[i];
            id+= seg[0].toUpperCase() + seg.substring(1);
        }

        return id;
    }
    /**
    * Attempts to resolve the controller, swallowing any errors
    * @function
    */
    function getController(name) {
        var ctrl;
        if ($container.hasDependency(name.substring(1))) {
            ctrl =  $container(name);
            //make sure we didn't find an object dependency
            if (isFunc(ctrl)) {
                return ctrl;
            }
        }
        if ($container.hasDependency(name.substring(1) + ".view")) {
            ctrl =  $container(name + ".view");
            //make sure we didn't find an object dependency
            if (isFunc(ctrl)) {
                return ctrl;
            }
        }
    }
    /**
    * Appends the elements to the element parent
    * @function
    */
    function appendElements(view) {
        view.children.forEach(function forEachElement(child) {
            view.element.appendChild(child);
        });
    }
    /**
    * Gets the property from the state that matches the id
    * @function
    */
    function getChildState(id, state) {
        return resolvePath(id, state).value;
    }
    /**
    * Destroys the view's child elements
    * @function
    */
    function destroyChildren(view) {
        //loop through the children and destroy each one
        view.children.forEach(function forEachChild(child) {
            if (child.hasOwnProperty(cnsts.destroy)) {
                child[cnsts.destroy]();
            }
        });

        view.children = [];
    }
    /**
    * Destroys any child views
    * @function
    */
    function destroyViews(view) {
        //loop through the child views
        view.views.forEach(function forEachChild(child) {
            child[cnsts.destroy]();
        });

        view.views = [];
    }
    /**
    * Destroys the view's context
    * @function
    */
    function destroyContext(view) {
        if (view.context.hasOwnProperty(cnsts.destroy)) {
            view.context[cnsts.destroy]();
        }
    }
    /**
    * Destroys any watchers returned by the controller
    * @function
    */
    function destroyWatchers(view) {
        //loop through the watcher guids
        view.watchers.forEach(function forEachWatcher(guid) {
            view.state[cnsts.unwatch](guid);
        });

        view.watchers = [];
    }
    /**
    * Creates the destroy closure, that executes the $destroy method on any
    * element that has one
    * @function
    */
    function createDestroyClosure(view) {
        return function destroy() {
            //destroy the child elements
            destroyChildren(view);
            //destroy any watchers
            destroyWatchers(view);
            //destroy any child views
            destroyViews(view);
            //run the context destroy method
            destroyContext(view);
            //remove the element
            view.element.$destroy();
        };
    }
    /**
    * Creates watchers based on the return from the controller
    * @function
    */
    function createWatchers(view, watchers) {
        if (!!watchers) {
            watchers.forEach(function forEachWatcher(watcher) {
                view.watchers = view.watchers.concat(
                    view.state[cnsts.watch](watcher.path, watcher.handler)
                );
            });
        }
    }
    /**
    * Creates a key value pair for each attribute
    * @function
    */
    function getAttributes(element) {
        var attributes = {};

        for (var i = 0, l = element.attributes.length; i < l; i++) {
            var attr = element.attributes[i]
            , name = attr.name;
            //convert the name
            if (name.indexOf("-") !== -1) {
                name = name.split("-");
                name = name.map(function (val, indx) {
                    if (!!indx) {
                        val = val.substring(0,1).toUpperCase() + val.substring(1);
                    }
                    return val;
                }).join("");
            }
            attributes[name] = attr[cnsts.value] || attr.value;
        }

        //if there is innerHTML then let's scrape that out and add an attrib
        if (!!element.innerHTML) {
            attributes[cnsts.content] = element.innerHTML;
        }

        return attributes;
    }
    /**
    * Creates the addChildView closure, which when called, adds a child view to
    * the view, either at the selector or, appended to the views.element.
    * @function
    * @param {string} tag
    * @param {object} state The object that will be used as the view's state.
    * @param {string} [selector] The selector used to locate the parent element
    * that the child view's element will be added to.
    * @param {number} [position] The position in the parent element that the
    * child view's element will be inserted; if omitted it will be appended.
    */
    function createAddChildViewClosure(parentView) {
        return function addChildView(id, name, attributes, selector, position) {
            var parent = parentView.element
            , tempEl, element, view
            , childState = getChildState(id || name, parentView.state) || {}
            , context = createChildViewContext(id, name, attributes, childState)
            , tagHtml = createViewHtml(name, id, attributes, context)
            ;

            //if there is a selector use it to get the parent element
            if (!!selector) {
                parent = parent.querySelector(selector);
                if (!parent) {
                    throw new Error(simpleErrors.invalidViewContainerSelector);
                }
            }

            //run a temp element through the simple template to process the tagHTML
            tempEl = simpleTemplate("temp", tagHtml, context);
            element = tempEl[0];

            //add the element to the parent
            if (isNill(position)) {
                parent.appendChild(element);
            }
            else {
                parent.insertBefore(element, parent.childNodes[position]);
            }

            //create the view the same way it would be created
            view = processElements([element], parentView.state, parentView.renderCb)[0];

            parentView.views.push(view);
            parentView.children.push(element);
        };
    }
    /**
    * Creates an html tag with the supplied values
    * @function
    */
    function createViewHtml(name, id, attributes, context) {
        var attrStr = "";

        //add the attribute values to the context and update the attr string
        if (isObject(attributes)) {
            Object.keys(attributes)
            .forEach(function forEachAttr(attrKey) {
                var cntxtKey = attrKey.replace(/-/g, "");
                attrStr+= " " +
                    attrKey.toLowerCase() +
                    "=\"{:" + cntxtKey + ":}\""
                ;
            });
        }

        return cnsts.tagTemplate
            .replace(TAG_PATT, function updateTags(tag, name) {
                if (name === "attributes") {
                    return attrStr;
                }
                else {
                    var val = context[name];
                    if (isNill(val)) {
                        val = "";
                    }
                    return val;
                }
            })
        ;
    }
    /**
    * Creates the state-context object for the child view
    * @function
    */
    function createChildViewContext(id, name, attributes, state) {
        var context = Object.create(state);
        context.id = id;
        context.name = name;

        //add the attribute values to the context and update the attr string
        if (isObject(attributes)) {
            Object.keys(attributes)
            .forEach(function forEachAttr(attrKey) {
                var cntxtKey = attrKey.replace(/-/g, "");
                if (!context.hasOwnProperty(attrKey)) {
                    context[cntxtKey] = attributes[attrKey];
                }
            });
        }

        return context;
    }

    /**
    * @worker
    */
    return simpleView = function SimpleView(element, controller, state, renderCb) {
        try {
            //create the view token
            var view = {
                "element": element
                , "name": getElementName(element)
                , "state": state
                , "controller": controller
                , "attributes": getAttributes(element)
                , "children": []
                , "views": []
                , "watchers": []
                , "renderCb": renderCb
            }
            , watchers;

            //create the render function with the view token
            view.render = createRenderClosure(view);

            //create the add child view function
            view.addChildView = createAddChildViewClosure(view);

            //create the destroy closure
            view[cnsts.destroy] = createDestroyClosure(view);

            //execute the controller
            watchers = controller(view.render, view.attributes, state);

            //create the watchers
            createWatchers(view, watchers);

            //return the view
            return view;
        }
        catch(ex) {
            simpleReporter.error(ex);
            renderCb(ex);
        }
    };
}