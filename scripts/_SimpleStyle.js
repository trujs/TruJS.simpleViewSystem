/**
* This factory creates a worker function that processes css text and the context
* object
* @factory
*/
function _SimpleStyle(createElement, createTextNode) {
    var TAG_PATT = /\{\:(.*?)\:\}/g
    ;

    /**
    * @worker
    */
    return function SimpleStyle(template, context) {
        //template could be an array
        if(isArray(template)) {
            template = template.join("\n");
        }

        var style = createElement("style")
        , css = template.replace(TAG_PATT, function (tag, key) {
            var val = resolvePath(key, context).value;
            if (isNill(val)) {
                return "";
            }
            return val;
        })
        , cssNode = createTextNode("\n" + css + "\n")
        ;

        style.appendChild(cssNode);

        return style;
    };
}