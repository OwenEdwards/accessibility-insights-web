// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IAssessmentVisualizationInstance } from '../../../../../injected/frameCommunicators/html-element-axe-results-helper';
import { FailureInstanceFormatter } from '../../../../../injected/visualization/failure-instance-formatter';
import { HighlightBoxFormatter } from '../../../../../injected/visualization/highlight-box-formatter';

describe('HighlightBoxFormatterTests', () => {
    let testSubject: HighlightBoxFormatter;
    const htmlElement = document.createElement('div');

    beforeEach(() => {
        testSubject = new HighlightBoxFormatter();
    });

    test('verify highlight box drawer configs: no failure box', () => {
        const config = testSubject.getDrawerConfiguration(htmlElement, null);

        expect(config.showVisualization).toBe(true);
        expect(config.failureBoxConfig).toBeNull();
        expect(config.borderColor).toEqual('#CC0000');
        expect(config.textAlign).toEqual('center');
    });

    test('verify highlight box drawer configs with failure box', () => {
        const data = { isFailure: true } as IAssessmentVisualizationInstance;
        const config = testSubject.getDrawerConfiguration(htmlElement, data);

        expect(config.failureBoxConfig).toEqual(FailureInstanceFormatter.failureBoxConfig);
    });

    test('verify getDialogRenderer', () => {
        expect(testSubject.getDialogRenderer()).toBeNull();
    });
});
