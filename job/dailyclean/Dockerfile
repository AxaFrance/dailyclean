
FROM registry.access.redhat.com/ubi8/ubi:8.5-200 as build

ENV \
  APP_ROOT=/opt/app-root \
  # The $HOME is not set by default, but some applications needs this variable
  HOME=/opt/app-root \
  PATH=/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

WORKDIR ${APP_ROOT}

RUN INSTALL_PKGS="python38 python38-devel python38-setuptools python38-pip gcc diffutils file make gcc-c++ cmake git" && \
  dnf -y module enable python38:3.8 && \
  dnf -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
  rpm -V $INSTALL_PKGS && \
  dnf -y clean all --enablerepo='*'

RUN python3 -m pip install --compile --no-cache-dir --root ${APP_ROOT}/packages kubernetes
RUN echo $(ls -1 ${APP_ROOT})

FROM registry.access.redhat.com/ubi8-minimal:8.5-204 as run

ENV \
  APP_ROOT=/opt/app-root \
  # The $HOME is not set by default, but some applications needs this variable
  HOME=/opt/app-root \
  PATH=/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin 

RUN INSTALL_PKGS="python38" && \
  microdnf -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
  rpm -V $INSTALL_PKGS && \
  microdnf -y clean all --enablerepo='*'

ENV PYTHONPATH=${APP_ROOT}/.local/lib64/python3.8/site-packages

WORKDIR ${APP_ROOT}

COPY --chown=1001 --from=build ${APP_ROOT}/packages/usr/local ./.local
COPY --chown=1001 dailyclean.py ${APP_ROOT}

ENTRYPOINT ["/usr/bin/python3", "dailyclean.py"]