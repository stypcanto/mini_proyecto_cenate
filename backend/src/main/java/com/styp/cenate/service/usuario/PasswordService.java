package com.styp.cenate.service.usuario;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.styp.cenate.utils.PasswordGenerator;

@Service
public class PasswordService {

	private static final int DEFAULT_LENGTH = 10;

	private final PasswordEncoder passwordEncoder;

	public PasswordService(PasswordEncoder passwordEncoder) {
		this.passwordEncoder = passwordEncoder;
	}

	public String generarNuevaContrasena() {
		return PasswordGenerator.generarContrasena(DEFAULT_LENGTH);
	}

	public String encriptar(String contrasenaPlana) {
		return passwordEncoder.encode(contrasenaPlana);
	}
}
