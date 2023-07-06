import React, {useState, useEffect} from "react";

import withResilience, { resilienceStatus } from './withResilience';
import {postAsync, urls} from './api'
import FormState from './FormState';
import {STOPPED, STARTED, computeState} from './state';

const FormWithResiliance = withResilience(FormState);

const initialState = {
    started: { value: false },
    submit: {disabled: true},
    status: resilienceStatus.EMPTY,
}

const FormStateContainer= ({fetch, apiState}) => {

    const [state, setState] = useState(initialState)
    let data = apiState.data;
    let workloads = data.workloads;
    const currentState = computeState(workloads);
    useEffect(() => {
        const submit = {disabled:true};
        if(state.submit.disabled) {
            if(currentState === STARTED) {
                setState({...state, submit, started:{value: true}});
            } else if(currentState === STOPPED) {
                setState({...state, submit, started:{value: false}});
            }
        }
    }, [currentState]);

    const onChange= (e) =>{
        switch(e.name){
            case "started":
                const submit = {disabled:false};
                setState({...state, started:{value: e.value}, submit, status: resilienceStatus.EMPTY });
                break;
            default:
                break;
        }
    };

    const onSubmit= () => {
        if(state.submit.disabled){
            return;
        }
        let url = state.started.value ? urls.podStart : urls.podStop;
        postAsync(fetch)(url).then(response => {
            if (response.status >= 300) {
                setState({
                    ...state,
                    status: resilienceStatus.ERROR,
                });
            } else {
                setState({
                    ...state,
                    status: resilienceStatus.SUCCESS,
                    submit: {disabled:true}
                });
            }
        });
    };

    return (<FormWithResiliance state={state} onSubmit={onSubmit} onChange={onChange} status={state.status} currentState={currentState} />);
}

export default FormStateContainer;
