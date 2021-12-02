import React from "react";
import {endWeekModeEnum, startWeekModeEnum} from './FormConfiguration';
import '@axa-fr/react-toolkit-alert/dist/alert.scss';
import '@axa-fr/react-toolkit-loader/dist/spinner.scss';

export const ApiConfigurationContext = React.createContext();

export const ApiConfigurationConsumer = ApiConfigurationContext.Consumer;

export const apiConfigurationInit = {
  endWeekMode: endWeekModeEnum.disabled,
  startWeekMode : startWeekModeEnum.disabled,
  endHour: 18,
  startHour: 9
}

export const withApiConfiguration = Component => props => {
  return (<ApiConfigurationConsumer>
    {store => <Component {...props} apiConfigurationState={store? store : apiConfigurationInit} />}
  </ApiConfigurationConsumer>);
};

