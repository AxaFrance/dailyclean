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

## Getting Started

Kubernetes script is comming soon in this section.

```
# The API 
docker pull axaguildev/dailyclean-api:latest
docker run -i --rm -p 8080:8080 axaguildev/dailyclean-api:latest
# now you can open your browser to http://localhost:8080 
# you can change the price ratio by adding price_by_month query string: http://localhost:8080?price_by_month=100 the default price is 75

# The Job 
docker pull axaguildev/dailyclean-job:latest
# The job run only run on kubernetes
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
