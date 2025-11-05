import { EndWeekMode, StartWeekMode } from "./api";

export type ResilienceStatus =
  | "EMPTY"
  | "LOADING"
  | "POST"
  | "SUCCESS"
  | "ERROR";

export type HourForm = {
  value: number;
  message: string;
  forceDisplayMessage: boolean;
};

export type Form = {
  startHour: HourForm;
  endHour: HourForm;
  startWeekMode: {
    value: StartWeekMode;
    message: string;
    forceDisplayMessage: boolean;
  };
  endWeekMode: {
    value: EndWeekMode;
    message: string;
    forceDisplayMessage: boolean;
  };
};

export type FormState = {
  form: Form;
  started: { value: boolean };
  submit: { disabled: boolean };
  status: ResilienceStatus;
};
