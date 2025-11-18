package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.styp.cenate.model.SolicitudCuenta;

public interface SolicitudCuentaRepository extends JpaRepository<SolicitudCuenta, Long> {
    long countByEstado(String estado);
}