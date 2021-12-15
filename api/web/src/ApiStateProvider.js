import React, {useEffect, useState, useRef} from "react";
import Loader, {LoaderModes} from '@axa-fr/react-toolkit-loader';
import {getAsync, urls} from './api'
import '@axa-fr/react-toolkit-alert/dist/alert.scss';
import '@axa-fr/react-toolkit-loader/dist/spinner.scss';

import {resilienceStatus} from './withResilience';
const ApiStateContext = React.createContext();

export const ApiStateConsumer = ApiStateContext.Consumer;

export const withApiState = Component => props => {
  return (<ApiStateConsumer>
    {store =>
      store.firstStatus === resilienceStatus.LOADING ? (
        <Loader mode={LoaderModes.get}/>
      ) : (
        <Component {...props} apiState={store} />
      )
    }
  </ApiStateConsumer>);
};

const loadStateAsync = (fetch) => async (setState, state) => {
  setState({
      ...state,
      status: resilienceStatus.LOADING,
  });
  const response = await getAsync(fetch)(urls.status);
  if (response.status >= 300) {
      setState({
          ...state,
          status: resilienceStatus.ERROR,
          firstStatus: resilienceStatus.EMPTY,
      });
      return;
  }
  const data = await response.json();
  setState({
      ...state,
      data,
      status: resilienceStatus.EMPTY,
      firstStatus: resilienceStatus.EMPTY,
  });
};

const initialState = {
  data: {
      state:"",
      namespace: "",
      deployments:[]
  },
  status: resilienceStatus.LOADING,
  firstStatus: resilienceStatus.LOADING,
};

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const ApiStateProvider = ({fetch, children}) => {
  const [state, setState] = useState(initialState);

  useInterval(() => {
      if(state.status !== resilienceStatus.LOADING){
          loadStateAsync(fetch)(setState, state);
      }
    }, state.status === resilienceStatus.ERROR ? 15000: 2000);

  useEffect(() => {
      loadStateAsync(fetch)(setState, state);
    }, []);
  return (<ApiStateContext.Provider value={state}>
    {children}
  </ApiStateContext.Provider>);
};

export default ApiStateProvider;