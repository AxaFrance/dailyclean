ARG buildImage
ARG runtimeImage
ARG nodeImage

FROM ${nodeImage} AS web

WORKDIR ${APP_ROOT}
COPY --chown=${USER} ./web .

RUN npm ci 
RUN npm run build 
RUN npm test --  --runInBand --coverage --watchAll=false

FROM ${buildImage} AS build

WORKDIR ${APP_ROOT}
COPY --chown=${USER} ./api .
RUN rm -Rf ./src/main/resources/META-INF/resources
COPY --chown=${USER} --from=web ${APP_ROOT}/build ./src/main/resources/META-INF/resources

RUN mvn package -Pnative -B

FROM ${runtimeImage} AS runtime

WORKDIR ${APP_ROOT}
COPY --chown=${USER} --from=build ${APP_ROOT}/target/*-runner ./application

EXPOSE 8080
USER ${USER}

CMD ["./application", "-Dquarkus.http.host=0.0.0.0", "-Xms40m", "-Xmx60m", "-Xmn20m"]

