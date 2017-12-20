/**
* This factory produces a worker function that generates the needed assets and
* calls the controller
* @factory
*/
function _SimpleView(controllers, simpleTemplate, simpleErrors, simpleStyle, funcAsync, newGuid) {
    var LD_PATH = /[_]/g
    , simpleView
    , cnsts = {
        "destroy": "$destroy"
        , "watch": "$watch"
        , "unwatch": "$unwatch"
        , "value": "$value"
        , "content": "$content"
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
                simpleTemplate(view.htmlTemplate, view.stateContext)
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

        function renderCb(err) {
            renderCnt--;
            if (!!err && !error) {
                error = err;
            }
            if (renderCnt <= 0) {
                renderedCb(error);
            }
        }

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
            , controller = resolvePath(name.replace(/-/g, ".") + ".view", controllers).value
            , childState = getChildState(id, state)
            ;

            //manual entries that don't have the standard view path
            if (!controller) {
                controller = resolvePath(name.replace(/-/g, "."), controllers).value;
            }

            //if there is a controller then run the view
            if (!!controller) {
                if (!childState && !isStateless) {
                    renderedCb(new Error(simpleErrors.missingChildState.replace("{name}", id)));
                    return false;
                }
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
            renderCb(ex);
        }
    };
}