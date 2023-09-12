/**
* The style compiler transpiles scss into css
* @factory
*/
function _StyleCompiler(
    is_array
    , utils_copy
) {
    var WSP_PATT = /^(?:[\r\n \t]*)((?:(?:.)|[\r\n \t])*?)(?:[\r\n \t]*)$/
    , LINE_PATT = /(\r?\n)/g
    , MEDIA_SELECTOR_PATT = /[ ]?@[A-z]+[ ][(]([^)]+)[)]/g
    , MULTI_SPACE_PATT = /[ ]{2,}/g
    , COMBINATOR_PATT = /[+~,]/
    ;

    return StyleCompiler;

    /**
    * @worker
    */
    function StyleCompiler(template) {
        //template could be an array
        if (is_array(template)) {
            template = template.join("\n");
        }
        //compile the template
        return compileScss(
            template
        );
    }
    /**
    * Compiles the simple-css, creating standard css markup (including watcher tags)
    * @function
    */
    function compileScss(template) {
        return generateCss(
            createBlocks(
                template
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
    * Loops through the blocks array and generates css text for each block
    * @function
    */
    function generateCss(blocks) {
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
        var selector, mediaQmatch, mediaQ;

        //if there isn't anything in the body we don't need to add it
        if (block.body === "\n") {
            return "";
        }
        //loop through the selectors and combine them into a single selector
        block.selectors.forEach(function forEachSel(sel) {
            if (!!selector) {
                var combinator = sel.match(COMBINATOR_PATT);
                combinator = !!combinator && combinator[0];
                //check for combinators
                if (!!combinator) {
                    sel = sel.split(combinator)
                    .map(function mapParts(part) {
                        if (part.indexOf("&") === 0) {
                            return selector + part.substring(1).trim();
                        }
                        return selector + " " + part.trim();
                    })
                    .join(` ${combinator} `)
                    ;
                }
                else if (sel.indexOf("&") === 0) {
                    sel = selector + sel.substring(1).trim();
                }
                else {
                    sel = selector + " " + sel.trim();
                }

                selector = sel.replace(MULTI_SPACE_PATT, " ");
            }
            else {
                selector = sel;
            }
        });

        if (selector.indexOf("@") !== -1) {
            mediaQmatch = selector.match(MEDIA_SELECTOR_PATT);
            if (!!mediaQmatch) {
                mediaQ = mediaQmatch[0].trim();
                selector = selector
                    .replace(MEDIA_SELECTOR_PATT, "")
                    .trim()
                ;

                return `${mediaQ} {\n\t${selector} \t{${block.body}\t}\n}`;
            }
        }

        return selector + " {" + block.body + "}";
    }
}