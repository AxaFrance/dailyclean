import { useEffect, useState } from "react";

import { postAsync, urls } from "./api";
import { endWeekModeEnum, startWeekModeEnum } from "./apiConstants";
import FormState from "./FormState";
import { computeState } from "./state";
import { ApiState } from "./types/api";
import { FormState as FormStateType } from "./types/form";
import withResilience from "./withResilience";

const FormWithResilience = withResilience(FormState);

interface FormStateContainerProps {
  fetch: (url: string, config?: RequestInit) => Promise<Response>;
  apiState: ApiState;
}

const initialState: FormStateType = {
  form: {
    startHour: {
      viewValue: "9",
      value: 9,
      message: "",
      forceDisplayMessage: false,
    },
    endHour: {
      viewValue: "18",
      value: 18,
      message: "",
      forceDisplayMessage: false,
    },
    startWeekMode: {
      value: startWeekModeEnum.disabled,
      message: "",
      forceDisplayMessage: false,
    },
    endWeekMode: {
      value: endWeekModeEnum.enabled,
      message: "",
      forceDisplayMessage: false,
    },
  },
  started: { value: false },
  submit: { disabled: true },
  status: "EMPTY",
};

const FormStateContainer = ({ fetch, apiState }: FormStateContainerProps) => {
  const [state, setState] = useState(initialState);
  const data = apiState.data;
  const workloads = data.workloads;
  const currentState = computeState(workloads);
  useEffect(() => {
    setState((prevState) => {
      const submit = { disabled: true };
      if (prevState.submit.disabled) {
        if (currentState === "STARTED") {
          return { ...prevState, submit, started: { value: true } };
        } else if (currentState === "STOPPED") {
          return { ...prevState, submit, started: { value: false } };
        }
      }
      return prevState;
    });
  }, [currentState]);

  const onChange = (e: { name: string; value: boolean }) => {
    switch (e.name) {
      case "started": {
        const submit = { disabled: false };
        setState((prevState) => ({
          ...prevState,
          started: { value: e.value },
          submit,
          status: "EMPTY",
        }));
        break;
      }
      default:
        break;
    }
  };

  const onSubmit = () => {
    if (state.submit.disabled) {
      return;
    }
    const url = state.started.value ? urls.podStart : urls.podStop;
    void postAsync(fetch)(url, {}).then((response) => {
      if (response.status >= 300) {
        setState((prevState) => ({
          ...prevState,
          status: "ERROR",
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          status: "SUCCESS",
          submit: { disabled: true },
        }));
      }
    });
  };

  return (
    <FormWithResilience
      state={state}
      onSubmit={onSubmit}
      onChange={onChange}
      status={state.status}
    />
  );
};

export default FormStateContainer;
