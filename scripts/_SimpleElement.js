/**
*
* The SimpleElement is a "wrapper" for a node or element.

    chaining support for all methods

    dom:
        up() or down() -> to traverse the dom
        sizing() -> returns a sizing object with calculated dimensions

    style:
        update({style obj})
        remove([array of style names to remove)
        get([array of style names to get])
        calc(["array of style names wanted"])

    attribute:
        update({attribute obj})
        remove([array of attribute names])
        get([array of attribute names])

    class:
        add([array of class names])
        remove([array of class names])
        toggle([array of class names])
        has([array of class names])
*
* @function
*/
function _SimpleElement($container, arrayFromArguments) {
    var self;

    /**
    * Creates a properties object object with all of the methods
    * @function
    */
    function createMethodProperties(element, wrapped, methods) {
        var properties = {};

        Object.keys(methods)
        .map(function mapMethods(key) {
            properties[key] = createMethodProperty(element, wrapped, methods[key]);
        });

        return properties;
    }
    /**
    * Creates an enumerable only property for the method
    * @function
    */
    function createMethodProperty(element, wrapped, method) {
        if (isFunc(method)) {
            return {
                "enumerable": true
                , "value": function () {
                    var args = [element].concat(arrayFromArguments(arguments))
                    , result = method.apply(this, args);
                    if (result === undefined) {
                        return wrapped;
                    }
                    return result;
                }
            };
        }
        else {
            return {
                "enumerable": true
                , "value": Object.create(
                    null
                    , createMethodProperties(element, wrapped, method)
                )
            };
        }
    }

    /**
    * @worker
    */
    return self = function SimpleElement(element) {
        var wrapped = Object.create(self)
        , properties = createMethodProperties(
            element
            , wrapped
            , $container(".elementMethods")
        );
        return Object.defineProperties(wrapped, properties);
    };
}