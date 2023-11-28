/**
* This factory produces a worker function that generates the needed assets and
* calls the controller
* @factory
*/
function _SimpleView(
    promise
    , resolve$
    , simpleTemplate
    , simpleErrors
    , simpleStyle
    , document
    , is_array
    , is_object
    , is_empty
    , is_func
    , is_nill
    , is_string
    , is_upper
    , utils_func_async
    , utils_reference
    , utils_ensure
    , utils_lookup
    , utils_func_inspector
    , utils_uuid
    , utils_update
    , utils_copy
    , utils_apply
) {
    var LD_PATH = /[_]/g
    , DASH_PATT = /[-]/g
    , DOT_PATT = /[.]/g
    , TAG_PATT = /\{([^}]+)\}/g
    , ORIGINAL_CONTENT_NODE_NAME = "original-content"
    , HTML_TAG_PATT = /[<]([A-z0-9_-]+)/g
    , NS_LAST_SEGMENT = /(.*)(?<!\\)[.][^.]+$/
    , cnsts = {
        "destroy": "$destroy"
        , "watch": "$addListener"
        , "unwatch": "$removeListener"
        , "value": "$value"
        , "content": "$content"
        , "tagTemplate": "<{tagName} id=\"{id}\"{attributes}></{tagName}>"
        , "viewAttributeNames": {
            "namespace": "view-ns"
            , "controller": "view-controller"
            , "stateId": "view-state-id"
            , "name": "view-name"
            , "processed": "view-processed"
        }
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
        var nodeName = element.nodeName;
        if (is_upper(nodeName)) {
            nodeName = nodeName.toLowerCase();
        }
        return nodeName.replace(LD_PATH, ".");
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
    async function renderView(view, template, context) {
        var childViews;
        //create the state context and view template (HTML/CSS)
        await setupView(
            view
            , template
            , context
        );
        //if there are child nodes then process those and return any sub-views
        if (!is_empty(view.children)) {
            appendElements(
                view
            );
            childViews = await processChildElements(
                view.namespace
                , view.children
                , view.state
            );
            view.views = childViews;
        }
        return view;
    }
    /**
    * @function
    */
    async function setupView(view, template, context) {
        //set or reset the view
        await resetView(
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
        //if there are original contents
        if (!!view.originalContents) {
            addBackOriginalElements(
                view
            );
        }
        //remove the dialog content node regardless if we have original
        var contentNode =
            view.element.querySelector(ORIGINAL_CONTENT_NODE_NAME)
        ;
        if (!!contentNode) {
            contentNode.parentNode.removeChild(contentNode);
        }
    }
    /**
    * @function
    */
    function addBackOriginalElements(view) {
        //if there is a content node then use that as the insert before element
        var contentNode = view.element.querySelector(ORIGINAL_CONTENT_NODE_NAME)
        , originalNodes = view.originalContents
        , parentNode = view.element
        ;
        for (let i = 0, len = originalNodes.length; i < len; i++) {
            if (!!contentNode) {
                contentNode.parentNode.insertBefore(
                    originalNodes[i]
                    , contentNode
                );
            }
            else {
                parentNode.appendChild(
                    originalNodes[i]
                );
            }
        }
    }
    /**
    * Sets or resets the view context and template along with destroying any
    * child elements and child views
    * @function
    */
    async function resetView(view, template, context) {
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

        //get a list of the tag namess that point to views
        view.childViewNames = await getChildViewNames(
            view.htmlTemplate
        );
        //get the state for any child views so they can be listened to

        ///TODO: get the child view state ids, so we can pre load the child
        ///      states in case the view needs to add listeners to child state
        ///      IDs

    }
    /**
    * @function
    */
    async function getChildViewNames(template) {
        //get the tag names from the tempalte
        var matches = [
            ...template.matchAll(HTML_TAG_PATT)
        ]
        //get a distinct list of the tag names
        , distinctMatches =
            matches.filter(
                function distinct(item, index, ar) {
                    return ar.indexOf(item) === index;
                }
            )
        , childViewNames = []
        ;
        //get a list of matches that have a view entry
        for (let i = 0, len = matches.length, match, name; i < len; i++) {
            match = matches[i];
            name = match[1].replace(/-/g, ".");
            if (
                await resolve$(
                    [
                       `.views.${name}`
                       , {
                           "quiet": true
                           , "caseInsensitive": true
                       }
                    ]
                )
            ) {
                childViewNames.push(
                    name
                );
            }
        }

        return childViewNames;
    }
    /**
    * Processes the html and css templates
    * @function
    */
    function processTemplates(view) {
        view.children = [];
        //add the style element
        if (!!view.cssTemplate) {
            view.children.push(
                simpleStyle(view.cssTemplate, view.stateContext)
            );
        }

        //if we have am html template then process it
        if (!!view.htmlTemplate) {
            //process the html and get the elements
            view.children = view.children.concat(
                ...simpleTemplate(
                    view.namespace
                    , view.element
                    , view.htmlTemplate
                    , view.stateContext
                ).children
            )
        }
    }
    /**
    * @function
    */
    function processChildElements(parentNamespace, children, parentState) {
        var procs = children.map(
            processChildElement.bind(
                null
                , parentNamespace
                , parentState
            )
        );
        //wait for the children to process
        return promise.all(procs)
        //then extract the views from the results
        .then(
            function thenProcessResults(results) {
                return processChildResults(
                    results
                );
            }
        );
    }
    /**
    * @function
    */
    async function processChildElement(parentNamespace, parentState, childEl) {
        //if this is a text node, skip all of this
        if (childEl.nodeType !== 1) {
            return [];
        }
        var tagName = getElementName(childEl)
        , ctrlName = childEl.hasAttribute(cnsts.viewAttributeNames.controller)
            ? childEl.getAttribute(cnsts.viewAttributeNames.controller)
            : getElementName(childEl).replace(/-/g, ".")
        //try to find a controller
        , controller = await getController(
            ctrlName
        )
        //if there is a controller, process the child view
        , childView = is_func(controller)
            && (await processChildView(
                parentNamespace
                , tagName
                , parentState
                , childEl
                , controller
            ))
        //otherwise process any children and collect the sub views
        , childSubViews = !childView
            && childEl.childNodes.length > 0
            && (await processChildElements(
                parentNamespace
                , Array.from(childEl.childNodes)
                , parentState
            ))
        , viewName, viewNs, viewNsSelector
        ;
        //if a view was generated, return that
        if (!!childView) {
            return [childView];
        }
        //set the view-ns attribute if there is a view-name
        viewName = childEl.getAttribute(cnsts.viewAttributeNames.name);
        if (!!viewName) {
            viewNs = `${parentNamespace}.${viewName}`;
            viewNsSelector =
                `[${cnsts.viewAttributeNames.namespace}='${viewNs}']`;
            //verify the view namespace does not already exist
            if (!!document.body.querySelector(viewNsSelector)) {
                throw new Error(
                    `${simpleErrors.viewNamespaceExists} (${viewNs})`
                );
            }
            childEl.setAttribute(
                cnsts.viewAttributeNames.namespace
                , viewNs
            );
        }

        return childSubViews;
    }
    /**
    * @function
    */
    function processChildView(parentNamespace, tagName, parentState, childEl, controller) {
        try {
            var isStateless
            , stateId = childEl.hasAttribute(cnsts.viewAttributeNames.stateId)
                ? childEl.getAttribute(cnsts.viewAttributeNames.stateId)
                : childEl.id || generateId(tagName)
            , controllerName = childEl.hasAttribute(cnsts.viewAttributeNames.controller)
                ? childEl.getAttribute(cnsts.viewAttributeNames.controller)
                    .replace(DOT_PATT, "-")
                : tagName
            , proc = promise.resolve()
            , modifiedParentNamespace = childEl.namespace
                .replace(NS_LAST_SEGMENT, "$1")
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
                proc = getChildState(
                    stateId
                    , controllerName
                    , parentState
                );
            }
            //check the state and create the view
            return proc.then(
                function thenCheckState(childState) {
                    //if this is not stateless and we are missing a state, throw an error
                    if (!childState && !isStateless) {
                        return promise.reject(
                            new Error(
                                simpleErrors.missingChildState.replace("{name}", id)
                            )
                        );
                    }
                    else {
                        //replace dots with dashes
                        if (!!childEl.id) {
                            childEl.id = childEl.id.replace(/[.]/g, "-");
                        }
                        //create the view
                        return SimpleView(
                            childEl
                            , controller
                            , childState
                            , modifiedParentNamespace
                        );
                    }
                }
            );
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
        //loop through the results, each member is a result of processing an
        // element
        results.forEach(
            function forEachChildResult(childResult) {
                //if this is an object, it's a child view
                if (is_object(childResult)) {
                    views.push(childResult);
                }
                //if this is an array then its results from processing the
                // child's child elements
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
    async function getController(name) {
        //if this name is in the no controllers list, skip it
        if (noControllers.indexOf(name) !== -1) {
            return null;
        }
        //see if there is a view definition for this name
        var viewDefinition = await resolve$(
            [
               `.views.${name}`
               , {
                   "quiet": true
                   , "caseInsensitive": true
               }
            ]
        );
        if (!!viewDefinition) {
            //no controller, use the default controller
            if (!viewDefinition.controller) {
                viewDefinition.controller =
                    (
                        await resolve$(
                            [
                                ".simpleDefaultController"
                            ]
                        )
                    ) (
                        viewDefinition.template
                        , viewDefinition.style
                    )
                ;
            }
            //
            if (!!viewDefinition.controller && is_func(viewDefinition.controller)) {
                return viewDefinition.controller;
            }
        }
        //if the controller wasn't found or not a controller then we _shouldn't_ try to look it up again
        noControllers.push(
            name
        );
        return;
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
    async function getChildState(stateId, tagName, parentState) {
        try {
            //create the view path from the tag name
            var viewPath = tagName.replace(DASH_PATT, ".")
            //get the view's default state
            , defaultViewState = await resolve$(
                [
                    `.views.${viewPath}.defaultState`
                    , {"quiet": true}
                ]
            )
            //get the view's state
            , viewState = await resolve$(
                [
                    `.views.${viewPath}.state`
                    , {"quiet": true}
                ]
            )
            //get the current child's state from the parent
            , childState = utils_lookup(
                stateId
                , parentState
            )
            ;
            //build up the state
            //start by adding the default state, we'll want to update the
            //  current state if it exists so we keep the state manager
            //  reference
            if (!!defaultViewState) {
                //if there is a childState and defaultViewState then combine it with the default
                if (!!childState) {
                    utils_update(
                        childState
                        , utils_copy(
                            defaultViewState
                        )
                    );
                }
                //otherwise if the default state exists then set that as the childState
                else {
                    childState = utils_copy(
                        defaultViewState
                    );
                }
            }
            //add the view state if it exists
            if (!!viewState) {
                //we should update the current state
                if (!!childState) {
                    utils_update(
                        childState
                        , utils_copy(
                            viewState
                        )
                    );
                }
                else {
                    childState = utils_copy(
                        viewState
                    );
                }
            }
            //if there isn't a child state, just use an empty object
            if (!childState) {
                childState = {};
            }
            //add the child state to the parent
            return addStateByPath(
                parentState
                , stateId
                , childState
            );

        }
        catch(ex) {
            return promise.reject(ex);
        }
    }
    /**
    * Ensures the path exists on the state and then add the child state to that path
    * @function
    */
    function addStateByPath(parentState, stateId, childState) {
        try {
            //if there isn't a child state from the resolve then error
            if (!childState) {
                throw new Error(
                    `${simpleErrors.missingChildState} (${stateId})`
                );
            }
            //the state id could be a multi secment path,
            //  ensure the path exists
            utils_ensure(
                stateId
                , parentState
            );
            //get a reference to the parent and update
            var ref = utils_reference(
                stateId
                , parentState
            );
            //ensure we aren't re-adding the state
            if (ref.parent[ref.index] !== childState) {
                //add the child state to the path
                ref.parent[ref.index] = childState;
            }


            return promise.resolve(ref.parent[ref.index]);
        }
        catch(ex) {
            return promise.reject(ex);
        }
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
    function destroyView(view) {
        //destroy any watchers now so nothing is fired during destroying
        destroyWatchers(view);
        //remove the element from the parent now to stop any rendering
        if (!!view.element.parentNode) {
            view.element.parentNode.removeChild(
                view.element
            );
        }
        //destroy the child elements
        destroyChildren(view);
        //destroy any child views
        destroyViews(view);
        //remove the original contents
        delete view.originalContents;
        //run the context destroy method
        destroyContext(view);
        //remove the element
        view.element.$destroy();
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
                            return watcher.handler(
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
            , name = attr.name
            //convert the name
            , jsSafeName = convertAttributeName(
                name
                )
            ;
            attributes[jsSafeName] = attr[cnsts.value] || attr.value;
        }

        //if there is innerHTML then let's scrape that out and add an attrib
        if (!!element.innerHTML) {
            attributes[cnsts.content] = element.innerHTML;
        }

        return attributes;
    }
    /**
     * Converts a DOM attribute name to a JS safe name
     * @function
     */
    function convertAttributeName(name) {
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

        return name;
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
    async function addChildView(
        parentView
        , id
        , tagName
        , attributes
        , selector
        , position
        , newState
    ) {
        var parent = parentView.element
        , element
        , childState = await getChildState(
            id
            , tagName
            , parentView.state
        )
        , tagHtml = createViewHtml(
            tagName
            , id
            , attributes
        )
        //determine the view namespace
        , viewNamespace = parentView.namespace
        , childView
        ;
        //add the newState contents to the child state
        if (is_object(newState)) {
            utils_apply(
                newState
                , childState
            );
        }
        //if there is a selector use it to get the parent element
        if (is_string(selector) && !is_empty(selector)) {
            parent = parent.querySelector(selector);
            if (!parent) {
                throw new Error(simpleErrors.invalidViewContainerSelector);
            }
        }
        //run a temp element through the simple template to process the tagHTML
        element = simpleTemplate(
            viewNamespace
            , tagHtml
            , parentView.stateContext
        ).children[0];
        
        parentView.children.push(element);

        //add the element to the parent
        if (is_nill(position)) {
            parent.appendChild(element);
        }
        else {
            parent.insertBefore(
                element
                , parent.childNodes[position]
            );
        }

        //create the view the same way it would be created
        childView = (await processChildElement(
            parentView.namespace
            , parentView.state
            , element
        ))[0];

        //add the view to the list
        if (!!childView) {
            if (is_nill(position)) {
                parentView.views.push(childView);
            }
            else {
                parentView.views.splice(position, 0, childView);
            }
        }

        return childView;
    }
    /**
    * Creates an html tag with the supplied values
    * @function
    */
    function createViewHtml(tagName, id, attributes) {
        var attrStr = ""
        ;

        //add the attribute values to the context and update the attr string
        if (is_object(attributes)) {
            Object.keys(attributes)
            .forEach(function forEachAttr(attrKey) {
                var cntxtKey = attrKey.replace(/-/g, "")
                , value = attributes[attrKey];
                attrStr+= " " +
                    attrKey +
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
    * @function
    */
    function createView(parentNamespace, controller, element, state) {
        //create the view token
        var view = {
            "element": element
            , "name": getElementName(element)
            , "namespace": getViewNamespace(
                element
                , parentNamespace
            )
            , "state": state
            , "controller": controller
            , "attributes": getAttributes(element)
            , "originalContents": element.children.length > 0
                ? [...element.children]
                : null
            , "children": []
            , "views": []
            , "watchers": []
        };
        //add the view namespace attribute
        element.setAttribute(
            cnsts.viewAttributeNames.namespace
            , view.namespace
        );
        view.attributes.viewNs = view.namespace;
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
        view.processChildElement = processChildElement.bind(
            null
            , view.namespace
            , state
        );
        //create the destroy closure
        view[cnsts.destroy] = destroyView.bind(
            null
            , view
        );
        
        return view;
    }
    /**
    * @function
    */
    function getViewNamespace(element, parentNamespace) {
        var viewName = is_upper(element.nodeName)
            ? element.nodeName.toLowerCase()
            : element.nodeName
        //start with the view state id so we can build on the state path
        , stateId = element.hasAttribute(cnsts.viewAttributeNames.stateId)
            ? element.getAttribute(cnsts.viewAttributeNames.stateId)
            //for backwards compatibility, the id represents the state id
            : element.hasAttribute("id")
                ? element.getAttribute("id")
                : viewName
        ;

        return `${parentNamespace}.${stateId}`;
    }
    /**
    * @function
    */
    function finalizeView(view, watchers) {
        //create any watchers returned from the controller
        createWatchers(
            view
            , watchers
        );
        //run the $render function on the controllers context
        executeControllerRender(
            view
        );
    }
    /**
    * @function
    */
    function executeControllerRender(view) {
        try {
            //if there is a $render function on the context then fire it
            if (view.context.hasOwnProperty("$render")) {
                utils_func_async(
                    view.context["$render"]
                    , [view]
                );
            }
        }
        catch(ex) {

        }
    }

    /**
    * @worker
    */
    return SimpleView;

    async function SimpleView(element, controller, state, parentNamespace = "$") {
        var view = createView(
            parentNamespace
            , controller
            , element
            , state
        )
        , watchers
        ;
        //execute the controller
        if (controller[Symbol.toStringTag] === "AsyncFunction") {
            watchers = await controller(
                view.render
                , view.attributes
                , state
            );
        }
        else {
            watchers = controller(
                view.render
                , view.attributes
                , state
            );
        }
        //return the view
        finalizeView(
            view
            , watchers
        );

        return view;
    };
}