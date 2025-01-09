import React , { useState } from "react";
import ReactDOM from 'react-dom';
import App from './App';

import './scss/grid.css';
import './scss/reboot.css';
import '@axa-fr/react-toolkit-core/dist/assets/fonts/icons/af-icons.css';
import '@axa-fr/react-toolkit-core/src/common/scss/core.scss';
import FormStateContainer from "./FormStateContainer";
import ListStateContainer from "./ListStateContainer";
import FormConfigurationContainer from "./FormConfigurationContainer";

import './index.scss';
import ApiStateProvider, { withApiState } from './ApiStateProvider';
import { withApiConfiguration, ApiConfigurationContext, apiConfigurationInit } from './ApiConfigurationProvider';

const ListStateContainerWithApiConfiguration = withApiConfiguration(ListStateContainer);


const ConfigurationStateProvider = ({apiState}) => {
    const [configurationState, setConfigurationState] = useState(apiConfigurationInit);
    const fetch = window.fetch;
    return (<ApiConfigurationContext.Provider value={configurationState}>
        <App>
        <div className="container">
            <div className="row">
                <div className="col col-sm-12">
                    <FormStateContainer fetch={fetch} apiState={apiState} />
                </div>
            </div>
        </div>
        <div className="separator"/>
        <div className="container">
            <div className="row">
                <div className="col col-sm-12">
                    <ListStateContainerWithApiConfiguration fetch={fetch} apiState={apiState} />
                </div>
            </div>
        </div>
        <div className="separator"/>
        <div className="container">
            <div className="row">
                <div className="col col-sm-12">
                    <FormConfigurationContainer fetch={fetch} setConfigurationState={setConfigurationState} apiState={apiState} />
                </div>
            </div>
        </div>
    </App></ApiConfigurationContext.Provider>);
}

const ConfigurationStateProviderWithApiState = withApiState(ConfigurationStateProvider);

ReactDOM.render(
  <React.StrictMode>
      <ApiStateProvider fetch={window.fetch}>
        <ConfigurationStateProviderWithApiState />
      </ApiStateProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
