/**
* The user event manager handles DOM user input at the application level. It listens to all events on the provided root element, processes the fired events, updates the `userEventState` object, and calls any event callback functions registered with the manager.
* The initialize method is called with the root DOM element and the user event state object. The application event handlers are added to the root DOM element and the state object is updated based on the user events.
* When a DOM event is fired, the user event manager determines the namespace of the component that the event was fired on. It makes updates to the `userEventState` object, which fires any watchers on that state object. Finally it calls any registered event handlers for that namespace and event type.
* Each event handler is called syncronously in a chain, in the order they were registered. An error in a callback will stop the callback chain and no other callbacks will be called.
* The callback is provided an instance of `iUserEventCallback` for the event, which includes a read-only copy of the user event state and a property `preventDefault` for the callback to identify that the default behavior should be prevented.
*
* #### DOM Events
*   - Pointer
*       - down    (onpointerdown)   pointer device pressed (mouse button)
*       - up      (onpointerup)     pointer device released after press
*       - move    (onpointermove)   pointer device changes coordinates
*       - over    (onpointerover)   pointer device is moved into an element's hit box
*       - out     (onpointerout)    pointer device is moved out of an element's hit box
*       - click   (onclick)
*       - double  (ondblClickNs)
*       - context (oncontextMenuNs)
*   - wheel   (onwheel)             pointer device's wheel is rotated
*   - Focus
*       - *focus   (onfocus)        (don't use doesn't bubble) fires when an element has received focus
*       - *blur    (onblur)         (don't use doesn't bubble) fires when an element has lost focus
*       - focusin  (onfocusin)      fires when an element is about to receive focus
*       - focusout (onfocusout)     fires when an element is about to lose focus
*   - Form
*       - change  (onchange)        (don't use, doesn't handle all changes; input does)
*       - *reset   (onreset)        fires when a <form> is reset
*       - input   (oninput)         fires when the value of an <input>, <select>, or <textarea> element has been changed
*       - *submit  (onsubmit)       fires when a <form> is submitted
*       - *invalid (oninvalid)      fires when a submittable element has been checked for validity and doesn't satisfy its constraints.
*   - Keyboard
*       - down    (onkeydown)       fired when a key is pressed; fires for all keys, regardless if they produce characters
*       - up      (onkeyup)         fired when a key is released
*   - Drag/Drop
*       - drag    (ondrag)          fired every few hundred milliseconds as an element or text selection is being dragged
*       - start   (ondragstart)     fired when the user starts dragging an element or text selection
*       - end     (ondragend)       fired when a drag operation is being ended (by releasing a mouse button or hitting the escape key)
*       - enter   (ondragenter)     fired when a dragged element or text selection enters a valid drop target
*       - leave   (ondragleave)     fired when a dragged element or text selection leaves a valid drop target
*       - over    (ondragover)      fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds); target is the drop target and event.preventDefault() makes the target a drop target.
*       - drop    (ondrop)          fired when an element or text selection is dropped on a valid drop target
*   - Sizing
*       - **resize(onresize)        fires after the window has been resized
*   - Scrolling
*       - *scroll (onscroll)        fires when the document view or an element has been scrolled
*   - Dialog
*       - *cancel (oncancel)        fires on a <dialog> when the user instructs the browser that they wish to dismiss the current open dialog
*       - *close  (onclose)         fired on an HTMLDialogElement object when the dialog it represents has been closed
*   - Details
*       - *toggle (ontoggle)        fires when the open/closed state of a <details> element is toggled. Does not bubble.
*   - Loading
*       - *load   (onload)          fires on the window element when the window is loaded. Fires on XMLHTTPRequest load
*       - *start   (onloadstart)    fired when a request has started to load data
*       - *end     (onloadend)      fired when a request has completed, whether successfully (after load) or unsuccessfully (after abort or error)
*       - *error   (onerror)        fired on window when there is an unhancled JS exception. Fired on an XMLHTTPRequest when a load fails but does not bubble. Fires when a loadeable element fails, img or script, but does not bubble.
*       - *progress(onprogress)     fired on an XMLHTTPRequest periodically when a request receives more data
*       - *abort   (onabort)        fired when a request has been aborted, for example because the program called XMLHttpRequest.abort(). Does not bubble.
*   - Media
*       - *play    (onplaying)      fired when the paused property is changed from true to false, as a result of the play method, or the autoplay attribute. Does not bubble
*       - *playing (onplaying)      fired when playback is ready to start after having been paused or delayed due to lack of data. Does not bubble
*       - *pause   (onpause)        fired when a request to pause an activity is handled and the activity has entered its paused state. Does not bubble
*   - Document (DOM)
*       - ***fullscreenchange       fired immediately after the browser switches into or out of full-screen mode
*       - ***fullscreenerror        fired when the browser cannot switch to full-screen mode
*       - ***visibilitychange       fired at the document when the contents of its tab have become visible or have been hidden
*       - ***selectionchange        fired when the current text selection on a document is changed
*       - ***selectstart            fired when a user starts a new selection.
*   - Clipboard
*       - copy    (oncopy)          fires when the user initiates a copy action through the browser's user interface
*       - cut     (oncut)           fired when the user has initiated a "cut" action through the browser's user interface
*       - paste   (onpaste)         fired when the user has initiated a "paste" action through the browser's user interface
*
*   * does not bubble
*   ** window element only
*   *** document element only
*
* #### User Event Namespace
* The user event namespace provides an address for the element that the event was triggered on. It starts with the containing view's namespace, found in the view element's `view-ns` attribute [set by the `VIEW_NAMESPACE_ATTRIBUTE_NAME` constant] . If the event target element is not the view element itself, rather it's child, then the dom path is appended to the view namespace.
* Each segment of the DOM path is represented with it's ordinal, within the parent's collection, and either it's id or it's tag name
*   - Examples
*       - screens.[0]div#screen1
*       - app.[1]application-toolbar
*
* @factory
*   @singleton
*   @defaults
*       @property {number} coordinateCaptureMs The interval between updating the pointer coordinates; throttling
*       @property {number} scrollCaptureMs The interval between updateing the scrollNs; throttling
*
* #### User Event State API
* The user event state api is a state object that implements `iUserEventState` and is updated when user events are fired.
* @interface iUserEventState
*   @property {object} event
*   @property {object} last
*   @property {string} focus
*       @property {string} inNs
*       @property {string} outNs
*   @property {string} selectedText if the user is selecting text, this is the currently selected text
*   @property {object} window
*       @property {boolean} resized true if the window has been resized
*       @property {number} widthDelta then delta of the previous window width to the new one
*       @property {number} heightDelta then delta of the previous window height to the new one
*   @property {object} pointer
*       @property {number} xCoordinate the current pointer x coordinate; updates every `coordinateCaptureMs`
*       @property {number} yCoordinate the current pointer y coordinate; updates every `coordinateCaptureMs`
*       @property {string} rightButtonNs if the right pointer button is being pressed, this is the namespace of the component that the pointer button was pressed on
*       @property {string} centerButtonNs if the center pointer button is being pressed, this is the namespace of the component that the pointer button was pressed on
*       @property {string} leftButtonNs if the left pointer button is being pressed, this is the namespace of the component that the pointer button was pressed on
*       @property {string} dblClickNs the namespace of the double clicked component
*       @property {string} contextMenuNs the namespace of the component the mouse was over when the contextMenuNs event was fired
*       @property {string} overNs the namespace of the component the pointer is currently over
*   @property {object} wheel
*       @property {number} deltaX the X axis delta of the wheel device (mouse scroll wheel)
*       @property {number} deltaY the Y axis delta of the wheel device (mouse scroll wheel)
*       @property {number} deltaZ the Z axis delta of the wheel device (mouse scroll wheel)
*       @property {string} deltaMode the string representation of the wheel's delta mode enumeration
*   @property {object} keyboard
*       @property {boolean} leftAlt true if the left alt key is pressed
*       @property {boolean} rightAlt true if the right alt key is pressed
*       @property {boolean} leftCtrl true if the left control key is pressed
*       @property {boolean} rightCtrl true if the right control key is pressed
*       @property {boolean} leftShift true if the left shift key is pressed
*       @property {boolean} rightShift true if the right shift key is pressed
*       @property {boolean} capsLock true if caps lock is enabled
*       @property {string} character if a character key is pressed, this will be that character, otherwise it will be null
*       @property {string} special if a non-character key is pressed, this will be the special key value, e.g. Control or LeftArrow, otherwise it will be null
*       @property {number} repeatCount this is the count the pressing key has trigger the event (holding the key down)
*       @property {array} keysPressed an array of the currently pressed keys, in the order they were pressed
*   @property {object} scrolling
*       @property {string} scrollNs the namespace of the currently scrolling item; updates every `scrollCaptureMs`
*       @property {number} leftDelta the delta of the previous scroll left to the current
*       @property {number} topDelta the delta of the previous scroll top to the current
*   @property {object} dragDrop
*       @property {string} draggingNs the namespace of the item being dragged
*       @property {string} draggingOverNs the namespace of the droppable item which the dragging item is over
*       @property {string} droppedNs the namespace of the droppable item the dragging item was dropped on
*   @property {object} form
*       @property {string} inputNs the namespace of the item that had an input event
*       @property {string} changeNs the namespace of the item that had an change event
*       @property {string} invalidNs the namespace of the item that was marked invalid
*       @property {string} submitNs the namespace of the form that had a submit event fired
*       @property {string} resetNs the namespace of the form that had a reset event fired
* #### User Event Callback API
* The user event callback interface is an object created for each event fired and contains the `userEventState` and a property to mark the event to prevent default.
* @interface iUserEventCallback
*   @property {string} namespace The namespace of the item the event was fired on
*   @property {string} eventName The name of the event that fired
*   @property {number} timestamp The number of 100ns intervals since the gregorian reform (used in UUIDs)
*   @property {object} userEventState A read-only copy of the `userEventState` object at the moment the event fired (post any updates by the manager)
*   @property {object} data An optional object that stores data specific to the event; e.g. the scrollLeft property of a scroll event
*   @property {boolean} preventDefault a passthrough of the DOM event's preventDefault function
*/
function _UserEventManager(
    eventEmitter
    , dom_window
    , dom_document
    , performance
    , iUserEventState
    , utils_applyIf
    , utils_copy
    , utils_func_delay
    , defaults
    , infos
    , errors
    , reporter
) {
    var 
    /**
    * The parent element that the manager will be listening on.
    * @field
    */
    rootElement
    /**
    * The state object which represents the user events. This is passed to the initialize function
    * @field
    */
    , userEventState
    /**
    * The local timestamp of the last time the pointer coordinates were captured
    * @field
    */
    , lastCoordinateCapture = 0
    /**
    * A record of the scroll event's target's scrollLeft value; used to calculate the delta
    * @field
    */
    , lastScrollLeft = 0
    /**
    * A record of the scroll event's target's scrollLeft value; used to calculate the delta
    * @field
    */
    , lastScrollTop = 0
    ;

    const
    /**
    * @worker
    */
    self = Object.create(
        eventEmitter()
        , {
            "initialize": {
                "enumerable": true
                , "value": initializeUserEventManager
            }
            , "handleExternalEvent": {
                "enumerable": true
                , "value": handleExternalEvent
            }
            , "destroy": {
                "enumerable": true
                , "value": destroyUserEventManager
            }
        }
    )
    /**
    * A delayed function for the update overNs logic
    * @field
    */
    , delayedUpdateOverNs = utils_func_delay(
        updateOverNs
    )
    /**
    * A delayed function for the clear draggingOverNs
    * @field
    */
    , delayedclearDraggingOver = utils_func_delay(
        clearDraggingOver
    )
    /**
    * Maps the wheel event deltaMode to it's text value
    * @constant
    */
    , WHEEL_MODE_MAP = {
        "0": "Pixel"
        , "1": "Line"
        , "2": "Page"
    }
    /**
    * Maps the event location number and event key to a property name on the user event state object
    * @constant
    */
    , SPECIAL_KEY_MAP = {
        "1Control": "leftCtrl"
        , "2Control": "rightCtrl"
        , "1Alt": "leftAlt"
        , "2Alt": "rightAlt"
        , "1Shift": "leftShift"
        , "2Shift": "rightShift"
        , "0CapsLock": "capsLock"
    }
    /**
    * @constant
    */
    , SPECIAL_MULTIKEY_MAP = {
        "1Control": "ctrl"
        , "2Control": "ctrl"
        , "1Alt": "alt"
        , "2Alt": "alt"
        , "1Shift": "shift"
        , "2Shift": "shift"
    }
    /**
    * Maps the DOM event `button` property to a button name
    * @constant
    */
    , POINTER_BUTTON_MAP = {
        "1": "leftButtonNs"
        , "2": "rightButtonNs"
        , "3": ["rightButtonNs","leftButtonNs"]
        , "4": "centerButtonNs"
    }
    /**
    * @constant
    */
    , POINTER_BUTTONS = [
        "rightButtonNs"
        , "leftButtonNs"
        , "centerButtonNs"
    ]
    /**
    * Maps the event type to its handler function
    * @constant
    */
    , EVENT_HANDLER_MAP = {
        "pointermove": handlePointerMove
        , "pointerdown": handlePointerButton
        , "pointerup": handlePointerButton
        , "pointerover": handlePointerOver
        , "pointerout": handlePointerOut
        , "dblclick": handleDoubleClick
        , "click": handleClick
        , "contextmenu": handleContextMenu
        , "keydown": handleKeyDown
        , "keyup": handleKeyUp
        , "dragstart": handleDrag
        , "dragend": handleDrag
        , "dragenter": handleDragEnter
        , "dragleave": handleDragLeave
        , "drop": handleDrop
        , "focusin": handleFocusIn
        , "focusout": handleFocusOut
        , "wheel": handleWheel
        , "resize": handleWindowResize
        , "input": handleFormInput
        , "change": handleFormChange
        , "invalid": handleFormInvalid
        , "submit": handleFormSubmit
        , "reset": handleFormReset
        , "copy": handleClipboardCopy
        , "cut": handleClipboardCut
        , "paste": handleClipboardPaste
        , "online": handleConnectivityEvent
        , "offline": handleConnectivityEvent
        , "scroll": handleScroll
    }
    , CAPTURE_EVENTS = [
        "pointermove"
        , "pointerdown"
        , "pointerup"
        , "dblclick"
        , "click"
        , "contextmenu"
        , "keydown"
        , "keyup"
        , "dragstart"
        , "dragend"
        , "dragenter"
        , "dragleave"
        , "drop"
        , "focusin"
        , "focusout"
        , "wheel"
        , "resize"
        , "input"
        , "change"
        , "invalid"
        , "submit"
        , "reset"
        , "copy"
        , "cut"
        , "paste"
        , "online"
        , "offline"
        , "scroll"
    ]
    , CAPTURE_PASSIVE_EVENTS = [
        "pointermove"
        , "pointerover"
        , "pointerout"
    ]
    , WINDOW_EVENT = [
        "resize"
        , "online"
        , "offline"
    ]
    , CAPTURE_OPTION = {
        "capture": true
    }
    , CAPTURE_PASSIVE_OPTION = {
        "capture": true
        ,"passive": true
    }
    /**
    * A regular expression for spliting namespaces by a dot
    * @property
    */
    , SPLIT_DOT_PATT = /[.]/g
    ;

    return self;

    /**
    * @function
    */
    function initializeUserEventManager(element, eventState, options) {
        //store the given dependencies
        userEventState = eventState;
        rootElement = element;
        //ensure the required properties are on the user event state
        utils_applyIf(
            utils_copy(iUserEventState)
            , userEventState
        );
        //add the DOM listeners to the root element
        wireDOMListeners(options);
    }
    /**
    * @function
    */
    function wireDOMListeners(userEventOptions) {
        //loop through the events
        var eventKeys = Object.keys(EVENT_HANDLER_MAP);
        for(let i = 0, len = eventKeys.length, options, key; i < len; i++) {
            key = eventKeys[i];
            //get the options
            if (CAPTURE_EVENTS.indexOf(key) !== -1) {
                options = CAPTURE_OPTION;
            }
            else if (CAPTURE_PASSIVE_EVENTS.indexOf(key) !== -1) {
                options = CAPTURE_PASSIVE_OPTION;
            }
            //see if we are goign to skip this
            if (
                !(userEventOptions?.wirePointerMove === true) 
                && key === "pointermove"
            ) {
                continue;
            }
            if (
                !(userEventOptions?.wirePointerOverOut === true) 
                && (key === "pointerover" || key === "pointerout")
            ) {
                continue;
            }
            //wire the event
            if (WINDOW_EVENT.indexOf(key) !== -1) {
                dom_window.addEventListener(
                    key
                    , EVENT_HANDLER_MAP[key]
                    , options
                );
            }
            else {
                rootElement.addEventListener(
                    key
                    , EVENT_HANDLER_MAP[key]
                    , options
                );
            }
        }
    }


    /**
    * Receives a pointer move event and updates the coordinates, but at an interval;
    * @function
    */
    function handlePointerMove(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        //perform the coordinate capture
        updateCoordinates(
            event
        );
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Checks the interval and if it's time, uses the mousemove event to set the x and y coordinates
    * @function
    */
    function updateCoordinates(event) {
        var captureInterval = defaults.userEventManager.coordinateCaptureMs
        , currentTs = performance.now()
        ;
        if (currentTs - lastCoordinateCapture > captureInterval) {
            //set the last capture to now
            lastCoordinateCapture = currentTs;
            //update the state object
            userEventState.pointer.xCoordinate = event.x;
            userEventState.pointer.yCoordinate = event.y;
        }
    }
    /**
    * Receives the pointer button down and up events, and updates the pointer buttons in the user event state
    * @function
    */
    function handlePointerButton(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        //update based on the buttons property
        updatePointerButtons(
            event
        );
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Cancels any pointer out event, then gets and records the over namespace
    * @function
    */
    function handlePointerOver(event) {
        //cancel the out delay
        delayedUpdateOverNs.cancel();
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.pointer.overNs = namespace;
        //if a button is no longer clicked update the namespace
        updatePointerButtons(event);
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Starts a delayed function that updates the pointer.overNs value if another pointer over isn't fired
    * @function
    */
    function handlePointerOut(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        //delay updating the state object so we don't flip from null back to a ns when dragging
        delayedUpdateOverNs.delay(
            10
            , [event]
        );
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Sets the overNs to null. This happens if a pointer out event is fired and no subsequent pointer over event
    * @function
    */
    function updateOverNs(event) {
        userEventState.pointer.overNs = "";
    }
    /**
    * Handles a double click event.
    * @function
    */
    function handleDoubleClick(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.pointer.dblClickNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * @function
    */
    function handleClick(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.pointer.clickNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Handles a contextMenuNs event.
    * @function
    */
    function handleContextMenu(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.pointer.contextMenuNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Handles decifering the pointer buttons property
    * @function
    */
    function updatePointerButtons(event) {
        var pressed = POINTER_BUTTON_MAP[
            event.buttons
        ]
        //set the event object and get the namespace
        , namespace = setUserEvent(
            event
        )
        , buttonNs = ""
        , buttonName
        ;
        //more than one button can be pressed, loop through the buttons and c
        // if they are pressed
        for (let index in POINTER_BUTTONS) {
            buttonNs = "";
            if (
                !!pressed
                && pressed.indexOf(POINTER_BUTTONS[index]) !== -1
            ) {
                buttonNs = namespace;
            }
            buttonName = POINTER_BUTTONS[index];
            if (userEventState.pointer[buttonName] !== buttonNs) {
                userEventState.pointer[
                    buttonName
                ] = buttonNs;
            }
        }
        //clear the event object
        clearUserEvent();
    }
    /**
    * @function
    */
    function handleKeyDown(event) {
        //if the key down is a repeat
        if (event.repeat) {
            userEventState.keyboard.repeatCount++;
            return;
        }
        else if (userEventState.keyboard.repeatCount > 0) {
            userEventState.keyboard.repeatCount = 0;
        }

        var mapKey = getMapKey(event)
        //set the event object and get the namespace
        , namespace = setUserEvent(
            event
        )
        , mappedPropertyName
        , friendlyKey = event.key
        ;
        //if the key is a character
        if (event.key?.length === 1) {
            userEventState.keyboard.character = event.key;
            userEventState.keyboard.special = null;
        }
        else {
            userEventState.keyboard.character = null;
            userEventState.keyboard.special = event.key;
            //map special to state name
            if (SPECIAL_KEY_MAP.hasOwnProperty(mapKey)) {
                mappedPropertyName = SPECIAL_KEY_MAP[mapKey];
                userEventState.keyboard[mappedPropertyName] = true;
            }
            //map special to key counter
            if (SPECIAL_MULTIKEY_MAP.hasOwnProperty(mapKey)) {
                mappedPropertyName = SPECIAL_MULTIKEY_MAP[mapKey];
                userEventState.keyboard[mappedPropertyName]++;
                friendlyKey = mappedPropertyName;
            }
        }
        //add to the array of pressed keys
        if (userEventState.keyboard.keysPressed.indexOf() === -1) {
            userEventState.keyboard
                .keysPressed
                .push(
                    friendlyKey
                )
            ;
        }
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * @function
    */
    function handleKeyUp(event) {
        var mapKey = getMapKey(event)
        , index
        //set the event object and get the namespace
        , namespace = setUserEvent(
            event
        )
        , mappedPropertyName
        , friendlyKey = event.key
        ;

        if (userEventState.keyboard.character !== null) {
            userEventState.keyboard.character = null;
        }
        if (userEventState.keyboard.special !== null) {
            userEventState.keyboard.special = null;
        }
        //map special to state name
        if (SPECIAL_KEY_MAP.hasOwnProperty(mapKey)) {
            mappedPropertyName = SPECIAL_KEY_MAP[mapKey];
            userEventState.keyboard[mappedPropertyName] = false;
        }
        //map special to key counter
        if (SPECIAL_MULTIKEY_MAP.hasOwnProperty(mapKey)) {
            mappedPropertyName = SPECIAL_MULTIKEY_MAP[mapKey];
            userEventState.keyboard[mappedPropertyName]--;
            friendlyKey = mappedPropertyName;
        }
        index = userEventState
            .keyboard
            .keysPressed
            .indexOf(friendlyKey)
        ;
        //remove from the array of pressed keys
        if (index !== -1) {
            userEventState.keyboard
                .keysPressed
                .splice(
                    index
                    , 1
                )
            ;
        }
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Assembles the map key for the keyboard event
    * @function
    */
    function getMapKey(event) {
        return `${event.location}${event.key}`;
    }
    /**
    * If dragging is true then it determines the namespace of the dragging element and sets the draggingNs property. Otherwise it sets the draggingNs property to false.
    * @function
    */
    function handleDrag(event) {
        var dragging = event.type === "dragstart"
            ? true
            : false
        //set the event object and get the namespace
        , namespace = setUserEvent(
            event
        );
        if (dragging) {
            userEventState.dragDrop.draggingNs = namespace;
            if (!!userEventState.dragDrop.droppedNs) {
                userEventState.dragDrop.droppedNs = "";
            }
        }
        else {
            userEventState.dragDrop.draggingNs = "";
            if (!!userEventState.dragDrop.draggingOverNs) {
                userEventState.dragDrop.draggingOverNs = "";
            }
        }
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Cancels any clear dragging over, determines the namespace and sets the draggingOverNs
    * @function
    */
    function handleDragEnter(event) {
        delayedclearDraggingOver.cancel();
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.dragDrop.draggingOverNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
    }
    /**
    * Starts the delay for clearing the dargginOverNs
    * @function
    */
    function handleDragLeave(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        delayedclearDraggingOver.delay(
            10
            , [event]
        );
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Clears the draggingOverNs
    * @function
    */
    function clearDraggingOver(event) {
        userEventState.dragDrop.draggingOverNs = "";
    }
    /**
    * Clears the draggingNs and draggingOverNs and sets the droppedNs
    * @function
    */
    function handleDrop(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.dragDrop.draggingOverNs = "";
        userEventState.dragDrop.droppedNs  = namespace;
        userEventState.dragDrop.draggingNs = "";
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * @function
    */
    function handleFocusIn(event) {
        //get the namespace and update the user event state
        var namespace = setUserEvent(
            event
        );
        userEventState.focus.inNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * @function
    */
    function handleFocusOut(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.focus.outNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Handles the on wheel event and updates the wheel deltas
    * @function
    */
    function handleWheel(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.wheel.deltaX = event.deltaX;
        userEventState.wheel.deltaY = event.deltaY;
        userEventState.wheel.deltaZ = event.deltaZ;
        userEventState.wheel.deltaMode = WHEEL_MODE_MAP[
            event.deltaMode
        ];
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Handles the resize event and sets the windowResize property
    * @function
    */
    function handleWindowResize(event) {
        userEventState.window.resized = true;
        //TODO: record the delta and set the last width and height values

        //fire the event for anyone listening
        fireEvent(
            event
            , "window"
        );
    }
    /**
    * @function
    */
    function handleFormInput(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.form.inputNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * @function
    */
    function handleFormChange(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.form.changeNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Handles an externally fired invalid event, setting the invalidNs.
    * @function
    */
    function handleFormInvalid(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.form.invalidNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * @function
    */
    function handleFormSubmit(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.form.submitNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * @function
    */
    function handleFormReset(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        userEventState.form.resetNs = namespace;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Handles scroll events and updates the user event object
    * @function
    */
    function handleScroll(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        )
        , currentScrollLeft = event.target.scrollLeft
        , currentScrollTop = event.target.scrollTop
        ;
        //if the scrolling namespace is different, clear the scroll values
        if (namespace !== userEventState.scrolling.scrollNs) {
            userEventState.scrolling.scrollNs = namespace;
            lastScrollLeft = 0;
            lastScrollTop = 0;
        }
        //set the deltas
        userEventState
            .scrolling
            .leftDelta = currentScrollLeft - lastScrollLeft
        ;
        userEventState
            .scrolling
            .topDelta = currentScrollTop - lastScrollTop
        ;
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    *
    * @function
    */
    function handleClipboardCopy(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    *
    * @function
    */
    function handleClipboardCut(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    *
    * @function
    */
    function handleClipboardPaste(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * @function
    */
    function handleConnectivityEvent(event) {
        //set the event object and get the namespace
        var namespace = setUserEvent(
            event
        );
        //update the event state
        eventState.online = event.type === "online";
        //fire the event for anyone listening
        fireEvent(
            event
            , namespace
        );
        //clear the event object
        clearUserEvent();
    }
    /**
    * Handles external events that do not bubble or that the user event manager does not listen to; most notably the scroll event. Alternatives to scroll don't exist since it doesn't bubble.
    * @function
    */
    function handleExternalEvent(event) {
        //get the event handler function
        var handlerFn = EVENT_HANDLER_MAP[event.type]
        ;
        //if there isn't a handler then throw an error
        if (!handlerFn) {
            throw new Error(
                `${errors.userEventManager.invalid_event} (${event.type})`
            );
        }
        //execute the handler
        handlerFn(
            event
        );
    }


    /**
    * Determines the namespace, then sets the event object
    * @function
    */
    function setUserEvent(event) {
        //if there is an event already, clear it
        if (!!userEventState.event) {
            clearUserEvent();
        }
        var namespace = event.target.namespace;
        //set the value all as one so we can listen to a single state update
        // the change to the `event` property
        userEventState.event = {
            "type": event.type
            , "namespace": namespace
            , "timestamp": event.timeStamp
            , "getEventData": getEventData.bind(null, event)
            , "target": {
                "id": event.target.id
                , "tagName": event.target.tagName
                , "classList": event.target.classList
            }
            , "preventDefault": event.preventDefault.bind(event)
            , "stopPropagation": event.stopPropagation.bind(event)
        };
        ///LOGGING
        reporter.report(
            "userevent-extended"
            , `${infos.userEventManager.set_user_event} (${namespace}.${event.type})`
        );
        ///END LOGGING
        return namespace;
    }
    /**
    * Clears the event object
    * @function
    */
    function clearUserEvent() {
        if (!userEventState.event) {
            return;
        }
        //create a separate object so we don't reuse the state proxy object
        var lastEvent = {
            "type": userEventState.event.type
            , "namespace": userEventState.event.namespace
            , "timestamp": userEventState.event.timeStamp
        };
        //set the value all as one so we can listen to a single state update
        // the change to the `event` property
        userEventState.last = lastEvent;
        //release the DOM event by removing references
        userEventState.event = null;
        ///LOGGING
        reporter.report(
            "userevent-extended"
            , `${infos.userEventManager.clear_user_event} (${lastEvent.namespace}.${lastEvent.type})`
        );
        ///END LOGGING
    }


    /**
    * @function
    */
    function fireEvent(event, namespace) {
        var callbackInterface = userEventState.event
        //if the target is the window then add that to the event name
        , eventName = event.target === dom_window
            ? `window${event.type}`
            : event.type
        //add the event name to the end of the namespace
        , fqNamespace = `${namespace}.${eventName}`
        ;
        ///LOGGING
        reporter.report(
            "userevent"
            , fqNamespace
        );
        ///END LOGGING
        //should run listeners syncronously so any errors will stop
        self.emit(
            fqNamespace
            , userEventState.event
        );
    }


    /**
    * @function
    */
    function getEventData(event) {
        switch(event.type) {
            case "scroll":
                return getScrollEventData(
                    event
                );
                break;
            case "resize":
                return getResizeEventData(
                    event
                );
                break;
            case "drag":
            case "drop":
            case "dragstart":
            case "dragend":
            case "dragenter":
            case "dragleave":
                return getDragDropEventData(
                    event
                );
                break;
            case "copy":
            case "cut":
            case "paste":
                return getClipboardEventData(
                    event
                );
                break;
            case "submit":
            case "invalid":
            case "reset":
                return getFormEventData(
                    event
                );
            break;
            case "keydown":
            case "keyup": 
            case "keypress":
                return getKeyboardEventData(
                    event
                );
            break;
        }
    }
    /**
    * returns an object with the scroll target's new scroll values
    * @function
    */
    function getKeyboardEventData(event) {
        return {
            "key": event.key
            , "location": event.location
        };
    }
    /**
    * returns an object with the scroll target's new scroll values
    * @function
    */
    function getScrollEventData(event) {
        return {
            "scrollLeft": event.target.scrollLeft
            , "scrollTop": event.target.scrollTop
            , "scrollHeight": event.target.scrollHeight
            , "scrollWidth": event.target.scrollWidth
        };
    }
    /**
    * Returns an object with the window's new size
    * @function
    */
    function getResizeEventData(event) {
        var rootHtml = dom_document.querySelector('html')
        ;
        return {
            //get the total height of the root element
            "height": rootHtml.scrollHeight
            , "width": rootHtml.scrollWidth
            //get the visible viewport dimensions
            , "viewport": {
                "height": rootHtml.clientHeight //does not include scrollbar
                , "width": rootHtml.clientWidth //does not include scrollbar
            }
            //get the scroll offset
            , "scroll": {
                "left": rootHtml.scrollLeft
                , "top": rootHtml.scrollTop
            }
        };
    }
    /**
    * Returns an object with the event's dataTransfer API
    * @function
    */
    function getDragDropEventData(event) {
        return {
            "dataTransfer": event.dataTransfer
        };
    }
    /**
    * Returns an instance of the clipboard data transfer interface
    * @function
    */
    function getClipboardEventData(event) {
        return {
            "dataTransfer": event.clipboardData
        };
    }
    /**
    * @function
    */
    function getFormEventData(event) {
        var formData = new FormData(event.target)
        ;
        return Object.fromEntries(
            formData.entries()
        );
    }


    /**
    * @function
    */
    function destroyUserEventManager() {
        //remove listeners from the event emitter
        self.off();
        //remove the dom listeners
        removeDOMListeners();
        //release the references to the external dependencies
        userEventState = null;
        rootElement = null;
    }
    /**
    * @function
    */
    function removeDOMListeners() {
        //loop through the events
        var eventKeys = Object.keys(EVENT_HANDLER_MAP);
        for(let i = 0, len = eventKeys.length, options, key; i < len; i++) {
            key = eventKeys[i];
            //get the options
            if (CAPTURE_EVENTS.indexOf(key) !== -1) {
                options = CAPTURE_OPTION;
            }
            else if (CAPTURE_PASSIVE_EVENTS.indexOf(key) !== -1) {
                options = CAPTURE_PASSIVE_OPTION;
            }
            //wire the event
            if (WINDOW_EVENT.indexOf(key) !== -1) {
                dom_window.removeEventListener(
                    key
                    , EVENT_HANDLER_MAP[key]
                    , options
                );
            }
            else {
                if (!rootElement) {
                    continue;
                }
                rootElement.removeEventListener(
                    key
                    , EVENT_HANDLER_MAP[key]
                    , options
                );
            }
        }
    }
}