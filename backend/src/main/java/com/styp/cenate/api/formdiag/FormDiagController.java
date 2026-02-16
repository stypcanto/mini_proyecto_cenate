package com.styp.cenate.api.formdiag;

import com.styp.cenate.dto.formdiag.DescargarZipRequest;
import com.styp.cenate.dto.formdiag.FirmaDigitalRequest;
import com.styp.cenate.dto.formdiag.FirmaDigitalResponse;
import com.styp.cenate.dto.formdiag.FormDiagEstadisticasDTO;
import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import com.styp.cenate.dto.formdiag.FormDiagRequest;
import com.styp.cenate.dto.formdiag.FormDiagResponse;
import com.styp.cenate.model.formdiag.FormDiagCatNecesidad;
import com.styp.cenate.model.formdiag.FormDiagCatPrioridad;
import com.styp.cenate.repository.formdiag.FormDiagCatNecesidadRepository;
import com.styp.cenate.repository.formdiag.FormDiagCatPrioridadRepository;
import com.styp.cenate.service.formdiag.FirmaDigitalService;
import com.styp.cenate.service.formdiag.FormDiagExcelService;
import com.styp.cenate.service.formdiag.FormDiagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Controlador REST para gestionar los formularios de diagnóstico situacional de Telesalud
 */
@RestController
@RequestMapping("/api/formulario-diagnostico")
@RequiredArgsConstructor
@Slf4j
public class FormDiagController {

    private final FormDiagService formDiagService;
    private final FirmaDigitalService firmaDigitalService;
    private final FormDiagExcelService formDiagExcelService;
    private final FormDiagCatNecesidadRepository catNecesidadRepo;
    private final FormDiagCatPrioridadRepository catPrioridadRepo;

    /**
     * Crear un nuevo formulario de diagnóstico
     */
    @PostMapping
    public ResponseEntity<FormDiagResponse> crear(
            @RequestBody FormDiagRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("POST /api/formulario-diagnostico - Creando nuevo formulario");
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        FormDiagResponse response = formDiagService.crear(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Actualizar un formulario existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<FormDiagResponse> actualizar(
            @PathVariable("id") Integer id,
            @RequestBody FormDiagRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("PUT /api/formulario-diagnostico/{} - Actualizando formulario", id);
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        FormDiagResponse response = formDiagService.actualizar(id, request, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Guardar borrador del formulario (crear o actualizar)
     */
    @PostMapping("/borrador")
    public ResponseEntity<FormDiagResponse> guardarBorrador(
            @RequestBody FormDiagRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("POST /api/formulario-diagnostico/borrador - Guardando borrador");
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        FormDiagResponse response = formDiagService.guardarBorrador(request, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Enviar formulario (cambiar estado a ENVIADO)
     */
    @PostMapping("/{id}/enviar")
    public ResponseEntity<FormDiagResponse> enviar(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("POST /api/formulario-diagnostico/{}/enviar - Enviando formulario", id);
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        FormDiagResponse response = formDiagService.enviar(id, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener formulario por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<FormDiagResponse> obtenerPorId(@PathVariable("id") Integer id) {
        log.info("GET /api/formulario-diagnostico/{} - Obteniendo formulario", id);
        FormDiagResponse response = formDiagService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener formulario activo (en proceso) por IPRESS
     */
    @GetMapping("/borrador/ipress/{idIpress}")
    public ResponseEntity<FormDiagResponse> obtenerBorradorPorIpress(@PathVariable("idIpress") Long idIpress) {
        log.info("GET /api/formulario-diagnostico/borrador/ipress/{} - Obteniendo borrador", idIpress);
        FormDiagResponse response = formDiagService.obtenerEnProcesoPorIpress(idIpress);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener el último formulario por IPRESS (cualquier estado)
     */
    @GetMapping("/ultimo/ipress/{idIpress}")
    public ResponseEntity<FormDiagResponse> obtenerUltimoPorIpress(@PathVariable("idIpress") Long idIpress) {
        log.info("GET /api/formulario-diagnostico/ultimo/ipress/{} - Obteniendo último formulario", idIpress);
        FormDiagResponse response = formDiagService.obtenerUltimoPorIpress(idIpress);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Listar todos los formularios
     */
    @GetMapping
    public ResponseEntity<List<FormDiagListResponse>> listarTodos() {
        log.info("GET /api/formulario-diagnostico - Listando todos los formularios");
        List<FormDiagListResponse> response = formDiagService.listarTodos();
        return ResponseEntity.ok(response);
    }

    /**
     * Listar formularios por IPRESS
     */
    @GetMapping("/ipress/{idIpress}")
    public ResponseEntity<List<FormDiagListResponse>> listarPorIpress(@PathVariable("idIpress") Long idIpress) {
        log.info("GET /api/formulario-diagnostico/ipress/{} - Listando por IPRESS", idIpress);
        List<FormDiagListResponse> response = formDiagService.listarPorIpress(idIpress);
        return ResponseEntity.ok(response);
    }

    /**
     * Listar formularios por Red Asistencial
     */
    @GetMapping("/red/{idRed}")
    public ResponseEntity<List<FormDiagListResponse>> listarPorRed(@PathVariable("idRed") Long idRed) {
        log.info("GET /api/formulario-diagnostico/red/{} - Listando por Red", idRed);
        List<FormDiagListResponse> response = formDiagService.listarPorRed(idRed);
        return ResponseEntity.ok(response);
    }

    /**
     * Listar formularios por estado
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<FormDiagListResponse>> listarPorEstado(@PathVariable("estado") String estado) {
        log.info("GET /api/formulario-diagnostico/estado/{} - Listando por estado", estado);
        List<FormDiagListResponse> response = formDiagService.listarPorEstado(estado);
        return ResponseEntity.ok(response);
    }

    /**
     * Listar formularios por año
     */
    @GetMapping("/anio/{anio}")
    public ResponseEntity<List<FormDiagListResponse>> listarPorAnio(@PathVariable("anio") Integer anio) {
        log.info("GET /api/formulario-diagnostico/anio/{} - Listando por año", anio);
        List<FormDiagListResponse> response = formDiagService.listarPorAnio(anio);
        return ResponseEntity.ok(response);
    }

    /**
     * Eliminar formulario (solo si está en proceso)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Integer id) {
        log.info("DELETE /api/formulario-diagnostico/{} - Eliminando formulario", id);
        formDiagService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Verificar si existe un formulario en proceso para la IPRESS en el año actual
     */
    @GetMapping("/existe-en-proceso/ipress/{idIpress}")
    public ResponseEntity<Boolean> existeEnProcesoActual(@PathVariable("idIpress") Long idIpress) {
        log.info("GET /api/formulario-diagnostico/existe-en-proceso/ipress/{} - Verificando", idIpress);
        boolean existe = formDiagService.existeEnProcesoActual(idIpress);
        return ResponseEntity.ok(existe);
    }

    // ==================== ENDPOINTS DE FIRMA DIGITAL ====================

    /**
     * Firmar un formulario de diagnóstico con certificado digital
     */
    @PostMapping("/{id}/firmar")
    public ResponseEntity<FirmaDigitalResponse> firmarFormulario(
            @PathVariable("id") Integer id,
            @RequestBody FirmaDigitalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("POST /api/formulario-diagnostico/{}/firmar - Firmando formulario", id);
        request.setIdFormulario(id);
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        FirmaDigitalResponse response = firmaDigitalService.firmarFormulario(request, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Verificar la firma digital de un formulario
     */
    @GetMapping("/{id}/verificar-firma")
    public ResponseEntity<FirmaDigitalResponse> verificarFirma(@PathVariable("id") Integer id) {
        log.info("GET /api/formulario-diagnostico/{}/verificar-firma - Verificando firma", id);
        FirmaDigitalResponse response = firmaDigitalService.verificarFirma(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Descargar el PDF firmado de un formulario
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> descargarPdfFirmado(@PathVariable("id") Integer id) {
        log.info("GET /api/formulario-diagnostico/{}/pdf - Descargando PDF firmado", id);
        byte[] pdf = firmaDigitalService.obtenerPdfFirmado(id);

        if (pdf == null || pdf.length == 0) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "formulario_" + id + "_firmado.pdf");
        headers.setContentLength(pdf.length);

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    /**
     * Verificar si un formulario está firmado
     */
    @GetMapping("/{id}/esta-firmado")
    public ResponseEntity<Boolean> estaFirmado(@PathVariable("id") Integer id) {
        log.info("GET /api/formulario-diagnostico/{}/esta-firmado - Verificando", id);
        boolean firmado = firmaDigitalService.estaFirmado(id);
        return ResponseEntity.ok(firmado);
    }

    /**
     * Descargar múltiples PDFs en un archivo ZIP
     *
     * @param request DTO con lista de IDs de formularios
     * @return ZIP con los PDFs firmados
     */
    @PostMapping("/descargar-zip")
    public ResponseEntity<byte[]> descargarPdfsZip(
            @RequestBody @Valid DescargarZipRequest request) {

        log.info("POST /api/formulario-diagnostico/descargar-zip - {} IDs recibidos",
                 request.getIds().size());

        // Validación: máximo 50 PDFs
        if (request.getIds().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (request.getIds().size() > 50) {
            log.warn("Intento de descargar {} PDFs (máximo: 50)", request.getIds().size());
            return ResponseEntity.badRequest()
                    .body("No se pueden descargar más de 50 PDFs a la vez".getBytes());
        }

        try {
            // Generar ZIP
            byte[] zipBytes = firmaDigitalService.generarZipPdfs(request.getIds());

            if (zipBytes == null || zipBytes.length == 0) {
                log.error("ZIP vacío o null");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }

            // Headers para descarga
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/zip"));

            String timestamp = java.time.LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
            );
            String filename = String.format("diagnosticos_%s.zip", timestamp);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(zipBytes.length);

            log.info("ZIP generado: {} bytes, {} archivo(s)", zipBytes.length, filename);
            return new ResponseEntity<>(zipBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error al generar ZIP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error al generar ZIP: " + e.getMessage()).getBytes());
        }
    }

    // ==================== ENDPOINTS DE CATÁLOGOS ====================

    /**
     * Obtener catálogo de necesidades
     */
    @GetMapping("/catalogos/necesidades")
    public ResponseEntity<List<FormDiagCatNecesidad>> getCatalogoNecesidades() {
        log.info("GET /api/formulario-diagnostico/catalogos/necesidades");
        List<FormDiagCatNecesidad> lista = catNecesidadRepo.findAllByOrderByIdNecesidadAsc();
        return ResponseEntity.ok(lista);
    }

    /**
     * Obtener catálogo de necesidades por categoría
     */
    @GetMapping("/catalogos/necesidades/categoria/{categoria}")
    public ResponseEntity<List<FormDiagCatNecesidad>> getCatalogoNecesidadesPorCategoria(
            @PathVariable("categoria") String categoria) {
        log.info("GET /api/formulario-diagnostico/catalogos/necesidades/categoria/{}", categoria);
        List<FormDiagCatNecesidad> lista = catNecesidadRepo.findByCategoria(categoria);
        return ResponseEntity.ok(lista);
    }

    /**
     * Obtener catálogo de prioridades
     */
    @GetMapping("/catalogos/prioridades")
    public ResponseEntity<List<FormDiagCatPrioridad>> getCatalogoPrioridades() {
        log.info("GET /api/formulario-diagnostico/catalogos/prioridades");
        List<FormDiagCatPrioridad> lista = catPrioridadRepo.findAllByOrderByIdPrioridadAsc();
        return ResponseEntity.ok(lista);
    }

    // ==================== ENDPOINTS DE ESTADÍSTICAS ====================

    /**
     * Obtener estadísticas detalladas de un formulario de diagnóstico
     */
    @GetMapping("/{id}/estadisticas")
    public ResponseEntity<FormDiagEstadisticasDTO> obtenerEstadisticas(@PathVariable("id") Integer id) {
        log.info("GET /api/formulario-diagnostico/{}/estadisticas - Obteniendo estadísticas", id);
        FormDiagEstadisticasDTO estadisticas = formDiagService.obtenerEstadisticasDetalladas(id);
        return ResponseEntity.ok(estadisticas);
    }

    /**
     * Descargar reporte Excel con estadísticas del formulario
     */
    @GetMapping("/{id}/excel-reporte")
    public ResponseEntity<byte[]> descargarExcelReporte(@PathVariable("id") Integer id) {
        log.info("GET /api/formulario-diagnostico/{}/excel-reporte - Descargando Excel", id);

        try {
            byte[] excelBytes = formDiagExcelService.generarReporteExcel(id);

            if (excelBytes == null || excelBytes.length == 0) {
                return ResponseEntity.noContent().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            String filename = "reporte_estadistico_formulario_" + id + ".xlsx";
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelBytes.length);

            log.info("Excel generado: {} bytes", excelBytes.length);
            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error al generar Excel: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error: " + e.getMessage()).getBytes());
        }
    }
}
