import React from 'react';

import Table from '@axa-fr/react-toolkit-table';
import Popover from '@axa-fr/react-toolkit-popover';
import {STOPPED, STARTED} from './state';
import {endWeekModeEnum, startWeekModeEnum} from './FormConfiguration';
import '@axa-fr/react-toolkit-table/dist/table.scss';
import '@axa-fr/react-toolkit-popover/dist/popover.scss';

import './ListState.scss'

const cssState = (d, more="") => {
    if(!d.isDailycleaned){
        return "af-table-body-content af-table-body-content--not-daily-cleaned " + more;
    }
    if(d.current !== d.target) {
        return "af-table-body-content af-table-body-content--in-progress " + more;
    }
    if(d.current === d.target && d.current === 0 ){
        return "af-table-body-content af-table-body-content--stopped " + more;
    }
    return "af-table-body-content af-table-body-content--ok " + more;
};

const getTitle = (state) => {
    if(state === STARTED) {
        return "Started";
    } else if(state === STOPPED) {
        return "Stopped";
    }
    return "In progress";
}

const Containers = ({deployment}) => {
    if(!deployment.containers) return null;
    return <>{deployment.containers.map(c =>c.image)}</>
}

const Resources = ({container, deployment, priceByMonth, apiState, locale, currency}) => {
    if(!container.resource_limits || !container.resource_requests) return <span>No resource found</span>
    return <> <h2>{container.name}</h2>
         <h4>Resource limits:</h4>
        <ul> {container.resource_limits.map(r =><li>{r.name} : {r.amount}{r.format}</li>)}</ul>
        <h4>Resource Requests:</h4>
        <ul> {container.resource_requests.map(r =><li>{r.name} : {r.amount}{r.format}</li>)}</ul>
        <h4>Estimated cost for 1 pod:</h4>
        <ul>
            <li>{formatPrice(monthlyCost(findMaxGoResource(deployment), 1, deployment.isDailycleaned, 1, priceByMonth, apiState.data.state), locale, currency)} / month</li>
            <li>{formatPrice(yearlyCost(findMaxGoResource(deployment), 1, deployment.isDailycleaned, 1, priceByMonth, apiState.data.state, true), locale, currency)} / year</li>
        </ul>
        <h4>Price by month for 1 Go:</h4>
        <ul>{formatPrice(priceByMonth, locale, currency)}</ul>
    </>
}

const ContainerResources = ({deployment, priceByMonth, apiState, locale, currency}) => {
    if(!deployment.containers) return <span>No container</span>;;
    return <>{deployment.containers.map(c =><Resources container={c} deployment={deployment} priceByMonth={priceByMonth} apiState={apiState} locale={locale} currency={currency} />)}</>
}


const findMaxGoResource = (deployment) => {
    if(!deployment.containers) return 0;
    
    const gos = deployment.containers.map(container => {
        let goResourceLimit = 0;
        const resourceLimit = container.resource_limits.filter(rl => rl.name == "memory");
        if(resourceLimit.length > 0) {
            goResourceLimit = convertToGo(resourceLimit[0].amount, resourceLimit[0].format);
        }
        let goRequestLimit = 0;
        const requestLimit = container.resource_requests.filter(rq => rq.name == "memory");
        if(requestLimit.length > 0) {
            goRequestLimit = convertToGo(requestLimit[0].amount, requestLimit[0].format);
        }

        if(goRequestLimit > goResourceLimit) {
            return goRequestLimit;
        }
        return goResourceLimit;
    })
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    return gos.reduce(reducer, 0);
}

const convertToGo = (amount, format) => {
    switch(format){
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
}

const monthlyCost = (amountGo, target, isDailycleaned, ratio=1, priceMonth=105, apiDataState) => {
    if(!isDailycleaned){
        return amountGo * priceMonth * target;
    }
    
    if(target == 0 && apiDataState === "STOPPED"){
        target = 1;
    }

    return amountGo * priceMonth * target * ratio;
} 

const costTotalMonth = (workloads, ratio=1, priceMonth=105, apiDataState) => {
    const reducer = (accumulator, currentValue) => accumulator + monthlyCost(findMaxGoResource(currentValue), currentValue.target, currentValue.isDailycleaned, ratio, priceMonth, apiDataState);
    return workloads.reduce(reducer, 0);
} 

const yearlyCost = (amountGo, target, isDailycleaned, ratio=1, priceMonth=105, apiDataState, isFullYear=true) => {
    const cost = monthlyCost(amountGo, target, isDailycleaned, ratio, priceMonth, apiDataState);
    if(!isDailycleaned) {
        return cost * 12;
    }
    if(isFullYear) {
        return cost * 12;
    }
    return cost;
}

const totalCostPerYear = (workloads, ratio=1, priceMonth=105, apiDataState, isFullYear=true) => {
    const reducer = (accumulator, currentValue) => accumulator + yearlyCost(findMaxGoResource(currentValue), currentValue.target, currentValue.isDailycleaned, ratio, priceMonth, apiDataState, isFullYear);
    return workloads.reduce(reducer, 0);
}

const formatPrice =(price, local, currency) =>{
    var formatter = new Intl.NumberFormat(local, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
      });
    return formatter.format(price);
}

const computeRatio = (state, apiState)=>{
    const form = state;

    const isStopped = apiState.data.state === "STOPPED";

    if(form.endWeekMode === endWeekModeEnum.disabled){
        if(form.startWeekMode !== startWeekModeEnum.disabled){
            return { ratio: 1, isFullYear: true};
        }
        return { ratio: isStopped ? 0:1, isFullYear: true};
    }

    if(form.startWeekMode === startWeekModeEnum.disabled){
        return { ratio: 0, isFullYear: false};
    }

    let ratio = 1;
    let startHour = form.startHour;
    let endHour = form.endHour;
    let hourInADay = Math.abs(endHour - startHour);
    switch (form.startWeekMode){
        case startWeekModeEnum.workedDays:
            ratio = 5/7;
            break;
        case startWeekModeEnum.allDays:
            ratio = 1;
            break;
        default:
            ratio = 0;
            break;
    }

    return { ratio: ratio * hourInADay /24, isFullYear: true }; 
}

const ListState = ({apiState, apiConfigurationState, priceByMonth, locale="FR-fr", currency="EUR"}) => {
    const apiConfiguration = computeRatio(apiConfigurationState, apiState);
    const costTotalM = costTotalMonth(apiState.data.workloads, apiConfiguration.ratio, priceByMonth, apiState.data.state)
    const costTotalMwithoutDailyClean = costTotalMonth(apiState.data.workloads, 1, priceByMonth, apiState.data.state);
    const costTotalY = totalCostPerYear(apiState.data.workloads, apiConfiguration.ratio, priceByMonth, apiState.data.state, apiConfiguration.isFullYear);
    const costTotalYwithoutDailyClean = totalCostPerYear(apiState.data.workloads,1, priceByMonth, apiState.data.state, true);
 return (<div className="deployment">
    <h3 className="af-title"><span className={"deployment__state deployment__state--" + apiState.data.state.toLowerCase()}></span> {getTitle(apiState.data.state)}</h3>
    <Table>
        <Table.Header>
            <Table.Tr>
                <Table.Th rowSpan="2">
                    <span className="af-table-th-content">Deployments and StatefulSets</span>
                </Table.Th>
                <Table.Th rowSpan="2">
                    <span className="af-table-th-content">Ready </span>
                </Table.Th>
                <Table.Th colSpan="3">
                <Popover
                        placement="top"
                        mode="hover"
                    >
                        <Popover.Pop>
                            <h3>Warning</h3>
                            <p>This is cost estimation only, not the real price.</p>
                            <p>Price by month for 1 Go: <b>{formatPrice(priceByMonth, locale, currency)}</b></p>
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
            {apiState.data.workloads.map(d =><Table.Tr key={d.id}>
                <Table.Td>
                    <Popover
                        placement="right"
                        mode="hover"
                        classModifier='deployment'
                    >
                        <Popover.Pop>
                            <ContainerResources deployment={d} priceByMonth={priceByMonth} apiState={apiState} locale={locale} currency={currency} />
                        </Popover.Pop>
                        <Popover.Over>
                            <span className={cssState(d, "af-table-body-content--more")}>{d.id}</span>    
                        </Popover.Over>
                    </Popover>
                    <span className="af-table-body-content--containers"> <Containers deployment={d} /></span>
                </Table.Td>
                <Table.Td>
                    <span className={cssState(d)}>{d.current}/{d.target}</span>
                </Table.Td>
                <Table.Td>
                    <span>{formatPrice(monthlyCost(findMaxGoResource(d), d.target, d.isDailycleaned, apiConfiguration.ratio, priceByMonth, apiState.data.state), locale, currency)}</span>
                </Table.Td>
                <Table.Td>
                    <span>{formatPrice(yearlyCost(findMaxGoResource(d), d.target, d.isDailycleaned, apiConfiguration.ratio, priceByMonth, apiState.data.state, apiConfiguration.isFullYear), locale, currency)}</span>
                </Table.Td>
            </Table.Tr>)}
            <Table.Tr>
                <Table.Td colSpan="2">
                    <span className="af-table-body-content--total">Total</span>
                </Table.Td>
                <Table.Td>
                    <span className="af-table-body-content--total">{formatPrice(costTotalM, locale, currency)}</span>
                </Table.Td>
                <Table.Td>
                    <span className="af-table-body-content--total">{formatPrice(costTotalY, locale, currency)}</span>
                </Table.Td>
            </Table.Tr>
            <Table.Tr>
                <Table.Td colSpan="2">
                    <span className="af-table-body-content--total-without-daily">Without dailyclean you should pay (for 1 pod instead of 0)</span>
                </Table.Td>
                <Table.Td>
                    <span className="af-table-body-content--total-without-daily">{formatPrice(costTotalMwithoutDailyClean, locale, currency)}</span>
                </Table.Td>
                <Table.Td>
                    <span className="af-table-body-content--total-without-daily">{formatPrice(costTotalYwithoutDailyClean, locale, currency)}</span>
                </Table.Td>
            </Table.Tr>
            <Table.Tr>
                <Table.Td colSpan="2">
                    <span className="af-table-body-content--total-with-daily">With dailyclean you save (for 1 pod instead of 0)</span>
                </Table.Td>
                <Table.Td>
                    <span className="af-table-body-content--total-with-daily">{formatPrice(costTotalMwithoutDailyClean-costTotalM, locale, currency)}</span>
                </Table.Td>
                <Table.Td>
                    <span className="af-table-body-content--total-with-daily">{formatPrice(costTotalYwithoutDailyClean-costTotalY, locale, currency)}</span>
                </Table.Td>
            </Table.Tr>
        </Table.Body>
    </Table>
    </div>);
}


export default ListState;