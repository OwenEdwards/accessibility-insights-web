// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { findIndex, forEach, indexOf, keys } from 'lodash';

import { FeatureFlags, getAllFeatureFlagDetails, getDefaultFeatureFlagValues } from '../../../../common/feature-flags';
import { FeatureFlagStoreData } from '../../../../common/types/store-data/feature-flag-store-data';

describe('FeatureFlagsTest', () => {
    let featureFlagValues: FeatureFlagStoreData;

    beforeEach(() => {
        featureFlagValues = getDefaultFeatureFlagValues();
    });

    test('default values', () => {
        const expectedValues: FeatureFlagStoreData = {
            [FeatureFlags.exportResult]: true,
            [FeatureFlags.shadowDialog]: false,
            [FeatureFlags.newAssessmentExperience]: true,
            [FeatureFlags.showAllAssessments]: false,
            [FeatureFlags.logTelemetryToConsole]: false,
            [FeatureFlags.showAllFeatureFlags]: false,
            [FeatureFlags.scoping]: false,
            [FeatureFlags.showBugFiling]: true,
            [FeatureFlags.showInstanceVisibility]: false,
            [FeatureFlags.highContrastMode]: true,
        };

        const featureFlagValueKeys = keys(featureFlagValues);
        const expectedValueKeys = keys(expectedValues);

        expect(featureFlagValueKeys).toEqual(expectedValueKeys);

        forEach(expectedValues, (value, key) => {
            expect(featureFlagValues[key]).toEqual(value);
        });
    });

    test('all feature flag have a corresponding feature flag value', () => {
        const featureFlags = keys(FeatureFlags).sort();
        const featureFlagValueKeys = keys(featureFlagValues).sort();

        expect(featureFlagValueKeys).toEqual(featureFlags);
    });

    test('feature flag value is not null nor undefined', () => {
        const featureFlags = keys(FeatureFlags);
        forEach(featureFlags, flagName => {
            expect(featureFlagValues[flagName]).toBeDefined();
        });
    });

    test('feature flag property name should be the same as the property value', () => {
        const featureFlagNames = keys(FeatureFlags);

        forEach(featureFlagNames, flagName => {
            expect(flagName).toEqual(FeatureFlags[flagName]);
        });
    });

    test('all feature flags should have matching details', () => {
        const names = keys(FeatureFlags);
        const details = getAllFeatureFlagDetails();

        forEach(names, featureFlagName => {
            expect(findIndex(details, ['id', featureFlagName])).not.toBe(-1);
        });
    });

    test('all details should have matching feature flags', () => {
        const details = getAllFeatureFlagDetails();
        const names = keys(FeatureFlags);

        forEach(details, detail => {
            expect(indexOf(names, detail.id)).not.toBe(-1);
        });
    });

    test('all details should have non-empty names and descriptions', () => {
        const details = getAllFeatureFlagDetails();

        forEach(details, detail => {
            expect(detail.displayableName.length > 0).toBeTruthy();
            expect(detail.displayableDescription.length > 0).toBeTruthy();
        });
    });
});
