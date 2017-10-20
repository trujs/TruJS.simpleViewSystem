/**
* This factory creates a worker function that processes css text and the context
* object
* @factory
*/
function _SimpleStyle(createElement, createTextNode) {
    var TAG_PATT = /\{\:(.*?)\:\}/g
    , cnsts = {
        "destroy": "$destroy"
        , "watch": "$watch"
        , "unwatch": "$unwatch"
    }
    ;

    /**
    * Gets an array of watchers
    * @function
    */
    function getWatchers(template, context) {
        var watchers = [];

        template.replace(TAG_PATT, function (tag, key) {
            var obj = resolvePath(key, context);
            //add a watch
            if (obj.parent.hasOwnProperty(cnsts.watch)) {
                watchers.push({ "key": obj.index, "parent": obj.parent });
            }
        });

        return watchers;
    }
    /**
    * Creates the destroy closure that unwatches any watchers
    * @function
    */
    function addDestroy(style, watchers) {
        style[cnsts.destroy] = function destroy() {
            watchers.forEach(function (watcher) {
                watcher.parent[cnsts.unwatch](watcher.guids);
            });
        };
    }
    /**
    * Processes the style template and returns the css
    * @function
    */
    function processTemplate(template, context) {
        return template.replace(TAG_PATT, function (tag, key) {
            var val = resolvePath(key, context).value;

            if (isNill(val)) {
                return "";
            }

            return val;
        });
    }
    /**
    * Adds/Updates the style element cssNode
    * @function
    */
    function updateElement(style, template, context) {
        var css = processTemplate(template, context)
        , cssNode = createTextNode("\n" + css + "\n")
        ;

        //clear any existing styles
        style.innerText = "";

        //add the css node to the style
        style.appendChild(cssNode);
    }

    /**
    * @worker
    */
    return function SimpleStyle(template, context) {
        //template could be an array
        if(isArray(template)) {
            template = template.join("\n");
        }

        //create the style element
        var style = createElement("style")
        //get the array of watchers
        , watchers = getWatchers(template, context)
        ;

        //add $destroy
        addDestroy(style, watchers);

        //create the css
        updateElement(style, template, context);

        //add the watchers
        watchers.forEach(function (watcher) {
            watcher.guids =
            watcher.parent[cnsts.watch](watcher.key, function watch() {
                updateElement(style, template, context);
            });
        });

        return style;
    };
}