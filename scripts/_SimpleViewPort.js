/**
* This factory produces a worker function that creates a simple view port
* @factory
*/
function _SimpleViewPort(
    promise
    , views_main_controller
    , views_main_state
    , simpleView
    , simpleTemplate
    , dom_createElement
    , view_userEventManager
    , is_object
    , utils_apply
) {
    var curState, curView
    /**
    * @alias
    */
    , createElement = dom_createElement
    /**
    * @alias
    */
    , userEventManager = view_userEventManager
    ;

    /**
    * @worker
    */
    return function SimpleViewPort(
        viewport
        , state
        , context
        , attributes
    ) {
        try {
            var template = "<main view-ns=\"$.main\"${attributes}></main>"
            , attributeStr = ""
            , loaded = false
            , element
            ;

            if (is_object(attributes)) {
                Object.keys(attributes)
                .forEach(
                    function addAttribute(attribName) {
                        var attributeValue = attributes[attribName];
                        attributeStr+= ` ${attribName}="${attributeValue}"`;
                    }
                );
            }

            //apply main's state to the application's state
            utils_apply(
                views_main_state
                , state.main
            )

            if (!context) {
                context = {};
            }
            Object.setPrototypeOf(
                context
                , state.main
            );

            template = template.replace(
                "${attributes}"
                , attributeStr
            );

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

            //create the template element
            element = simpleTemplate(
                "$"
                , template
                , context
            ).children[0];

            //initialize the user event manager
            userEventManager.initialize(
                element
                , state.main.userEventState
            );

            return simpleView(
                element
                , views_main_controller
                , curState.main
            )
            .then(
                function thenFinishRender(view) {
                    loaded = true;
                    viewport.innerHTML = "";
                    viewport.appendChild(element);
                    return promise.resolve(view);
                }
            );
        }
        catch(ex) {
            return promise.reject(ex);
        }
    };
}