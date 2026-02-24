package com.styp.cenate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.styp.cenate.model.Asegurado;

import java.util.List;
import java.util.Optional;

public interface AseguradoRepository extends JpaRepository<Asegurado, String> {
    Page<Asegurado> findAll(Pageable pageable);

    Optional<Asegurado> findByDocPaciente(String docPaciente);

    /** Carga batch de asegurados por lista de DNIs (evita N+1 en mapeo de bandeja) */
    List<Asegurado> findByDocPacienteIn(List<String> docPacientes);
}
