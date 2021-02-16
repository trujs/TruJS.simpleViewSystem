/**
* This factory produces a worker function that generates the needed assets and
* calls the controller
* @factory
*/
function _SimpleView(
    promise
    , $resolve
    , simpleTemplate
    , simpleErrors
    , simpleStyle
    , reporter
    , is_array
    , is_object
    , is_empty
    , is_func
    , is_nill
    , is_string
    , utils_func_async
    , utils_reference
    , utils_lookup
    , utils_func_inspector
    , utils_uuid
) {
    var LD_PATH = /[_]/g
    , TAG_PATT = /\{([^}]+)\}/g
    , simpleView
    , cnsts = {
        "destroy": "$destroy"
        , "watch": "$addListener"
        , "unwatch": "$removeListener"
        , "value": "$value"
        , "content": "$content"
        , "tagTemplate": "<{tagName} id=\"{id}\"{attributes}></{tagName}>"
    }
    /**
    * A list of tag names that have already been checked for a controller and don't have one
    * @property
    */
    , noControllers = []
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
                , "value": !!view.element.id && view.element.id || (view.element.id = utils_uuid({"version":4,"format":"id"}))
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
                if (!is_empty(view.children)) {
                    appendElements(view);
                    view.views = processElements(
                        view.children
                        , view.state
                        , view.renderCb
                    );
                }

                //if there is a $render function on the context then fire it
                if (view.context.hasOwnProperty("$render")) {
                    utils_func_async(
                        view.context["$render"]
                        , [view]
                    );
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
            if (is_array(template)) {
                view.cssTemplate = template[1];
                view.htmlTemplate = template[0];
            }
            else {
                view.htmlTemplate = template;
            }
        }

        //convert the css and html template arrays
        if (is_array(view.cssTemplate)) {
            view.cssTemplate = view.cssTemplate.join("\n\n");
        }
        if (is_array(view.htmlTemplate)) {
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
        var error, renderCnt = elements.length, views = []
        , proc = promise.resolve()
        ;

        //loop through the elements until finished or an error occurs
        elements.forEach(
            function forEachElement(element) {
                //if this is a text node, skip all of this
                if (element.nodeType !== 1) {
                    renderCb();
                    return;
                }
                //process the element
                var name = getElementName(element)
                , ctrlName = name.replace(/-/g, ".")
                ;
                //get controller is now asyncronous
                proc = proc.then(
                    function thengetNextController() {
                        return getController(
                            ctrlName
                        );
                    }
                )
                .catch(
                    function catchGetControllerError(err) {
                        return promise.resolve();
                    }
                )
                .then(
                    function thenProcessElement(result) {
                        var controller;
                        if (!!result) {
                            controller = result.value;
                        }
                        processElement(
                            views
                            , name
                            , state
                            , element
                            , controller
                            , renderCb
                        );
                        return promise.resolve();
                    }
                );
            }
        );

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
        //if this name is in the no controllers list, skip it
        if (noControllers.indexOf(name) !== -1) {
            return promise.resolve(null);
        }
        //try without view on the end
        return $resolve(
            [
               `.controllers.${name}`
               , {"missingAction":"none"}
            ]
        )
        .then(
            function thenCheckResolved(controller) {
                if (!!controller && is_func(controller.value)) {
                    return promise.resolve(controller);
                }
                //try with view on the end
                return $resolve(
                    [
                        `.controllers.${name}.view`
                        , {"missingAction":"none"}
                    ]
                );
            }
        )
        .then(
            function thenFinalResolveCheck(controller) {
                if (!!controller && is_func(controller.value)) {
                    return promise.resolve(controller);
                }
                noControllers.push(
                    name
                );
                return promise.resolve();
            }
        );
    }
    /**
    * @function
    */
    function processElement(
        views
        , name
        , state
        , element
        , controller
        , renderCb
    ) {
        try {
            var childState, isStateless
            , id = element.id || generateId(name)
            ;
            //if there is a controller then run the view
            if (!!controller) {
                //see if the controller is stateless
                isStateless = element.hasAttribute("stateless");
                if (!isStateless) {
                    isStateless =
                        utils_func_inspector(
                            controller
                        )
                        .params
                        .length < 3
                    ;
                }
                //get the state
                if (!isStateless) {
                    childState = getChildState(
                        id
                        , state
                    );
                }
                //if this is not stateless and we are missing a state, throw an error
                if (!childState && !isStateless) {
                    renderCb(
                        new Error(
                            simpleErrors.missingChildState.replace("{name}", id)
                        )
                    );
                }
                else {
                    //replace dots with underscores
                    element.id = id = id.replace(/[.]/g, "-");
                    //create the view
                    views.push(
                        simpleView(
                            element
                            , controller
                            , childState
                            , renderCb
                        )
                    );
                }
            }
            //otherwise process the children, or execute the render callback
            else {
                //if there are children then process those
                if (element.childNodes.length > 0) {
                    var children = Array.from(element.childNodes);
                    views = views.concat(
                        processElements(
                            children
                            , state
                            , renderCb
                        )
                    );
                }
                else {
                    renderCb();
                }
            }
        }
        catch(ex) {
            renderCb(ex);
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
        var ref = utils_reference(
            id
            , state
        );

        return ref.value;
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
                    view.state[cnsts.watch](
                        watcher.path
                        , function stateNetWrap(event, key) {
                            watcher.handler(
                                key
                                , event.value
                                , event
                            );
                        }
                    )
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
        return function addChildView(
            id
            , tagName
            , attributes
            , selector
            , position
            , newState
        ) {
            var childPath, ref, parentState;
            //add the new state to the parent state
            if (is_object(newState)) {
                //get the parent state
                if (id.indexOf(".") !== -1 ) {
                    ref = utils_reference(
                        id
                        , parentView.state
                    );
                    parentState = ref.parent
                    childPath = ref.index;
                }
                else {
                    parentState = parentView.state;
                    childPath = id;
                }
                //if it's not there then move it
                if (!(childPath in parentState)) {
                    parentState[id] = newState;
                }
            }

            var parent = parentView.element
            , tempEl, element, view
            , childState = getChildState(
                id
                , parentView.state
            )
            , tagHtml = createViewHtml(
                tagName
                , id
                , attributes
            )
            ;
            //if there is a selector use it to get the parent element
            if (is_string(selector) && !is_empty(selector)) {
                parent = parent.querySelector(selector);
                if (!parent) {
                    throw new Error(simpleErrors.invalidViewContainerSelector);
                }
            }

            //run a temp element through the simple template to process the tagHTML
            tempEl = simpleTemplate("temp", tagHtml, parentView.context);
            element = tempEl[0];

            //create the view the same way it would be created
            view = processElements(
                [element]
                , parentView.state
                , parentView.renderCb
            )[0];

            //add the element to the parent
            if (is_nill(position)) {
                parent.appendChild(element);
            }
            else {
                parent.insertBefore(element, parent.childNodes[position]);
            }

            parentView.views.push(view);
            parentView.children.push(element);
        };
    }
    /**
    * Creates an html tag with the supplied values
    * @function
    */
    function createViewHtml(tagName, id, attributes) {
        var attrStr = "";

        //add the attribute values to the context and update the attr string
        if (is_object(attributes)) {
            Object.keys(attributes)
            .forEach(function forEachAttr(attrKey) {
                var cntxtKey = attrKey.replace(/-/g, "")
                , value = attributes[attrKey];
                attrStr+= " " +
                    attrKey.toLowerCase() +
                    "=\"" + value + "\""
                ;
            });
        }

        return cnsts.tagTemplate
            .replace(TAG_PATT, function updateTags(tag, name) {
                if (name === "attributes") {
                    return attrStr;
                }
                else if (name === "id") {
                    return id;
                }
                else if (name === "tagName") {
                    return tagName;
                }
            })
        ;
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
            reporter.error(ex);
            renderCb(ex);
        }
    };
}