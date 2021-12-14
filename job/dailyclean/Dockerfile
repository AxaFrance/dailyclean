
FROM registry.access.redhat.com/ubi8/python-38:1-75.1638364053 as build

ENV APP_ROOT /app_root
WORKDIR ${APP_ROOT}
USER root
RUN python3 -m pip install --compile --no-cache-dir --root ${APP_ROOT}/packages kubernetes
RUN echo $(ls -1 ${APP_ROOT})

FROM registry.access.redhat.com/ubi8/python-38:1-75.1638364053 as run

ENV APP_ROOT /app_root
WORKDIR ${APP_ROOT}

COPY --chown=1001 --from=build ${APP_ROOT}/packages/opt/app-root/bin ./.local
COPY --chown=1001 dailyclean.py ${APP_ROOT}

ENTRYPOINT ["/usr/bin/python3", "dailyclean.py"]