/**
* Parses XML markup (XHTML, HTML5, SVG, etc.), to pre-process the bind variables before the markup is added to the DOM. It returns the markup with the bind variables replaced with their current value, as well as a collection of path/expression pairs that describe where the bind variable came from and what it's expression is.
* @factory
*/
function _XMLBindVariableParser(
    expression_interface
    , is_nill
    , is_func
    , is_objectValue
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
            , "variable"
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
    function XMLBindVariableParser(xmlMarkup) {
        var tokens = tokenize(
            xmlMarkup
        )
        , bindExpressionMap = extractBindExpressions(
            tokens
        )
        , cleanMarkup = cleanXMLMarkup(
            tokens
        )
        , pathExpressionMap = combineAttributesToTag(
            bindExpressionMap
        );

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
        , inComment = false
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
                //process any text gathered to this point
                //if we have curtext this is a text token
                else if (!!curText) {
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
                }
                else {
                    curText+= curChar;
                }

                stringChar = curChar;
            }
            //if we are ending our string literal
            else if (!!stringChar && curChar === stringChar) {
                stringChar = "";
                if (openBeginTag || openEndTag) {
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
                else {
                    curText+= curChar;
                }
            }
            //if we are in a string literal
            else if (!!stringChar) {
                curText+= curChar;
            }
            //check for starting comment
            else if (!inComment && curChar === "<" && nextChar === "!" && xmlMarkup.substr(c, 4) === "<!--") {
                inComment = true;
                //add the comment start token
                tokens.push(
                    `(${line},${c})COMMENT:START`
                );
                c = c + 3;
            }
            //if we are leaving a comment
            else if (!!inComment && prevChar === curChar && curChar === "-" && nextChar === ">") {
                inComment = false;
                //remove the first dash from the text
                curText = curText.substring(0, curText.length - 1);
                //add the comment token
                tokens.push(
                    `(${line},${c - curText.length})COMMENT:${curText}`
                );
                //add the comment end token
                tokens.push(
                    `(${line},${c})COMMENT:END`
                );
                //clear the curText for the next round
                curText = "";
                //increment to skip the next char
                c++;
            }
            //if we are in a comment
            else if (!!inComment) {
                curText+= curChar;
            }
            //see if we're in a bind expression
            else if (inBindExpression) {
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
    function extractBindExpressions(tokens) {
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
                ] || 0;
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
                //if we are in an attribute
                if (inAttrib) {
                    inAttrib = false;
                    //remove the attribute name from the path
                    xpath.pop();
                }
                //since this is not a leaf, we know it could have children
                //add an entry to the map
                pathChildCountMap[
                    xpath.join(".")
                ] = 0;
            }
            //if this is leaf then update the xpath (remove last seg)
            else if (token === "STARTTAG:LEAF") {
                //if we are in an attribute
                if (inAttrib) {
                    inAttrib = false;
                    xpath.pop();
                }
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
                        `[${curChildCount}]#text`
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
                //if this is not an attribute then set the name
                if (!inAttrib) {
                    xpath.push(
                        tokenVal
                    );
                    //identify that we're inside an attribute
                    inAttrib = true;
                }
                //otherwise if this is in a string then record the value
                else if (inString) {
                    textIndex+= tokenVal.length;
                    cleanText+= tokenVal;
                }
                //otherwise the last attribute was a stand alone attribute
                else {
                    xpath.pop();
                    xpath.push(
                        tokenVal
                    );
                }
            }
            //tag bind expression
            else if (tokenType === "TAGBINDEXP") {
                //if the text index is not set this means it our first encounter with text, set it to 0
                if (textIndex === -1) {
                    textIndex = 0;
                }
                //create the tag entry if it doesn't exist
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
                ] = expression_interface(
                    tokenVal
                );
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
                        `[${curChildCount}]#text`
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
                ] = expression_interface(
                    tokenVal
                );
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
    function cleanXMLMarkup(tokens) {
        var cleanMarkup = ""
        , token, tokenType, tokenVal
        , expr
        , value
        , inTag = false
        , hasBindExpr = false
        , stringChar
        , curAttribName
        , curAttribValue = ""
        , lastNonTermToken
        ;
        //loop through the tokens, using them to re-assemble the xml
        for (let t = 0, l = tokens.length; t < l; t++) {
            //get a reference to the token
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
            //handle inTag
            if (token === "STARTTAG:OPEN" || token === "ENDTAG:OPEN") {
                inTag = true;
            }
            else if (
                token === "STARTTAG:CLOSE"
                || token === "ENDTAG:CLOSE"
                || token === "STARTTAG:LEAF"
            ) {
                inTag = false;
                if (!!curAttribName) {
                    cleanMarkup+= ` ${curAttribName}`;
                    curAttribName = null;
                }
            }
            //handle inString
            if (
                !stringChar
                && cnsts.stringTerminators.indexOf(tokenVal) !== -1
            ) {
                stringChar = tokenVal;
            }
            else if (!!stringChar && stringChar === tokenVal) {
                stringChar = null;
                //ending the string literal means ending the attribute
                //if a bind expression was not found then add the attribute and value
                if (!hasBindExpr) {
                    cleanMarkup+= ` ${curAttribName}=\"${curAttribValue}\"`;
                }
                else {
                    hasBindExpr = false;
                }
                curAttribName = null;
                curAttribValue = "";
            }

            //if a bindvar token, ignore
            if (tokenType === "BINDVAR" || tokenType === "TAGBINDVAR") {
                continue;
            }
            //if a bindexp in a text node then leave in place
            else if (tokenType === "BINDEXP") {
                cleanMarkup+= "<#text>";
                continue;
            }
            //if a tag bind expression in a tag
            else if (tokenType === "TAGBINDEXP") {
                hasBindExpr = true;
                continue;
            }
            //if this is text in a text node then add it
            else if (tokenType === "TEXT") {
                cleanMarkup+= tokenVal;
            }
            //if this is text in a tag
            else if (tokenType == "TAGTEXT") {
                //if there isn't an attribute name then this must be it
                if (!curAttribName) {
                    curAttribName = tokenVal;
                }
                //if there is an attribute name and this is part of a string
                //  literal then this is part of the attribute
                else if (!!stringChar) {
                    curAttribValue+= tokenVal;
                }
                //otherwise the previous attribute had no value and this is
                // another attribute name
                else {
                    cleanMarkup+= ` ${curAttribName}`;
                    curAttribName = tokenVal;
                    curAttribValue = "";
                }
            }
            else if (tokenType === "TERM") {
                if (!inTag) {
                    cleanMarkup+= tokenVal;
                }
            }
            else if (tokenType === "TAGNAME") {
                cleanMarkup+= tokenVal;
            }
            else if (tokenType === "ENDTAGNAME") {
                cleanMarkup+= tokenVal;
            }
            else if (tokenType === "COMMENT") {
                //skip comments
            }
            //otherwise it should be a tag token
            else {
                cleanMarkup+= cnsts.tokenCharMap[token];
            }
        }

        return cleanMarkup;
    }
    /**
    * Attributes are added as individual entries, combine and roll up those entries to the tag level
    * @function
    */
    function combineAttributesToTag(pathExpressionMap) {
        var combinedPathExprMap = {};

        Object.keys(pathExpressionMap)
        .forEach(
            function forEachPathExprMap(path) {
                var item = pathExpressionMap[path]
                , pathAr
                , attribName
                , tagPath
                ;
                //text entries can go right on the combine collection, they
                //   aren't attributes
                if (item.type === "text") {
                    combinedPathExprMap[path] = item;
                    return;
                }
                //remove the attribute name from the path and get the tag path
                pathAr = path.split(".");
                attribName = pathAr.pop();
                tagPath = pathAr.join(".");
                //see if we have a tag entry already
                if (!combinedPathExprMap.hasOwnProperty(tagPath)) {
                    //add a new entry forthis tag
                    combinedPathExprMap[tagPath] = {
                        "type": "tag"
                        , "attributes": {}
                    };
                }
                //add the attribute to the tag's collection
                combinedPathExprMap[tagPath].attributes[attribName] = item;
            }
        );

        return combinedPathExprMap;
    }
}