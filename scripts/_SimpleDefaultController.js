/**
* The default view controller, just render the template and style
* @factory
*/
function _Default(
    template
    , style
) {

    /**
    * @worker
    */
    return Default;
    
    async function Default(render, attributes, state) {
        await render([template, style]);
    };
}