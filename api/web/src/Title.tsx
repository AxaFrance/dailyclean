import { ApiStateConsumer } from "./ApiStateProvider";
import { withApiState } from "./apiStateUtils";
import { ApiState } from "./types/api";

interface HeaderTitleProps {
  apiState: ApiState;
}

function HeaderTitle({ apiState }: HeaderTitleProps) {
  return (
    <div className="af-title-bar">
      <div className="af-title-bar__wrapper container">
        <h1 className="af-title-bar__title">{apiState.data.namespace}</h1>
      </div>
    </div>
  );
}

const HeaderTitleWithApiState = withApiState(HeaderTitle, ApiStateConsumer);

export default HeaderTitleWithApiState;
