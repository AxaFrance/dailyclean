import {
  Button,
  NumberInput,
  RadioInput,
} from "@axa-fr/design-system-slash-react";

import React, { ReactNode } from "react";
import "./FormConfiguration.scss";
import { endWeekModeEnum, startWeekModeEnum } from "./apiConstants";
import { FormState } from "./types/form";

const optionsStart = [
  {
    label: "Working days (Monday to Friday)",
    value: startWeekModeEnum.workedDays,
  },
  { label: "All days", value: startWeekModeEnum.allDays },
  { label: "Disabled", value: startWeekModeEnum.disabled },
];

const optionsEnd = [
  { label: "Enabled", value: endWeekModeEnum.enabled },
  { label: "Disabled", value: endWeekModeEnum.disabled },
];

const FormPlateformState = ({
  state,
  onChange,
  onSubmit,
  children,
}: {
  state: FormState;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}) => (
  <form className="af-form">
    {children}
    <h2 className="af-title--content">Configuration</h2>
    <NumberInput
      label="Start hour"
      id="startHour"
      name="startHour"
      helpMessage="a number between 0 and 23"
      onChange={onChange}
      classModifier="hour"
      disabled={state.form.startWeekMode.value === startWeekModeEnum.disabled}
      {...state.form.startHour}
    />
    <RadioInput
      label=""
      id="startWeekMode"
      name="startWeekMode"
      options={optionsStart}
      onChange={onChange}
      {...state.form.startWeekMode}
    />
    <NumberInput
      label="End hour"
      id="endHour"
      name="endHour"
      onChange={onChange}
      helpMessage="a number between 0 and 23"
      classModifier="hour"
      disabled={state.form.endWeekMode.value === endWeekModeEnum.disabled}
      {...state.form.endHour}
    />
    <RadioInput
      label=""
      id="endWeekMode"
      name="endWeekMode"
      options={optionsEnd}
      onChange={onChange}
      {...state.form.endWeekMode}
    />
    <Button
      className="offset-md-2 btn af-btn"
      onClick={onSubmit}
      disabled={state.submit.disabled}
      variant={state.submit.disabled ? "secondary" : "primary"}
    >
      <span className="af-btn__text">Submit</span>
    </Button>
  </form>
);

export default FormPlateformState;
