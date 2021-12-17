# DailyClean
![workflow](https://github.com/AxaGuilDEv/dailyclean/actions/workflows/dailyclean-docker-images.yml/badge.svg) 

![DailyClean](./dailyclean.gif "DailyClean")

- [About](#about)
- [Getting Started](#getting-started)
- [How Does It Work](#how-does-it-work)
- [Contribute](#contribute)
- [Authors](#authors)

## About

Daily clean is all you to turn on or off automatically or manually all your pods your kubernetes namespace.
Save the planet with DailyClean.
Daily clean only use kubernetes native API.

![DailyClean Automation](./dailyclean-configuration.png "DailyClean Automation")

## Configure your Kubernetes cluster

We assume that you have a proper kubernetes installed on your machine (for instance, the docker desktop one).

You have to make sure that you have a service account (for exemple, default) which has sufficient rights to access resources.
If not, you can use this command (!!!DO NOT USE IT IN PRODUCTION !!!)

```
kubectl create clusterrolebinding cluster-admin-default --clusterrole=admin --serviceaccount=default:default
```

To test, you have to know the ip or the domain of your cluster. With docker desktop, it is usually kubernetes.docker.internal.
To find it, use this command :

```
kubectl cluster-info
```

## Getting Started

Kubernetes script is comming soon in this section.

```
git clone https://github.com/AxaGuilDEv/dailyclean.git
cd dailyclean/demo
# Install dailyclean for the default service account
kubectl apply -f deployment-dailyclean.yml
# Install three instances of kubernetes-bootcamp
kubectl apply -f deployment-others.yml
```

Now, open your favorite browser and enter the url of dailyclean-api service : http://${your_cluster_domain_or_ip}:30001

Enjoy dailyclean !!!!

## Clean your local cluster

To clean your kubernetes cluster, use these commands : 

```
kubectl delete service dailyclean-api
kubectl delete service kubernetes-bootcamp1
kubectl delete service kubernetes-bootcamp2
kubectl delete service kubernetes-bootcamp3
kubectl delete deployment dailyclean-api
kubectl delete deployment kubernetes-bootcamp1
kubectl delete deployment kubernetes-bootcamp2
kubectl delete deployment kubernetes-bootcamp3
```


## How Does It Work

- Daily clean use native kubernetes API, it works with any kubernetes projects. 
DailyClean is a pod that have to be install in your namespace. 
It create cron job that start or stop your pods. 
- API is in native GraalVM so it is lightweight.
- User interface is in React/Javascript.

## Contribute

- [How to run the solution and to contribute](./CONTRIBUTING.md)
- [Please respect our code of conduct](./CODE_OF_CONDUCT.md)

## Authors

The awesome team :

- __[Thomas Lemarchand](https://github.com/tlemarchand)__ : Conception, Architecture, Dailyclean job developer
- __[Pierre-Henri Gache](https://github.com/phgache)__ : Architecture, CI/CD Pipelines
- __[Guillaume Thomas](https://github.com/guillaume-thomas)__ : API developer
- __[Guillaume Chervet](https://github.com/guillaume-chervet)__: Frontend developer, CI/CD Pipelines
- Charles Herriau: Developer of the statefulset management feature
