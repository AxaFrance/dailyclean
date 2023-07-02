package fr.axa.openpaas.dailyclean.exception;

import fr.axa.openpaas.dailyclean.model.Error;
import io.netty.handler.codec.http.HttpResponseStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class DefaultExceptionMapper implements ExceptionMapper<Exception> {

    private static final Logger logger = LoggerFactory.getLogger(DefaultExceptionMapper.class);

    @Override
    public Response toResponse(Exception e) {
        logger.warn("An exception was throw. An error response will be sent.", e);
        Error error = new Error();
        error.setCode(ErrorCode.DEFAULT.getCode());
        error.setMessage(e.getMessage());
        return Response.status(HttpResponseStatus.INTERNAL_SERVER_ERROR.code())
                .entity(error)
                .build();
    }
}
