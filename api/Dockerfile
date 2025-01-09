
FROM registry.access.redhat.com/ubi9/nodejs-22 AS web
ENV \
  APP_ROOT=/opt/app-root \
  HOME=/opt/app-root \
  PATH=/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  USER=1001

WORKDIR ${APP_ROOT}
COPY --chown=${USER} ./web .
USER root
RUN npm ci
RUN npm test -- --run
RUN npm run build

FROM registry.access.redhat.com/ubi9/ubi:latest AS build
ENV \
  APP_ROOT=/opt/app-root \
  HOME=/opt/app-root \
  PATH=/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  USER=1001

WORKDIR ${APP_ROOT}

USER root

ENV MAVEN_VERSION 3.9.6
ENV MAVEN_DOWNLOAD_SUM 706f01b20dec0305a822ab614d51f32b07ee11d0218175e55450242e49d2156386483b506b3a4e8a03ac8611bae96395fd5eec15f50d3013d5deed6d1ee18224
ENV MAVEN_DIR=/opt/maven

RUN INSTALL_PKGS="java-21-openjdk java-21-openjdk-devel" && \
  dnf -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
  rpm -V $INSTALL_PKGS && \
  dnf -y clean all --enablerepo='*'

WORKDIR ${HOME}

RUN curl -fsSL https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz -O && \
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

ENV JAVA_VERSION java21
ENV MANDREL_VERSION 23.1.0.0-Final
ENV MANDREL_DOWNLOAD_SUM 49b5a7672c542a5636a92abc2bae53ab024207261f45766774b77ee44e40ba82
ENV MANDREL_DIR /opt/mandrel

WORKDIR ${APP_ROOT}

RUN curl -fsSL https://github.com/graalvm/mandrel/releases/download/mandrel-${MANDREL_VERSION}/mandrel-${JAVA_VERSION}-linux-amd64-${MANDREL_VERSION}.tar.gz -O && \
    echo "$MANDREL_DOWNLOAD_SUM  mandrel-${JAVA_VERSION}-linux-amd64-${MANDREL_VERSION}.tar.gz" | sha256sum -c - && \
    tar xvfz mandrel-${JAVA_VERSION}-linux-amd64-${MANDREL_VERSION}.tar.gz && \
    rm mandrel-${JAVA_VERSION}-linux-amd64-${MANDREL_VERSION}.tar.gz && \
    mv mandrel-${JAVA_VERSION}-${MANDREL_VERSION} ${MANDREL_DIR} && \
    rm -Rf ${MANDREL_DIR}/demo ${MANDREL_DIR}/man

ENV JAVA_HOME=${MANDREL_DIR}
ENV GRAALVM_HOME=${MANDREL_DIR}
ENV PATH=${JAVA_HOME}/bin:${MAVEN_DIR}/bin:${PATH}

COPY --chown=${USER} ./api .
RUN rm -Rf ./src/main/resources/META-INF/resources
COPY --chown=${USER} --from=web ${APP_ROOT}/dist ./src/main/resources/META-INF/resources

RUN mvn package -Pnative -B

FROM registry.access.redhat.com/ubi9/ubi-minimal:latest AS runtime
ENV \
  APP_ROOT=/opt/app-root \
  HOME=/opt/app-root \
  PATH=/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  USER=1001

WORKDIR ${APP_ROOT}
COPY --chown=${USER} --from=build ${APP_ROOT}/target/*-runner ./application

EXPOSE 8080
USER ${USER}

CMD ["./application", "-Dquarkus.http.host=0.0.0.0", "-Xms40m", "-Xmx60m", "-Xmn20m"]
