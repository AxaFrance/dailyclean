import { useState } from "react";
import {
  ApiConfigurationContext,
  apiConfigurationDefault,
} from "../ApiConfigurationProvider";
import App from "../App";
import FormConfigurationContainer from "../FormConfigurationContainer";
import FormStateContainer from "../FormStateContainer";
import ListStateContainer from "../ListStateContainer";
import { ApiState } from "../types/api";

interface ConfigurationStateProviderProps {
  apiState: ApiState;
  fetch: (url: string, config?: RequestInit) => Promise<Response>;
}

const ConfigurationStateProvider = ({
  apiState,
  fetch,
}: ConfigurationStateProviderProps) => {
  const [configurationState, setConfigurationState] = useState(
    apiConfigurationDefault,
  );
  return (
    <ApiConfigurationContext.Provider value={configurationState}>
      <App>
        <div className="container">
          <div className="row">
            <div className="col col-sm-12">
              <FormStateContainer
                fetch={fetch}
                workloads={apiState.data.workloads}
              />
            </div>
          </div>
        </div>
        <div className="separator" />
        <div className="container">
          <div className="row">
            <div className="col col-sm-12">
              <ListStateContainer apiState={apiState.data} />
            </div>
          </div>
        </div>
        <div className="separator" />
        <div className="container">
          <div className="row">
            <div className="col col-sm-12">
              <FormConfigurationContainer
                fetch={fetch}
                setConfigurationState={setConfigurationState}
              />
            </div>
          </div>
        </div>
      </App>
    </ApiConfigurationContext.Provider>
  );
};

export default ConfigurationStateProvider;
