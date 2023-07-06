import ListState from "./ListState";
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import { apiConfigurationInit } from "./ApiConfigurationProvider";
import React from "react";

import { describe, it, expect } from 'vitest';
import mock from "./ListState.mock.js"

describe(`ListState`, () => {

    it(`component should load data with success`, async () => {
        render(<ListState apiState={{data:mock}} apiConfigurationState={apiConfigurationInit} />);
        const textLoader = screen.queryByText("ri-classify");
        expect(textLoader).toBeTruthy();
    });

});
