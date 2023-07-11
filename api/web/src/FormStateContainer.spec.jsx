import FormStateContainer from "./FormStateContainer";
import '@testing-library/jest-dom';
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import React from "react";
import { resilienceStatus } from './withResilience';
import sleep from './sleep';
import {STOPPED} from './state';
import { describe, it, expect } from 'vitest';

const fetch = (status =200) => async () => {
    await sleep(1);
    return {
        status:status,
        json: async () => {
            await sleep(1);
            return {  };
        },
    };
};

const initialState = {
    data: {
        state:STOPPED,
        namespace: "",
        workloads:[]
    },
    status: resilienceStatus.EMPTY,
}
const delay = ms => new Promise(res => setTimeout(res, ms));
describe(`FormStateContainer`, () => {

    it(`submit should save data with success`, async () => {
        render(<FormStateContainer fetch={fetch(200)} apiState={initialState}/>);
        const textLoader = screen.queryByText("State");
        
        expect(textLoader).toBeTruthy();
        expect(screen.getByRole('button')).toHaveAttribute('disabled');

        const item = screen.queryByText("off");
        fireEvent.click(item);
        expect(screen.getByRole('button')).not.toHaveAttribute('disabled');

        const fireSumbit = () => {
            const item = screen.queryByText("Submit");
            fireEvent.click(item);
        };

        fireSumbit();
        await waitFor(() => screen.getByRole('alert'));

        expect(screen.getByRole('alert')).toHaveTextContent("SuccessSave done succesfully.");
        expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it(`submit should fail`, async () => {
        render(<FormStateContainer fetch={fetch(500)} apiState={initialState}/>);
        const textLoader = screen.queryByText("State");
        expect(textLoader).toBeTruthy();
        expect(screen.getByRole('button')).toHaveAttribute('disabled');

        const item = screen.queryByText("off");
        fireEvent.click(item);
        expect(screen.getByRole('button')).not.toHaveAttribute('disabled');

        const fireSumbit = () => {
            const item = screen.queryByText("Submit");
            fireEvent.click(item);
        };

        fireSumbit();
        await waitFor(() => screen.getByRole('alert'));

        expect(screen.getByRole('alert')).toHaveTextContent("ErrorError occured, please contact your administrator.");
        expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
    });

});
