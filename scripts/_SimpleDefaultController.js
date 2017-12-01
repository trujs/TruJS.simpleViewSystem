/**
* The default view controller, just render the template and style
* @factory
*/
function _Default(template, style) {

    /**
    * @worker
    */
    return function Default(render, attributes, state) {
        render([template, style]);
    };
}