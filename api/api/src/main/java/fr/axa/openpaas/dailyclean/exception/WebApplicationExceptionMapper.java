package fr.axa.openpaas.dailyclean.exception;

import fr.axa.openpaas.dailyclean.model.Error;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

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
