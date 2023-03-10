
FROM node:16-buster AS web

ENV \
    APP_ROOT=/app_root \
    USER=patrick \
    HOME=/home

RUN groupadd -r usersdocker && useradd -r -g usersdocker patrick

WORKDIR ${APP_ROOT}
COPY --chown=${USER} ./web .
USER root
RUN npm ci
RUN npm test --  --runInBand --coverage --watchAll=false
RUN npm run build 
    
FROM registry.access.redhat.com/ubi9/ubi:9.1.0-1782 AS build

ENV \
    APP_ROOT=/app_root \
    USER=1004 \
    HOME=/home

WORKDIR ${APP_ROOT}

USER root

ENV MAVEN_VERSION 3.9.0
ENV MAVEN_DOWNLOAD_SUM 1ea149f4e48bc7b34d554aef86f948eca7df4e7874e30caf449f3708e4f8487c71a5e5c072a05f17c60406176ebeeaf56b5f895090c7346f8238e2da06cf6ecd
ENV MAVEN_DIR=/opt/maven

RUN INSTALL_PKGS="java-17-openjdk java-17-openjdk-devel" && \
  dnf -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
  rpm -V $INSTALL_PKGS && \
  dnf -y clean all --enablerepo='*'

WORKDIR ${HOME}

RUN curl -fsSL https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz -O && \
    #echo "sha512sum apache-maven-${MAVEN_VERSION}-bin.tar.gz" && \
    echo "$MAVEN_DOWNLOAD_SUM  apache-maven-${MAVEN_VERSION}-bin.tar.gz" | sha512sum -c - && \
    tar xvfz apache-maven-${MAVEN_VERSION}-bin.tar.gz && \
    mkdir -p ${MAVEN_DIR} && \
    cp -R apache-maven-${MAVEN_VERSION}/* ${MAVEN_DIR} && \
    rm ${MAVEN_DIR}/conf/settings.xml && \
    #cp /opt/configurations/settings.xml ${MAVEN_DIR}/conf/settings.xml && \
    rm -Rf apache-maven-${MAVEN_VERSION}
    

ENV PATH ${MAVEN_DIR}/bin:$PATH

RUN rm -r /var/cache/dnf && \
    INSTALL_PKGS="glibc-devel zlib-devel gcc" && \
    dnf -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    dnf makecache && \
    dnf --nobest -y install libstdc++-static && \
    rpm -V libstdc++-static && \
    dnf -y clean all --enablerepo='*'

ENV JAVA_VERSION java17
ENV MANDREL_VERSION 22.3.1.0-Final
ENV MANDREL_DOWNLOAD_SUM 3c31169724c1fa23dc5cf5688d9d7f90d0d7bef9e90c9aea2419db9eb946b62c

WORKDIR ${APP_ROOT}

RUN curl -fsSL https://github.com/graalvm/mandrel/releases/download/mandrel-${MANDREL_VERSION}/mandrel-${JAVA_VERSION}-linux-amd64-${MANDREL_VERSION}.tar.gz -O && \
    echo "$MANDREL_DOWNLOAD_SUM  mandrel-${JAVA_VERSION}-linux-amd64-${MANDREL_VERSION}.tar.gz" | sha256sum -c - && \
    tar xvfz mandrel-${JAVA_VERSION}-linux-amd64-${MANDREL_VERSION}.tar.gz && \
    rm mandrel-${JAVA_VERSION}-linux-amd64-${MANDREL_VERSION}.tar.gz && \
    mv mandrel-${JAVA_VERSION}-${MANDREL_VERSION} mandrel && \
    rm -Rf mandrel/demo mandrel/man 

ENV JAVA_HOME=${APP_ROOT}/mandrel
ENV GRAALVM_HOME=${APP_ROOT}/mandrel
ENV PATH=${JAVA_HOME}/bin:${PATH}

COPY --chown=${USER} ./api .
RUN rm -Rf ./src/main/resources/META-INF/resources
COPY --chown=${USER} --from=web ${APP_ROOT}/build ./src/main/resources/META-INF/resources

RUN mvn package -Pnative -B

FROM registry.access.redhat.com/ubi9/ubi-minimal:9.1.0-1793 AS runtime

ENV \
    APP_ROOT=/app_root \
    USER=1004 \
    HOME=/home

WORKDIR ${APP_ROOT}
COPY --chown=${USER} --from=build ${APP_ROOT}/target/*-runner ./application

EXPOSE 8080
USER ${USER}

CMD ["./application", "-Dquarkus.http.host=0.0.0.0", "-Xms40m", "-Xmx60m", "-Xmn20m"]

