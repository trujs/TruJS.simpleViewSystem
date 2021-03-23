/**
* This factory produces a worker function that creates a simple view port
* @factory
*/
function _SimpleViewPort(
    promise
    , views_main_controller
    , simpleView
    , simpleTemplate
    , dom_createElement
    , is_object
) {
    var curState, curView
    /**
    * @alias
    */
    , createElement = dom_createElement
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
            var template = "<main${attributes}></main>"
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

            if (!context) {
                context = {};
            }
            Object.setPrototypeOf(context, state);

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
                template
                , context
            )[0];

            return simpleView(
                element
                , views_main_controller
                , state
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