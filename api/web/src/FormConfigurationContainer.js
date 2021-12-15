import React, {useEffect, useState} from "react";

import withResilience, {resilienceStatus} from './withResilience';
import {getAsync, postAsync, urls} from './api'
import FormConfiguration, {endWeekModeEnum, startWeekModeEnum} from './FormConfiguration';
import {computeInitialStateErrorMessage, genericHandleChange,} from './validation';

const FormWithResiliance = withResilience(FormConfiguration);

const preInitialState  = {
    form: {
        startHour: {viewValue :"9", value :9, message:"", forceDisplayMessage:false},
        endHour: {viewValue :"18", value :18, message:"", forceDisplayMessage:false},
        startWeekMode: {value : startWeekModeEnum.disabled, message:"", forceDisplayMessage:false},
        endWeekMode: {value : endWeekModeEnum.enabled, message:"", forceDisplayMessage:false}
        },
    submit: {disabled: true},
    status: resilienceStatus.LOADING,
};

const ruleMin = "Please enter a value greater than or equal to {min}.";
const ruleMax = "Please enter a value less than or equal to {max}.";
const ruleRequired = "The field is required.";
const ruleDigit = "Please enter an integer.";
const rules = {
    startHour: [
        {required: {message: ruleRequired}},
        {digit: {message: ruleDigit}},
        { min: {min:0 ,message: ruleMin }},
        { max: {max:23, message: ruleMax }}
    ],
    startWeekMode: [{required: {message:ruleRequired}}],
    endHour: [
        {required: {message:ruleRequired}},
        {digit: {message:ruleDigit}},
        { min: {min:0, message: ruleMin }},
        { max: {max:23, message:ruleMax }}
    ],
    endWeekMode: [{required: {message:ruleRequired}}],
};

const initialState = computeInitialStateErrorMessage(preInitialState, rules);

export const messageStartHourShouldBeBeforeEndHour = "The start time must not be equal to the end time";
const validateStartHour = (form) => (value) => {
    if(form.endWeekMode.value === endWeekModeEnum.disabled || form.startWeekMode.value === startWeekModeEnum.disabled){
        return { message: "", success: true };
    }
    const valueInt = parseInt(value, 10);
    if(valueInt === form.endHour.value){
        return { message: messageStartHourShouldBeBeforeEndHour, success: false };
    }
    return { message: "", success: true };
};

export const messageEndDateShouldBeAfterStartDate = "The end time must not be equal to the start time";
const validateEndHour = (form) => (value) => {
    if(form.endWeekMode.value === endWeekModeEnum.disabled || form.startWeekMode.value === startWeekModeEnum.disabled){
        return { message: "", success: true };
    }
    const valueInt = parseInt(value, 10);
    if(valueInt === form.startHour.value){
        return { message: messageEndDateShouldBeAfterStartDate, success: false };
    }
    return { message: "", success: true };
};

function extractStartHour(cron_start) {
    if (cron_start) {
        const splitCronStart = cron_start.split(" ");
        if (splitCronStart.length >= 2) {
            const cronStart = splitCronStart[1];
            if (cronStart !== "*") {
                return cronStart;
            }
        }
    }
    return "9";
}

function extractStartWeek(cron_start) {
    if (cron_start) {
        const splitCronStart = cron_start.split(" ");
        if (splitCronStart.length >= 5) {
            return splitCronStart[4] === "1-5" ? startWeekModeEnum.workedDays : startWeekModeEnum.allDays;
        }
    }
    return startWeekModeEnum.disabled;
}

function extractEndHour(cron_stop) {
    if (cron_stop) {
        const splitCronEnd = cron_stop.split(" ");
        if(splitCronEnd.length >= 2) {
            return splitCronEnd[1];
        }
    }
    return "18";
}

const getTimeRangesAsync = (fetch) => (getLocalHour) => async (setState, state) => {
    const response = await getAsync(fetch)(urls.timeranges);
    if (response.status >= 300) {
        setState({
            ...state,
            status: resilienceStatus.ERROR,
        });
        return null;
    }
    const timeranges = await response.json();
    const cron_start = timeranges.cron_start;
    let startHour = extractStartHour(cron_start);
    const startWeekMode = extractStartWeek(cron_start);
    let startHourLocal = getLocalHour(parseInt(startHour, 10));
    
    
    const endHour = extractEndHour(timeranges.cron_stop);
    let endHourLocal = getLocalHour(parseInt(endHour, 10));
    const endWeekMode = timeranges.cron_stop ? endWeekModeEnum.enabled : endWeekModeEnum.disabled;
    const form = state.form;
    const newState = {
        ...state,
        form: {
            startHour: {...form.startHour, viewValue: startHourLocal.toString(), value: startHourLocal},
            endHour: {...form.endHour, viewValue: endHourLocal.toString(), value: endHourLocal},
            startWeekMode: {...form.startWeekMode, value: startWeekMode},
            endWeekMode: {...form.endWeekMode, value: endWeekMode}
        },
        status: resilienceStatus.EMPTY,
    }
    setState(newState);
    return newState;
};

const extractTimeRanges=getUTCHour =>(form) => {
    
    let startWeekMode;
    switch (form.startWeekMode.value){
        case startWeekModeEnum.workedDays:
            startWeekMode="1-5";
            break;
        case startWeekModeEnum.allDays:
            startWeekMode="*";
            break;
        default:
            startWeekMode=null;
            break;
    }
    
    let endWeekMode;
    switch (form.endWeekMode.value){
        case endWeekModeEnum.enabled:
            endWeekMode="*";
            break;
        default:
            endWeekMode=null;
            break;
    }
    
    const timeranges = {};
    if(startWeekMode){
        timeranges.cron_start = `0 ${getUTCHour(form.startHour.value).toString()} * * ${startWeekMode}`;
    }
    if(endWeekMode){
        timeranges.cron_stop = `0 ${getUTCHour(form.endHour.value).toString()} * * *`;
    }
    
    return timeranges;
}

const onSubmitAsync = fetch => getUTCHour => async (setState, state) => {
    if (state.submit.disabled) {
        return null;
    }
    const form = state.form;
    const timeranges = extractTimeRanges(getUTCHour)(form);
    setState({...state, status: resilienceStatus.POST});
    const response = await postAsync(fetch)(urls.timeranges, timeranges);
    const error = response.status >= 300;
    if (error) {
        setState({
            ...state,
            status: resilienceStatus.ERROR,
        });
        return null
    } 
        
    const newState = {
            ...state,
            status: resilienceStatus.SUCCESS,
            submit: {disabled: true}
        };
    setState(newState);
    return newState
};

const customStartHour = (form) => {
    return {
        custom: {
            validateView: validateStartHour(form),
            validateModel: validateStartHour(form)
        }
    }
};
const customEndHour = (form) => {
    return {
        custom: {
            validateView: validateEndHour(form),
            validateModel: validateEndHour(form)
        }
    }
};

function validateField(e, form, updatedRules, fieldName, disabledValue, fieldName1, fieldName2 ) {
    if (e.name === fieldName || e.name === fieldName1) {
        if (e.value === disabledValue) {
            form[fieldName1] = {...form[fieldName1], message: ""}
            
            if(form[fieldName2].message){
                form = genericHandleChange(updatedRules, form, {name: fieldName2, ...form[fieldName2]});
                if(form[fieldName2].message) {
                    form[fieldName2].forceDisplayMessage = true;
                }
            }
            
        } else {
            form = genericHandleChange(updatedRules, form, {name: fieldName1,  ...form[fieldName1]});
            form = genericHandleChange(updatedRules, form, {name: fieldName2, ...form[fieldName2]});
            if (form[fieldName1].message) {
                form[fieldName1].forceDisplayMessage = true;
            }
            if (form[fieldName2].message) {
                form[fieldName2].forceDisplayMessage = true;
            }
        }
    }
    return form;
}

const doChange = (state, e, setState) => {
    const newRules = {
        ...rules,
        startHour: [...rules.startHour, customStartHour(state.form)],
        endHour: [...rules.endHour, customEndHour(state.form)]
    };
    let form = genericHandleChange(newRules, state.form, e);

    const updatedRules = {
        ...rules,
        startHour: [...rules.startHour, customStartHour(form)],
        endHour: [...rules.endHour, customEndHour(form)]
    };

    form = validateField(e, form, updatedRules, "startWeekMode", startWeekModeEnum.disabled, "startHour", "endHour" );
    form = validateField(e, form, updatedRules, "endWeekMode", endWeekModeEnum.disabled, "endHour", "startHour" );

    const isKo = Object.values(form).find(field => field.message);
    const submit = {disabled: isKo};
    setState({...state, form, submit, status: resilienceStatus.EMPTY});
};

const FormConfigurationContainer = ({fetch, getLocalHour, getUTCHour, setConfigurationState}) => {
    const [state, setState] = useState(initialState);
    useEffect(() => {
        getTimeRangesAsync(fetch)(getLocalHour)(setState, state).then(newState => {
            if(newState) {
                const form = newState.form;
                setConfigurationState({
                    endWeekMode: form.endWeekMode.value,
                    startWeekMode : form.startWeekMode.value,
                    endHour: form.endHour.value,
                    startHour: form.startHour.value
                  });
            }
        } );
    }, []);
    const onChange= (e) => doChange(state, e, setState);
    const onSubmit= () => {
        onSubmitAsync(fetch)(getUTCHour)(setState, state).then(newState => {
            if(newState) {
                const form = newState.form;
                setConfigurationState({
                    endWeekMode: form.endWeekMode.value,
                    startWeekMode : form.startWeekMode.value,
                    endHour: form.endHour.value,
                    startHour: form.startHour.value
                  });
            }
        } );
    }
    return (<FormWithResiliance state={state} onSubmit={onSubmit} onChange={onChange} status={state.status} />);
};

export default FormConfigurationContainer;
