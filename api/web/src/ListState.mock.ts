import { ApiData } from "./types/api";

const ressources = {
  resource_limits: [
    {
      name: "cpu",
      amount: 200,
      raw_amount: "200",
      format: "m",
    },
    {
      name: "memory",
      amount: 512,
      raw_amount: "512",
      format: "Mi",
    },
  ],
  resource_requests: [
    {
      name: "cpu",
      amount: 100,
      raw_amount: "100",
      format: "m",
    },
    {
      name: "memory",
      amount: 256,
      raw_amount: "256",
      format: "Mi",
    },
  ],
};

const mockStarted: ApiData = {
  namespace: "ri-openfaas-fn-dev-fr",
  state: "STARTED",
  workloads: [
    {
      id: "alertmanager",
      isDailycleaned: true,
      current: 1,
      target: 1,
      type: "DEPLOYMENT",
      containers: [
        { image: "alertmanager.v1", name: "alertmanager", ...ressources },
      ],
    },
    {
      id: "dailyclean-api",
      isDailycleaned: false,
      current: 1,
      target: 1,
      labels: {
        "axa.com/dailyclean": "false",
      },
      annotations: {
        "kubectl.kubernetes.io/last-applied-configuration":
          '{"apiVersion":"apps/v1","kind":"StatefulSet","metadata":{"annotations":{},"labels":{"axa.com/dailyclean":"true"},"name":"mysql","namespace":"gthomas59800-dev"},"spec":{"selector":{"matchLabels":{"app":"mysql"}},"serviceName":"mysql","template":{"metadata":{"labels":{"app":"mysql"}},"spec":{"containers":[{"env":[{"name":"MYSQL_ROOT_PASSWORD","valueFrom":{"secretKeyRef":{"key":"password","name":"mysql-secret"}}}],"image":"mysql:5.6","name":"mysql","ports":[{"containerPort":3306,"name":"mysql"}],"resources":{"limits":{"cpu":"600m","memory":"1024Mi"},"requests":{"cpu":"300m","memory":"512Mi"}},"volumeMounts":[{"mountPath":"/var/lib/mysql","name":"mysql-persistent-storage"}]}],"volumes":[{"name":"mysql-persistent-storage","persistentVolumeClaim":{"claimName":"mysql-pv-claim"}}]}}}}\n',
      },
      type: "DEPLOYMENT",
      containers: [
        {
          image: "dailyclean-api.v1",
          name: "dailyclean-api",
          resource_limits: [
            {
              name: "cpu",
              amount: 200,
              raw_amount: "200",
              format: "m",
            },
            {
              name: "memory",
              amount: 90,
              raw_amount: "90",
              format: "Mi",
            },
          ],
          resource_requests: [
            {
              name: "cpu",
              amount: 100,
              raw_amount: "100",
              format: "m",
            },
            {
              name: "memory",
              amount: 90,
              raw_amount: "90",
              format: "Mi",
            },
          ],
        },
      ],
    },
    {
      id: "flux",
      isDailycleaned: true,
      current: 1,
      target: 1,
      type: "DEPLOYMENT",
      containers: [{ image: "", name: "", ...ressources }],
    },
    {
      id: "helm-operator",
      isDailycleaned: true,
      current: 1,
      target: 1,
      containers: [
        {
          name: "helm-operator",
          image: "docker.io/fluxcd/helm-operator:1.2.0",
          ports: [
            {
              port: 3030,
              protocol: "TCP",
            },
          ],
          ...ressources,
        },
      ],
    },
    {
      id: "jaeger-collector",
      isDailycleaned: true,
      current: 1,
      target: 1,
      type: "DEPLOYMENT",
      containers: [
        {
          name: "jaeger-collector",
          image: "docker.io/fluxcd/jaeger-collector:1.0.0",
          ...ressources,
        },
      ],
    },
    {
      id: "jaeger-query",
      isDailycleaned: true,
      current: 1,
      target: 1,
      type: "DEPLOYMENT",
      containers: [
        {
          name: "jaeger-query",
          image: "docker.io/fluxcd/jaeger-query:1.0.0",
          ...ressources,
        },
      ],
    },
    {
      id: "kube-state-metrics",
      isDailycleaned: true,
      current: 1,
      target: 1,
      type: "DEPLOYMENT",
      containers: [
        {
          name: "kube-state-metrics",
          image: "docker.io/fluxcd/kube-state-metrics:v1.9.7",
          ...ressources,
        },
      ],
    },
    {
      id: "memcached",
      isDailycleaned: true,
      current: 1,
      target: 1,
      type: "DEPLOYMENT",
      containers: [
        {
          name: "memcached",
          image: "docker.io/fluxcd/memcached:1.5.22-alpine",
          ...ressources,
        },
      ],
    },
    {
      id: "redis-ha-haproxy",
      isDailycleaned: true,
      current: 3,
      target: 3,
      type: "STATEFULSET",
      containers: [
        {
          name: "helm-operator",
          image: "docker.io/fluxcd/helm-operator:1.2.0",
          resource_limits: [
            {
              name: "cpu",
              amount: 200,
              raw_amount: "200",
              format: "m",
            },
            {
              name: "memory",
              amount: 300,
              raw_amount: "300",
              format: "Mi",
            },
          ],
          resource_requests: [
            {
              name: "cpu",
              amount: 100,
              raw_amount: "100",
              format: "m",
            },
            {
              name: "memory",
              amount: 256,
              raw_amount: "256",
              format: "Mi",
            },
          ],
          ports: [
            {
              port: 3030,
              protocol: "TCP",
            },
          ],
        },
      ],
    },
    {
      id: "ri",
      isDailycleaned: true,
      current: 1,
      target: 1,
      labels: {
        "axa.com/function": "true",
      },
      containers: [
        {
          name: "ri",
          image: "docker.io/fluxcd/ri:latest",
          ...ressources,
        },
      ],
    },
    {
      id: "ri-classify",
      isDailycleaned: true,
      current: 0,
      target: 0,
      labels: {
        "axa.com/function": "true",
      },
      containers: [
        {
          name: "helm-operator",
          image: "docker.io/fluxcd/helm-operator:1.2.0",
          resource_limits: [
            {
              name: "cpu",
              amount: 200,
              raw_amount: "200",
              format: "m",
            },
            {
              name: "memory",
              amount: 4012,
              raw_amount: "512",
              format: "Mi",
            },
          ],
          resource_requests: [
            {
              name: "cpu",
              amount: 100,
              raw_amount: "100",
              format: "m",
            },
            {
              name: "memory",
              amount: 256,
              raw_amount: "256",
              format: "Mi",
            },
          ],
          ports: [
            {
              port: 3030,
              protocol: "TCP",
            },
          ],
        },
      ],
    },
    {
      id: "ri-file",
      isDailycleaned: true,
      current: 1,
      target: 1,
      labels: {
        "axa.com/function": "true",
      },
      containers: [
        {
          name: "ri-file",
          image: "docker.io/fluxcd/ri-file:latest",
          ...ressources,
        },
      ],
    },
    {
      id: "ri-ocr",
      isDailycleaned: true,
      current: 2,
      target: 2,
      labels: {
        "axa.com/function": "true",
      },
      containers: [
        {
          name: "ri-ocr",
          image: "docker.io/fluxcd/ri-ocr:latest",
          ...ressources,
        },
      ],
    },
    {
      id: "ri-splitter",
      isDailycleaned: true,
      current: 1,
      target: 1,
      labels: {
        "axa.com/function": "true",
      },
      containers: [
        {
          name: "ri-splitter",
          image: "docker.io/fluxcd/ri-splitter:latest",
          ...ressources,
        },
      ],
    },
  ],
};

export default mockStarted;

export const mockStateOff: ApiData = {
  namespace: "ri-openfaas-fn-dev-fr",
  state: "STOPPED",
  workloads: [
    {
      id: "alertmanager",
      isDailycleaned: true,
      current: 0,
      target: 0,
      type: "DEPLOYMENT",
    },
  ],
};

export const mockStateInProgress: ApiData = {
  namespace: "ri-openfaas-fn-dev-fr",
  state: "IN_PROGRESS",
  workloads: [
    {
      id: "alertmanager",
      isDailycleaned: true,
      current: 0,
      target: 1,
      type: "DEPLOYMENT",
    },
  ],
};
