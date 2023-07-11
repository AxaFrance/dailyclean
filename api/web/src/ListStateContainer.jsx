import React, {useState, useEffect} from "react";

import ListState from './ListState';

const getPriceByMonth = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    if(urlSearchParams.has("price_by_month")){
        return parseInt(urlSearchParams.get("price_by_month"), 10);
    }
    return 75;
}

const getCurrency = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    if(urlSearchParams.has("currency")){
        return urlSearchParams.get("currency");
    }
    return "EUR";
}

const initialState = {
    priceByMonth: 75,
    locale: "FR-fr",
    currency: "EUR"
}

const ListStateContainer = (props) => {
    const [state, setState] = useState(initialState)
    useEffect(() => {
        const priceByMonth = getPriceByMonth();
        const userLanguages = window.navigator.browserLanguage  || window.navigator.language;
        const locale = userLanguages.lenght > 0 ? userLanguages[0] : "FR-fr";
        const currency = getCurrency();
        setState({priceByMonth, locale, currency})
    }, []);
   
    return <ListState {...props} priceByMonth={state.priceByMonth} locale={state.local} currency={state.currency} />
}

export default ListStateContainer;
