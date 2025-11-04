import { ApiStateConsumer } from "../ApiStateProvider";
import { withApiState } from "../apiStateUtils";
import ConfigurationStateProvider from "./ConfigurationStateProvider";

interface AppWrapperProps {
  fetch: (url: string, config?: RequestInit) => Promise<Response>;
}

const AppWrapper = ({ fetch }: AppWrapperProps) => {
  const ConfigurationStateProviderWithApiState = withApiState(
    (props) => <ConfigurationStateProvider {...props} fetch={fetch} />,
    ApiStateConsumer,
  );

  return <ConfigurationStateProviderWithApiState />;
};

export default AppWrapper;
