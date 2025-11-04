import "@axa-fr/react-toolkit-layout-header/dist/Title/title-bar.scss";
import { ApiStateConsumer } from "./ApiStateProvider";
import { withApiState } from "./apiStateUtils";
import { ApiState } from "./types/api";

interface TitleProps {
  apiState: ApiState;
}

function Title({ apiState }: TitleProps) {
  return (
    <div className="af-title-bar">
      <div className="af-title-bar__wrapper container">
        <h1 className="af-title-bar__title">{apiState.data.namespace}</h1>
      </div>
    </div>
  );
}

const TitleWithApiState = withApiState(Title, ApiStateConsumer);

export default TitleWithApiState;
