/**
* This factory produces a worker function / simple method, that sets a variable
* to a literal or variable value
* @factory
*/
function _SetValue(classHelper) {

    /**
    * @worker
    */
    return function SetValue(event, root, path, value) {
        var ref = resolvePath(path, this);
        if (!isNill(ref.index)) {
            while(isPrototypeKey(ref.parent, ref.index)) {
                ref.parent = Object.getPrototypeOf(ref.parent);
            }
            ref.parent[ref.index] = value;
        }
    };
}