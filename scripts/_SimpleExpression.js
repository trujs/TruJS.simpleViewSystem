/**
* This factory produces a worker function that evaluates a text expression. An
* expression can be either a conditional statement, returning true/false, an
* interative statement, returning an iterator object, or a value exxpression
* which may be a function, including parameters
*
* Any non-literal value will be treated as a property in the data object and
* resolved before evaluating the expression or function
*
* If a variable name resolves to a function, that function will be executed and
* the result will be used as the value. If parameters are to be passed to the
* function then use the standard function call syntax.
*
* conditional:
*   x = y
*   x is [object] -> uses ofType
*   x is not [array]
* iterator:
*   x in y
*   x,z,a in y sort z
* value:
*   "value" -> string literal
*   9.0 -> number literal
*   x("param") -> function
* @factory
*/
function _SimpleExpression() {
    var COND_PATT = /^([A-Za-z0-9$.,()'\[\]_]+) (is|==|>|<|!=|>=|<=|!==|===) ([A-Za-z0-9$.,()'\[\]]+|\[[a-z]+\])$/i
    , ITER_PATT = /^([A-Za-z0-9$_]+)(?:, ?([A-Za-z0-9$_]+))?(?:, ?([A-Za-z0-9$_]+))? in ([A-Za-z0-9.()'\[\],$_]+)(?: sort ([A-Za-z0-9$.]+)(?: (desc|asc))?)?$/i
    , LITERAL_PATT = /^('[^']+'|"[^"]+"|(?:0x)?[0-9.]+)|true|false|null|undefined$/
    , FUNC_PATT = /^([A-Za-z0-9$.,()'\[\]_]+) ?\(([^)]+)?\)$/
    , ARRAY_PATT = /^\[([A-Za-z0-9$.()_'\[\],]+)\]$/
    , TYPE_PATT = /^\[([a-z]+)\]$/
    , INDX_PATT = /.*\]$/
    ;

    /**
    * Starts the expression evaluation
    * @function
    */
    function evaluate(expression, data) {
        var match;
        //see if this is an iterator
        if (!!(match = ITER_PATT.exec(expression))) {
            return evaluateIterator(match, data);
        }
        //maybe a conditional statement
        else if (!!(match = COND_PATT.exec(expression))) {
            return evaluateConditional(match, data);
        }
        //otherwise its a value expression
        else {
            return evaluateValue(expression, data);
        }
    }
    /**
    * Evaluates the iteration expression and returns an iterator
    * @function
    */
    function evaluateIterator(match, data) {
        var indxVar = match[2]
        , keyVar = match[1]
        , valVar = match[3]
        , res = evaluateValue(match[4], data)
        , coll = res.result
        , sort = match[5]
        , dir = match[6] || "asc"
        , keys = Object.keys(coll)
        , indx = 0
        , vars = {
            "indx": indxVar
            , "key": keyVar
            , "val": valVar
        }
        , expr = {
            "type": "iterator"
            , "keys": res.keys
            , "expression": match[0]
        }
        ;
        //sort if we have a sort
        if (!!sort) {
            keys.sort(function sortKeys(k1, k2) {
                var k1Val = sort === keyVar && k1
                    || resolvePath(sort, coll[k1]).value
                , k2Val = sort === keyVar && k2
                    || resolvePath(sort, coll[k2]).value
                ;
                if (k1Val < k2Val) {
                    return dir === "asc" && -1 || 1;
                }
                if (k1Val > k2Val) {
                    return dir === "asc" && 1 || -1;
                }
                return 1;
            });
        }
        //create the iterator
        expr.iterator = Object.create(null, {
            "vars": {
                "get": function () { return vars; }
            }
            , "keys": {
                "get": function () { return keys; }
            }
            , "index": {
                "get": function () { return indx; }
            }
            , "length": {
                "get" : function () { return keys.length; }
            }
            , "collection": {
                "get": function () { return coll; }
            }
            , "next": {
                "value": function next() {
                    return keys[indx++];
                }
            }
        });

        return expr;
    }
    /**
    * Evaluates the conditional statement and returns the result
    * @function
    */
    function evaluateConditional(match, data) {
        var sideA = evaluateValue(match[1], data)
        , op = match[2]
        , sideB = (sideB = TYPE_PATT.exec(match[3])) && sideB[1]
            || evaluateValue(match[3], data)
        , expr = {
            "type": "conditional"
            , "keys": []
            , "expression": match[0]
        }
        ;
        //add the side a keys
        expr.keys = expr.keys.concat(sideA.keys);
        sideA = sideA.result;
        //add the side b keys
        if (isObject(sideB)) {
            expr.keys = expr.keys.concat(sideB.keys);
            sideB = sideB.result;
        }

        //if the operator equals "is" then we'll set sideA to getType
        if (op === "is") {
            sideA = getType(sideA);
            op = "=";
        }

        //run the evaluation ... I did it this way because using eval only works with primitives
        switch(op) {
            case "==":
                expr.result = sideA == sideB;
                break;
            case "!=":
                expr.result = sideA != sideB;
                break;
            case "!==":
                expr.result =  sideA !== sideB;
                break;
            case ">":
                expr.result = sideA > sideB;
                break;
            case ">=":
                expr.result = sideA >= sideB;
                break;
            case "<":
                expr.result = sideA < sideB;
                break;
            case "<=":
                expr.result = sideA <= sideB;
                break;
            default:
                expr.result = sideA === sideB;
                break;
        }

        return expr;
    }
    /**
    * Evalates the value as a comma delimited set of values and returns the
    * resulting array with is's members evaluated as well.
    * @function
    */
    function evaluateArray(value, data) {
        var mems = value.split(",")
        , expr = {
            "type": "array"
            , "keys": []
            , "expression": value
            , "result": []
        };
        //resolve the members
        mems.forEach(function forEachMem(mem) {
            var res = evaluateValue(mem, data);
            expr.keys = expr.keys.concat(res.keys);
            expr.result.push(res.result);
        });

        return expr;
    }
    /**
    * Evaluates the function at match[1] with any parameters at match[2],
    * evaluating the parameters if any.
    * @function
    */
    function evaluatefunc(match, data) {
        var funcName = match[1]
        , params = match[2]
        , func = isFunc(funcName) && funcName
            || resolvePath(funcName, data).value
        , expr = {
            "type": "function"
            , "keys": []
            , "expression": match[0]
        }
        ;
        //resolve the params
        if (!!params) {
            params = params.split(",").map(function mapParams(param) {
                var paramExpr = evaluateValue(param, data);
                expr.keys = expr.keys.concat(paramExpr.keys);
                return paramExpr.result;
            });
        }
        //execute the function
        expr.result = func.apply(null, params);

        return expr;
    }
    /**
    * Evaluates the value expression and returns the value
    * @function
    */
    function evaluateValue(value, data) {
        var match, expr, res;

        //remove any leading or trailing whitespace
        value = value.trim();
        //see if this is a literal
        if (LITERAL_PATT.test(value)) {
            return {
                "type": "literal"
                , "keys": []
                , "expression": value
                , "result": eval(value) //eval so string delimiters are removed
            };
        }
        //not a literal, should be a data value
        else {
            //see if this is a function
            if (!!(match = FUNC_PATT.exec(value))) {
                return evaluatefunc(match, data);
            }
            else if (!!(match = ARRAY_PATT.exec(value))) {
                return evaluateArray(match[1]);
            }
            else {
                expr = value;
                res = resolvePath(value, data);
                return {
                    "type": "value"
                    , "keys": res.indexKeys.concat(res.path)
                    , "expression": expr
                    , "result": res.value
                };
            }
        }
    }

    /**
    * @worker
    */
    return function SimpleExpression(expression, data) {

        return evaluate(expression, data);

    };
}