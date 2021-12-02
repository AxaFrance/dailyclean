import Loader, {LoaderModes} from '@axa-fr/react-toolkit-loader';
import Alert from '@axa-fr/react-toolkit-alert';
import '@axa-fr/react-toolkit-alert/dist/alert.scss';
import '@axa-fr/react-toolkit-loader/dist/spinner.scss';

export const resilienceStatus = {
    EMPTY: 'empty',
    LOADING: 'loading',
    POST: 'post',
    SUCCESS: 'success',
    ERROR: 'error',
  };
  
  const withLoader = Component => ({ loaderMode = LoaderModes.none, loaderText = null, ...otherProps }) => (
    <Loader mode={loaderMode} text={loaderText} >
      <Component {...otherProps} />
    </Loader>
  );
  
  const withResilience = Component => ({ status, loaderMode, ...otherProps }) => {
    const { ERROR, SUCCESS, LOADING, POST, EMPTY} = resilienceStatus;
    const ComponentWithLoader = withLoader(Component);
    return (
      <>
        {
          {
            [LOADING]: <ComponentWithLoader loaderMode={LoaderModes.get} {...otherProps} />,
            [POST]: <ComponentWithLoader loaderMode={LoaderModes.post} {...otherProps} />,
            [ERROR]: (
              <Component {...otherProps}>
                 <Alert classModifier="error" title="Error">
                 Error occured, please contact your administrator.
                </Alert>
              </Component>
            ),
            [SUCCESS]: (
              <Component {...otherProps}>
                 <Alert classModifier="success" title="Success">
                 Save done succesfully.
                </Alert>
              </Component>
            ),
            [EMPTY]: <Component {...otherProps} />,
          }[status]
        }
      </>
    );
  };

  export default withResilience;