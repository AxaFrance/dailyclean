
FROM node:18-buster AS web

ENV \
    APP_ROOT=/app_root \
    USER=patrick \
    HOME=/home

RUN groupadd -r usersdocker && useradd -r -g usersdocker patrick

WORKDIR ${APP_ROOT}
COPY --chown=${USER} ./web .
USER root
RUN npm ci
#RUN npm test
RUN npm run build 
    
FROM registry.access.redhat.com/ubi9/ubi:9.1.0-1782 AS build

ENV \
    APP_ROOT=/app_root \
    USER=1004 \
    HOME=/home

WORKDIR ${APP_ROOT}

USER root

ENV MAVEN_VERSION 3.9.3
ENV MAVEN_DOWNLOAD_SUM 400fc5b6d000c158d5ee7937543faa06b6bda8408caa2444a9c947c21472fde0f0b64ac452b8cec8855d528c0335522ed5b6c8f77085811c7e29e1bedbb5daa2
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

ENV JAVA_VERSION java20
ENV MANDREL_VERSION 23.0.0.0-Final
ENV MANDREL_DOWNLOAD_SUM 4b120a3272b4e637c3832b6245e100105ff07f46ad5b304f4844de5fad6b7fb7

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
COPY --chown=${USER} --from=web ${APP_ROOT}/dist ./src/main/resources/META-INF/resources

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

