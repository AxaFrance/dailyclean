import "@axa-fr/react-toolkit-alert/dist/alert.scss";
import "@axa-fr/react-toolkit-loader/dist/spinner.scss";
import React from "react";
import { endWeekModeEnum, startWeekModeEnum } from "./apiConstants";
import { ApiConfiguration } from "./types/api";

export const apiConfigurationDefault: ApiConfiguration = {
  endWeekMode: endWeekModeEnum.disabled,
  startWeekMode: startWeekModeEnum.disabled,
  endHour: 18,
  startHour: 9,
};

export const ApiConfigurationContext = React.createContext(
  apiConfigurationDefault,
);
