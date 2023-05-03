/**
* This factory creates a worker function that processes css text and the context
* object
* @factory
*/
function _SimpleStyle(
    statenet_common_findStateful
    , dom_createElement
    , dom_createTextNode
    , utils_regExp
    , is_array
    , is_nill
    , is_func
    , is_objectValue
    , utils_reference
    , utils_copy
    , xmlBindVariableParser
    , styleCompiler
) {
    var EMPTY_STYLE_PATT = /(?:^|\n\r?)[ \t]*[a-zA-z0-9-_]+[:][ ]?(?:undefined|null)?;/g
    , STRING_PERC_PATT = /(?:'|")([0-9]{1,3}[%])(?:'|")/g
    , cnsts = {
        "destroy": "$destroy"
        , "watch": "$addListener"
        , "unwatch": "$removeListener"
    }
    /**
    * @alias
    */
    , createElement = dom_createElement
    /**
    * @alias
    */
    , createTextNode = dom_createTextNode
    /**
    * @alias
    */
    , regExForEachMatch = utils_regExp.forEachMatch
    /**
    * @alias
    */
    , findStateful = statenet_common_findStateful
    ;

    /**
    * Gets an array of watchers
    * @function
    */
    function getWatchers(pathExpressionMap, context) {
        var watchers = []
        , variables =
            Object.keys(pathExpressionMap)
            .map(
                function addExpressionWatcher(key) {
                    return getExpressionMapVariables(
                        pathExpressionMap[key]
                    );
                }
            )
            //flatten the array
            .flat()
            //filter out duplicates
            .filter(
                function distinct(item, index, ar) {
                    return ar.indexOf(item) === index;
                }
            )
        ;
        //loop through the variables
        variables.forEach(
            function addVariableWatcher(key) {
                var ref = utils_reference(
                    key
                    , context
                )
                , watcher = !!ref.parent
                    && findStateful(
                        ref.parent
                        , ref.index
                    )
                ;
                //add a watch
                if (!!watcher) {
                    watchers.push({ "key": ref.index, "parent": watcher });
                }
            }
        );

        return watchers;
    }
    /**
    * @function
    */
    function getExpressionMapVariables(expressionMap) {
        //extract the vairables
        return Object.keys(expressionMap.expressions)
            .map(
                function getExpressionVariables(exprKey) {
                    return expressionMap.expressions[exprKey].variables;
                }
            )
            //flatten the array
            .flat()
            //filter out duplicates
            .filter(
                function distinct(item, index, ar) {
                    return ar.indexOf(item) === index;
                }
            )
        ;
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
    function processTemplate(template, context, expressionMap) {
        var cssMarkup = !!expressionMap
            ? updateWithExpression(
                expressionMap
                , context
            )
            : template
        ;

        return cssMarkup
        //remove any styles with empty values
        .replace(
            EMPTY_STYLE_PATT
            , ""
        )
        //remove the single quotes for any string literal percent
        .replace(
            STRING_PERC_PATT
            , "$1"
        );
    }
    /**
    * Uses the expression map to update the style text
    * @function
    */
    function updateWithExpression(expressionMap, context) {
        var styleText = expressionMap.cleanText;

        Object.keys(expressionMap.expressions)
        .reverse()
        .forEach(
            function appendToText(index) {
                var expr = expressionMap.expressions[index]
                , result = expr.execute(
                    context
                    , {"quiet":true}
                );
                if (expr.type === "object") {
                    result =
                        Object.keys(result)
                        .find(
                            function chooseKey(key) {
                                return result[key];
                            }
                        )
                    ;
                }
                else if (
                    is_func(result)
                    || is_objectValue(result)
                    || is_array(result)
                ) {
                    result = cnsts.value;
                }

                styleText =
                    styleText.substring(0, index)
                    + result
                    + styleText.substring(index)
                ;
            }
        );

        return styleText;
    }
    /**
    * Adds/Updates the style element cssNode
    * @function
    */
    function updateElement(style, template, context, expressionMap) {
        var css = processTemplate(
            template
            , context
            , expressionMap
        )
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
        //create the style element
        var styleEl = createElement("style")
        //parse the scss
        , compiledTemplate = styleCompiler(
            template
        )
        , styleTag = `<style>\n${compiledTemplate}\n</style>`
        //parse the
        , {pathExpressionMap, cleanMarkup} = xmlBindVariableParser(
            styleTag
            , context
        )
        , expressionMap = pathExpressionMap["$.[0]style.[0]#text"]
        //get the array of watchers
        , watchers = getWatchers(
            pathExpressionMap
            , context
        )
        ;

        //add $destroy
        addDestroy(
            styleEl
            , watchers
        );

        //create the css
        updateElement(
            styleEl
            , compiledTemplate
            , context
            , expressionMap
        );

        //add the watchers
        watchers.forEach(function (watcher) {
            watcher.guids =
            watcher.parent[cnsts.watch](
                watcher.key
                , function watch() {
                    updateElement(
                        styleEl
                        , compiledTemplate
                        , context
                        , expressionMap
                    );
                }
            );
        });

        return styleEl;
    };
}