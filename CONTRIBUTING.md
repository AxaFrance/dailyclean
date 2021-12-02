# Contributing to daily-clean

**Table of Contents**

- [Prerequisite](#prerequisite)
- [Installation](#installation)

## Prerequisite

You are advised to install GraalVM CE Jdk 11 on your machine and configure the environment variables accordingly.

This project uses GraalVM + Quarkus. You are therefore asked to configure your machine as follows:

- Install and configure Docker
- Install Java / GraalVM
- We recommend not to decorrelate the JDK from GraalVM (perfectly possible)
  Download GraalVM JDK 11 Community edition : https://www.graalvm.org/downloads/
Unzip GraalVM in the directory of your choice (example: C:\GTH\Tools\Java\graalvm-ce-java11-21.0.0.2).
- Create (or modify) the environment variables:
    - JAVA_HOME = C:\GTH\Tools\Java\graalvm-ce-java11-21.0.0.2
    - GRAALVM_HOME = C:\GTH\Tools\Java\graalvm-ce-java11-21.0.0.2
    - PATH += %JAVA_HOME%\bin (useful for doing java commands from the command prompt) 
- Install and configure Maven
- Enjoy Java!

## Installation

To get started, start by [forking the repository](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo) on your personnal github account.

Then, clone the forked repository:

```sh
git clone https://github.com/{your_account}/dailyclean.git
```

Run the server in dev mode:

```sh
cd dailyclean
cd api
mvn clean install
mvn compile quarkus:dev
```

Run the server with JIT Java compiler:

```sh
cd dailyclean
cd api
mvn clean install
java -jar /target/quarkus/quarkus-app.jar
```

Run webpage:

```sh
cd dailyclean
cd api
npm i
npm start
```