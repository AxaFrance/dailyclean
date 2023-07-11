import React from 'react';

import Header from './Header';
import ListStateContainer from './ListStateContainer';
import sleep from './sleep';
import './scss/grid.css';
import './scss/reboot.css';
import '@axa-fr/react-toolkit-core/dist/assets/fonts/icons/af-icons.css';
import '@axa-fr/react-toolkit-core/src/common/scss/core.scss';

import mock from './ListState.mock.js';
import {endWeekModeEnum, startWeekModeEnum} from "./apiConstants.js";

export default {
  title: 'ListState/ListStateContainer',
  component: Header,
};


const fetch = (status =200) => async (url, config) => {
  await sleep(200);
  return {
      status:status,
      json: async () => {
          await sleep(1);
          return mock;
        },
      };
};


const apiConfiguration = {
    endWeekMode: endWeekModeEnum.enabled,
    startWeekMode : startWeekModeEnum.disabled,
    endHour: 18,
    startHour: 9
}
const Template = (args) => <ListStateContainer {...args} apiState={{data:mock}} apiConfigurationState={apiConfiguration} />;

export const ListStateStory = Template.bind({});
ListStateStory.args = {
  fetch: fetch(200)
};
