ARG buildImage
ARG runtimeImage

FROM ${buildImage} as build

WORKDIR ${APP_ROOT}/

RUN python3 -m pip install --compile --no-cache-dir --root ${APP_ROOT}/packages kubernetes


FROM ${runtimeImage} as run

WORKDIR ${APP_ROOT}/

COPY --chown=1001 --from=build ${APP_ROOT}/packages/usr/local ./.local
COPY --chown=1001 dailyclean.py ${APP_ROOT}/

ENTRYPOINT ["/usr/bin/python3", "dailyclean.py"]