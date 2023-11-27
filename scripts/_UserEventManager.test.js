/**
* @test
*   @title CompTIA.portal.app._UserEventManager: dom listeners added
*/
function appUserEventManagerTest0(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, mockEventEmitter, mockEventEmitterWorker, copy, delayedPromise, snapshots;

    arrange(
        async function arrange() {
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            delayedPromise = await controller(
                [
                    ".utils.delayedPromise"
                ]
            );
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            eventListeners = {};
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
            ];
            snapshots = {
                "pointer": {}
            };
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );
        }
    );

    assert(
        function assert(test) {
            test("There should be 17 DOM event listeners added")
            .value(mockRootEl, "addEventListener")
            .hasBeenCalled(20)
            ;
        }
    );
}
/**
* @test
*   @title CompTIA.portal.app._UserEventManager: dom pointer listener unit test
*/
function appUserEventManagerTest1(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, mockEventEmitter, mockEventEmitterWorker, copy, delayedPromise, snapshots;

    arrange(
        async function arrange() {
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            delayedPromise = await controller(
                [
                    ".utils.delayedPromise"
                ]
            );
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            eventListeners = {};
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
            ];
            snapshots = {
                "pointer": {}
            };
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );
            //mock mouse down [pointer down]
            eventListeners.pointerdown(
                {
                    "target": mockRootEl.children[0]
                    , "buttons": 1
                    , "type": "pointerdown"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.pointer.leftPointerDown = copy(
                mockUserEventState
            );
            //mock mouse up [pointer up]
            eventListeners.pointerup(
                {
                    "target": mockRootEl.children[0]
                    , "buttons": 0
                    , "type": "pointerup"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.pointer.leftButtonUp = copy(
                mockUserEventState
            );
            //mock mouse over [pointer over]
            eventListeners.pointerover(
                {
                    "target": mockRootEl.children[0]
                    , "buttons": 0
                    , "type": "pointerover"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.pointer.pointerOver = copy(
                mockUserEventState
            );
            //mock mouse out [pointer out]
            eventListeners.pointerout(
                {
                    "target": mockRootEl.children[0]
                    , "type": "pointerout"
                    , "preventDefault": mock_callback()
                }
            );
            //mock another mouse over
            eventListeners.pointerover(
                {
                    "target": mockRootEl.children[1]
                    , "type": "pointerover"
                    , "buttons": 0
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.pointer.pointerOver2 = copy(
                mockUserEventState
            );
            //another mouse out
            eventListeners.pointerout(
                {
                    "target": mockRootEl.children[1]
                    , "type": "pointerout"
                    , "preventDefault": mock_callback()
                }
            );
            //there is a timeout for the clearing after the pointer out with no new pointer
            // we need to wait until that delay has completed
            await delayedPromise(10);
            snapshots.pointer.pointerOut = copy(
                mockUserEventState
            );

            //mock mouse move (pointer coordinates) [pointer move]
            eventListeners.pointermove(
                {
                    "target": mockRootEl.children[0]
                    , "buttons": 0
                    , "x": 0
                    , "y": 0
                    , "type": "pointermove"
                    , "preventDefault": mock_callback()
                }
            );
            eventListeners.pointermove(
                {
                    "target": mockRootEl.children[0]
                    , "buttons": 0
                    , "x": 30
                    , "y": 30
                    , "type": "pointermove"
                    , "preventDefault": mock_callback()
                }
            );
            eventListeners.pointermove(
                {
                    "target": mockRootEl.children[0]
                    , "buttons": 0
                    , "x": 50
                    , "y": 50
                    , "type": "pointermove"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.pointer.initialMove = copy(
                mockUserEventState
            );
            await delayedPromise(50);
            eventListeners.pointermove(
                {
                    "target": mockRootEl.children[0]
                    , "buttons": 0
                    , "x": 99
                    , "y": 99
                    , "type": "pointermove"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.pointer.endMove = copy(
                mockUserEventState
            );

            //mock dblclick
            eventListeners.dblclick(
                {
                    "target": mockRootEl.children[0]
                    , "type": "dblclick"
                    , "preventDefault": mock_callback()
                }
            );
            //mock contextmenu
            eventListeners.contextmenu(
                {
                    "target": mockRootEl.children[1]
                    , "type": "contextmenu"
                    , "preventDefault": mock_callback()
                }
            );
        }
    );

    assert(
        function assert(test) {
            //testing pointer button up/down
            test("the leftPointerDown should be myns and nothing else changed")
            .value(snapshots, "pointer.leftPointerDown")
            .stringify()
            .equals()
            ;
            test("the pointer.leftButtonNs should be empty now, after the pointer up")
            .value(snapshots, "pointer.leftButtonUp")
            .stringify()
            .equals()
            ;
            test("the pointerOver should be")
            .value(snapshots, "pointer.pointerOver")
            .stringify()
            .equals()
            ;
            test("the pointerOut should be")
            .value(snapshots, "pointer.pointerOut")
            .stringify()
            .equals()
            ;

            //testing pointer move
            test("the initial pointerMove should be")
            .value(snapshots, "pointer.initialMove")
            .stringify()
            .equals()
            ;
            test("the end pointerMove should be")
            .value(snapshots, "pointer.endMove")
            .stringify()
            .equals()
            ;

            test("the double click ns should be set")
            .value(mockUserEventState, "pointer.dblClickNs")
            .equals("myns.[0]div")
            ;

            test("the double click ns should be set")
            .value(mockUserEventState, "pointer.contextMenuNs")
            .equals("myns.[1]div#child2")
            ;

            test("the event emitter should be called")
            .value(mockEventEmitter, "emit")
            .hasBeenCalled(12)
            .hasBeenCalledWithArg(0, 0, "myns.[0]div.pointerdown")
            .hasBeenCalledWithArg(1, 0, "myns.[0]div.pointerup")
            .hasBeenCalledWithArg(2, 0, "myns.[0]div.pointerover")
            .hasBeenCalledWithArg(3, 0, "myns.[0]div.pointerout")
            .hasBeenCalledWithArg(4, 0, "myns.[1]div#child2.pointerover")
            .hasBeenCalledWithArg(5, 0, "myns.[1]div#child2.pointerout")
            .hasBeenCalledWithArg(6, 0, "myns.[0]div.pointermove")
            .hasBeenCalledWithArg(7, 0, "myns.[0]div.pointermove")
            .hasBeenCalledWithArg(8, 0, "myns.[0]div.pointermove")
            .hasBeenCalledWithArg(9, 0, "myns.[0]div.pointermove")
            .hasBeenCalledWithArg(10, 0, "myns.[0]div.dblclick")
            .hasBeenCalledWithArg(11, 0, "myns.[1]div#child2.contextmenu")
            ;

            test("the event emitter should be called with null data")
            .value(mockEventEmitter, "emit")
            .getCallbackArg(0, 1)
            .getPropertyValue("data")
            .isNull()
            ;
        }
    );
}
/**
* @test
*   @title CompTIA.portal.app._UserEventManager: dom wheel listener unit test
*/
function appUserEventManagerTest2(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, copy, mockEventEmitterWorker, mockEventEmitter;

    arrange(
        async function arrange() {
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            eventListeners = {};
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
            ];
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );
            eventListeners.wheel(
                {
                    "target": mockRootEl.children[1]
                    , "deltaX": -100
                    , "deltaY": 100
                    , "deltaZ": 0
                    , "deltaMode": 1
                    , "type": "wheel"
                    , "preventDefault": mock_callback()
                }
            );
        }
    );

    assert(
        function assert(test) {
            test("the wheel event should update the deltas")
            .value(mockUserEventState)
            .stringify()
            .equals()
            ;

            test("the event emitter should be called once")
            .value(mockEventEmitter, "emit")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, "myns.[1]div#child2.wheel")
            ;

            test("the event emitter should be called with null data")
            .value(mockEventEmitter, "emit")
            .getCallbackArg(0, 1)
            .getPropertyValue("data")
            .isNull()
            ;
        }
    );
}
/**
* @test
*   @title CompTIA.portal.app._UserEventManager: dom keyboard listener unit test
*/
function appUserEventManagerTest3(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, mockEventEmitter, mockEventEmitterWorker, copy, delayedPromise, snapshots;

    arrange(
        async function arrange() {
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            delayedPromise = await controller(
                [
                    ".utils.delayedPromise"
                ]
            );
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            eventListeners = {};
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
            ];
            snapshots = {
                "keyboard": {}
            };
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );
            //mock left alt keydown
            eventListeners.keydown(
                {
                    "target": mockRootEl.children[1]
                    , "key": "Alt"
                    , "location": 1
                    , "type": "keydown"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.keyboard.leftAltDown = copy(
                mockUserEventState
            );
            //mock character key pressed
            eventListeners.keydown(
                {
                    "target": mockRootEl.children[1]
                    , "key": "e"
                    , "location": 0
                    , "type": "keydown"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.keyboard.characterKeyDown = copy(
                mockUserEventState
            );
            //mock left alt key up
            eventListeners.keyup(
                {
                    "target": mockRootEl.children[1]
                    , "key": "Alt"
                    , "location": 1
                    , "type": "keyup"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.keyboard.leftAltUp = copy(
                mockUserEventState
            );
            //mock character key up
            eventListeners.keyup(
                {
                    "target": mockRootEl.children[1]
                    , "key": "e"
                    , "location": 0
                    , "type": "keyup"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.keyboard.characterKeyUp = copy(
                mockUserEventState
            );
            //mock repeat
            eventListeners.keydown(
                {
                    "target": mockRootEl.children[1]
                    , "key": "e"
                    , "location": 0
                    , "type": "keydown"
                    , "preventDefault": mock_callback()
                }
            );
            eventListeners.keydown(
                {
                    "target": mockRootEl.children[1]
                    , "key": "e"
                    , "location": 0
                    , "repeat": true
                    , "type": "keydown"
                    , "preventDefault": mock_callback()
                }
            );
            eventListeners.keydown(
                {
                    "target": mockRootEl.children[1]
                    , "key": "e"
                    , "location": 0
                    , "repeat": true
                    , "type": "keydown"
                    , "preventDefault": mock_callback()
                }
            );
            eventListeners.keydown(
                {
                    "target": mockRootEl.children[1]
                    , "key": "e"
                    , "location": 0
                    , "repeat": true
                    , "type": "keydown"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.keyboard.repeatKeyDown= copy(
                mockUserEventState
            );
            eventListeners.keyup(
                {
                    "target": mockRootEl.children[1]
                    , "key": "e"
                    , "location": 0
                    , "type": "keyup"
                    , "preventDefault": mock_callback()
                }
            );
            //mock after repeat character press
            eventListeners.keydown(
                {
                    "target": mockRootEl.children[1]
                    , "key": "e"
                    , "location": 0
                    , "type": "keydown"
                    , "preventDefault": mock_callback()
                }
            );
            eventListeners.keyup(
                {
                    "target": mockRootEl.children[1]
                    , "key": "e"
                    , "location": 0
                    , "type": "keyup"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.keyboard.postRepeatKey = copy(
                mockUserEventState
            );
        }
    );

    assert(
        function assert(test) {
            test("The left alt down snapshot should be")
            .value(snapshots, "keyboard.leftAltDown")
            .stringify()
            .equals()
            ;

            test("the chartacter key down should be")
            .value(snapshots, "keyboard.characterKeyDown")
            .stringify()
            .equals()
            ;

            test("the left alt key up should be")
            .value(snapshots, "keyboard.leftAltUp")
            .stringify()
            .equals()
            ;

            test("the chartacter key up should be")
            .value(snapshots, "keyboard.characterKeyUp")
            .stringify()
            .equals()
            ;

            test("the repeat key down should be")
            .value(snapshots, "keyboard.repeatKeyDown")
            .stringify()
            .equals()
            ;

            test("the post repeat key down should be")
            .value(snapshots, "keyboard.postRepeatKey")
            .stringify()
            .equals()
            ;

            test("the event emitter should be called once")
            .value(mockEventEmitter, "emit")
            .hasBeenCalled(8)
            .hasBeenCalledWithArg(0, 0, "myns.[1]div#child2.keydown")
            .hasBeenCalledWithArg(1, 0, "myns.[1]div#child2.keydown")
            .hasBeenCalledWithArg(2, 0, "myns.[1]div#child2.keyup")
            .hasBeenCalledWithArg(3, 0, "myns.[1]div#child2.keyup")
            .hasBeenCalledWithArg(4, 0, "myns.[1]div#child2.keydown")
            .hasBeenCalledWithArg(5, 0, "myns.[1]div#child2.keyup")
            .hasBeenCalledWithArg(6, 0, "myns.[1]div#child2.keydown")
            .hasBeenCalledWithArg(7, 0, "myns.[1]div#child2.keyup")
            ;

            test("the event emitter should be called with null data")
            .value(mockEventEmitter, "emit")
            .getCallbackArg(0, 1)
            .getPropertyValue("data")
            .isNull()
            ;
        }
    );
}
/**
* @test
*   @title CompTIA.portal.app._UserEventManager: dom blur focus listener unit test
*/
function appUserEventManagerTest4(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, copy, mockEventEmitter, mockEventEmitterWorker, delayedPromise, snapshots;

    arrange(
        async function arrange() {
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            delayedPromise = await controller(
                [
                    ".utils.delayedPromise"
                ]
            );
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            eventListeners = {};
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
            ];
            snapshots = {
            };
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );
            //mock focusin
            eventListeners.focusin(
                {
                    "target": mockRootEl.children[1]
                    , "type": "focusin"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.firstFocusIn = copy(
                mockUserEventState
            );
            //focus out
            eventListeners.focusout(
                {
                    "target": mockRootEl.children[1]
                    , "type": "focusout"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.firstFocusOut = copy(
                mockUserEventState
            );
            //focus back in no delay
            eventListeners.focusin(
                {
                    "target": mockRootEl.children[0]
                    , "type": "focusin"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.secondFocusIn = copy(
                mockUserEventState
            );
            //focus out
            eventListeners.focusout(
                {
                    "target": mockRootEl.children[0]
                    , "type": "focusout"
                    , "preventDefault": mock_callback()
                }
            );
            //delay after the focus out
            await delayedPromise(100);

            snapshots.secondFocusOutDelayed = copy(
                mockUserEventState
            );
        }
    );

    assert(
        function assert(test) {
            test("The first focus in should result in")
            .value(snapshots, "firstFocusIn")
            .stringify()
            .equals()
            ;

            test("The first focus out should result in")
            .value(snapshots, "firstFocusOut")
            .stringify()
            .equals()
            ;

            test("The second focus in should result in")
            .value(snapshots, "secondFocusIn")
            .stringify()
            .equals()
            ;

            test("The second focus out with delay should result in")
            .value(snapshots, "secondFocusOutDelayed")
            .stringify()
            .equals()
            ;

            test("the event emitter should be called once")
            .value(mockEventEmitter, "emit")
            .hasBeenCalled(4)
            .hasBeenCalledWithArg(0, 0, "myns.[1]div#child2.focusin")
            .hasBeenCalledWithArg(1, 0, "myns.[1]div#child2.focusout")
            .hasBeenCalledWithArg(2, 0, "myns.[0]div.focusin")
            .hasBeenCalledWithArg(3, 0, "myns.[0]div.focusout")
            ;

            test("the event emitter should be called with null data")
            .value(mockEventEmitter, "emit")
            .getCallbackArg(0, 1)
            .getPropertyValue("data")
            .isNull()
            ;
        }
    );
}
/**
* @test
*   @title CompTIA.portal.app._UserEventManager: dom drag and drop listener unit test
*/
function appUserEventManagerTest5(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, copy, mockEventEmitter, mockEventEmitterWorker, delayedPromise, snapshots, mockDataTransfer;

    arrange(
        async function arrange() {
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            delayedPromise = await controller(
                [
                    ".utils.delayedPromise"
                ]
            );
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            eventListeners = {};
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
            ];
            snapshots = {
            };
            mockDataTransfer = {};
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );
            //mock drag start
            eventListeners.dragstart(
                {
                    "target": mockRootEl.children[1]
                    , "type": "dragstart"
                    , "dataTransfer": mockDataTransfer
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.dragStart = copy(
                mockUserEventState
            );
            //mock drag enter
            eventListeners.dragenter(
                {
                    "target": mockRootEl.children[0]
                    , "type": "dragenter"
                    , "dataTransfer": mockDataTransfer
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.dragEnter1 = copy(
                mockUserEventState
            );
            //mock drag leave
            eventListeners.dragleave(
                {
                    "target": mockRootEl.children[0]
                    , "type": "dragleave"
                    , "dataTransfer": mockDataTransfer
                    , "preventDefault": mock_callback()
                }
            );
            //see if the draggingOverNs is cleared
            await delayedPromise(20);
            snapshots.dragLeave1 = copy(
                mockUserEventState
            );
            //mock drag enter
            eventListeners.dragenter(
                {
                    "target": mockRootEl.children[0]
                    , "type": "dragenter"
                    , "dataTransfer": mockDataTransfer
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.dragEnter2 = copy(
                mockUserEventState
            );
            //mock drag end
            eventListeners.dragend(
                {
                    "target": mockRootEl.children[1]
                    , "type": "dragend"
                    , "dataTransfer": mockDataTransfer
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.dragEnd = copy(
                mockUserEventState
            );
            //mock drop
            eventListeners.drop(
                {
                    "target": mockRootEl.children[0]
                    , "type": "drop"
                    , "dataTransfer": mockDataTransfer
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.drop = copy(
                mockUserEventState
            );
        }
    );

    assert(
        function assert(test) {
            test("dragStart should result in")
            .value(snapshots, "dragStart")
            .stringify()
            .equals()
            ;

            test("dragEnter1 should result in")
            .value(snapshots, "dragEnter1")
            .stringify()
            .equals()
            ;

            test("dragLeave1 should result in")
            .value(snapshots, "dragLeave1")
            .stringify()
            .equals()
            ;

            test("dragEnter2 should result in")
            .value(snapshots, "dragEnter2")
            .stringify()
            .equals()
            ;

            test("dragEnd should result in")
            .value(snapshots, "dragEnd")
            .stringify()
            .equals()
            ;

            test("drop should result in")
            .value(snapshots, "drop")
            .stringify()
            .equals()
            ;

            test("the event emitter should be called once")
            .value(mockEventEmitter, "emit")
            .hasBeenCalled(6)
            .hasBeenCalledWithArg(0, 0, "myns.[1]div#child2.dragstart")
            .hasBeenCalledWithArg(1, 0, "myns.[0]div.dragenter")
            .hasBeenCalledWithArg(2, 0, "myns.[0]div.dragleave")
            .hasBeenCalledWithArg(3, 0, "myns.[0]div.dragenter")
            .hasBeenCalledWithArg(4, 0, "myns.[1]div#child2.dragend")
            .hasBeenCalledWithArg(5, 0, "myns.[0]div.drop")
            ;

            test("the event emitter should be called with a data object containing the dataTransfer api")
            .value(mockEventEmitter, "emit")
            .getCallbackArg(0, 1)
            .getPropertyValue("data")
            .getPropertyValue("dataTransfer")
            .equals(mockDataTransfer)
            ;
        }
    );
}
/**
* @test
*   @title CompTIA.portal.app._UserEventManager: dom external scroll and other listener unit test
*/
function appUserEventManagerTest6(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, copy, mockEventEmitter, mockEventEmitterWorker, delayedPromise, snapshots;

    arrange(
        async function arrange() {
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            delayedPromise = await controller(
                [
                    ".utils.delayedPromise"
                ]
            );
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            eventListeners = {};
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                    , "scrollLeft": 0
                    , "scrollTop": 0
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                    , "scrollLeft": 0
                    , "scrollTop": 0
                }
            ];
            snapshots = {
                "scroll": {}
            };
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );

            //mock scroll
            mockRootEl.children[0].scrollLeft = 100;
            userEventManager.handleExternalEvent(
                "targetNs"
                , {
                    "target": mockRootEl.children[0]
                    , "type": "scroll"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.scroll.left = copy(
                mockUserEventState
            );
            mockRootEl.children[0].scrollTop = 100;
            userEventManager.handleExternalEvent(
                "targetNs"
                , {
                    "target": mockRootEl.children[0]
                    , "type": "scroll"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.scroll.top = copy(
                mockUserEventState
            );

            mockRootEl.children[0].scrollTop = -100;
            userEventManager.handleExternalEvent(
                "targetNs"
                , {
                    "target": mockRootEl.children[0]
                    , "type": "scroll"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.scroll.topMinus = copy(
                mockUserEventState
            );

            mockRootEl.children[1].scrollLeft = -100;
            userEventManager.handleExternalEvent(
                "targetNs"
                , {
                    "target": mockRootEl.children[1]
                    , "type": "scroll"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.scroll.leftMinus = copy(
                mockUserEventState
            );
        }
    );

    assert(
        function assert(test) {
            test("the left scroll should result in")
            .value(snapshots, "scroll.left")
            .stringify()
            .equals()
            ;

            test("the top scroll should result in")
            .value(snapshots, "scroll.top")
            .stringify()
            .equals()
            ;

            test("the top minus scroll should result in")
            .value(snapshots, "scroll.topMinus")
            .stringify()
            .equals()
            ;

            test("the left minus scroll should result in")
            .value(snapshots, "scroll.leftMinus")
            .stringify()
            .equals()
            ;

            test("the event emitter should be called once")
            .value(mockEventEmitter, "emit")
            .hasBeenCalled(4)
            .hasBeenCalledWithArg(0, 0, "myns.[0]div.scroll")
            .hasBeenCalledWithArg(1, 0, "myns.[0]div.scroll")
            .hasBeenCalledWithArg(2, 0, "myns.[0]div.scroll")
            .hasBeenCalledWithArg(3, 0, "myns.[1]div#child2.scroll")
            ;

            test("the event emitter should be called with null data")
            .value(mockEventEmitter, "emit")
            .getCallbackArg(0, 1)
            .getPropertyValue("data")
            .stringify()
            .equals('{"scrollLeft":100,"scrollTop":0}')
            ;
        }
    );
}
/**
* @test
*   @title CompTIA.portal.app._UserEventManager: dom form listeners unit test
*/
function appUserEventManagerTest7(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, dom_formData, mockDataForm, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, copy, mockEventEmitter, mockEventEmitterWorker, delayedPromise, snapshots;

    arrange(
        async function arrange() {
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            delayedPromise = await controller(
                [
                    ".utils.delayedPromise"
                ]
            );
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            mockDataForm = {};
            dom_formData = mock_callback(
                function mockDataFormConst() {
                    return mockDataForm;
                }
            );
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                        ,
                        ,
                        , dom_formData
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            eventListeners = {};
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
            ];
            snapshots = {
                "form": {}
            };
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );
            //mock input
            eventListeners.input(
                {
                    "target": mockRootEl.children[1]
                    , "type": "input"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.form.input = copy(
                mockUserEventState
            );
            //mock submit
            eventListeners.submit(
                {
                    "target": mockRootEl.children[0]
                    , "type": "submit"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.form.submit = copy(
                mockUserEventState
            );
            //mock reset
            eventListeners.reset(
                {
                    "target": mockRootEl.children[1]
                    , "type": "reset"
                    , "preventDefault": mock_callback()
                }
            );
            snapshots.form.reset = copy(
                mockUserEventState
            );
        }
    );

    assert(
        function assert(test) {
            test("The form input should result in")
            .value(snapshots, "form.input")
            .stringify()
            .equals()
            ;

            test("The form submit should result in")
            .value(snapshots, "form.submit")
            .stringify()
            .equals()
            ;

            test("The form reset should result in")
            .value(snapshots, "form.reset")
            .stringify()
            .equals()
            ;

            test("the event emitter should be called once")
            .value(mockEventEmitter, "emit")
            .hasBeenCalled(3)
            .hasBeenCalledWithArg(0, 0, "myns.[1]div#child2.input")
            .hasBeenCalledWithArg(1, 0, "myns.[0]div.submit")
            .hasBeenCalledWithArg(2, 0, "myns.[1]div#child2.reset")
            ;

            test("the event emitter should be called with null data")
            .value(mockEventEmitter, "emit")
            .getCallbackArg(0, 1)
            .getPropertyValue("data")
            .isNull()
            ;
        }
    );
}
/**
* @test
*   @title CompTIA.portal.app._UserEventManager: dom window resize listener unit test
*/
function appUserEventManagerTest8(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, mockHtmlEl, dom_window, dom_document, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, copy, mockEventEmitter, mockEventEmitterWorker, delayedPromise;

    arrange(
        async function arrange() {
            eventListeners = {};
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            delayedPromise = await controller(
                [
                    ".utils.delayedPromise"
                ]
            );
            dom_window = {
                "addEventListener": mock_callback(
                    function mockWindowAddListener(name, fn) {
                        eventListeners['resize'] = fn;
                    }
                )
            };
            mockHtmlEl = {
                "clientHeight": 100
                , "clientWidth": 100
                , "offsetHeight": 200
                , "offsetWidth": 200
                , "scrollHeight": 220
                , "scrollWidth": 220
                , "scrollLeft": 10
                , "scrollTop": 100
            };
            dom_document = {
                "querySelector": mock_callback(
                    function mockDocumentQuerySelector(selector) {
                        return mockHtmlEl;
                    }
                )
            };
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                        , dom_window
                        , dom_document
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
            ];
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );
            //mock resize
            eventListeners.resize(
                {
                    "target": mockRootEl
                    , "type": "resize"
                    , "preventDefault": mock_callback()
                }
            );
        }
    );

    assert(
        function assert(test) {
            test("the event emitter should be called once")
            .value(mockEventEmitter, "emit")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, "window.resize")
            ;

            test("The user event state should be")
            .value(mockUserEventState)
            .stringify()
            .equals()
            ;

            test("The event emitter should be called with")
            .value(mockEventEmitter, "emit")
            .hasBeenCalled(1)
            .getCallbackArg(0, 1)
            .getPropertyValue("data")
            .stringify()
            .equals('{"height":220,"width":220,"viewport":{"height":100,"width":100},"scroll":{"left":10,"top":100}}')
            ;
        }
    );
}
/**
* @test
*   @title CompTIA.portal.app._UserEventManager: destroy user manager
*/
function appUserEventManagerTest9(
    controller
    , mock_callback
) {
    var userEventManager, mockRootEl, mockHtmlEl, dom_window, dom_document, mockUserEventState, eventListeners, mockHasAttribute, mockGetAttribute, copy, mockEventEmitter, mockEventEmitterWorker, delayedPromise;

    arrange(
        async function arrange() {
            eventListeners = {};
            copy = await controller(
                [
                    ":PunyJS.core.object.Copy"
                ]
            );
            delayedPromise = await controller(
                [
                    ".utils.delayedPromise"
                ]
            );
            dom_window = {
                "addEventListener": mock_callback(
                    function mockWindowAddListener(name, fn) {
                        eventListeners['resize'] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockWindowAddListener(name, fn) {
                        delete eventListeners['resize'];
                    }
                )
            };
            mockHtmlEl = {
                "clientHeight": 100
                , "clientWidth": 100
                , "offsetHeight": 200
                , "offsetWidth": 200
                , "scrollHeight": 220
                , "scrollWidth": 220
                , "scrollLeft": 10
                , "scrollTop": 100
            };
            dom_document = {
                "querySelector": mock_callback(
                    function mockDocumentQuerySelector(selector) {
                        return mockHtmlEl;
                    }
                )
            };
            mockEventEmitter = {
                "emit": mock_callback()
            };
            mockEventEmitterWorker = function () {
                return mockEventEmitter;
            };
            userEventManager = await controller(
                [
                    ":CompTIA.portal.app._UserEventManager"
                    , [
                        mockEventEmitterWorker
                        , dom_window
                        , dom_document
                    ]
                ]
            );
            //template object should be copied so the actual dependency isn't updated
            mockUserEventState =
                copy(
                    await controller(
                    [
                        ":CompTIA.portal.ui.gui.IUserEventState"
                    ]
                )
            );
            mockHasAttribute = mock_callback(
                function mockedHasAttribute(name) {
                    //even so the child will always first fail to find a ns and then the parent will always find a ns
                    if (mockHasAttribute.callbackCount % 2 === 0) {
                        return true;
                    }
                    return false;
                }
            );
            mockGetAttribute = mock_callback(
                function mockedGetAttribute(name) {
                    return "myns";
                }
            );
            mockRootEl = {
                "nodeName": "parent"
                , "addEventListener": mock_callback(
                    function mockAddEventListener(eventName, fn) {
                        if (eventListeners.hasOwnProperty(eventName)) {
                            //only one listener should be added per event
                            debugger;
                        }
                        eventListeners[eventName] = fn;
                    }
                )
                , "removeEventListener": mock_callback(
                    function mockRemoveEventListener(eventName, fn) {
                        delete eventListeners[eventName];
                    }
                )
                , "getAttribute": mockGetAttribute
                , "hasAttribute": mockHasAttribute
            };
            //add some mock children
            mockRootEl.children = [
                {
                    "nodeName": "div"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
                , {
                    "nodeName": "div"
                    , "id": "child2"
                    , "parentElement": mockRootEl
                    , "getAttribute": mockGetAttribute
                    , "hasAttribute": mockHasAttribute
                }
            ];
        }
    );

    act(
        async function act() {
            //initialize
            userEventManager.initialize(
                mockRootEl
                , mockUserEventState
            );
            userEventManager.destroy();
        }
    );

    assert(
        function assert(test) {
            test("the root el remove listener should be called")
            .value(mockRootEl, "removeEventListener")
            .hasBeenCalled(20)
            .hasBeenCalledWithArg(0, 0, 'pointermove')
            .hasBeenCalledWithArg(1, 0, 'pointerdown')
            .hasBeenCalledWithArg(2, 0, 'pointerup')
            .hasBeenCalledWithArg(3, 0, 'pointerover')
            .hasBeenCalledWithArg(4, 0, 'pointerout')
            .hasBeenCalledWithArg(5, 0, 'dblclick')
            .hasBeenCalledWithArg(6, 0, 'contextmenu')
            .hasBeenCalledWithArg(7, 0, 'keydown')
            .hasBeenCalledWithArg(8, 0, 'keyup')
            .hasBeenCalledWithArg(9, 0, 'dragstart')
            .hasBeenCalledWithArg(10, 0, 'dragend')
            .hasBeenCalledWithArg(11, 0, 'dragenter')
            .hasBeenCalledWithArg(12, 0, 'dragleave')
            .hasBeenCalledWithArg(13, 0, 'drop')
            .hasBeenCalledWithArg(14, 0, 'focusin')
            .hasBeenCalledWithArg(15, 0, 'focusout')
            .hasBeenCalledWithArg(16, 0, 'wheel')
            .hasBeenCalledWithArg(17, 0, 'input')
            .hasBeenCalledWithArg(18, 0, 'submit')
            .hasBeenCalledWithArg(19, 0, 'reset')
            ;

            test("the window remove listener should be called")
            .value(dom_window, "removeEventListener")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, 'resize')
            ;
        }
    );
}