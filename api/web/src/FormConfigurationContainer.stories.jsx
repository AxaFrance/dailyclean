import React from 'react';

import Header from './Header';
import FormConfigurationContainer from './FormConfigurationContainer';
import sleep from './sleep';

import './scss/grid.css';
import './scss/reboot.css';
import '@axa-fr/react-toolkit-core/dist/assets/fonts/icons/af-icons.css';
import '@axa-fr/react-toolkit-core/src/common/scss/core.scss';

export default {
  title: 'Configuration/FormConfigurationContainer',
  component: Header,
};

const getUTCHour = (hour) => hour;
const getLocalHour = (hour) => hour;

const fetch = (status =200) => async (url, config) => {
  if(config.method === "POST") {
    return {
      status:status,
      json: async () => {
          await sleep(1);
          return {};
      },
  };
  }
  await sleep(1);
  return {
      status:status,
      json: async () => {
          await sleep(1);
          return {"cron_start":"0 7 * * 1-5","cron_stop":"0 17 * * *"};
      },
  };
};

const setConfigurationState = () => console.log("updateRatio");
const Template = (args) => <FormConfigurationContainer {...args} />;

export const FormConfiguration = Template.bind({});
FormConfiguration.args = {
  getUTCHour,
  getLocalHour,
  fetch: fetch(200),
  setConfigurationState
};
