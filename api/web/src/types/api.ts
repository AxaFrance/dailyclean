import { endWeekModeEnum, startWeekModeEnum } from "../apiConstants";
import { ResilienceStatus } from "./form";

export type StartWeekModeEnum = typeof startWeekModeEnum;
export type StartWeekMode = StartWeekModeEnum[keyof StartWeekModeEnum];

export type EndWeekModeEnum = typeof endWeekModeEnum;
export type EndWeekMode = EndWeekModeEnum[keyof EndWeekModeEnum];

export type ApiConfiguration = {
  endWeekMode: EndWeekMode;
  startWeekMode: StartWeekMode;
  endHour: number;
  startHour: number;
};

export type State = "IN_PROGRESS" | "STARTED" | "STOPPED";

export type Resource = {
  name: string;
  amount: number;
  raw_amount: string;
  format: string;
};

export type Container = {
  name: string;
  image: string;
  resource_limits: Array<Resource>;
  resource_requests: Array<Resource>;
  ports?: Array<{
    port: number;
    protocol: string;
  }>;
};

export type Workload = {
  id: string;
  isDailycleaned: boolean;
  current: number;
  target: number;
  type?: string;
  labels?: {
    [key: string]: string;
  };
  annotations?: {
    [key: string]: string;
  };
  containers?: Array<Container>;
};

export type ApiData = {
  namespace: string;
  state: State;
  workloads: Array<Workload>;
};

export type ApiState = {
  data: ApiData;
  status: ResilienceStatus;
  firstStatus: ResilienceStatus;
};
