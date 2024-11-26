
FROM registry.access.redhat.com/ubi9/python-312 as build

ENV APP_ROOT=/opt/app-root

WORKDIR ${APP_ROOT}

RUN python3 -m pip install --compile --no-cache-dir --root ${APP_ROOT}/packages kubernetes
RUN mv ${APP_ROOT}/packages/${APP_ROOT}/* ${APP_ROOT}/packages && rm -rf ${APP_ROOT}/packages/opt

FROM registry.access.redhat.com/ubi9-minimal:latest as run

ENV \
  APP_ROOT=/opt/app-root \
  # The $HOME is not set by default, but some applications needs this variable
  HOME=/opt/app-root \
  PATH=/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

RUN INSTALL_PKGS="python3.12" && \
  microdnf -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
  rpm -V $INSTALL_PKGS && \
  microdnf -y clean all --enablerepo='*'

ENV PYTHONPATH=${APP_ROOT}/.local/lib64/python3.12/site-packages

WORKDIR ${APP_ROOT}

COPY --chown=1001 --from=build ${APP_ROOT}/packages ./.local
COPY --chown=1001 dailyclean.py ${APP_ROOT}

ENTRYPOINT ["/usr/bin/python3.12", "dailyclean.py"]