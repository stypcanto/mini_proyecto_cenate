package com.styp.cenate.repository;

import com.styp.cenate.model.RecuperacionCuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecuperacionCuentaRepository extends JpaRepository<RecuperacionCuenta, Long> {
    List<RecuperacionCuenta> findByEstadoIgnoreCase(String estado);
}