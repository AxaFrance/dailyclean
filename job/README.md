# Introduction
This docker image is used to terminate or create the pods of the namespace

# Build and Test
You can build this image with a classic docker build command. You have to set all the base images like the build image
and the runtime image. 

For example : 

```
docker build --build-arg buildImage=***/factory/build/linux/python:3.8-ubi8 --build-arg runtimeImage=***/factory/build/linux/python:3.8-ubi8 -t openpaas/dailyclean .
```
