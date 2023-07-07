import ListState from "./ListState";
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import { apiConfigurationInit } from "./ApiConfigurationProvider";
import React from "react";

import { describe, it, expect } from 'vitest';
import mockStarted, {mockStateOff, mockStateInProgress} from "./ListState.mock.js"

describe(`ListState should`, () => {

    it(`be environment Started`, async () => {
        render(<ListState apiState={{data:mockStarted}} apiConfigurationState={apiConfigurationInit} />);
        const textLoader = screen.queryByText("ri-classify");
        expect(textLoader).toBeTruthy();
        const testStarted = screen.queryByText("Started");
        expect(testStarted).toBeTruthy();
    })

    it(`be environment Stopped`, async () => {
        render(<ListState apiState={{data:mockStateOff}} apiConfigurationState={apiConfigurationInit} />);
        const textLoader = screen.queryByText("alertmanager");
        expect(textLoader).toBeTruthy();
        const testStarted = screen.queryByText("Stopped");
        expect(testStarted).toBeTruthy();
    })

    it(`be environment InProgess`, async () => {
        render(<ListState apiState={{data:mockStateInProgress}} apiConfigurationState={apiConfigurationInit} />);
        const textLoader = screen.queryByText("alertmanager");
        expect(textLoader).toBeTruthy();
        const testStarted = screen.queryByText("In progress");
        expect(testStarted).toBeTruthy();
    })

});
