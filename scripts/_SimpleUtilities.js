/**
*
* @factory
*/
/**[@dependencies({
    "simpleExpression": ["TruJS.simpleViewSystem._SimpleExpression", []]
})]*/
function _SimpleUtilities(simpleExpression) {
    var TAG_PATT = /\{\:(.*?)\:\}/g
    , WSP_PATT = /^[ \t\n\r]+$/
    , TRIM_PATT = /^[\n\r\t ]*(.*?)[\n\r\t ]*$/
    , self;

    /**
    * @worker
    */
    return self = Object.create(null, {
        /**
        * Finds all {:expressions:}, evaluates them, and then replaces the
        * {:expression:} with the result.
        * @function
        */
        "processValue": {
            "enumerable": true
            , "value": function processValue(value, context) {
                var result = {
                    "keys": []
                    , "values": []
                    , "hybrid": !!value.replace(TAG_PATT, "")
                };

                result.value = value.replace(TAG_PATT, function forEachMatch(tag, expr) {
                    var expr = simpleExpression(expr, context);
                    result.keys = result.keys.concat(expr.keys);
                    result.values.push(expr.result);
                    if (isObject(expr.result) || isFunc(expr.result)) {
                        return "";
                    }
                    return expr.result;
                });

                if (!result.hybrid && result.values.length === 1) {
                    if (result.value === "null" || result.value === "undefined") {
                        result.values[0] = result.value = eval(result.value);
                    }
                    else {
                        result.value = result.values[0];
                    }
                }

                return result;
            }
        }
        /**
        * Returns a regular expression to match the {::} tag pattern
        * @property
        */
        , "tagPattern": {
            "enumerable": true
            , "get": function () { return new RegExp(TAG_PATT.source, TAG_PATT.flags); }
        }
        /**
        * Returns a regular expression to match if a value has only lf, nl, tab,
        * and/or space characters in it
        * @property
        */
        , "wspPattern": {
            "enumerable": true
            , "get": function () { return new RegExp(WSP_PATT.source, WSP_PATT.flags); }
        }
        /**
        * Returns a regular expression to match if a value has only lf, nl, tab,
        * and/or space characters in it
        * @property
        */
        , "wspTrimPattern": {
            "enumerable": true
            , "get": function () { return new RegExp(TRIM_PATT.source, TRIM_PATT.flags); }
        }
    });
}