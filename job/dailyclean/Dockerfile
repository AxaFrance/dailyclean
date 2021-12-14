
FROM registry.access.redhat.com/ubi8/python-38:1-75.1638364053 as build

WORKDIR /workdir
#USER root
#RUN python3 -m pip install --upgrade --user pip wheel && find ${APP_ROOT}/.local -type d -exec chmod 0755 {} \;
RUN python3 -m pip install --compile --no-cache-dir --root /workdir/packages kubernetes
#RUN ls /workdir/packages
RUN echo $(ls -1 /workdir/packages)

FROM registry.access.redhat.com/ubi8/python-38:1-75.1638364053 as run

WORKDIR /workdir

COPY --chown=1001 --from=build /workdir/packages/usr/local ./.local
COPY --chown=1001 dailyclean.py /workdir/

ENTRYPOINT ["/usr/bin/python3", "dailyclean.py"]