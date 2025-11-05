import { useContext } from "react";
import { ApiConfigurationContext } from "./ApiConfigurationProvider";
import { ListState } from "./ListState";
import { ApiData } from "./types/api";

const getPriceByMonth = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const priceByMonth = urlSearchParams.get("price_by_month");
  if (priceByMonth) {
    return parseInt(priceByMonth, 10);
  }
  return 75;
};

const getCurrency = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  if (urlSearchParams.has("currency")) {
    return urlSearchParams.get("currency");
  }
  return "EUR";
};

const ListStateContainer = (props: { apiState: ApiData }) => {
  const apiConfigurationState = useContext(ApiConfigurationContext);
  const priceByMonth = getPriceByMonth();
  const languages: readonly string[] =
    Array.isArray(window.navigator.languages) &&
    window.navigator.languages.length > 0
      ? window.navigator.languages
      : [window.navigator.language || "FR-fr"];
  const locale: string =
    languages && languages.length > 0 ? languages[0] : "FR-fr";
  const currency = getCurrency();

  return (
    <ListState
      apiState={props.apiState}
      apiConfigurationState={apiConfigurationState}
      priceByMonth={priceByMonth}
      locale={locale || "FR-fr"}
      currency={currency || "EUR"}
    />
  );
};

export default ListStateContainer;
