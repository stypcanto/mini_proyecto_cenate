package com.styp.cenate.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class AseguradoNoEncontradoException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;

	public AseguradoNoEncontradoException(String documento) {
		super("Error : " + documento);
	}

}
