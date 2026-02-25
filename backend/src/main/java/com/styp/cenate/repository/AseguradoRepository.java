package com.styp.cenate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.styp.cenate.model.Asegurado;

import java.util.List;
import java.util.Optional;

public interface AseguradoRepository extends JpaRepository<Asegurado, String> {
    Page<Asegurado> findAll(Pageable pageable);

    Optional<Asegurado> findByDocPaciente(String docPaciente);

    /** Carga batch de asegurados por lista de DNIs (evita N+1 en mapeo de bandeja) */
    List<Asegurado> findByDocPacienteIn(List<String> docPacientes);

    /**
     * Devuelve los DNIs de asegurados marcados como paciente_cronico=true.
     * Usado para enriquecer el flag esCenacron cuando la tabla paciente_estrategia
     * no tiene registro activo pero el asegurado ya está marcado en la tabla base.
     */
    @Query(value = "SELECT doc_paciente FROM asegurados WHERE doc_paciente IN :dnis AND paciente_cronico = true", nativeQuery = true)
    List<String> findDnisCronicosByDocPacienteIn(@Param("dnis") List<String> dnis);

    /**
     * Sincroniza el flag paciente_cronico en la tabla asegurados.
     * Se llama al inscribir (true) o dar de baja (false) del programa CENACRON,
     * manteniendo ambas tablas (asegurados y paciente_estrategia) consistentes.
     */
    @Modifying
    @Query(value = "UPDATE asegurados SET paciente_cronico = :valor WHERE doc_paciente = :docPaciente", nativeQuery = true)
    int actualizarPacienteCronico(@Param("docPaciente") String docPaciente, @Param("valor") boolean valor);
}
