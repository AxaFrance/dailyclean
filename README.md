# DailyClean
![API workflow](https://github.com/AxaGuilDEv/dailyclean/actions/workflows/dailyclean-api-docker-image.yml/badge.svg) ![JOB workflow](https://github.com/AxaGuilDEv/dailyclean/actions/workflows/dailyclean-job-docker-image.yml/badge.svg)

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
docker pull axaguildev/dailyclean-api:pr-7
docker run -i --rm -p 8080:8080 axaguildev/dailyclean-api:pr-7
# now you can open your browser to http://localhost:8080 
# you can change the price ratio by adding price_by_month query string: http://localhost:8080?price_by_month=100 the default price is 75

# The Job 
docker pull axaguildev/dailyclean-job:pr-7
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

- Thomas Lemarchand 
- Pierre-Henri Gache
- Guillaume Thomas
- Guillaume Chervet
