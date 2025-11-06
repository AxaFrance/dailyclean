import { Alert, Loader } from "@axa-fr/design-system-slash-react";
import { ComponentProps, ComponentType, forwardRef } from "react";
import { ResilienceStatus } from "./types/form";

interface WithResilienceProps {
  status: ResilienceStatus;
  loaderMode?: ComponentProps<typeof Loader>["mode"];
}

const withResilience = <P extends object>(Component: ComponentType<P>) => {
  const WrappedComponent = forwardRef<HTMLElement, P & WithResilienceProps>(
    (props, ref) => {
      const { status, loaderMode, ...componentProps } = props;

      switch (status) {
        case "LOADING":
          return (
            <Loader mode={loaderMode || "get"}>
              <Component {...(componentProps as P)} ref={ref} />
            </Loader>
          );

        case "POST":
          return (
            <Loader mode={loaderMode || "post"}>
              <Component {...(componentProps as P)} ref={ref} />
            </Loader>
          );

        case "ERROR":
          return (
            <Component {...(componentProps as P)} ref={ref}>
              <Alert classModifier="error" title="Error">
                Error occured, please contact your administrator.
              </Alert>
            </Component>
          );

        case "SUCCESS":
          return (
            <Component {...(componentProps as P)} ref={ref}>
              <Alert classModifier="success" title="Success">
                Save done succesfully.
              </Alert>
            </Component>
          );

        case "EMPTY":
        default:
          return <Component {...(componentProps as P)} ref={ref} />;
      }
    },
  );

  WrappedComponent.displayName = `withResilience(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default withResilience;
