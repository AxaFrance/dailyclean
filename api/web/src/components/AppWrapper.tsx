import { ApiStateConsumer } from "../ApiStateProvider";
import { withApiState } from "../apiStateUtils";
import ConfigurationStateProvider from "./ConfigurationStateProvider";

const createAppWrapperComponent = (
  fetch: (url: string, config?: RequestInit) => Promise<Response>,
) => {
  return withApiState(
    (props) => <ConfigurationStateProvider {...props} fetch={fetch} />,
    ApiStateConsumer,
  );
};

export default createAppWrapperComponent;
