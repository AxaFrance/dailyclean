
import '@axa-fr/react-toolkit-layout-header/dist/Title/title-bar.scss';
import {withApiState} from "./ApiStateProvider";
import React from "react";

function Title({apiState}){
    return <div className="af-title-bar">
    <div className="af-title-bar__wrapper container">
        <h1 className="af-title-bar__title">{apiState.data.namespace}</h1>
    </div>
</div>
}

const TitleWithApiState = withApiState(Title);

export default TitleWithApiState;