import "@axa-fr/design-system-slash-css/dist/common/common.scss";
import Header from "./Header";
import ListStateContainer from "./ListStateContainer";
import "./scss/grid.css";
import "./scss/reboot.css";
import { createMockFetch } from "./test-utils/mockResponse";

import mock from "./ListState.mock.js";

export default {
  title: "ListState/ListStateContainer",
  component: Header,
};

const fetch = (status = 200) => {
  return createMockFetch(status, () => mock);
};

interface TemplateArgs {
  fetch: (url: string, config?: RequestInit) => Promise<Response>;
}

const Template = (args: TemplateArgs) => (
  <ListStateContainer {...args} apiState={mock} />
);
Template.displayName = "ListStateTemplate";

export const ListStateStory = Template.bind({}) as typeof Template & {
  args: TemplateArgs;
};
ListStateStory.args = {
  fetch: fetch(200),
};
