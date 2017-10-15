/**
* This factory produces a worker function that creates a simple view port
* @factory
*/
function _SimpleViewPort(templates, controllers, simpleWatcher, simpleTemplate, simpleView, simpleDefaults, simpleErrors) {
    var HTML_PATT = /^<([^ ]*?)/
    /**
    * @worker
    */
    return function SimpleViewPort(viewport, mainTag, state, renderedCb) {
        var context, element, controller, renderCb, name
        , loaded = false
        ;

        try {
            mainTag = mainTag || simpleDefaults.mainTag;

            name = HTML_PATT.exec(mainTag);
            if (!!name) {
                name = name[1];
            }


            if (!state.hasOwnProperty(name || simpleDefaults.mainContext)) {
                throw new Error(simpleErrors.missingMainContext.replace("{name}", simpleDefaults.mainContext));
            }
            context = simpleWatcher(state[name || simpleDefaults.mainContext]);

            if (!controllers.hasOwnProperty(name || simpleDefaults.mainController)) {
                throw new Error(simpleErrors.missingMainController.replace("{name}", simpleDefaults.mainController));
            }
            controller = controllers[name || simpleDefaults.mainController];

            element = simpleTemplate(mainTag, context)[0];

            renderCb = function (err) {
                if (!loaded) {
                    loaded = true;
                    viewport.innerHTML = "";
                    viewport.appendChild(element);
                    renderedCb(err);
                }
            };

            simpleView(element, controller, context, renderCb);
        }
        catch(ex) {
            renderedCb(ex);
        }
    };
}