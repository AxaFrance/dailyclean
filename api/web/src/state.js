export const STARTED = "STARTED";
export const STOPPED = "STOPPED";
export const IN_PROGRESS = "IN_PROGRESS";


export const computeState = (workloads) =>
{
    const workloadInProgress = workloads.find(w => !computeIsFunction(w) && w.current !== w.target)
    if(workloadInProgress) return "IN_PROGRESS";

    const workload = workloads.find(w => !computeIsFunction(w) && w.target === 0)
    return workload != null ? "STOPPED" : "STARTED";
}


export const computeIsFunction = (deployment) => {
    return (deployment && deployment.labels && deployment.labels["axa.com/function"] === "true");
}
