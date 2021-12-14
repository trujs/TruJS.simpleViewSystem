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
    , utils_reference
    , utils_copy
) {
    var TAG_PATT = /\{\:(.*?)\:\}/g
    , WSP_PATT = /^(?:[\r\n \t]*)((?:(?:.)|[\r\n \t])*?)(?:[\r\n \t]*)$/
    , LINE_PATT = /(\r?\n)/g
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
    * Compiles the simple-css, creating standard css markup (including watcher tags)
    * @function
    */
    function compileScss(template) {
        return generateCss(
            consolidateGroupRules(
                createBlocks(template)
            )
        );
    }
    /**
    * Parses the scss text into block objects
    * @function
    */
    function createBlocks(template) {
        var len = template.length, cur, next, prev, text = ""
        , blocks = [], curBlock, block
        , selectors = [], selector
        , inComment = false
        , stringChar = null;

        for(var i = 0; i < len; i++) {
            cur = template[i];
            next = template[i + 1];
            if (!stringChar && (cur === "'" || cur === '"')) {
                stringChar = cur;
                text+= cur;
            }
            else if (!!stringChar && cur === stringChar) {
                stringChar = null;
                text+= cur;
            }
            else if (!inComment && cur === "/" && next === "*") {
                inComment = true;
                text+= cur;
            }
            else if (inComment && cur === "/" && prev === "*") {
                inComment = false;
                text+= cur;
            }
            else if (cur === ";" && !stringChar && !inComment) {
                text = (text + cur).replace(WSP_PATT, "$1");
                !!text && (curBlock.body+= "\t" + text + "\n");
                text = "";
            }
            else if (cur === "{" && next !== ":" && !stringChar && !inComment) {
                selector = text.replace(WSP_PATT, "$1");
                selectors.push(selector);
                block = {
                    "selectors": utils_copy(selectors)
                    , "body": "\n"
                    , "parent": curBlock
                };
                blocks.push(block);
                curBlock = block;
                text = "";
            }
            else if (cur === "}" && prev !== ":" && !stringChar && !inComment) {
                selectors.pop();
                text = text.replace(WSP_PATT, "$1");
                !!text && (curBlock.body+= "\t" + text + "\n");
                curBlock = curBlock.parent;
                text = "";
            }
            else {
                text+= cur;
            }
            prev = cur;
        }

        return blocks;
    }
    /**
    * Puts nested conditional group at-rules back together
    * @function
    */
    function consolidateGroupRules(blocks) {
        var indent;
        blocks.reverse();
        return blocks.filter(function filterBlocks(block) {
            if (!!block.parent) {
                if (block.selectors[block.selectors.length - 2].indexOf("@") !== -1) {
                    indent = Array(block.selectors.length).join("\t");
                    block.parent.body+= indent + block.selectors[block.selectors.length - 1];
                    block.parent.body+= " {" + block.body.replace(LINE_PATT, "$1" + indent) + "}\n";
                    return false;
                }
            }
            return true;
        });
    }
    /**
    * Loops through the blocks array and generates css text for each block
    * @function
    */
    function generateCss(blocks) {
        blocks.reverse();
        return blocks.map(function mapBlocks(block) {
            return convertBlockToCss(block);
        })
        .join("\n\n");
    }
    /**
    * Collates the block selectors and creates css text
    * @function
    */
    function convertBlockToCss(block) {
        var selector;

        block.selectors.forEach(function forEachSel(sel) {
            if (!!selector) {
                selector =
                sel.split(",")
                .map(function mapParts(part) {
                    if (part.indexOf("&") === 0) {
                        return selector + part.substring(1);
                    }
                    return selector + " " + part;
                })
                .join(",");
            }
            else {
                selector = sel;
            }
        });

        return selector + " {" + block.body + "}";
    }
    /**
    * Gets an array of watchers
    * @function
    */
    function getWatchers(template, context) {
        var watchers = [];

        template.replace(TAG_PATT, function (tag, key) {
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
            var ref = utils_reference(
                key
                , context
            )
            , val = ref.value
            ;

            if (is_nill(val)) {
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
        if(is_array(template)) {
            template = template.join("\n");
        }

        //parse the simple-css
        template = compileScss(template);

        //create the style element
        var styleEl = createElement("style")
        //get the array of watchers
        , watchers = getWatchers(
            template
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
            , template
            , context
        );

        //add the watchers
        watchers.forEach(function (watcher) {
            watcher.guids =
            watcher.parent[cnsts.watch](
                watcher.key
                , function watch() {
                    updateElement(
                        styleEl
                        , template
                        , context
                    );
                }
            );
        });

        return styleEl;
    };
}