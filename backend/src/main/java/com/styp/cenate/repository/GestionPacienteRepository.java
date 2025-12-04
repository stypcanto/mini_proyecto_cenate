package com.styp.cenate.repository;

import com.styp.cenate.model.GestionPaciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GestionPacienteRepository extends JpaRepository<GestionPaciente, Long> {

    // Buscar por pk_asegurado
    Optional<GestionPaciente> findByAsegurado_PkAsegurado(String pkAsegurado);

    // Buscar por número de documento del asegurado
    @Query("SELECT gp FROM GestionPaciente gp WHERE gp.asegurado.docPaciente = :numDoc")
    List<GestionPaciente> findByNumDoc(@Param("numDoc") String numDoc);

    // Buscar por condición
    List<GestionPaciente> findByCondicion(String condicion);

    // Buscar por gestora
    List<GestionPaciente> findByGestora(String gestora);

    // Buscar seleccionados para telemedicina
    List<GestionPaciente> findBySeleccionadoTelemedicina(Boolean seleccionado);

    // Buscar por condición y gestora
    List<GestionPaciente> findByCondicionAndGestora(String condicion, String gestora);

    // Verificar existencia por pk_asegurado
    boolean existsByAsegurado_PkAsegurado(String pkAsegurado);

    // Buscar por IPRESS del asegurado (cas_adscripcion)
    @Query("SELECT gp FROM GestionPaciente gp WHERE gp.asegurado.casAdscripcion = :codIpress")
    List<GestionPaciente> findByIpress(@Param("codIpress") String codIpress);

    // Buscar por origen
    List<GestionPaciente> findByOrigen(String origen);

    // Contar por condición
    long countByCondicion(String condicion);

    // Contar por gestora
    long countByGestora(String gestora);
}
