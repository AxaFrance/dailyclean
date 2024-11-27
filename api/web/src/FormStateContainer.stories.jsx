import React from 'react';

import Header from './Header';
import FormStateContainer from './FormStateContainer';
import sleep from './sleep';


import './scss/grid.css';
import './scss/reboot.css';
import '@axa-fr/react-toolkit-core/dist/assets/fonts/icons/af-icons.css';
import '@axa-fr/react-toolkit-core/src/common/scss/core.scss';

import mock from './ListState.mock.js';
export default {
  title: 'State/FormStateContainer',
  component: Header,
};

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

const Template = (args) => <FormStateContainer {...args} />;

export const FormState = Template.bind({});
FormState.args = {
  fetch: fetch(200),
  apiState:{data:mock}
};
