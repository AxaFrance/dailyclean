import FormStateContainer from "./FormStateContainer";
import Header from "./Header";
import { createMockFetch } from "./test-utils/mockResponse";

import "@axa-fr/design-system-slash-css/dist/common/common.scss";
import "./scss/grid.css";
import "./scss/reboot.css";

import { ComponentProps } from "react";
import mock from "./ListState.mock";

export default {
  title: "State/FormStateContainer",
  component: Header,
};

const fetch = (status = 200) => {
  return createMockFetch(
    status,
    () => ({ cron_start: "0 7 * * 1-5", cron_stop: "0 17 * * *" }),
    () => {},
  );
};

type TemplateArgs = ComponentProps<typeof FormStateContainer>;

const Template = (args: TemplateArgs) => <FormStateContainer {...args} />;
Template.displayName = "FormStateTemplate";

export const FormState = Template.bind({}) as typeof Template & {
  args: TemplateArgs;
};
FormState.args = {
  fetch: fetch(200),
  workloads: mock.workloads,
};
