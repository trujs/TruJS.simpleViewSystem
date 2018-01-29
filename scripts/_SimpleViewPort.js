/**
* This factory produces a worker function that creates a simple view port
* @factory
*/
function _SimpleViewPort(controllers_view, createElement, simpleView) {
    var curState, curView;

    /**
    * @worker
    */
    return function SimpleViewPort(viewport, state, renderedCb) {
        try {
            var element = createElement("main")
            , loaded = false;

            //if there is a current view then destroy it
            if (!!curView) {
                curView.$destroy();
            }
            //if there is a current state then destroy it
            if (!!curState) {
                curState.$destroy();
            }
            //save a reference to the state so if this function is called again
            // we can destroy it
            curState = state;

            //render the main view
            curView = simpleView(element, controllers_view, state, renderCb);

            function renderCb(err) {
                if (!loaded) {
                    loaded = true;
                    viewport.innerHTML = "";
                    viewport.appendChild(element);
                    renderedCb(err);
                }
            };
        }
        catch(ex) {
            renderedCb(ex);
        }
    };
}