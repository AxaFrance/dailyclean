
FROM registry.access.redhat.com/ubi10/python-312-minimal AS build
ENV \
  APP_ROOT=/opt/app-root \
  HOME=/opt/app-root \
  PATH=/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  USER=1001

WORKDIR ${APP_ROOT}

RUN python3 -m pip install --compile --no-cache-dir --root ${APP_ROOT}/packages kubernetes
RUN mv ${APP_ROOT}/packages/${APP_ROOT}/* ${APP_ROOT}/packages && rm -rf ${APP_ROOT}/packages/opt

FROM registry.access.redhat.com/ubi10/python-312-minimal AS run
ENV \
  APP_ROOT=/opt/app-root \
  HOME=/opt/app-root \
  PATH=/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  USER=1001

ENV PYTHONPATH=${APP_ROOT}/.local/lib64/python3.12/site-packages

WORKDIR ${APP_ROOT}

COPY --chown=${USER} --from=build ${APP_ROOT}/packages ./.local
COPY --chown=${USER} dailyclean.py ${APP_ROOT}

ENTRYPOINT ["/usr/bin/python3.12", "dailyclean.py"]