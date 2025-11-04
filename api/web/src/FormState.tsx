import Button from "@axa-fr/react-toolkit-button";
import "@axa-fr/react-toolkit-button/dist/button.scss";
import "@axa-fr/react-toolkit-form-core/dist/form.scss";
import "@axa-fr/react-toolkit-form-input-checkbox/dist/checkbox.scss";
import { ChoiceInput } from "@axa-fr/react-toolkit-form-input-choice";
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
  onChange: (e: { name: string; value: boolean }) => void;
  onSubmit: () => void;
  children?: React.ReactNode;
}) => (
  <>
    <form className="af-form">
      {children}
      <h2 className="af-title--content">State</h2>
      <ChoiceInput
        label="Turn environment"
        id="started"
        name="started"
        options={defaultOptions}
        value={state.started.value.toString()}
        onChange={onChange}
        classModifier="state"
        crossOrigin={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
      <Button
        className="offset-md-2 btn af-btn"
        id="id"
        onClick={onSubmit}
        disabled={state.submit.disabled}
        classModifier={state.submit.disabled ? "disabled" : ""}
      >
        <span className="af-btn__text">Submit</span>
      </Button>
    </form>
  </>
);

export default FormState;
