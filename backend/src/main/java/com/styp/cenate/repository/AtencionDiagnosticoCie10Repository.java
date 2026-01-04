// ========================================================================
// AtencionDiagnosticoCie10Repository.java
// ------------------------------------------------------------------------
// CENATE 2026 | Repository para diagnósticos CIE-10 de atenciones
// ========================================================================

package com.styp.cenate.repository;

import com.styp.cenate.model.AtencionDiagnosticoCie10;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtencionDiagnosticoCie10Repository extends JpaRepository<AtencionDiagnosticoCie10, Long> {

    /**
     * Obtener todos los diagnósticos CIE-10 de una atención ordenados por prioridad
     */
    List<AtencionDiagnosticoCie10> findByIdAtencionOrderByOrdenAsc(Long idAtencion);

    /**
     * Obtener solo el diagnóstico principal de una atención
     */
    AtencionDiagnosticoCie10 findByIdAtencionAndEsPrincipalTrue(Long idAtencion);
}
