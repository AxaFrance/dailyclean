import type { ApiData, Timeranges } from "../types/api";

type MockState = {
  apiData: ApiData;
  timeranges: Timeranges;
};

export const initialMockState: MockState = {
  apiData: {
    namespace: "default",
    state: "STOPPED",
    workloads: [
      {
        id: "deployment-web-app",
        isDailycleaned: true,
        current: 0,
        target: 0,
        type: "Deployment",
        labels: {
          app: "web-app",
          version: "v1.0.0",
        },
        annotations: {
          "dailyclean.io/enabled": "true",
        },
        containers: [
          {
            name: "web-app",
            image: "nginx:1.21",
            resource_limits: [
              {
                name: "cpu",
                amount: 500,
                raw_amount: "500m",
                format: "millicores",
              },
              {
                name: "memory",
                amount: 512,
                raw_amount: "512Mi",
                format: "Mi",
              },
            ],
            resource_requests: [
              {
                name: "cpu",
                amount: 100,
                raw_amount: "100m",
                format: "millicores",
              },
              {
                name: "memory",
                amount: 256,
                raw_amount: "256Mi",
                format: "Mi",
              },
            ],
            ports: [
              {
                port: 80,
                protocol: "TCP",
              },
            ],
          },
        ],
      },
      {
        id: "deployment-api-server",
        isDailycleaned: true,
        current: 0,
        target: 0,
        type: "Deployment",
        labels: {
          app: "api-server",
          version: "v2.1.0",
        },
        annotations: {
          "dailyclean.io/enabled": "true",
        },
        containers: [
          {
            name: "api-server",
            image: "node:18-alpine",
            resource_limits: [
              {
                name: "cpu",
                amount: 1000,
                raw_amount: "1000",
                format: "cores",
              },
              {
                name: "memory",
                amount: 1,
                raw_amount: "1Gi",
                format: "Gi",
              },
            ],
            resource_requests: [
              {
                name: "cpu",
                amount: 200,
                raw_amount: "200m",
                format: "millicores",
              },
              {
                name: "memory",
                amount: 512,
                raw_amount: "512Mi",
                format: "Mi",
              },
            ],
            ports: [
              {
                port: 3000,
                protocol: "TCP",
              },
            ],
          },
        ],
      },
    ],
  },
  timeranges: {
    cron_start: "0 8 * * 1-5", // 8 AM Monday to Friday
    cron_stop: "0 18 * * 1-5", // 6 PM Monday to Friday
  },
};

let mockState: MockState = { ...initialMockState };

export const getMockState = (): MockState => mockState;

export const updateMockState = (updates: Partial<MockState>): void => {
  mockState = { ...mockState, ...updates };
};

export const resetMockState = (): void => {
  mockState = { ...initialMockState };
};

export const startPods = (): void => {
  updateMockState({
    apiData: {
      ...mockState.apiData,
      state: "STARTED",
      workloads: mockState.apiData.workloads.map((workload, index) => ({
        ...workload,
        target: index + 1,
        current: index + 1,
      })),
    },
  });
};

export const stopPods = (): void => {
  updateMockState({
    apiData: {
      ...mockState.apiData,
      state: "STOPPED",
      workloads: mockState.apiData.workloads.map((workload) => ({
        ...workload,
        current: 0,
        target: 0,
      })),
    },
  });
};

export const updateTimeranges = (timeranges: {
  cron_start?: string;
  cron_stop?: string;
}): void => {
  updateMockState({
    timeranges: { ...mockState.timeranges, ...timeranges },
  });
};

type Mode = "start" | "stop";

export const setInProgress = (mode: Mode): void => {
  updateMockState({
    apiData: {
      ...mockState.apiData,
      state: "IN_PROGRESS",
      workloads: mockState.apiData.workloads.map((workload, index) => ({
        ...workload,
        target: mode === "start" ? index + 1 : 0,
        current: mode === "start" ? 0 : index + 1,
      })),
    },
  });
};
