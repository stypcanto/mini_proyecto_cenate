package com.styp.cenate.repository;

import com.styp.cenate.model.AtencionClinica107;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

/**
 * 🔄 AtencionClinica107RepositoryCustom
 * Propósito: Interfaz para métodos personalizados con JOIN FETCH
 */
public interface AtencionClinica107RepositoryCustom {

    /**
     * Buscar todas las atenciones con JOIN FETCH de EstadoGestionCita
     */
    <S extends AtencionClinica107> Page<S> findAllWithEstado(
        Specification<AtencionClinica107> spec, 
        Pageable pageable, 
        Class<S> type
    );
}
