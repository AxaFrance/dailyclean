import { useState } from "react";
import { postAsync, urls } from "./api";
import { endWeekModeEnum, startWeekModeEnum } from "./apiConstants";
import FormState from "./FormState";
import { computeState } from "./state";
import { State, Workload } from "./types/api";
import { FormState as FormStateType } from "./types/form";
import withResilience from "./withResilience";

const FormWithResilience = withResilience(FormState);

interface FormStateContainerProps {
  fetch: (url: string, config?: RequestInit) => Promise<Response>;
  workloads: Workload[];
}

const initialState: FormStateType = {
  form: {
    startHour: {
      value: 9,
      message: "",
      forceDisplayMessage: false,
    },
    endHour: {
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

const computeFormState = (
  formState: FormStateType,
  state: State,
): FormStateType => {
  const submit = { disabled: true };
  if (formState.submit.disabled) {
    if (state === "STARTED") {
      return { ...formState, submit, started: { value: true } };
    } else if (state === "STOPPED") {
      return { ...formState, submit, started: { value: false } };
    }
  }
  return formState;
};

const FormStateContainer = ({ fetch, workloads }: FormStateContainerProps) => {
  const currentState = computeState(workloads);
  const [formState, setFormState] = useState(
    computeFormState(initialState, currentState),
  );
  const [prevState, setPrevState] = useState(computeState(workloads));

  if (currentState !== prevState) {
    setPrevState(currentState);
    setFormState((prev) => computeFormState(prev, currentState));
  }

  const onChange = (e: { name: string; value: boolean }) => {
    switch (e.name) {
      case "started": {
        const submit = { disabled: false };
        setFormState((prevState) => ({
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
    if (formState.submit.disabled) {
      return;
    }
    const url = formState.started.value ? urls.podStart : urls.podStop;
    void postAsync(fetch)(url, {}).then((response) => {
      if (response.status >= 300) {
        setFormState((prevState) => ({
          ...prevState,
          status: "ERROR",
        }));
      } else {
        setFormState((prevState) => ({
          ...prevState,
          status: "SUCCESS",
          submit: { disabled: true },
        }));
      }
    });
  };

  return (
    <FormWithResilience
      state={formState}
      onSubmit={onSubmit}
      onChange={onChange}
      status={formState.status}
    />
  );
};

export default FormStateContainer;
