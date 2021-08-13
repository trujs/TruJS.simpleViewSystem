/**
* @test
*   @name controller
*   @type setup
*/
async function setupCompTIAPortalGuiController(
    $entry
    , $client
    , $import
    , $global
    , $reporter
    , $mocks
) {
    try {
        $mocks.fs = {};
        $mocks.path = {};
        $mocks.process = {};
        var controller = await $import(
            "controller"
        )
        , container = await $import(
            "app"
        )
        , dtree = await $import(
            "app1"
        )
        ;

        controller
            .setup
            .setContainer(container)
            .setAbstractTree(dtree)
            .setGlobal($global)
        ;

        controller
            .dependency
            .add(
                ".reporter"
                , $reporter
            )
        ;

        return $global.Promise.resolve(controller);
    }
    catch(ex) {
        return $global.Promise.reject(ex);
    }
}