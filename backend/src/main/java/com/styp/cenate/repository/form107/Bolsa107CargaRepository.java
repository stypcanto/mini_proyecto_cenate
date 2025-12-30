package com.styp.cenate.repository.form107;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.styp.cenate.model.form107.Bolsa107Carga;

public interface Bolsa107CargaRepository extends JpaRepository<Bolsa107Carga, Long> {
	Optional<Bolsa107Carga> findByFechaReporteAndHashArchivo(LocalDate fechaReporte, String hashArchivo);
}
