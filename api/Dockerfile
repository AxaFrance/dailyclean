
FROM registry.access.redhat.com/ubi10/nodejs-22 AS web
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

FROM registry.access.redhat.com/ubi10/ubi:latest AS build
ENV \
  APP_ROOT=/opt/app-root \
  HOME=/opt/app-root \
  PATH=/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  USER=1001

WORKDIR ${APP_ROOT}

USER root

ENV MAVEN_VERSION=3.9.12
ENV MAVEN_DOWNLOAD_SUM=0a1be79f02466533fc1a80abbef8796e4f737c46c6574ede5658b110899942a94db634477dfd3745501c80aef9aac0d4f841d38574373f7e2d24cce89d694f70
ENV MAVEN_DIR=/opt/maven

RUN printf "[Adoptium]\nname=Adoptium\nbaseurl=https://packages.adoptium.net/artifactory/rpm/rhel/10/x86_64/\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.adoptium.net/artifactory/api/gpg/key/public\n" > /etc/yum.repos.d/adoptium.repo

RUN INSTALL_PKGS="temurin-25-jdk" && \
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


ENV PATH=${MAVEN_DIR}/bin:$PATH

RUN rm -r /var/cache/dnf && \
    INSTALL_PKGS="glibc-devel zlib-ng-compat-devel gcc" && \
    dnf -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    dnf makecache && \
    dnf --nobest -y install libstdc++-static && \
    rpm -V libstdc++-static && \
    dnf -y clean all --enablerepo='*'

ENV JAVA_VERSION=java25
ENV MANDREL_VERSION=25.0.0.1-Final
ENV MANDREL_DOWNLOAD_SUM=d4eaeacc7737d7f0285164c56472d5cdd5f44228597b38329d8b436594c15af5
ENV MANDREL_DIR=/opt/mandrel

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

FROM registry.access.redhat.com/ubi10/ubi-minimal:latest AS runtime
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
