import Popover, { PopoverPlacements } from "@axa-fr/react-toolkit-popover";
import "@axa-fr/react-toolkit-popover/dist/popover.scss";
import Table from "@axa-fr/react-toolkit-table";
import "@axa-fr/react-toolkit-table/dist/table.scss";
import { endWeekModeEnum, startWeekModeEnum } from "./apiConstants";
import {
  computeIsDailyCleaned,
  computeIsFunction,
  computeState,
} from "./state.js";

import Badge from "@axa-fr/react-toolkit-badge";
import "@axa-fr/react-toolkit-badge/dist/af-badge.css";
import "./ListState.scss";
import {
  ApiConfiguration,
  ApiData,
  Container,
  State,
  Workload,
} from "./types/api";

const cssState = (deployment: Workload, state: State, more = "") => {
  const cssStopped =
    "af-table-body-content af-table-body-content--stopped " + more;
  if (!computeIsDailyCleaned(deployment)) {
    return (
      "af-table-body-content af-table-body-content--not-daily-cleaned " + more
    );
  }
  if (computeIsFunction(deployment)) {
    if (state === "STOPPED") {
      return cssStopped;
    }
    return "af-table-body-content af-table-body-content--function " + more;
  }
  if (deployment.current !== deployment.target) {
    return "af-table-body-content af-table-body-content--in-progress " + more;
  }
  if (deployment.current === deployment.target && deployment.current === 0) {
    return cssStopped;
  }
  return "af-table-body-content af-table-body-content--ok " + more;
};

const getTitle = (state: State) => {
  if (state === "STARTED") {
    return "Started";
  } else if (state === "STOPPED") {
    return "Stopped";
  }
  return "In progress";
};

const Containers = ({ deployment }: { deployment: Workload }) => {
  if (!deployment.containers) return null;
  return <>{deployment.containers.map((c: Container) => c.image)}</>;
};

const Resources = ({
  container,
  workload,
  priceByMonth,
  apiState,
  locale,
  currency,
}: {
  container: Container;
  workload: Workload;
  priceByMonth: number;
  apiState: ApiData;
  locale: Intl.LocalesArgument;
  currency: string;
}) => {
  if (!container.resource_limits || !container.resource_requests)
    return <span>No resource found</span>;
  const isDailyCleaned = computeIsDailyCleaned(workload);
  return (
    <>
      <h2>{container.name}</h2>
      <h4>Resource limits:</h4>
      <ul>
        {" "}
        {container.resource_limits.map((r) => (
          <li key={r.name}>
            {r.name} : {r.amount}
            {r.format}
          </li>
        ))}
      </ul>
      <h4>Resource Requests:</h4>
      <ul>
        {" "}
        {container.resource_requests.map((r) => (
          <li key={r.name}>
            {r.name} : {r.amount}
            {r.format}
          </li>
        ))}
      </ul>
      <h4>Estimated cost for 1 pod:</h4>
      <ul>
        <li>
          {formatPrice(
            monthlyCost(
              findMaxGoResource(workload),
              1,
              isDailyCleaned,
              1,
              priceByMonth,
              apiState.state,
            ),
            locale,
            currency,
          )}{" "}
          / month
        </li>
        <li>
          {formatPrice(
            yearlyCost(
              findMaxGoResource(workload),
              1,
              isDailyCleaned,
              1,
              priceByMonth,
              apiState.state,
              true,
            ),
            locale,
            currency,
          )}{" "}
          / year
        </li>
      </ul>
      <h4>Price by month for 1 Go:</h4>
      <ul>{formatPrice(priceByMonth, locale, currency)}</ul>
    </>
  );
};

const ContainerResources = ({
  workload,
  priceByMonth,
  apiState,
  locale,
  currency,
}: {
  workload: Workload;
  priceByMonth: number;
  apiState: ApiData;
  locale: Intl.LocalesArgument;
  currency: string;
}) => {
  if (!workload.containers) return <span>No container</span>;
  return (
    <>
      {workload.containers.map((c) => (
        <Resources
          key={workload.id}
          container={c}
          workload={workload}
          priceByMonth={priceByMonth}
          apiState={apiState}
          locale={locale}
          currency={currency}
        />
      ))}
    </>
  );
};

const findMaxGoResource = (workload: Workload) => {
  if (!workload.containers) return 0;

  const gos = workload.containers.map((container) => {
    let goResourceLimit = 0;
    const resourceLimit = container.resource_limits.filter(
      (rl) => rl.name === "memory",
    );
    if (resourceLimit.length > 0) {
      goResourceLimit = convertToGo(
        resourceLimit[0].amount,
        resourceLimit[0].format,
      );
    }
    let goRequestLimit = 0;
    const requestLimit = container.resource_requests.filter(
      (rq) => rq.name === "memory",
    );
    if (requestLimit.length > 0) {
      goRequestLimit = convertToGo(
        requestLimit[0].amount,
        requestLimit[0].format,
      );
    }

    if (goRequestLimit > goResourceLimit) {
      return goRequestLimit;
    }
    return goResourceLimit;
  });
  const reducer = (accumulator: number, currentValue: number) =>
    accumulator + currentValue;
  return gos.reduce(reducer, 0);
};

const convertToGo = (amount: number, format: string) => {
  switch (format) {
    case "Mi":
      return amount * 0.001048576;
    case "Ki":
      return amount * 0.000001024;
    case "Gi":
      return amount * 1.073741824;
    case "Ti":
      return amount * 1099.511627776;
    case "Pi":
      return amount * 1125899.9068426238;
    case "Ei":
      return amount * 1152921504.6068468;
    default:
      return 0;
  }
};

const monthlyCost = (
  amountGo: number,
  target: number,
  isDailyCleaned: boolean,
  ratio = 1,
  priceMonth = 105,
  apiDataState: State,
) => {
  if (!isDailyCleaned) {
    return amountGo * priceMonth * target;
  }
  if (target === 0 && apiDataState === "STOPPED") {
    target = 1;
  }

  return amountGo * priceMonth * target * ratio;
};

const costTotalMonth = (
  workloads: Workload[],
  ratio = 1,
  priceMonth = 105,
  apiDataState: State,
): number => {
  const reducer = (accumulator: number, currentValue: Workload) =>
    accumulator +
    monthlyCost(
      findMaxGoResource(currentValue),
      currentValue.target || 0,
      computeIsDailyCleaned(currentValue),
      ratio,
      priceMonth,
      apiDataState,
    );
  return workloads.reduce(reducer, 0);
};

const yearlyCost = (
  amountGo: number,
  target: number,
  isDailycleaned: boolean,
  ratio = 1,
  priceMonth = 105,
  apiDataState: State,
  isFullYear = true,
) => {
  const cost = monthlyCost(
    amountGo,
    target,
    isDailycleaned,
    ratio,
    priceMonth,
    apiDataState,
  );
  if (!isDailycleaned) {
    return cost * 12;
  }
  if (isFullYear) {
    return cost * 12;
  }
  return cost;
};

const totalCostPerYear = (
  workloads: Workload[],
  ratio = 1,
  priceMonth = 105,
  apiDataState: State,
  isFullYear = true,
): number => {
  const reducer = (accumulator: number, currentValue: Workload) =>
    accumulator +
    yearlyCost(
      findMaxGoResource(currentValue),
      currentValue.target || 0,
      computeIsDailyCleaned(currentValue),
      ratio,
      priceMonth,
      apiDataState,
      isFullYear,
    );
  return workloads.reduce(reducer, 0);
};

const formatPrice = (
  price: number,
  local: Intl.LocalesArgument,
  currency: string,
) => {
  const formatter = new Intl.NumberFormat(local, {
    style: "currency",
    currency,
    minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
  });
  return formatter.format(price);
};

const computeRatio = (state: ApiConfiguration, apiState: State) => {
  const isStopped = apiState === "STOPPED";
  if (state.endWeekMode === endWeekModeEnum.disabled) {
    if (state.startWeekMode !== startWeekModeEnum.disabled) {
      return { ratio: 1, isFullYear: true };
    }
    return { ratio: isStopped ? 0 : 1, isFullYear: true };
  }

  if (state.startWeekMode === startWeekModeEnum.disabled) {
    return { ratio: 0, isFullYear: false };
  }
  let ratio = 1;
  const startHour = state.startHour;
  const endHour = state.endHour;
  const hourInADay = Math.abs(endHour - startHour);
  switch (state.startWeekMode) {
    case startWeekModeEnum.workedDays:
      ratio = 5 / 7;
      break;
    case startWeekModeEnum.allDays:
      ratio = 1;
      break;
    default:
      ratio = 0;
      break;
  }
  return { ratio: (ratio * hourInADay) / 24, isFullYear: true };
};

export const ListState = ({
  apiState,
  apiConfigurationState,
  priceByMonth,
  locale = "FR-fr",
  currency = "EUR",
}: {
  apiState: ApiData;
  apiConfigurationState: ApiConfiguration;
  priceByMonth: number;
  locale: Intl.LocalesArgument;
  currency?: string;
}) => {
  const workloads = apiState.workloads;
  const state = computeState(workloads);
  const apiConfiguration = computeRatio(apiConfigurationState, state);
  const ratio = apiConfiguration.ratio;
  const costTotalM = costTotalMonth(workloads, ratio, priceByMonth, state);
  const costTotalMonthWithoutDailyClean = costTotalMonth(
    workloads,
    1,
    priceByMonth,
    state,
  );
  const costTotalY = totalCostPerYear(
    workloads,
    ratio,
    priceByMonth,
    state,
    apiConfiguration.isFullYear,
  );
  const costTotalYearWithoutDailyClean = totalCostPerYear(
    workloads,
    1,
    priceByMonth,
    state,
    true,
  );

  return (
    <div className="deployment">
      <h3 className="af-title">
        <span
          className={
            "deployment__state deployment__state--" + state.toLowerCase()
          }
        ></span>{" "}
        {getTitle(state)}
      </h3>
      <Table>
        <Table.Header>
          <Table.Tr>
            <Table.Th rowSpan={2}>
              <span className="af-table-th-content">
                Deployments and StatefulSets
              </span>
            </Table.Th>
            <Table.Th rowSpan={2}>
              <span className="af-table-th-content">Ready </span>
            </Table.Th>
            <Table.Th colSpan={3}>
              <Popover placement={PopoverPlacements.top} mode="hover">
                <Popover.Pop>
                  <h3>Warning</h3>
                  <p>This is cost estimation only, not the real price.</p>
                  <p>
                    Price by month for 1 Go:{" "}
                    <b>{formatPrice(priceByMonth, locale, currency)}</b>
                  </p>
                </Popover.Pop>
                <Popover.Over>
                  <span className="af-table-th-content">Estimated cost *</span>
                </Popover.Over>
              </Popover>
            </Table.Th>
          </Table.Tr>
          <Table.Tr>
            <Table.Th>
              <span className="af-table-th-content">by month</span>
            </Table.Th>
            <Table.Th>
              <span className="af-table-th-content">by year</span>
            </Table.Th>
          </Table.Tr>
        </Table.Header>
        <Table.Body>
          {workloads.map((d) => (
            <Table.Tr key={d.id}>
              <Table.Td>
                <Popover
                  placement={PopoverPlacements.right}
                  mode="hover"
                  classModifier="deployment"
                >
                  <Popover.Pop>
                    <ContainerResources
                      workload={d}
                      priceByMonth={priceByMonth}
                      apiState={apiState}
                      locale={locale}
                      currency={currency}
                    />
                  </Popover.Pop>
                  <Popover.Over>
                    <span
                      className={cssState(
                        d,
                        state,
                        "af-table-body-content--more",
                      )}
                    >
                      {d.id}
                    </span>
                  </Popover.Over>
                </Popover>
                <div className={"dailyclean-badges"}>
                  {computeIsFunction(d) && (
                    <Badge classModifier="function">Function</Badge>
                  )}
                  {d.type === "STATEFULSET" && (
                    <Badge classModifier="statefulset">Statefulset</Badge>
                  )}
                </div>
                <span className="af-table-body-content--containers">
                  {" "}
                  <Containers deployment={d} />{" "}
                </span>
              </Table.Td>
              <Table.Td>
                <span className={cssState(d, state)}>
                  {d.current}/{d.target}
                </span>
              </Table.Td>
              <Table.Td>
                <span>
                  {formatPrice(
                    monthlyCost(
                      findMaxGoResource(d),
                      d.target || 0,
                      computeIsDailyCleaned(d),
                      ratio,
                      priceByMonth,
                      apiState.state,
                    ),
                    locale,
                    currency,
                  )}
                </span>
              </Table.Td>
              <Table.Td>
                <span>
                  {formatPrice(
                    yearlyCost(
                      findMaxGoResource(d),
                      d.target || 0,
                      computeIsDailyCleaned(d),
                      ratio,
                      priceByMonth,
                      apiState.state,
                      apiConfiguration.isFullYear,
                    ),
                    locale,
                    currency,
                  )}
                </span>
              </Table.Td>
            </Table.Tr>
          ))}
          <Table.Tr>
            <Table.Td colSpan={2}>
              <span className="af-table-body-content--total">Total</span>
            </Table.Td>
            <Table.Td>
              <span className="af-table-body-content--total">
                {formatPrice(costTotalM, locale, currency)}
              </span>
            </Table.Td>
            <Table.Td>
              <span className="af-table-body-content--total">
                {formatPrice(costTotalY, locale, currency)}
              </span>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td colSpan={2}>
              <span className="af-table-body-content--total-without-daily">
                Without dailyclean you should pay (for 1 pod instead of 0)
              </span>
            </Table.Td>
            <Table.Td>
              <span className="af-table-body-content--total-without-daily">
                {formatPrice(costTotalMonthWithoutDailyClean, locale, currency)}
              </span>
            </Table.Td>
            <Table.Td>
              <span className="af-table-body-content--total-without-daily">
                {formatPrice(costTotalYearWithoutDailyClean, locale, currency)}
              </span>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td colSpan={2}>
              <span className="af-table-body-content--total-with-daily">
                With dailyclean you save (for 1 pod instead of 0)
              </span>
            </Table.Td>
            <Table.Td>
              <span className="af-table-body-content--total-with-daily">
                {formatPrice(
                  costTotalMonthWithoutDailyClean - costTotalM,
                  locale,
                  currency,
                )}
              </span>
            </Table.Td>
            <Table.Td>
              <span className="af-table-body-content--total-with-daily">
                {formatPrice(
                  costTotalYearWithoutDailyClean - costTotalY,
                  locale,
                  currency,
                )}
              </span>
            </Table.Td>
          </Table.Tr>
        </Table.Body>
      </Table>
    </div>
  );
};
