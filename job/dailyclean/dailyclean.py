from kubernetes import client, config
import os
import sys
import time


def get_api_client(local_mode=False):
    if local_mode:
        configuration = client.Configuration()
        config.load_kube_config(client_configuration=configuration)
        configuration.verify_ssl = False
        return client.ApiClient(configuration)
    else:
        config.load_incluster_config()
        return client.ApiClient()


def list_deployments(api_instance, namespace, label_selector):
    try:
        return api_instance.list_namespaced_deployment(namespace=namespace, watch=False, label_selector=label_selector)
    except client.exceptions.ApiException as e:
        print(f'Error while listing Deployments with selector {label_selector} ({e}).')
        return None


def list_stateful_sets(api_instance, namespace, label_selector):
    try:
        return api_instance.list_namespaced_stateful_set(namespace=namespace, watch=False,
                                                         label_selector=label_selector)
    except client.exceptions.ApiException as e:
        print(f'Error while listing StatefulSet with selector {label_selector} ({e}).')
        return None


def patch_deployment(api_instance, namespace, deployment_name, replicas):
    deployment = api_instance.read_namespaced_deployment(namespace=namespace, name=deployment_name)
    deployment.spec.replicas = replicas
    api_instance.patch_namespaced_deployment(namespace=namespace, name=deployment_name, body=deployment)


def patch_stateful_set(api_instance, namespace, stateful_set_name, replicas):
    stateful_set = api_instance.read_namespaced_stateful_set(namespace=namespace, name=stateful_set_name)
    stateful_set.spec.replicas = replicas
    api_instance.patch_namespaced_stateful_set(namespace=namespace, name=stateful_set_name, body=stateful_set)


def get_replicas(action, resource):
    if action == "start":
        replicas = int(resource.metadata.labels.get('axa.com/dailyclean-start-replicas', 1))
    elif action == "stop":
        replicas = 0
    else:
        raise Exception(f'Unknown action {action}.')
    return replicas


def handle_resources(api_instance, namespace, action, excluding=None):
    if excluding is None:
        excluding = []
    deployments = list_deployments(api_instance, namespace, 'axa.com/dailyclean!=false')
    if deployments:
        for deployment in deployments.items:
            if deployment.metadata.name in excluding:
                continue
            replicas = get_replicas(action, deployment)
            patch_deployment(api_instance, namespace, deployment.metadata.name, replicas)
            print(f'Deployment {deployment.metadata.name} replicas set to {replicas}.')

    stateful_sets = list_stateful_sets(api_instance, namespace, 'axa.com/dailyclean!=false')
    if stateful_sets:
        for stateful_set in stateful_sets.items:
            replicas = get_replicas(action, stateful_set)
            patch_stateful_set(api_instance, namespace, stateful_set.metadata.name, replicas)
            print(f'StatefulSet {stateful_set.metadata.name} replicas set to {replicas}.')


def try_scale_down(api_instance, namespace, deployment_name):
    try:
        api_instance.read_namespaced_deployment(namespace=namespace, name=deployment_name)
    except client.exceptions.ApiException as e:
        print(f'No {deployment_name} deployed. Skipping')
        return
    while api_instance.read_namespaced_deployment(namespace=namespace, name=deployment_name).spec.replicas != 0:
        print(f'Trying to set deployment {deployment_name} replicas to 0.')
        patch_deployment(api_instance, namespace, deployment_name, 0)
        time.sleep(10)
    print(f'Deployment {deployment_name} replicas set to 0.')


def start(api_client, namespace):
    api_instance = client.AppsV1Api(api_client)
    handle_resources(api_instance, namespace, "start")


def stop(api_client, namespace):
    api_instance = client.AppsV1Api(api_client)

    # Scale down flux and helm-operator first, so they don't try to reconcile the resources we're about to scale down
    try_scale_down(api_instance, namespace, 'flux')
    try_scale_down(api_instance, namespace, 'helm-operator')

    handle_resources(api_instance, namespace, "stop", excluding=['flux', 'helm-operator'])


def main():
    local_mode = len(sys.argv) > 2 and sys.argv[2] == 'local'
    api_client = get_api_client(local_mode)
    namespace = os.environ.get('CURRENT_NAMESPACE')

    if sys.argv[1] == 'start':
        start(api_client, namespace)
    elif sys.argv[1] == 'stop':
        stop(api_client, namespace)


if __name__ == '__main__':
    main()
