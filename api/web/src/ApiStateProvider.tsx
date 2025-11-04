import "@axa-fr/react-toolkit-alert/dist/alert.scss";
import "@axa-fr/react-toolkit-loader/dist/spinner.scss";
import React, { useEffect, useRef, useState } from "react";
import { getAsync, urls } from "./api";
import { initialState } from "./apiStateUtils";
import { ApiData, ApiState } from "./types/api";

const ApiStateContext = React.createContext<ApiState>(initialState);

export const ApiStateConsumer = ApiStateContext.Consumer;

const loadStateAsync =
  (fetch: (url: string, config?: RequestInit) => Promise<Response>) =>
  async (setState: React.Dispatch<React.SetStateAction<ApiState>>) => {
    setState((prev) => ({
      ...prev,
      status: "LOADING",
    }));
    const response = await getAsync(fetch)(urls.status);
    if (response.status >= 300) {
      setState((prev) => ({
        ...prev,
        status: "ERROR",
        firstStatus: "EMPTY",
      }));
      return;
    }
    const data = (await response.json()) as ApiData;
    setState((prev) => ({
      ...prev,
      data,
      status: "EMPTY",
      firstStatus: "EMPTY",
    }));
  };

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => savedCallback.current(), delay);
    return () => {
      clearInterval(id);
    };
  }, [delay]);
}

const ApiStateProvider = ({
  fetch,
  children,
}: {
  fetch: (url: string, config?: RequestInit) => Promise<Response>;
  children: React.ReactNode;
}) => {
  const [state, setState] = useState(initialState);

  useInterval(
    () => {
      if (state.status !== "LOADING") {
        void loadStateAsync(fetch)(setState);
      }
    },
    state.status === "ERROR" ? 15000 : 2000,
  );

  useEffect(() => {
    void loadStateAsync(fetch)(setState);
  }, [fetch, setState]);

  return (
    <ApiStateContext.Provider value={state}>
      {children}
    </ApiStateContext.Provider>
  );
};

export default ApiStateProvider;
