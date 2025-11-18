package com.styp.cenate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.styp.cenate.model.SolicitudContrasena;

public interface SolicitudContrasenaRepository extends JpaRepository<SolicitudContrasena, Long> {
	
    Optional<SolicitudContrasena> findByIdempotencia(String idempotencia);


}
