package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.styp.cenate.model.Paciente;
import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, String> {
    Optional<Paciente> findByDocPaciente(String docPaciente);
}
