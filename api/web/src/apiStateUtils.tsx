import Loader, { LoaderModes } from "@axa-fr/react-toolkit-loader";
import React, { ComponentType } from "react";
import { ApiState } from "./types/api";

export const initialState: ApiState = {
  data: {
    state: "IN_PROGRESS",
    namespace: "",
    workloads: [],
  },
  status: "LOADING",
  firstStatus: "LOADING",
};

export const withApiState = <P extends object>(
  Component: ComponentType<P & { apiState: ApiState }>,
  ApiStateConsumer: React.Consumer<ApiState>,
) => {
  const WrappedComponent = (props: P) => {
    return (
      <ApiStateConsumer>
        {(store) =>
          store.firstStatus === "LOADING" ? (
            <Loader mode={LoaderModes.get}>Loading...</Loader>
          ) : (
            <Component {...props} apiState={store} />
          )
        }
      </ApiStateConsumer>
    );
  };
  WrappedComponent.displayName = `withApiState(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
