package com.styp.cenate.repository.enfermeria;

import com.styp.cenate.model.enfermeria.AtencionEnfermeria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtencionEnfermeriaRepository extends JpaRepository<AtencionEnfermeria, Long> {

    // Buscar si ya existe atención para una atención médica específica
    Optional<AtencionEnfermeria> findByIdAtencionMedicaRef(Long idAtencionMedicaRef);

    // Buscar si ya existe atención para una cita específica
    Optional<AtencionEnfermeria> findByIdCitaRef(Long idCitaRef);

    // Listar atenciones de un paciente ordenadas por fecha reciente
    List<AtencionEnfermeria> findByIdPacienteOrderByFechaAtencionDesc(Long idPaciente);

    // Método para obtener todas las atenciones asociadas a un paciente con datos
    // enriquecidos (si fuera necesario DTO projection)
    @Query("SELECT ae FROM AtencionEnfermeria ae WHERE ae.idPaciente = :idPaciente ORDER BY ae.fechaAtencion DESC")
    List<AtencionEnfermeria> findAllByPacienteId(@Param("idPaciente") Long idPaciente);

    // Listar atenciones de una enfermera específica ordenadas por fecha reciente
    List<AtencionEnfermeria> findByIdUsuarioEnfermeraOrderByFechaAtencionDesc(Long idUsuarioEnfermera);
}
