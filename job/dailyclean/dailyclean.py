from kubernetes import client, config
import os
import sys
import time


def main():
    if len(sys.argv) > 2 and sys.argv[2] == 'local':
        aConfig = client.Configuration()
        config.load_kube_config(client_configuration=aConfig)
        aConfig.verify_ssl = False
        aApiClient = client.ApiClient(aConfig)
    else:
        config.load_incluster_config()
        aApiClient = client.ApiClient()

    namespace = os.environ.get('CURRENT_NAMESPACE')

    if sys.argv[1] == 'start':
        start(aApiClient, namespace)
    elif sys.argv[1] == 'stop':
        stop(aApiClient, namespace)


def start(aApiClient, namespace):
    appsV1Api_instance = client.AppsV1Api(aApiClient)

    try:
        nodailyclean_deployments = appsV1Api_instance.list_namespaced_deployment(namespace=namespace, watch=False, label_selector='axa.com/dailyclean=false')
    except client.exceptions.ApiException as e:
        print('Error while listing disabled dailyclean Deployments (%s).\n' % e)
    else:
        for deployment in nodailyclean_deployments.items:
            print('Dailyclean disabled for deployment %s.' % deployment.metadata.name)

    try:
        deployments = appsV1Api_instance.list_namespaced_deployment(namespace=namespace, watch=False, label_selector='axa.com/dailyclean!=false')
    except client.exceptions.ApiException as e:
        print('Error while listing Deployments (%s).\n' % e)
    else:
        for deployment in deployments.items:
            deployment.spec.replicas = 1
            appsV1Api_instance.patch_namespaced_deployment(namespace=namespace, name=deployment.metadata.name, body=deployment)
            print('Deployment %s replicas set to 1.' % deployment.metadata.name)

    try:
        stateful_sets = appsV1Api_instance.list_namespaced_stateful_set(namespace=namespace, watch=False, label_selector='axa.com/dailyclean=true')
    except client.exceptions.ApiException as e:
        print('Error while listing StatefulSet (%s).\n' % e)
    else:
        for stateful_set in stateful_sets.items:
            stateful_set.spec.replicas = 1
            appsV1Api_instance.patch_namespaced_stateful_set(namespace=namespace, name=stateful_set.metadata.name, body=stateful_set)
            print('StatefulSet %s replicas set to 1.' % stateful_set.metadata.name)


def stop(aApiClient, namespace):
    appsV1Api_instance = client.AppsV1Api(aApiClient)

    while appsV1Api_instance.read_namespaced_deployment(namespace=namespace, name='flux').spec.replicas != 0:
        print('Trying to set deployment flux replicas to 0.')
        flux_deployment = appsV1Api_instance.read_namespaced_deployment(namespace=namespace, name='flux')
        flux_deployment.spec.replicas = 0
        appsV1Api_instance.patch_namespaced_deployment(namespace=namespace,name='flux', body=flux_deployment)
        time.sleep(10)

    print('Deployment flux replicas set to 0.')

    try:
        helm_deployment = appsV1Api_instance.read_namespaced_deployment(namespace=namespace, name='helm-operator')
    except client.exceptions.ApiException as e:
        print('No helm-operator deployed. Skipping.')
    else:
        helm_deployment.spec.replicas = 0
        appsV1Api_instance.patch_namespaced_deployment(namespace=namespace, name='helm-operator', body=helm_deployment)
        print('Deployment helm-operator replicas set to 0.')

    try:
        nodailyclean_deployments = appsV1Api_instance.list_namespaced_deployment(namespace=namespace, watch=False, label_selector='axa.com/dailyclean=false')
    except client.exceptions.ApiException as e:
        print('Error while listing disabled dailyclean Deployments (%s).\n' % e)
    else:
        for deployment in nodailyclean_deployments.items:
            print('Dailyclean disabled for deployment %s.' % deployment.metadata.name)

    try:
        deployments = appsV1Api_instance.list_namespaced_deployment(namespace=namespace, watch=False, label_selector='axa.com/dailyclean!=false')
    except client.exceptions.ApiException as e:
        print('Error while listing Deployments (%s).\n' % e)
    else:
        for deployment in deployments.items:
            if deployment.metadata.name == 'flux' or deployment.metadata.name == 'helm-operator':
                continue
            deployment.spec.replicas = 0
            appsV1Api_instance.patch_namespaced_deployment(namespace=namespace, name=deployment.metadata.name, body=deployment)
            print('Deployment %s replicas set to 0.' % deployment.metadata.name)

    try:
        stateful_sets = appsV1Api_instance.list_namespaced_stateful_set(namespace=namespace, watch=False, label_selector='axa.com/dailyclean=true')
    except client.exceptions.ApiException as e:
        print('Error while listing StatefulSet (%s).\n' % e)
    else:
        for stateful_set in stateful_sets.items:
            stateful_set.spec.replicas = 0
            appsV1Api_instance.patch_namespaced_stateful_set(namespace=namespace, name=stateful_set.metadata.name, body=stateful_set)
            print('StatefulSet %s replicas set to 0.' % stateful_set.metadata.name)


if __name__ == '__main__':
    main()
