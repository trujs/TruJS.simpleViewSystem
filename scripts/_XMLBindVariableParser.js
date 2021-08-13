/**
* Parses XML markup (XHTML, HTML5, SVG, etc.), to pre-process the bind variables before the markup is added to the DOM. It returns the markup with the bind variables replaced with their current value, as well as a collection of path/expression pairs that describe where the bind variable came from and what it's expression is.
* @factory
*/
function _XMLBindVariableParser(
    simpleExpression
    , is_nill
    , simpleErrors
) {
    /**
    * @constants
    */
    var cnsts = {
        /**
        * A map of tag tokens to their markup character
        * @constant
        */
        "tokenCharMap": {
            "STARTTAG:OPEN": "<"
            , "STARTTAG:CLOSE": ">"
            , "STARTTAG:LEAF": "/>"
            , "ENDTAG:OPEN": "</"
            , "ENDTAG:CLOSE": ">"
        }
        , "stringTerminators": [
            "'"
            , '"'
            , "`"
        ]
        , "terminators": [
            " "
            , "\t"
            , "\r"
            , "\n"
            , "="
        ]
        /**
        * A list of expression types for which we can use the results in the markup
        * @constant
        */
        , "textExprTypeList": [
            "literal"
            , "value"
            , "function"
        ]
    }
    /**
    * A regular expression pattern for removing trailing whitespace from the end of a text node
    * @property
    */
    , TEXT_TRAIL_WS_PATT = /(?:\r?\n)+[ ]+$/
    ;

    return XMLBindVariableParser;

    /**
    * @worker
    */
    function XMLBindVariableParser(xmlMarkup, context) {
        var tokens = tokenize(
            xmlMarkup
        )
        , pathExpressionMap = extractBindExpressions(
            tokens
            , context
        )
        , cleanMarkup = substituteBindVars(
            tokens
            , context
        )
        ;

        return {
            "pathExpressionMap": pathExpressionMap
            , "cleanMarkup": cleanMarkup
        };
    }

    /**
    * Breaks down the XML into logical tokens to be processed
    * @function
    */
    function tokenize(xmlMarkup) {
        var curChar, nextChar, prevChar
        , curText = ""
        , stringChar = ""
        , line = 1
        , tokens = []
        , openBeginTag
        , openEndTag
        , tagName, attributeName
        , inBindExpression
        ;
        //loop through each character and create tokens for tag delimeters
        for(let c = 0, l = xmlMarkup.length; c < l; c++) {
            curChar = xmlMarkup[c];
            //get the next character if there is one
            if (c + 1 < l) {
                nextChar = xmlMarkup[c + 1];
            }
            else {
                nextChar = "";
            }
            //get the previous char
            if (c > 0) {
                prevChar = xmlMarkup[c - 1];
            }
            //if this is a begin bind variable
            if (curChar === "{" && nextChar === ":" && prevChar !== "\\") {
                //identify we are in a bind expression
                inBindExpression = true;
                //if in a string literal
                if (!!stringChar && !!curText) {
                    //create a text token with the curText
                    //differentiate between a bind var in a tag or just in text
                    if (openBeginTag || openEndTag) {
                        tokens.push(
                            `(${line},${c - curText.length})TAGTEXT:${curText}`
                        );
                    }
                    else {
                        tokens.push(
                            `(${line},${c - curText.length})TEXT:${curText}`
                        );
                    }
                    //reset the cur text
                    curText = "";
                }
                //otherwise
                else {
                    //pocess any text gathered to this point
                    //if we have curtext this is a text token
                    if (!!curText) {
                        //differentiate between a bind var in a tag or just in text
                        if (openBeginTag || openEndTag) {
                            tokens.push(
                                `(${line},${c - curText.length})TAGTEXT:${curText}`
                            );
                        }
                        else {
                            tokens.push(
                                `(${line},${c - curText.length})TEXT:${curText}`
                            );
                        }
                        //reset curtext for the next run
                        curText = "";
                    }
                }
                //differentiate between a bind var in a tag or just in text
                if (openBeginTag || openEndTag) {
                    tokens.push(
                        `(${line},${c})TAGBINDVAR:OPEN`
                    );
                }
                else {
                    tokens.push(
                        `(${line},${c})BINDVAR:OPEN`
                    );
                }

                //skip the next char
                c++;
            }
            //if this is an end bind variable
            else if (inBindExpression && curChar === ":" && nextChar === "}" && prevChar !== "\\") {
                //identify we are not in a bind expression
                inBindExpression = false;
                //if there isn't any cur text then throw error, empty bind variable
                if (!curText) {
                    throw new Error(
                        `${simpleErrors.empty_bind_variable} `
                    );
                }
                //create a bind expression token
                //differentiate between a bind var in a tag or just in text
                if (openBeginTag || openEndTag) {
                    tokens.push(
                        `(${line},${c - curText.length})TAGBINDEXP:${curText}`
                    );
                    tokens.push(
                        `(${line},${c})TAGBINDVAR:CLOSE`
                    );
                }
                else {
                    tokens.push(
                        `(${line},${c - curText.length})BINDEXP:${curText}`
                    );
                    tokens.push(
                        `(${line},${c})BINDVAR:CLOSE`
                    );
                }

                //reset the cur text
                curText = "";
                //skip the next char
                c++;
            }
            //if we are starting a string literal
            else if (cnsts.stringTerminators.indexOf(curChar) !== -1 && !stringChar && prevChar !== "\\") {
                //if we are in a tag then identify string literals
                //otherwise this would be in textnodes and no identification needed
                if (openBeginTag || openEndTag) {
                    //pocess any text gathered to this point
                    if (!!curText) {
                        tokens.push(
                            `(${line},${c - curText.length})TAGTEXT:${curText}`
                        );
                    }
                    //add the string start token
                    tokens.push(
                        `(${line},${c})TERM:${curChar}`
                    );
                    //reset curtext for the next run
                    curText = "";
                    stringChar = curChar;
                }
            }
            //if we are ending our string literal
            else if (!!stringChar && curChar === stringChar) {
                stringChar = "";
                //add the string literal token
                tokens.push(
                    `(${line},${c - curText.length})TAGTEXT:${curText}`
                );
                //add the string end token
                tokens.push(
                    `(${line},${c})TERM:${curChar}`
                );
                //clear the curText for the next round
                curText = "";
            }
            //if we are in a string literal
            else if (!!stringChar) {
                curText+= curChar;
            }
            //check for an opening begin tag
            else if (curChar === "<" && nextChar !== "/") {
                //pocess any text gathered to this point
                //if we have curtext this is a text token
                if (!!curText) {
                    if (openBeginTag || openEndTag) {
                        tokens.push(
                            `(${line},${c - curText.length})TAGTEXT:${curText}`
                        );
                    }
                    else {
                        tokens.push(
                            `(${line},${c - curText.length})TEXT:${curText}`
                        );
                    }
                    //reset curtext for the next run
                    curText = "";
                }
                //TODO: syntax error if open begining is already true
                openBeginTag = true;
                tokens.push(
                    `(${line},${c})STARTTAG:OPEN`
                );
            }
            //check for closing a begin tag
            else if (curChar === ">" && !!openBeginTag && !openEndTag) {
                //pocess any text gathered to this point
                //if we have curtext this is a text token
                if (!!curText) {
                    //if there isn't a tag name then
                    if (openBeginTag === true) {
                        tokens.push(
                            `(${line},${c - curText.length})TAGNAME:${curText}`
                        );
                    }
                    else {
                        tokens.push(
                            `(${line},${c - curText.length})TAGTEXT:${curText}`
                        );
                    }

                    //reset curtext for the next run
                    curText = "";
                }
                openBeginTag = false;
                tokens.push(
                    `(${line},${c})STARTTAG:CLOSE`
                );
            }
            //check for leaf tags (no body or ending tag)
            else if (curChar === "/" && nextChar === ">" && !!openBeginTag) {
                //pocess any text gathered to this point
                //if we have curtext this is a text token
                if (!!curText) {
                    tokens.push(
                        `(${line},${c - curText.length})TAGTEXT:${curText}`
                    );
                    //reset curtext for the next run
                    curText = "";
                }
                //add a tag leaf rather than a tag close
                tokens.push(
                    `(${line},${c})STARTTAG:LEAF`
                );
                //skip the nextChar
                c++;

                openBeginTag = false;
            }
            //check for opening end-tag
            else if (curChar === "<" && nextChar === "/") {
                //pocess any text gathered to this point
                //if we have curtext this is a text token
                if (!!curText) {
                    tokens.push(
                        `(${line},${c - curText.length})TEXT:${curText}`
                    );
                    //reset curtext for the next run
                    curText = "";
                }
                ///TODO: syntax error if we are already in an
                openEndTag = true;
                tokens.push(
                    `(${line},${c})ENDTAG:OPEN`
                );
                //skip the nextChar
                c++;
            }
            //check for closing end-tag
            else if (curChar === ">" && !!openEndTag && !openBeginTag) {
                //pocess any text gathered to this point
                //if we have curtext this is a text token
                if (!!curText) {
                    //if there isn't a tag name yet then that's what the curText is, the tag name
                    if (openEndTag === true) {
                        tokens.push(
                            `(${line},${c - curText.length})ENDTAGNAME:${curText}`
                        );
                    }
                    //otherwise it's tag text
                    else {
                        tokens.push(
                            `(${line},${c - curText.length})TAGTEXT:${curText}`
                        );
                    }
                    //reset curtext for the next run
                    curText = "";
                }
                //identify we are no longer in a ending tag
                openEndTag = false;
                //add the end tag token
                tokens.push(
                    `(${line},${c})ENDTAG:CLOSE`
                );
            }
            //terminators
            else if (cnsts.terminators.indexOf(curChar) !== -1) {
                //if we are in a tag
                tagName = openBeginTag || openEndTag;
                if (!!tagName) {
                    //if this is the tag name
                    if (tagName === true) {
                        //add the tag name
                        tokens.push(
                            `(${line},${c - curText.length})TAGNAME:${curText}`
                        );
                        //update the tag indicator with the name for the next round
                        if (openBeginTag) {
                            openBeginTag = curText;
                        }
                        else {
                            openEndTag = curText;
                        }
                        //reset curtext for the next run
                        curText = "";
                    }
                    //otherwise it's a text token
                    else if (curChar !== prevChar && !!curText){
                        tokens.push(
                            `(${line},${c - curText.length})TAGTEXT:${curText}`
                        );
                        //reset curtext for the next run
                        curText = "";
                    }
                }
                //pocess any text gathered to this point
                //if we have curtext this is a text token
                else if (curChar !== prevChar && !!curText) {
                    tokens.push(
                        `(${line},${c - curText.length})TEXT:${curText}`
                    );
                    //reset curtext for the next run
                    curText = "";
                }
                //if the next character is the same then continue
                if (curChar === nextChar) {
                    curText+= curChar;
                }
                //otherwise record the terminator
                else {
                    //add the terminator character to the tokens
                    tokens.push(
                        `(${line},${c - (curText.length) - 1})TERM:${curText + curChar}`
                    );
                    //reset curtext for the next run
                    curText = "";
                }
            }
            //add to the collection of the current characters
            else {
                curText+= curChar;
            }
            //record the line number for debugging
            if (curChar === "\n") {
                line++;
            }
        }

        return tokens;
    }
    /**
    * Analyzes the tokens, finding bind variable text, and converts them to simple expressions, while keeping track of the xml-path to the bind variable
    * @function
    */
    function extractBindExpressions(tokens, context) {
        //holds the segments for the current tag xml path
        var xpath = [
            "$"
        ]
        , pathChildCountMap = {
            "$": 0
        }
        , pathExpressionMap = {}
        , curChildCount
        , inAttrib = false //to keep track if we are in the right side of an attribute in a tag
        , inTextNode = false //to keep track if we are in a text node
        , textIndex = -1 //to keep track of bind var positions in text
        , token, tokenType, tokenVal, nextToken
        , inString
        , cleanText = ""
        , lastNonTermToken
        ;
        //loop through the tokens
        for(let t = 0, l = tokens.length; t < l; t++) {
            //get the token without the line and char numbers
            token = tokens[t]
                .substring(
                    tokens[t].indexOf(")") + 1
                )
            ;
            tokenType = token.substring(
                0
                , token.indexOf(":")
            );
            tokenVal = token.substring(
                token.indexOf(":") + 1
            );

            //reset the text index if this is a non text related token
            if (
                textIndex !== -1
                && (
                    tokenType === "STARTTAG"
                    || tokenType === "ENDTAG"
                )
            ) {
                textIndex = -1;
            }

            //if this is a tag start get the name and update the xpath (add new seg)
            if (token === "STARTTAG:OPEN") {
                //if we were in a text node, close that out
                if (inTextNode) {
                    inTextNode = false;
                    if (!!cleanText) {
                        //add the clean text to the attribute
                        if (pathExpressionMap.hasOwnProperty(xpath.join("."))) {
                            pathExpressionMap[
                                xpath.join(".")
                            ].cleanText =
                                cleanText
                                .replace(
                                    TEXT_TRAIL_WS_PATT
                                    , ""
                                )
                            ;
                        }
                        cleanText = "";
                    }
                    //remove the text node from the path
                    xpath.pop();
                }
            }
            //if this is the tag name then add it to the xpath
            else if (tokenType === "TAGNAME") {
                curChildCount = pathChildCountMap[
                    xpath.join(".")
                ];
                //increment then child count
                pathChildCountMap[
                    xpath.join(".")
                ]++;

                xpath.push(
                    `[${curChildCount}]${tokenVal}`
                );
            }
            //if this is a start tag open then create a parent path entry
            else if (token === "STARTTAG:CLOSE") {
                //since this is not a leaf, we know it could have children
                //add an entry to the map
                pathChildCountMap[
                    xpath.join(".")
                ] = 0;
            }
            //if this is leaf then update the xpath (remove last seg)
            else if (token === "STARTTAG:LEAF") {
                //remove the tag name from the path
                xpath.pop();
            }
            //handle inTextNode switch
            else if (token === "ENDTAG:OPEN") {
                if (inTextNode) {
                    inTextNode = false;
                    if (!!cleanText) {
                        //add the clean text to the attribute
                        if (pathExpressionMap.hasOwnProperty(xpath.join("."))) {
                            pathExpressionMap[
                                xpath.join(".")
                            ].cleanText =
                                cleanText
                                .replace(
                                    TEXT_TRAIL_WS_PATT
                                    , ""
                                )
                            ;
                        }
                        cleanText = "";
                    }
                    //remove the text node from the path
                    xpath.pop();
                }
            }
            //if this is an end tag then update the xpath (remove last seg)
            else if (token === "ENDTAG:CLOSE") {
                //pop the end tag name off the xpath
                xpath.pop();
            }
            //start string literal
            else if (
                !inString
                && tokenType === "TERM"
                && cnsts.stringTerminators.indexOf(tokenVal) !== -1
            ) {
                inString = true;
                textIndex = 0;
            }
            //end string literal
            else if (
                inString
                && tokenType === "TERM"
                && cnsts.stringTerminators.indexOf(tokenVal) !== -1
            ) {
                inString = false;
                textIndex = -1;
                //add the clean text to the attribute
                if (pathExpressionMap.hasOwnProperty(xpath.join("."))) {
                    pathExpressionMap[
                        xpath.join(".")
                    ].cleanText =
                        cleanText
                        .replace(
                            TEXT_TRAIL_WS_PATT
                            , ""
                        )
                    ;
                }
                //clear the clean text
                cleanText = "";
                //pop the attribute name off since this signals the end of the attribute value
                xpath.pop();
                inAttrib = false;
            }
            //text node
            //handle inTextNode
            else if (tokenType === "TEXT") {
                if (!inTextNode) {
                    //identify we've entered a text node
                    inTextNode = true;
                    textIndex = 0;
                    //get the current path's child count
                    curChildCount = pathChildCountMap[
                        xpath.join(".")
                    ];
                    //increment then child count
                    pathChildCountMap[
                        xpath.join(".")
                    ]++;
                    //create a text node path
                    xpath.push(
                        `[${curChildCount}]Text`
                    );
                }

                textIndex+= tokenVal.length;
                cleanText+= tokenVal;
            }
            //spaces inside a text node
            else if (inTextNode && tokenType === "TERM") {
                textIndex+= tokenVal.length;
                cleanText+= tokenVal;
            }
            //if this is tag text and we're not in an attribute this is the attrib name
            //handles inAttrib
            else if (tokenType === "TAGTEXT") {
                if (!inAttrib) {
                    xpath.push(
                        tokenVal
                    );
                    //identify that we're inside an attribute
                    inAttrib = true;
                }
                else if (inString) {
                    textIndex+= tokenVal.length;
                    cleanText+= tokenVal;
                }
            }
            //tag bind expression
            else if (tokenType === "TAGBINDEXP") {
                //if the text index is not set this means it our first encounter with text, set it to 0
                if (textIndex === -1) {
                    textIndex = 0;
                }
                if (!pathExpressionMap.hasOwnProperty(xpath.join("."))) {
                    //add the attribute meta data container
                    pathExpressionMap[
                        xpath.join(".")
                    ] = {
                        "type": "attribute"
                        , "expressions": {}
                        , "cleanText": ""
                    };
                }
                //record the expression
                pathExpressionMap[
                    xpath.join(".")
                ]
                .expressions[
                    textIndex
                ] = tokenVal
                ;
            }
            //text bind variables
            else if (tokenType === "BINDEXP") {
                //if this is a bind variable by itself, not in a text node we need to add a text node to the path
                if (!inTextNode) {
                    inTextNode = true;
                    textIndex = 0;
                    //get the current path's child count
                    curChildCount = pathChildCountMap[
                        xpath.join(".")
                    ];
                    //increment then child count
                    pathChildCountMap[
                        xpath.join(".")
                    ]++;
                    //add the path to the
                    xpath.push(
                        `[${curChildCount}]Text`
                    );
                }
                //create the text node entry if one doesn't exist
                if (!pathExpressionMap.hasOwnProperty(xpath.join("."))) {
                    //add the attribute meta data container
                    pathExpressionMap[
                        xpath.join(".")
                    ] = {
                        "type": "text"
                        , "expressions": {}
                        , "cleanText": ""
                    };
                }
                //record the expression
                pathExpressionMap[
                    xpath.join(".")
                ]
                .expressions[
                    textIndex
                ] = tokenVal
                ;
            }

            //record this if it's not a terminator
            if (token.indexOf("TERM:") !== 0) {
                lastNonTermToken = token;
            }
        }

        return pathExpressionMap;
    }
    /**
    * Analyzes the tokens, finding bind variable and
    * @function
    */
    function substituteBindVars(tokens, context) {
        var cleanMarkup = ""
        , token
        , expr
        ;
        //loop through the tokens, using them to re-assemble the xml
        for(let t = 0, l = tokens.length; t < l; t++) {
            //get a reference to the token
            token = tokens[t]
                .substring(
                    tokens[t].indexOf(")") + 1
                )
            ;
            //if a bindvar token, ignore
            if (token.indexOf("BINDVAR") !== -1) {
                continue;
            }
            //if a bindexp leave in place
            else if (token.indexOf("BINDEXP:") === 0) {
                cleanMarkup+= `{:${token.substring(8)}:}`
            }
            //if a tag bind evaluate and replace
            else if (token.indexOf("TAGBINDEXP:") === 0) {
                expr = simpleExpression(
                    token.substring(11)
                    , context
                );
                if (cnsts.textExprTypeList.indexOf(expr.type) !== -1) {
                    cleanMarkup += is_nill(expr.result)
                        ? ""
                        : expr.result
                    ;
                }
            }
            //otherwise
            else {
                //if this is text then add it
                if (token.indexOf("TEXT:") === 0) {
                    cleanMarkup+= token.substring(5);
                }
                else if (token.indexOf("TAGTEXT:") === 0) {
                    cleanMarkup+= token.substring(8);
                }
                else if (token.indexOf("TERM:") === 0) {
                    cleanMarkup+= token.substring(5);
                }
                else if (token.indexOf("TAGNAME:") === 0) {
                    cleanMarkup+= token.substring(8);
                }
                else if (token.indexOf("ENDTAGNAME:") === 0) {
                    cleanMarkup+= token.substring(11);
                }
                //otherwise it should be a tag token
                else {
                    cleanMarkup+= cnsts.tokenCharMap[token];
                }
            }
        }

        return cleanMarkup;
    }
}