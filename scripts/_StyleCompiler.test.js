/**
 * @test
 *  @title TruJS.simpleViewSystem.scripts._StyleCompiler: unit test
 */
function styleCompilerTest1(
    controller
) {
    var styleCompiler, template1, result1
    ;

    arrange(
        async function arrangeFn() {
            styleCompiler = await controller(
                [
                    ":TruJS.simpleViewSystem.scripts._StyleCompiler"
                    , []
                ]
            );

            template1 = `.ctia-toolbar {
    position: relative;
    display: inline-flex;
                
    &[aria-orientation = 'horizontal'] {
        flex-direction: row;
        align-items: center;
        min-width: fit-content;

        > .ctia-toolbar-separator {
            &[spacer=' '] {
                width: 1rem;
            }
    
            &[spacer='|'] {
                border-right: 1px groove var(--color-gray-500);
                height: var(--toolbar-spacer-height);
                margin-right: var(--toolbar-spacer-margin);
                margin-left: var(--toolbar-spacer-margin);
            }
        }

        > .ctia-toolbar-item + > .ctia-toolbar-item {
            margin-left: 10px;
        }

        &.ctia-toolbar-item ~ &.ctia-toolbar-item {
            margin-right: 10px;
        }
    }
} `;
        }
    );

    act(
        function actFn() {
            result1 = styleCompiler(
                template1
            );
        }
    );

    assert(
        function assertFn(test) {
            
        }
    );
}