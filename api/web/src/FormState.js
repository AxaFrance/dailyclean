import React from 'react';

import Button from '@axa-fr/react-toolkit-button';

import { ChoiceInput } from '@axa-fr/react-toolkit-form-input-choice';

import '@axa-fr/react-toolkit-form-input-checkbox/dist/checkbox.scss';
import '@axa-fr/react-toolkit-button/dist/button.scss';
import '@axa-fr/react-toolkit-form-core/dist/form.scss';

import './FormState.scss';

const defaultOptions = [
    { label: 'on', value: true, id: '1' },
    { label: 'off', value: false, id: '2' },
];

const FormState = ({state, onChange, onSubmit, children}) => 
            <>
                    <form className="af-form">
                        {children}
                        <h2 className="af-title--content">State</h2>
                        <ChoiceInput
                            label="Turn environment"
                            id='started'
                            name="started"
                            options={defaultOptions}
                            value={state.started.value}
                            onChange={onChange}
                            classModifier="state"
                        />
                        <Button className="offset-md-2 btn af-btn" id="id" onClick={onSubmit} disabled={state.submit.disabled} classModifier={state.submit.disabled ? "disabled": ""}>
                            <span className="af-btn__text">Submit</span>
                        </Button>
                    </form>
            </>;


export default FormState;