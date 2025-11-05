import FormConfigurationContainer from "./FormConfigurationContainer";
import Header from "./Header";
import { createMockFetch } from "./test-utils/mockResponse";

import "@axa-fr/design-system-slash-css/dist/common/common.scss";
import "./scss/grid.css";
import "./scss/reboot.css";

export default {
  title: "Configuration/FormConfigurationContainer",
  component: Header,
};

const fetch = (status = 200) => {
  return createMockFetch(
    status,
    () => ({ cron_start: "0 7 * * 1-5", cron_stop: "0 17 * * *" }),
    () => {},
  );
};

const setConfigurationState = () => {
  // Mock function for Storybook
};

interface TemplateArgs {
  fetch: (url: string, config?: RequestInit) => Promise<Response>;
  setConfigurationState: () => void;
}

const Template = (args: TemplateArgs) => (
  <FormConfigurationContainer {...args} />
);
Template.displayName = "FormConfigurationTemplate";

export const FormConfiguration = Template.bind({}) as typeof Template & {
  args: TemplateArgs;
};
FormConfiguration.args = {
  fetch: fetch(200),
  setConfigurationState,
};
