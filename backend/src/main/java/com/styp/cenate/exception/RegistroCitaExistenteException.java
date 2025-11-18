package com.styp.cenate.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class RegistroCitaExistenteException extends RuntimeException{
	
	private static final long serialVersionUID = 1L;

	public RegistroCitaExistenteException(String mensaje) {
		super(mensaje);
	}

}
