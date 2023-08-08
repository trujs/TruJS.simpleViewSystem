/**
*
* @factory
*/
function _chooseOne() {

    /**
    * @worker
    */
    return function chooseOne(rootElement, ...rest) {
        for (let i = 0, len = rest.length; i < len; i++) {
            if (!!rest[i]) {
                return rest[i];
            }
        }
    };
}