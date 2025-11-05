import React, { useEffect, useState } from "react";

import { getAsync, postAsync, urls } from "./api";
import { endWeekModeEnum, startWeekModeEnum } from "./apiConstants";
import FormConfiguration from "./FormConfiguration";
import {
  ApiConfiguration,
  EndWeekMode,
  StartWeekMode,
  Timeranges,
} from "./types/api";
import { Form, FormState, HourForm } from "./types/form";
import {
  computeInitialStateErrorMessage,
  genericHandleChange,
} from "./validation";
import withResilience from "./withResilience";

const FormWithResiliance = withResilience(FormConfiguration);

interface FormConfigurationContainerProps {
  fetch: (url: string, config?: RequestInit) => Promise<Response>;
  setConfigurationState: (state: ApiConfiguration) => void;
}

const preInitialForm: Form = {
  startHour: {
    value: 9,
    message: "",
  },
  endHour: {
    value: 18,
    message: "",
  },
  startWeekMode: {
    value: startWeekModeEnum.disabled,
    message: "",
  },
  endWeekMode: {
    value: endWeekModeEnum.enabled,
    message: "",
  },
};

const preInitialState: FormState = {
  form: preInitialForm,
  started: { value: false },
  submit: { disabled: true },
  status: "LOADING",
};

const ruleMin = "Please enter a value greater than or equal to {min}.";
const ruleMax = "Please enter a value less than or equal to {max}.";
const ruleRequired = "The field is required.";
const ruleDigit = "Please enter an integer.";
const rules = {
  startHour: [
    { required: { message: ruleRequired } },
    { digit: { message: ruleDigit } },
    { min: { min: 0, message: ruleMin } },
    { max: { max: 23, message: ruleMax } },
  ],
  startWeekMode: [{ required: { message: ruleRequired } }],
  endHour: [
    { required: { message: ruleRequired } },
    { digit: { message: ruleDigit } },
    { min: { min: 0, message: ruleMin } },
    { max: { max: 23, message: ruleMax } },
  ],
  endWeekMode: [{ required: { message: ruleRequired } }],
};

const initialState = computeInitialStateErrorMessage(preInitialState, rules);

const messageStartHourShouldBeBeforeEndHour =
  "The start time must not be equal to the end time";

const validateStartHour = (form: Form) => (value: string) => {
  if (
    form.endWeekMode.value === endWeekModeEnum.disabled ||
    form.startWeekMode.value === startWeekModeEnum.disabled
  ) {
    return { message: "", success: true };
  }
  const valueInt = parseInt(value, 10);
  if (valueInt === form.endHour.value) {
    return { message: messageStartHourShouldBeBeforeEndHour, success: false };
  }
  return { message: "", success: true };
};

const messageEndDateShouldBeAfterStartDate =
  "The end time must not be equal to the start time";
const validateEndHour = (form: Form) => (value: string) => {
  if (
    form.endWeekMode.value === endWeekModeEnum.disabled ||
    form.startWeekMode.value === startWeekModeEnum.disabled
  ) {
    return { message: "", success: true };
  }
  const valueInt = parseInt(value, 10);
  if (valueInt === form.startHour.value) {
    return { message: messageEndDateShouldBeAfterStartDate, success: false };
  }
  return { message: "", success: true };
};

function extractStartHour(cron_start: string | undefined) {
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

function extractStartWeek(cron_start: string | undefined) {
  if (cron_start) {
    const splitCronStart = cron_start.split(" ");
    if (splitCronStart.length >= 5) {
      return splitCronStart[4] === "1-5"
        ? startWeekModeEnum.workedDays
        : startWeekModeEnum.allDays;
    }
  }
  return startWeekModeEnum.disabled;
}

function extractEndHour(cron_stop: string | undefined) {
  if (cron_stop) {
    const splitCronEnd = cron_stop.split(" ");
    if (splitCronEnd.length >= 2) {
      return splitCronEnd[1];
    }
  }
  return "18";
}

const getTimeRangesAsync =
  (fetch: (url: string, config?: RequestInit) => Promise<Response>) =>
  async (setState: (state: FormState) => void, state: FormState) => {
    const response = await getAsync(fetch)(urls.timeranges);
    if (response.status >= 300) {
      setState({
        ...state,
        status: "ERROR",
      });
      return null;
    }
    const timeranges = (await response.json()) as {
      cron_start?: string;
      cron_stop?: string;
    };
    const cron_start = timeranges.cron_start;
    const startHour = extractStartHour(cron_start);
    const startWeekMode = extractStartWeek(cron_start);
    const startHourLocal = Number.parseInt(startHour);

    const endHour = extractEndHour(timeranges.cron_stop);
    const endHourLocal = Number.parseInt(endHour);
    const endWeekMode = timeranges.cron_stop
      ? endWeekModeEnum.enabled
      : endWeekModeEnum.disabled;
    const form = state.form;
    const newState: FormState = {
      ...state,
      form: {
        startHour: {
          ...form.startHour,
          value: startHourLocal,
        },
        endHour: {
          ...form.endHour,
          value: endHourLocal,
        },
        startWeekMode: { ...form.startWeekMode, value: startWeekMode },
        endWeekMode: { ...form.endWeekMode, value: endWeekMode },
      },
      status: "EMPTY",
    };
    setState(newState);
    return newState;
  };

const extractTimeRanges = (form: Form): Timeranges => {
  let startWeekMode: string | null;
  switch (form.startWeekMode.value) {
    case startWeekModeEnum.workedDays:
      startWeekMode = "1-5";
      break;
    case startWeekModeEnum.allDays:
      startWeekMode = "*";
      break;
    default:
      startWeekMode = null;
      break;
  }

  let endWeekMode: string | null;
  switch (form.endWeekMode.value) {
    case endWeekModeEnum.enabled:
      endWeekMode = "*";
      break;
    default:
      endWeekMode = null;
      break;
  }

  const timeranges: Timeranges = {};
  if (startWeekMode) {
    timeranges.cron_start = `0 ${form.startHour.value} * * ${startWeekMode}`;
  }
  if (endWeekMode) {
    timeranges.cron_stop = `0 ${form.endHour.value} * * *`;
  }

  return timeranges;
};

const onSubmitAsync =
  (fetch: (url: string, config?: RequestInit) => Promise<Response>) =>
  async (setState: (apiState: FormState) => void, state: FormState) => {
    if (state.submit.disabled) {
      return null;
    }
    const form = state.form;
    const timeranges = extractTimeRanges(form);
    setState({ ...state, status: "POST" });
    const response = await postAsync(fetch)(urls.timeranges, timeranges);
    const error = response.status >= 300;
    if (error) {
      setState({
        ...state,
        status: "ERROR",
      });
      return null;
    }

    const newState: FormState = {
      ...state,
      status: "SUCCESS",
      submit: { disabled: true },
    };
    setState(newState);
    return newState;
  };

const customStartHour = (form: Form) => {
  return {
    custom: {
      validateView: validateStartHour(form),
      validateModel: validateStartHour(form),
    },
  };
};
const customEndHour = (form: Form) => {
  return {
    custom: {
      validateView: validateEndHour(form),
      validateModel: validateEndHour(form),
    },
  };
};

const doChange = (
  state: FormState,
  e: { name: string; value: string | number },
  setState: (state: FormState) => void,
) => {
  const newRules = {
    ...rules,
    startHour: [...rules.startHour, customStartHour(state.form)],
    endHour: [...rules.endHour, customEndHour(state.form)],
  };
  const form = genericHandleChange(newRules, state.form, e) as Form;

  const isKo = Object.values(form).find(
    (
      field:
        | HourForm
        | {
            value: StartWeekMode | EndWeekMode;
            message: string;
          },
    ) => field.message,
  );
  const submit = { disabled: !!isKo };
  setState({ ...state, form, submit, status: "EMPTY" });
};

const FormConfigurationContainer = ({
  fetch,
  setConfigurationState,
}: FormConfigurationContainerProps) => {
  const [state, setState] = useState(initialState);
  useEffect(() => {
    void getTimeRangesAsync(fetch)(setState, initialState).then((newState) => {
      if (newState) {
        const form = newState.form;
        setConfigurationState({
          endWeekMode: form.endWeekMode.value,
          startWeekMode: form.startWeekMode.value,
          endHour: form.endHour.value,
          startHour: form.startHour.value,
        });
      }
    });
  }, [fetch, setConfigurationState]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    doChange(
      state,
      {
        name,
        value: type === "checkbox" ? (checked ? 1 : 0) : value,
      },
      setState,
    );
  };
  const onSubmit = () => {
    void onSubmitAsync(fetch)(setState, state).then((newState) => {
      if (newState) {
        const form = newState.form;
        setConfigurationState({
          endWeekMode: form.endWeekMode.value,
          startWeekMode: form.startWeekMode.value,
          endHour: form.endHour.value,
          startHour: form.startHour.value,
        });
      }
    });
  };
  return (
    <FormWithResiliance
      state={state}
      onSubmit={onSubmit}
      onChange={onChange}
      status={state.status}
    />
  );
};

export default FormConfigurationContainer;
