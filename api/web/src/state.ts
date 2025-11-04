import { State, Workload } from "./types/api";

export const computeState = (workloads: Workload[]): State => {
  const workloadInProgress = workloads.find(
    (w) =>
      !computeIsFunction(w) &&
      w.current === 0 &&
      w.target > 0 &&
      computeIsDailyCleaned(w),
  );
  if (workloadInProgress) return "IN_PROGRESS";

  const workloadStopped = workloads.find(
    (w) => !computeIsFunction(w) && w.target === 0 && computeIsDailyCleaned(w),
  );
  return workloadStopped != null ? "STOPPED" : "STARTED";
};

export const computeIsFunction = (workload: Workload) => {
  return (
    workload &&
    workload.labels &&
    workload.labels["axa.com/function"] === "true"
  );
};

export const computeIsDailyCleaned = (workload: Workload) => {
  return workload.isDailycleaned;
};
