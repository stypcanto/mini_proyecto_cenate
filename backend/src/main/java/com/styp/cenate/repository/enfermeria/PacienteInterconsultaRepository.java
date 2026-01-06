package com.styp.cenate.repository.enfermeria;

import com.styp.cenate.model.enfermeria.PacienteInterconsulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PacienteInterconsultaRepository extends JpaRepository<PacienteInterconsulta, Long> {

    List<PacienteInterconsulta> findByIdPaciente(Long idPaciente);

    List<PacienteInterconsulta> findByEstado(String estado);
}
