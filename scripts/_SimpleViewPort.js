/**
* This factory produces a worker function that creates a simple view port
* @factory
*/
function _SimpleViewPort(controllers_view, createElement, simpleView) {

    /**
    * @worker
    */
    return function SimpleViewPort(viewport, state, renderedCb) {
        try {
            var element = createElement("main")
            , loaded = false;

            simpleView(element, controllers_view, state, renderCb);

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