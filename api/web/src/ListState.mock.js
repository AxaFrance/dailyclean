

const ressources = {"resource_limits": [
    {
        "name": "cpu",
        "amount": 200,
        "raw_amount": "200",
        "format": "m"
    },
    {
        "name": "memory",
        "amount": 512,
        "raw_amount": "512",
        "format": "Mi"
    }
],
    "resource_requests": [
    {
        "name": "cpu",
        "amount": 100,
        "raw_amount": "100",
        "format": "m"
    },
    {
        "name": "memory",
        "amount": 256,
        "raw_amount": "256",
        "format": "Mi"
    }
]}

const mockStarted = {
    "namespace": "ri-openfaas-fn-dev-fr",
    "workloads": [
        {
            "id": "alertmanager",
            "current": 1,
            "target": 1,
            "type": "DEPLOYMENT",
            "containers": [{...ressources}]
        },
        {
            "id": "dailyclean-api",
            "current": 1,
            "target": 1,
            "labels": {
                "axa.com/dailyclean": "false"
            },
            "annotations": {
                "kubectl.kubernetes.io/last-applied-configuration": "{\"apiVersion\":\"apps/v1\",\"kind\":\"StatefulSet\",\"metadata\":{\"annotations\":{},\"labels\":{\"axa.com/dailyclean\":\"true\"},\"name\":\"mysql\",\"namespace\":\"gthomas59800-dev\"},\"spec\":{\"selector\":{\"matchLabels\":{\"app\":\"mysql\"}},\"serviceName\":\"mysql\",\"template\":{\"metadata\":{\"labels\":{\"app\":\"mysql\"}},\"spec\":{\"containers\":[{\"env\":[{\"name\":\"MYSQL_ROOT_PASSWORD\",\"valueFrom\":{\"secretKeyRef\":{\"key\":\"password\",\"name\":\"mysql-secret\"}}}],\"image\":\"mysql:5.6\",\"name\":\"mysql\",\"ports\":[{\"containerPort\":3306,\"name\":\"mysql\"}],\"resources\":{\"limits\":{\"cpu\":\"600m\",\"memory\":\"1024Mi\"},\"requests\":{\"cpu\":\"300m\",\"memory\":\"512Mi\"}},\"volumeMounts\":[{\"mountPath\":\"/var/lib/mysql\",\"name\":\"mysql-persistent-storage\"}]}],\"volumes\":[{\"name\":\"mysql-persistent-storage\",\"persistentVolumeClaim\":{\"claimName\":\"mysql-pv-claim\"}}]}}}}\n"
            },
            "type": "DEPLOYMENT",
            "containers": [{"resource_limits": [
                    {
                        "name": "cpu",
                        "amount": 200,
                        "raw_amount": "200",
                        "format": "m"
                    },
                    {
                        "name": "memory",
                        "amount": 90,
                        "raw_amount": "90",
                        "format": "Mi"
                    }
                ],
                "resource_requests": [
                    {
                        "name": "cpu",
                        "amount": 100,
                        "raw_amount": "100",
                        "format": "m"
                    },
                    {
                        "name": "memory",
                        "amount": 90,
                        "raw_amount": "90",
                        "format": "Mi"
                    }
                ]}]
        },
        {
            "id": "flux",
            "current": 1,
            "target": 1,
            "type": "DEPLOYMENT",
            "containers": [{...ressources}]
        },
        {
            "id": "helm-operator",
            "current": 1,
            "target": 1,
            "containers": [
                {
                    "name": "helm-operator",
                    "image": "docker.io/fluxcd/helm-operator:1.2.0",
                    
                    "ports": [
                        {
                            "port": 3030,
                            "protocol": "TCP"
                        }
                    ],
                    ...ressources,
                }
            ]
        },
        {
            "id": "jaeger-collector",
            "current": 1,
            "target": 1,
            "type": "DEPLOYMENT",
            "containers": [{...ressources}]
        },
        {
            "id": "jaeger-query",
            "current": 1,
            "target": 1,
            "type": "DEPLOYMENT",
            "containers": [{...ressources}]
        },
        {
            "id": "kube-state-metrics",
            "current": 1,
            "target": 1,
            "type": "DEPLOYMENT",
            "containers": [{...ressources}]
        },
        {
            "id": "memcached",
            "current": 1,
            "target": 1,
            "type": "DEPLOYMENT",
            "containers": [{...ressources}]
        },
        {
            "id": "redis-ha-haproxy",
            "current": 3,
            "target": 3,
            "type": "STATEFULSET",
            "containers": [
                {
                    "name": "helm-operator",
                    "image": "docker.io/fluxcd/helm-operator:1.2.0",
                    "resource_limits": [
                        {
                            "name": "cpu",
                            "amount": 200,
                            "raw_amount": "200",
                            "format": "m"
                        },
                        {
                            "name": "memory",
                            "amount": 300,
                            "raw_amount": "300",
                            "format": "Mi"
                        }
                    ],
                    "resource_requests": [
                        {
                            "name": "cpu",
                            "amount": 100,
                            "raw_amount": "100",
                            "format": "m"
                        },
                        {
                            "name": "memory",
                            "amount": 256,
                            "raw_amount": "256",
                            "format": "Mi"
                        }
                    ],
                    "ports": [
                        {
                            "port": 3030,
                            "protocol": "TCP"
                        }
                    ]
                }
            ]
        },
        {
            "id": "ri",
            "current": 1,
            "target": 1,
            "labels": {
                "axa.com/function": "true"
            },
            "containers": [{...ressources}]
        },
        {
            "id": "ri-classify",
            "current": 0,
            "target": 0,
            "labels": {
                "axa.com/function": "true"
            },
            "containers": [
                {
                    "name": "helm-operator",
                    "image": "docker.io/fluxcd/helm-operator:1.2.0",
                    "resource_limits": [
                        {
                            "name": "cpu",
                            "amount": 200,
                            "raw_amount": "200",
                            "format": "m"
                        },
                        {
                            "name": "memory",
                            "amount": 4012,
                            "raw_amount": "512",
                            "format": "Mi"
                        }
                    ],
                    "resource_requests": [
                        {
                            "name": "cpu",
                            "amount": 100,
                            "raw_amount": "100",
                            "format": "m"
                        },
                        {
                            "name": "memory",
                            "amount": 256,
                            "raw_amount": "256",
                            "format": "Mi"
                        }
                    ],
                    "ports": [
                        {
                            "port": 3030,
                            "protocol": "TCP"
                        }
                    ]
                }
            ]
        },
        {
            "id": "ri-file",
            "current": 1,
            "target": 1,
            "labels": {
                "axa.com/function": "true"
            },
            "containers": [{...ressources}]
        },
        {
            "id": "ri-ocr",
            "current": 2,
            "target": 2,
            "labels": {
                "axa.com/function": "true"
            },
            "containers": [{...ressources}]
        },
        {
            "id": "ri-splitter",
            "current": 1,
            "target": 1,
            "labels": {
                "axa.com/function": "true"
            },
            "containers": [{...ressources}]
        }
    ]
};

export default mockStarted;

export const mockStateOff = {
    "namespace": "ri-openfaas-fn-dev-fr",
    "workloads": [
        {
            "id": "alertmanager",
            "current": 0,
            "target": 0,
            "type": "DEPLOYMENT"
        },
]};

export const mockStateInProgress = {
    "namespace": "ri-openfaas-fn-dev-fr",
    "workloads": [
        {
            "id": "alertmanager",
            "current": 0,
            "target": 1,
            "type": "DEPLOYMENT"
        },
    ]};

