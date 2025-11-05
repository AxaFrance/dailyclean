import { Button, ChoiceInput } from "@axa-fr/design-system-slash-react";
import React from "react";
import "./FormState.scss";
import { FormState as FormStateType } from "./types/form";

const defaultOptions = [
  { label: "on", value: true, id: "1" },
  { label: "off", value: false, id: "2" },
];

const FormState = ({
  state,
  onChange,
  onSubmit,
  children,
}: {
  state: FormStateType;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <>
      <form className="af-form">
        {children}
        <h2 className="af-title--content">State</h2>
        <ChoiceInput
          label="Turn environment"
          id="started"
          name="started"
          options={defaultOptions}
          value={state.started.value}
          onChange={onChange}
          classModifier="state"
        />
        <Button
          className="offset-md-2 btn af-btn"
          onClick={onSubmit}
          disabled={state.submit.disabled}
        >
          <span className="af-btn__text">Submit</span>
        </Button>
      </form>
    </>
  );
};

export default FormState;
