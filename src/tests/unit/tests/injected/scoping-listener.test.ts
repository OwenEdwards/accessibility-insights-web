// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, Times } from 'typemoq';

import { ISingleElementSelector } from '../../../../common/types/store-data/scoping-store-data';
import { WindowUtils } from '../../../../common/window-utils';
import { ElementFinderByPosition } from '../../../../injected/element-finder-by-position';
import { ScopingListener } from '../../../../injected/scoping-listener';
import { ShadowUtils } from '../../../../injected/shadow-utils';

class TestableScopingListener extends ScopingListener {
    public getOnClick(): (event: MouseEvent) => void {
        return this.onClick;
    }

    public getOnHover(): (event: MouseEvent) => void {
        return this.onHover;
    }
}

describe('ScopingListenerTest', () => {
    let windowUtilsMock: IMock<WindowUtils>;
    let elementFinderMock: IMock<ElementFinderByPosition>;
    let shadowUtilsMock: IMock<ShadowUtils>;
    let shadowContainerMock: IMock<HTMLElement>;
    let onInspectClickMock: IMock<(event: MouseEvent, selector: ISingleElementSelector) => void>;
    let onInspectHoverMock: IMock<(selector: ISingleElementSelector) => void>;
    let promiseStub;
    let promiseHandlerMock: IMock<(callback: Function) => void>;
    let onClickCurrentTimeoutID: number;
    let onHoverCurrentTimeoutID: number;
    let onClickSetTimeoutHandler: Function;
    let onClickProcessRequestPromiseCallback: (path: ISingleElementSelector) => void;
    let onClick: (event: MouseEvent) => void;
    let addEventListenerMock: IMock<(event: string, callback: (event: MouseEvent) => void) => void>;
    let removeEventListenerMock: IMock<(event: string, callback: (event: MouseEvent) => void) => void>;
    let createElementMock: IMock<(tagName: string) => HTMLElement>;
    let dom: Document;
    let elementStub: HTMLElement;
    let mouseEventStub: MouseEvent;
    let testSubject: TestableScopingListener;
    let onHoverSetTimeoutHandler: Function;
    let onHoverProcessRequestPromiseCallback: (path: ISingleElementSelector) => void;
    let onHover: (event: MouseEvent) => void;

    beforeEach(() => {
        windowUtilsMock = Mock.ofType(WindowUtils);
        shadowUtilsMock = Mock.ofType(ShadowUtils);
        elementFinderMock = Mock.ofType(ElementFinderByPosition);
        onInspectClickMock = Mock.ofInstance((eventName, selector) => {});
        addEventListenerMock = Mock.ofInstance((eventName, callback) => {});
        removeEventListenerMock = Mock.ofInstance((eventName, callback) => {});
        createElementMock = Mock.ofInstance(tagName => {
            return null;
        });
        promiseHandlerMock = Mock.ofInstance(callback => {});
        onClickCurrentTimeoutID = 95;
        onHoverCurrentTimeoutID = -1;
        onClick = null;
        onHover = null;
        onClickProcessRequestPromiseCallback = null;
        onHoverProcessRequestPromiseCallback = null;
        onClickSetTimeoutHandler = null;
        onHoverSetTimeoutHandler = null;

        dom = {
            addEventListener: addEventListenerMock.object,
            removeEventListener: removeEventListenerMock.object,
            createElement: createElementMock.object,
        } as Document;

        elementStub = {
            style: {},
        } as HTMLElement;

        mouseEventStub = {
            clientX: 100,
            clientY: 120,
        } as MouseEvent;

        promiseStub = {
            then: promiseHandlerMock.object,
        };

        shadowContainerMock = Mock.ofInstance({
            querySelector: selector => {},
            appendChild: node => {},
            removeChild: node => {},
        } as any);

        shadowUtilsMock
            .setup(it => it.getShadowContainer())
            .returns(() => {
                return shadowContainerMock.object;
            })
            .verifiable();

        onInspectClickMock = Mock.ofInstance((eventName, selector) => {});
        onInspectHoverMock = Mock.ofInstance(selector => {});

        testSubject = new TestableScopingListener(elementFinderMock.object, windowUtilsMock.object, shadowUtilsMock.object, dom);
    });

    test("start scope layout container doesn't exist and timeout doesn't exist", () => {
        const givenPath = ['selector'];
        setupShadowContainerMockQuerySelector(`#${ScopingListener.scopeLayoutContainerId}`, null);
        setupScopeElement();
        setupAddEventListener();

        testSubject.start(onInspectClickMock.object, onInspectHoverMock.object);
        setupOnClickSetTimeout(givenPath);
        onClick(mouseEventStub);
        onClickSetTimeoutHandler();
        onClickProcessRequestPromiseCallback(givenPath);

        setupOnHoverSetTimeout(givenPath);
        onHover(mouseEventStub);
        onHoverSetTimeoutHandler();
        onHoverProcessRequestPromiseCallback(givenPath);

        verifyAll();
    });

    test("start scope layout container doesn't exist and timeout does exist", () => {
        const givenPath = ['selector'];
        setupShadowContainerMockQuerySelector(`#${ScopingListener.scopeLayoutContainerId}`, null);
        setupScopeElement();
        setupAddEventListener();

        windowUtilsMock.setup(wum => wum.clearTimeout(onClickCurrentTimeoutID)).verifiable();

        windowUtilsMock.setup(wum => wum.clearTimeout(onHoverCurrentTimeoutID)).verifiable();

        testSubject.start(onInspectClickMock.object, onInspectHoverMock.object);
        setupOnClickSetTimeout(givenPath, 2);
        onClick(mouseEventStub);
        onClick(mouseEventStub);

        setupOnHoverSetTimeout(givenPath, 2);
        onHover(mouseEventStub);
        onHover(mouseEventStub);

        onClickSetTimeoutHandler();
        onClickProcessRequestPromiseCallback(givenPath);
        onHoverSetTimeoutHandler();
        onHoverProcessRequestPromiseCallback(givenPath);

        verifyAll();
    });

    test('stop, scoping container exists', () => {
        const shadowContainerElementStub = {} as HTMLElement;
        setupShadowContainerMockQuerySelector(`#${ScopingListener.scopeLayoutContainerId}`, shadowContainerElementStub);
        shadowContainerMock.setup(scm => scm.removeChild(shadowContainerElementStub)).verifiable();

        removeEventListenerMock.setup(re => re('click', testSubject.getOnClick())).verifiable();

        removeEventListenerMock.setup(re => re('mousemove', testSubject.getOnHover())).verifiable();

        testSubject.stop();
        verifyAll();
    });

    function setupAddEventListener(): void {
        addEventListenerMock
            .setup(ae => ae('click', It.isAny()))
            .callback((action, cb) => {
                onClick = cb;
            })
            .verifiable();

        addEventListenerMock
            .setup(ae => ae('mousemove', It.isAny()))
            .callback((action, cb) => {
                onHover = cb;
            })
            .verifiable();
    }

    function verifyAll(): void {
        windowUtilsMock.verifyAll();
        shadowUtilsMock.verifyAll();
        elementFinderMock.verifyAll();
        shadowContainerMock.verifyAll();
        onInspectClickMock.verifyAll();
        onInspectHoverMock.verifyAll();
        addEventListenerMock.verifyAll();
        removeEventListenerMock.verifyAll();
        createElementMock.verifyAll();
    }

    function setupShadowContainerMockQuerySelector(id: string, returnValue: Element): void {
        shadowContainerMock
            .setup(sc => sc.querySelector(id))
            .returns(() => returnValue)
            .verifiable();
    }

    function setupScopeElement(): void {
        createElementMock
            .setup(cem => cem('div'))
            .returns(() => elementStub)
            .verifiable();

        const expectedElement = {
            style: {
                position: 'fixed',
                left: '0',
                top: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'auto',
                cursor: 'crosshair',
                visibility: 'visible',
            },
            id: ScopingListener.scopeLayoutContainerId,
        } as HTMLElement;

        shadowContainerMock.setup(sc => sc.appendChild(It.isValue(expectedElement))).verifiable();
    }

    function setupOnClickSetTimeout(path: ISingleElementSelector, times: number = 1): void {
        windowUtilsMock
            .setup(wum => wum.setTimeout(It.isAny(), ScopingListener.onClickTimeout))
            .callback(handler => {
                onClickSetTimeoutHandler = handler;
            })
            .returns(() => onClickCurrentTimeoutID)
            .verifiable(Times.exactly(times));

        const expectedMessage = {
            x: mouseEventStub.clientX,
            y: mouseEventStub.clientY,
        };

        elementFinderMock
            .setup(ef => ef.processRequest(It.isValue(expectedMessage)))
            .returns(() => promiseStub)
            .verifiable(Times.atLeastOnce());

        promiseHandlerMock
            .setup(phm => phm(It.isAny()))
            .callback(callback => {
                onClickProcessRequestPromiseCallback = callback;
            });

        onInspectClickMock.setup(ssm => ssm(mouseEventStub, It.isValue(path))).verifiable();
    }

    function setupOnHoverSetTimeout(path: ISingleElementSelector, times: number = 1): void {
        windowUtilsMock
            .setup(wum => wum.setTimeout(It.isAny(), ScopingListener.onHoverTimeout))
            .callback(handler => {
                onHoverSetTimeoutHandler = handler;
            })
            .returns(() => onHoverCurrentTimeoutID)
            .verifiable(Times.exactly(times));

        const expectedMessage = {
            x: mouseEventStub.clientX,
            y: mouseEventStub.clientY,
        };

        elementFinderMock
            .setup(ef => ef.processRequest(It.isValue(expectedMessage)))
            .returns(() => promiseStub)
            .verifiable(Times.atLeastOnce());

        promiseHandlerMock
            .setup(phm => phm(It.isAny()))
            .callback(callback => {
                onHoverProcessRequestPromiseCallback = callback;
            });

        onInspectHoverMock.setup(ssm => ssm(It.isValue(path))).verifiable();
    }
});
