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
    , is_error
    , utils_func_async
    , utils_reference
    , utils_ensure
    , utils_lookup
    , utils_func_inspector
    , utils_uuid
) {
    var LD_PATH = /[_]/g
    , TAG_PATT = /\{([^}]+)\}/g
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
    * @function
    */
    function renderView(view, template, context) {
        //create the state context and view template (HTML/CSS)
        return setupView(
            view
            , template
            , context
        )
        //the process any child elements
        .then(
            function thenProcessChildElements() {
                if (!is_empty(view.children)) {
                    return processChildElements(
                        view.children
                        , view.state
                    );
                }
                return promise.resolve([]);
            }
        )
        //then append child elements and handle child views
        .then(
            function thenHandleChildren(childViews) {
                //append the child elements and add views to list
                if (!is_empty(view.children)) {
                    appendElements(
                        view
                    );
                    view.views = childViews;
                }
                //if there is a $render function on the context then fire it
                if (view.context.hasOwnProperty("$render")) {
                    utils_func_async(
                        view.context["$render"]
                        , [view]
                    );
                }

                return promise.resolve(view);
            }
        );
    }
    /**
    * @function
    */
    function setupView(view, template, context) {
        try {
            //set or reset the view
            resetView(
                view
                , template
                , context
            );
            //create the state context
            view.stateContext = createStateContext(
                view
            );
            //clear the element contents
            view.element.innerHTML = "";
            //process the html and css templates
            processTemplates(
                view
            );

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
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
    * @function
    */
    function processChildElements(children, parentState) {
        var procs = children.map(
            processChildElement.bind(
                null
                , parentState
            )
        );
        //wait for the children to process
        return promise.all(procs)
        //then extract the views from the results
        .then(
            function thenProcessResults(results) {
                return promise.resolve(
                    processChildResults(
                        results
                    )
                );
            }
        );
    }
    /**
    * @function
    */
    function processChildElement(parentState, childEl) {
        //if this is a text node, skip all of this
        if (childEl.nodeType !== 1) {
            return ;
        }
        var tagName = getElementName(childEl)
        , ctrlName = tagName.replace(/-/g, ".")
        ;
        //try to find a controller
        return getController(
            ctrlName
        )
        //then if there was a controller, process the view
        .then(
            function thenProcessView(controller) {
                if (is_func(controller)) {
                    return processChildView(
                        tagName
                        , parentState
                        , childEl
                        , controller
                    );
                }
                //if there isn't a controller then process the children
                if (childEl.childNodes.length > 0) {
                    return processChildElements(
                        Array.from(childEl.childNodes)
                        , parentState
                    );
                }
                return promise.resolve();
            }
        );
    }
    /**
    * @function
    */
    function processChildView(tagName, parentState, childEl, controller) {
        try {
            var childState, isStateless
            , id = childEl.id || generateId(tagName)
            ;
            //see if the controller is stateless
            isStateless = childEl.hasAttribute("stateless");
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
                    , parentState
                );
            }
            //if this is not stateless and we are missing a state, throw an error
            if (!childState && !isStateless) {
                return promise.reject(
                    new Error(
                        simpleErrors.missingChildState.replace("{name}", id)
                    )
                );
            }
            else {
                //replace dots with underscores
                childEl.id = id = id.replace(/[.]/g, "-");
                //create the view
                return SimpleView(
                    childEl
                    , controller
                    , childState
                );
            }

            return promise.resolve();
        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * @function
    */
    function processChildResults(results) {
        var views = [];
        //loop through the results, each member is a result of processing an element
        results.forEach(
            function forEachChildResult(childResult) {
                //if this is an object, it's a child view
                if (is_object(childResult)) {
                    views.push(childResult);
                }
                //if this is an array then it's results from processing the child's child elements
                else if (is_array(childResult)) {
                    views = views.concat(
                        processChildResults(
                            childResult
                        )
                    );
                }
            }
        );

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
        //resolve the controller for ${name}
        return $resolve(
            [
               `.views.${name}.controller`
               , {"missingAction":"none"}
            ]
        )
        .then(
            function thenFinalResolveCheck(controller) {
                if (!!controller && is_func(controller)) {
                    return promise.resolve(controller);
                }
                //if the controller wasn't found or not a controller then we _shouldn't_ try to look it up again
                noControllers.push(
                    name
                );
                return promise.resolve();
            }
        );
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
    function addChildView(
        parentView
        , id
        , tagName
        , attributes
        , selector
        , position
        , newState
    ) {
        try {
            var childPath, ref, parentState, views;
            //add the new state to the parent state
            if (is_object(newState)) {
                //get the parent state
                if (id.indexOf(".") !== -1) {
                    ref = utils_reference(
                        id
                        , parentView.state
                    );
                    if (ref.found) {
                        parentState = ref.parent
                        childPath = ref.index;
                    }
                    else {
                        ref = utils_ensure(
                            id
                            , parentView.state
                        );
                        parentState = ref.parent
                        childPath = ref.index;
                    }
                }
                else {
                    parentState = parentView.state;
                    childPath = id;
                }
                //if it's not there then move it
                if (!(childPath in parentState) || !parentState[childPath]) {
                    parentState[childPath] = newState;
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
            tempEl = simpleTemplate(
                "temp"
                , tagHtml
                , parentView.context
            );
            element = tempEl[0];
            //create the view the same way it would be created
            return processChildElement(
                parentView.state
                , element
            )
            .then(
                function thenAddChildView(childView) {
                    //add the element to the parent
                    if (is_nill(position)) {
                        parent.appendChild(element);
                        parentView.views.push(childView);
                    }
                    else {
                        parent.insertBefore(
                            element
                            , parent.childNodes[position]
                        );
                        parentView.views.splice(position, 0, childView);
                    }
                    parentView.children.push(element);
                }
            );


        }
        catch(ex) {
            return promise.reject(ex);
        }
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
    return SimpleView;

    function SimpleView(element, controller, state) {
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
            }
            , watchers;

            //create the render function with the view token
            view.render = renderView.bind(
                null
                , view
            );
            view.render.view = view;

            //create the add child view function
            view.addChildView = addChildView.bind(
                null
                , view
            );

            //create the destroy closure
            view[cnsts.destroy] = createDestroyClosure(view);

            //execute the controller
            watchers = controller(
                view.render
                , view.attributes
                , state
            );

            //create the watchers
            createWatchers(view, watchers);

            //return the view
            return promise.resolve(view);
        }
        catch(ex) {
            return promise.reject(ex);
        }
    };
}