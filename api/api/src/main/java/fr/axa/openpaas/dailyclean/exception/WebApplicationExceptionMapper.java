package fr.axa.openpaas.dailyclean.exception;

import fr.axa.openpaas.dailyclean.model.Error;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class WebApplicationExceptionMapper implements ExceptionMapper<WebApplicationException> {

    @Override
    public Response toResponse(WebApplicationException e) {
        Error error = new Error();
        error.setCode(ErrorCode.DEFAULT.getCode());
        error.setMessage(e.getMessage());
        return Response.status(e.getResponse().getStatus())
                .entity(error)
                .build();
    }
}
