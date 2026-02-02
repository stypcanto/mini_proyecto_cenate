package com.styp.cenate.repository;

import com.styp.cenate.model.AtencionClinica107;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 🔄 AtencionClinica107RepositoryImpl
 * Propósito: Implementación de métodos personalizados con JOIN FETCH
 */
@Repository
@RequiredArgsConstructor
public class AtencionClinica107RepositoryImpl implements AtencionClinica107RepositoryCustom {

    private final EntityManager entityManager;

    /**
     * Buscar todas las atenciones con JOIN FETCH de EstadoGestionCita
     * Evita el problema de N+1 queries
     */
    @Override
    @SuppressWarnings("unchecked")
    public <S extends AtencionClinica107> Page<S> findAllWithEstado(
        Specification<AtencionClinica107> spec,
        Pageable pageable,
        Class<S> type
    ) {
        // Crear query con JOIN FETCH
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<AtencionClinica107> query = cb.createQuery(AtencionClinica107.class);
        Root<AtencionClinica107> root = query.from(AtencionClinica107.class);
        
        // Hacer JOIN FETCH de EstadoGestionCita
        root.fetch("estadoGestionCita", JoinType.LEFT);
        
        // Aplicar especificación
        if (spec != null) {
            query.where(spec.toPredicate(root, query, cb));
        }
        
        // Aplicar ordenamiento
        query.select(root).distinct(true);
        
        // Obtener total count
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<AtencionClinica107> countRoot = countQuery.from(AtencionClinica107.class);
        
        if (spec != null) {
            countQuery.where(spec.toPredicate(countRoot, countQuery, cb));
        }
        
        countQuery.select(cb.countDistinct(countRoot));
        long total = entityManager.createQuery(countQuery).getSingleResult();
        
        // Aplicar paginación
        List<AtencionClinica107> content = entityManager.createQuery(query)
            .setFirstResult((int) pageable.getOffset())
            .setMaxResults(pageable.getPageSize())
            .getResultList();
        
        return (Page<S>) new PageImpl<>(content, pageable, total);
    }
}
