
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
    
FROM registry.access.redhat.com/ubi8/ubi:8.5-200 AS build

ENV \
    APP_ROOT=/app_root \
    USER=1004 \
    HOME=/home

WORKDIR ${APP_ROOT}

USER root

ENV MAVEN_VERSION 3.8.6
ENV MAVEN_DOWNLOAD_SUM f790857f3b1f90ae8d16281f902c689e4f136ebe584aba45e4b1fa66c80cba826d3e0e52fdd04ed44b4c66f6d3fe3584a057c26dfcac544a60b301e6d0f91c26
ENV MAVEN_DIR=/opt/maven

RUN INSTALL_PKGS="java-11-openjdk java-11-openjdk-devel" && \
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

RUN rm -r /var/cache/dnf && curl -fsSL https://git.centos.org/rpms/centos-repos/raw/c8/f/SOURCES/CentOS-Stream-PowerTools.repo -O && \
    mv CentOS-Stream-PowerTools.repo /etc/yum.repos.d/ && \
    curl -fsSL https://git.centos.org/rpms/centos-repos/raw/c8/f/SOURCES/RPM-GPG-KEY-centosofficial -O && \
    mv RPM-GPG-KEY-centosofficial /etc/pki/rpm-gpg/ && \
    INSTALL_PKGS="glibc-devel zlib-devel gcc" && \
    dnf -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    echo 8-stream > /etc/yum/vars/stream && \
    dnf makecache && \
    dnf --nobest --enablerepo=powertools -y install libstdc++-static && \
    rpm -V libstdc++-static && \
    dnf -y clean all --enablerepo='*'

ENV JAVA_VERSION java11
ENV MANDREL_VERSION 21.0.0.0-Final
ENV MANDREL_DOWNLOAD_SUM 85c5d39997e373fa488a1e5555a1040bebb98f307968f3614a002f75ebf678ff

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

FROM registry.access.redhat.com/ubi8-minimal:8.5-204 AS runtime

ENV \
    APP_ROOT=/app_root \
    USER=1004 \
    HOME=/home

WORKDIR ${APP_ROOT}
COPY --chown=${USER} --from=build ${APP_ROOT}/target/*-runner ./application

EXPOSE 8080
USER ${USER}

CMD ["./application", "-Dquarkus.http.host=0.0.0.0", "-Xms40m", "-Xmx60m", "-Xmn20m"]

