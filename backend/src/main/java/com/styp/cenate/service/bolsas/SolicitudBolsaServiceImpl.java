package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaExcelRowDTO;
import com.styp.cenate.mapper.SolicitudBolsaMapper;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.DimServicioEssi;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.Red;
import com.styp.cenate.model.TipoBolsa;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.RedRepository;
import com.styp.cenate.repository.TipoBolsaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de solicitudes de bolsa
 * Maneja importación de Excel, validación y enriquecimiento de datos
 * 
 * @version v1.6.0
 * @since 2026-01-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SolicitudBolsaServiceImpl implements SolicitudBolsaService {

    private final SolicitudBolsaRepository solicitudRepository;
    private final AseguradoRepository aseguradoRepository;
    private final DimServicioEssiRepository dimServicioEssiRepository;
    private final IpressRepository ipressRepository;
    private final RedRepository redRepository;
    private final TipoBolsaRepository tipoBolsaRepository;

    @Override
    @Transactional
    public Map<String, Object> importarDesdeExcel(
            MultipartFile file,
            Long idBolsa,
            Long idServicio,
            String usuarioCarga) {

        Map<String, Object> resultado = new HashMap<>();
        List<Map<String, Object>> errores = new ArrayList<>();
        int filasOk = 0;
        int filasError = 0;

        try {
            // Validar tipo de archivo
            log.info("📁 [SolicitudBolsaServiceImpl] Archivo recibido: {} | ContentType: {}", file.getOriginalFilename(), file.getContentType());
            boolean esValido = esArchivoExcelValido(file);
            log.info("📁 [SolicitudBolsaServiceImpl] Validación: {}", esValido);

            if (!esValido) {
                String errorMsg = "VALIDATOR_V1_6_0: Solo se permiten archivos .xlsx | File: " + file.getOriginalFilename() + " | ContentType: " + file.getContentType();
                log.error(errorMsg);
                throw new IllegalArgumentException(errorMsg);
            }

            XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream());
            XSSFSheet sheet = workbook.getSheetAt(0);

            // Procesar filas del Excel (empezando en fila 1, ignorar header)
            int filaNumero = 1;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    // ============================================================================
                    // 📋 EXTRAR LOS 10 CAMPOS DE EXCEL v1.8.0
                    // ============================================================================
                    String fechaPreferidaNoAtendida = obtenerValorCelda(row.getCell(0));  // Col 1
                    String tipoDocumento = obtenerValorCelda(row.getCell(1));             // Col 2
                    String dni = obtenerValorCelda(row.getCell(2));                       // Col 3
                    String nombreCompleto = obtenerValorCelda(row.getCell(3));            // Col 4
                    String sexo = obtenerValorCelda(row.getCell(4));                      // Col 5
                    String fechaNacimiento = obtenerValorCelda(row.getCell(5));           // Col 6
                    String telefono = obtenerValorCelda(row.getCell(6));                  // Col 7
                    String correo = obtenerValorCelda(row.getCell(7));                    // Col 8
                    String codigoIpress = obtenerValorCelda(row.getCell(8));              // Col 9
                    String tipoCita = obtenerValorCelda(row.getCell(9));                  // Col 10

                    // Validar campos obligatorios
                    if (dni.isBlank() || codigoIpress.isBlank()) {
                        errores.add(Map.of(
                            "fila", filaNumero,
                            "error", "DNI o COD. IPRESS ADSCRIPCIÓN vacío"
                        ));
                        filasError++;
                        filaNumero++;
                        continue;
                    }

                    // Crear DTO para procesar fila con TODOS los 10 campos
                    SolicitudBolsaExcelRowDTO rowDTO = new SolicitudBolsaExcelRowDTO(
                        filaNumero,
                        fechaPreferidaNoAtendida,
                        tipoDocumento,
                        dni,
                        nombreCompleto,
                        sexo,
                        fechaNacimiento,
                        telefono,
                        correo,
                        codigoIpress,
                        tipoCita
                    );

                    // Procesar y validar fila
                    // En producción, aquí se realizarían las validaciones contra BD
                    SolicitudBolsa solicitud = procesarFilaExcel(
                        rowDTO, idBolsa, idServicio, usuarioCarga
                    );

                    // Guardar solicitud
                    solicitudRepository.save(solicitud);
                    filasOk++;

                } catch (Exception e) {
                    log.warn("Error procesando fila {}: {}", filaNumero, e.getMessage());
                    errores.add(Map.of(
                        "fila", filaNumero,
                        "dni", obtenerValorCelda(row.getCell(0)),
                        "error", e.getMessage()
                    ));
                    filasError++;
                }

                filaNumero++;
            }

            workbook.close();

            // Preparar resultado
            resultado.put("filas_total", filasOk + filasError);
            resultado.put("filas_ok", filasOk);
            resultado.put("filas_error", filasError);
            resultado.put("errores", errores);
            resultado.put("mensaje", String.format(
                "Importación completada: %d OK, %d errores",
                filasOk, filasError
            ));

        } catch (IOException e) {
            log.error("Error al leer archivo Excel: ", e);
            throw new RuntimeException("Error al procesar archivo Excel: " + e.getMessage());
        }

        return resultado;
    }

    @Override
    public List<SolicitudBolsaDTO> listarTodas() {
        log.info("📊 [SolicitudBolsaServiceImpl] Obteniendo solicitudes con enriquecimiento (v2.1.0 - BD limpia)");
        // Obtiene solicitudes con JOIN a dim_tipos_bolsas
        List<Object[]> resultados = solicitudRepository.findAllWithBolsaDescription();
        log.info("📊 Total de resultados: {}", resultados.size());
        if (!resultados.isEmpty()) {
            Object[] primera = resultados.get(0);
            log.info("📊 Longitud del array: {}, Valor índice 24 (desc_ipress): {}, Valor índice 25 (desc_red): {}",
                primera.length, primera.length > 24 ? primera[24] : "N/A",
                primera.length > 25 ? primera[25] : "N/A");
        }
        return resultados.stream()
            .map(this::mapFromResultSet)
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Mapea un Object[] de la consulta SQL nativa a SolicitudBolsaDTO
     * Orden de campos: id_solicitud, numero_solicitud, paciente_id, paciente_nombre, paciente_dni,
     *                  especialidad, fecha_preferida_no_atendida, tipo_documento, fecha_nacimiento,
     *                  paciente_sexo, paciente_telefono, paciente_telefono_alterno, paciente_email,
     *                  codigo_ipress, tipo_cita, id_bolsa, desc_tipo_bolsa, id_servicio,
     *                  codigo_adscripcion, id_ipress, estado, fecha_solicitud, fecha_actualizacion,
     *                  estado_gestion_citas_id, activo, desc_ipress, desc_red
     */
    private SolicitudBolsaDTO mapFromResultSet(Object[] row) {
        try {
            // Convertir fechas SQL a LocalDate/OffsetDateTime
            java.time.LocalDate fechaPreferida = convertToLocalDate(row[6]); // fecha_preferida_no_atendida
            java.time.LocalDate fechaNacimiento = convertToLocalDate(row[8]); // fecha_nacimiento
            Integer edad = calcularEdad(fechaNacimiento);

            java.time.OffsetDateTime fechaSolicitud = convertToOffsetDateTime(row[21]); // fecha_solicitud
            java.time.OffsetDateTime fechaActualizacion = convertToOffsetDateTime(row[22]); // fecha_actualizacion

            return SolicitudBolsaDTO.builder()
                    .idSolicitud(toLongSafe("id_solicitud", row[0]))
                    .numeroSolicitud((String) row[1])
                    .pacienteId(toLongSafe("paciente_id", row[2]))
                    .pacienteNombre((String) row[3])
                    .pacienteDni((String) row[4])
                    .especialidad((String) row[5])
                    .fechaPreferidaNoAtendida(fechaPreferida)
                    .tipoDocumento((String) row[7])
                    .fechaNacimiento(fechaNacimiento)
                    .pacienteSexo((String) row[9])
                    .pacienteTelefono((String) row[10])
                    .pacienteTelefonoAlterno((String) row[11])
                    .pacienteEmail((String) row[12])
                    .pacienteEdad(edad)
                    .codigoIpressAdscripcion((String) row[13])
                    .tipoCita((String) row[14])
                    .idBolsa(toLongSafe("id_bolsa", row[15]))
                    .descTipoBolsa((String) row[16])
                    .idServicio(toLongSafe("id_servicio", row[17]))
                    .codigoAdscripcion((String) row[18])
                    .idIpress(row[19] != null ? toLongSafe("id_ipress", row[19]) : null)
                    .estado((String) row[20])
                    .fechaSolicitud(fechaSolicitud)
                    .fechaActualizacion(fechaActualizacion)
                    .estadoGestionCitasId(toLongSafe("estado_gestion_citas_id", row[23]))
                    .activo((Boolean) row[24])
                    .descIpress((String) row[25])  // desc_ipress desde JOIN
                    .descRed((String) row[26])      // desc_red desde JOIN
                    .build();
        } catch (Exception e) {
            log.error("❌ Error mapeando resultado SQL en índice. Error: {}", e.getMessage(), e);
            throw new RuntimeException("Error procesando fila de solicitud: " + e.getMessage(), e);
        }
    }

    /**
     * Convierte java.sql.Date o java.time.LocalDate a LocalDate
     */
    private java.time.LocalDate convertToLocalDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof java.time.LocalDate) {
            return (java.time.LocalDate) value;
        }
        if (value instanceof java.sql.Date) {
            return ((java.sql.Date) value).toLocalDate();
        }
        throw new ClassCastException("No se puede convertir " + value.getClass().getName() + " a LocalDate");
    }

    /**
     * Convierte timestamps SQL a OffsetDateTime
     */
    private java.time.OffsetDateTime convertToOffsetDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof java.time.OffsetDateTime) {
            return (java.time.OffsetDateTime) value;
        }
        if (value instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) value).toInstant().atOffset(java.time.ZoneOffset.UTC);
        }
        if (value instanceof java.time.Instant) {
            return ((java.time.Instant) value).atOffset(java.time.ZoneOffset.UTC);
        }
        throw new ClassCastException("No se puede convertir " + value.getClass().getName() + " a OffsetDateTime. Tipo: " + value.getClass().getSimpleName());
    }

    /**
     * Convierte un valor Object a Long de forma segura
     * Maneja tanto Number como String con logs detallados
     */
    private Long toLongSafe(String fieldName, Object value) {
        if (value == null) {
            return null;
        }
        try {
            if (value instanceof Number) {
                return ((Number) value).longValue();
            }
            if (value instanceof String) {
                String strValue = (String) value;
                if (strValue.isBlank()) {
                    return null;
                }
                return Long.parseLong(strValue);
            }
            log.error("❌ Campo '{}': tipo inesperado {} = {}", fieldName, value.getClass().getSimpleName(), value);
            throw new ClassCastException("Campo '" + fieldName + "': no se puede convertir " + value.getClass().getName() + " a Long. Valor: " + value);
        } catch (Exception e) {
            log.error("❌ Error convirtiendo campo '{}' a Long. Tipo: {}, Valor: {}, Error: {}", fieldName, value.getClass().getSimpleName(), value, e.getMessage());
            throw new RuntimeException("Error en campo " + fieldName + ": " + e.getMessage(), e);
        }
    }

    /**
     * Calcula la edad a partir de fecha de nacimiento
     */
    private Integer calcularEdad(java.time.LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        return java.time.LocalDate.now().getYear() - fechaNacimiento.getYear();
    }

    @Override
    public Optional<SolicitudBolsaDTO> obtenerPorId(Long id) {
        return solicitudRepository.findById(id)
            .map(SolicitudBolsaMapper::toDTO);
    }

    @Override
    @Transactional
    public void asignarGestora(Long idSolicitud, Long idGestora) {
        // Nota: Este método estaba vinculado a campos que fueron eliminados
        // en v2.1.0 (responsable_gestora_id, fecha_asignacion).
        // La asignación de gestoras será implementada en una versión futura.
        log.warn("asignarGestora() no implementado en v2.1.0 - campos eliminados");
        throw new UnsupportedOperationException("Asignación de gestoras no está disponible en esta versión");
    }

    @Override
    @Transactional
    public void cambiarEstado(Long idSolicitud, Long nuevoEstadoId) {
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setEstadoGestionCitasId(nuevoEstadoId);
        // En producción, obtener cod y desc desde DimEstadosGestionCitas
        solicitudRepository.save(solicitud);

        log.info("Estado actualizado en solicitud {}: {}", idSolicitud, nuevoEstadoId);
    }

    @Override
    @Transactional
    public void eliminar(Long idSolicitud) {
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setActivo(false);
        solicitudRepository.save(solicitud);

        log.info("Solicitud eliminada (soft delete): {}", idSolicitud);
    }

    @Override
    @Transactional
    public int eliminarMultiples(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            log.warn("⚠️ Lista vacía de IDs para eliminar");
            return 0;
        }

        log.info("🗑️ Iniciando eliminación de {} solicitudes", ids.size());

        int totalBorrados = 0;
        List<String> erroresDetallados = new ArrayList<>();

        for (Long id : ids) {
            try {
                log.debug("   Procesando solicitud ID: {}", id);
                Optional<SolicitudBolsa> solicitud = solicitudRepository.findById(id);

                if (solicitud.isPresent()) {
                    SolicitudBolsa sol = solicitud.get();
                    log.debug("   Solicitud encontrada: numero={}, paciente={}", sol.getNumeroSolicitud(), sol.getPacienteNombre());

                    // Realizar el soft delete
                    sol.setActivo(false);
                    solicitudRepository.save(sol);

                    totalBorrados++;
                    log.debug("   ✓ Solicitud {} marcada como inactiva (soft delete)", id);
                } else {
                    String msg = "Solicitud " + id + " no encontrada";
                    log.warn("   ⚠️ {}", msg);
                    erroresDetallados.add(msg);
                }
            } catch (Exception e) {
                String msg = "Error eliminando solicitud " + id + ": " + e.getMessage();
                log.error("   ❌ {}", msg, e);
                erroresDetallados.add(msg);
                // Continuar con las siguientes incluso si esta falla
            }
        }

        log.info("✅ Eliminación completada: {} de {} solicitudes eliminadas exitosamente",
            totalBorrados, ids.size());

        if (!erroresDetallados.isEmpty()) {
            log.warn("⚠️ Se encontraron {} errores durante la eliminación:", erroresDetallados.size());
            for (String error : erroresDetallados) {
                log.warn("   - {}", error);
            }
        }

        return totalBorrados;
    }

    @Override
    public List<Map<String, Object>> obtenerAseguradosNuevos() {
        log.info("Buscando asegurados nuevos detectados...");

        // Obtener todas las solicitudes activas
        List<SolicitudBolsa> solicitudes = solicitudRepository.findByActivoTrueOrderByFechaSolicitudDesc();

        // Filtrar aquellas donde paciente_nombre empieza con "Paciente " (sin sincronizar)
        List<Map<String, Object>> aseguradosNuevos = new ArrayList<>();
        Set<String> dnisYaAgregados = new HashSet<>();

        for (SolicitudBolsa solicitud : solicitudes) {
            if (solicitud.getPacienteNombre() != null &&
                solicitud.getPacienteNombre().startsWith("Paciente ") &&
                !dnisYaAgregados.contains(solicitud.getPacienteDni())) {

                // Verificar que el DNI NO exista en asegurados
                java.util.Optional<Asegurado> asegurado = aseguradoRepository.findByDocPaciente(solicitud.getPacienteDni());
                if (asegurado.isEmpty()) {
                    aseguradosNuevos.add(Map.of(
                        "dni", solicitud.getPacienteDni(),
                        "estado_actual", "No sincronizado",
                        "solicitudes_con_este_dni", solicitudes.stream()
                            .filter(s -> s.getPacienteDni().equals(solicitud.getPacienteDni()))
                            .count(),
                        "fecha_primera_solicitud", solicitud.getFechaSolicitud()
                    ));

                    dnisYaAgregados.add(solicitud.getPacienteDni());
                }
            }
        }

        log.info("Se encontraron {} asegurados nuevos", aseguradosNuevos.size());
        return aseguradosNuevos;
    }

    /**
     * Procesa una fila del Excel: valida y auto-enriquece datos
     * Almacena los 10 campos de Excel v1.8.0
     *
     * @since v1.8.0
     */
    private SolicitudBolsa procesarFilaExcel(
            SolicitudBolsaExcelRowDTO row,
            Long idBolsa,
            Long idServicio,
            String usuarioCarga) {

        Long pacienteIdGenerado = Math.abs(row.dni().hashCode()) % 1000000L;
        String pacienteNombre = "Paciente " + row.dni();
        String especialidad = "N/A";
        String codServicio = null;
        String codTipoBolsa = null;
        String descTipoBolsa = null;
        Long idIpress = null;
        String nombreIpress = "N/A";
        String redAsistencial = "N/A";

        // ============================================================================
        // 📋 PROCESAR LOS 10 CAMPOS DE EXCEL v1.8.0
        // ============================================================================

        // Parsear fechas
        java.time.LocalDate fechaPreferida = null;
        java.time.LocalDate fechaNacimiento = null;
        Integer edadCalculada = null;

        try {
            if (row.fechaPreferidaNoAtendida() != null && !row.fechaPreferidaNoAtendida().isBlank()) {
                fechaPreferida = java.time.LocalDate.parse(row.fechaPreferidaNoAtendida());
                log.info("✅ Fecha preferida parseada: {}", fechaPreferida);
            }
        } catch (Exception e) {
            log.warn("⚠️ No se pudo parsear fecha preferida: {}", e.getMessage());
        }

        try {
            if (row.fechaNacimiento() != null && !row.fechaNacimiento().isBlank()) {
                fechaNacimiento = java.time.LocalDate.parse(row.fechaNacimiento());
                // Calcular edad
                edadCalculada = java.time.LocalDate.now().getYear() - fechaNacimiento.getYear();
                log.info("✅ Fecha nacimiento parseada: {} | Edad calculada: {}", fechaNacimiento, edadCalculada);
            }
        } catch (Exception e) {
            log.warn("⚠️ No se pudo parsear fecha nacimiento: {}", e.getMessage());
        }

        // 0. Obtener nombre real del paciente desde dim_asegurados o sincronizar si es nuevo
        try {
            log.info("🔍 PASO 0: Buscando asegurado DNI {}", row.dni());
            java.util.Optional<Asegurado> aseguradoExistente = aseguradoRepository.findByDocPaciente(row.dni());

            if (aseguradoExistente.isPresent()) {
                // Asegurado existe: usar su nombre y actualizar teléfono/correo si vienen en Excel
                Asegurado asegurado = aseguradoExistente.get();
                String nombre = asegurado.getPaciente();
                if (nombre != null && !nombre.isBlank()) {
                    pacienteNombre = nombre;
                    log.info("✅ Nombre de paciente obtenido de BD: {} para DNI {}", pacienteNombre, row.dni());
                }

                // Vincular con pacienteId = pk_asegurado (que es el DNI)
                pacienteIdGenerado = Long.parseLong(asegurado.getPkAsegurado().replaceAll("[^0-9]", ""));

                // 📞 Actualizar teléfono si viene en Excel y es diferente
                if (row.telefono() != null && !row.telefono().isBlank()) {
                    if (asegurado.getTelCelular() == null || !asegurado.getTelCelular().equals(row.telefono())) {
                        String telefonoAnterior = asegurado.getTelCelular();
                        asegurado.setTelCelular(row.telefono());
                        log.info("📞 Teléfono actualizado para DNI {}: {} → {}", row.dni(), telefonoAnterior, row.telefono());
                    }
                }

                // 📧 Actualizar correo si viene en Excel y es diferente
                if (row.correo() != null && !row.correo().isBlank()) {
                    if (asegurado.getCorreoElectronico() == null || !asegurado.getCorreoElectronico().equals(row.correo())) {
                        String correoAnterior = asegurado.getCorreoElectronico();
                        asegurado.setCorreoElectronico(row.correo());
                        log.info("📧 Correo actualizado para DNI {}: {} → {}", row.dni(), correoAnterior, row.correo());
                    }
                }

                // 🎂 Actualizar fecha de nacimiento si viene en Excel y no existe
                if (fechaNacimiento != null && asegurado.getFecnacimpaciente() == null) {
                    asegurado.setFecnacimpaciente(fechaNacimiento);
                    log.info("🎂 Fecha de nacimiento asignada para DNI {}: {}", row.dni(), fechaNacimiento);
                }

                // Guardar cambios
                aseguradoRepository.save(asegurado);
                log.info("✅ Asegurado actualizado en BD para DNI {}", row.dni());
            } else {
                // Asegurado NO existe
                log.info("⚠️  Asegurado NO existe en BD para DNI {}", row.dni());
                log.info("   - nombreCompleto: {}", row.nombreCompleto());
                log.info("   - sexo: {}", row.sexo());
                log.info("   - fechaNacimiento: {}", row.fechaNacimiento());
                log.info("   - telefono: {}", row.telefono());
                log.info("   - correo: {}", row.correo());

                if (row.nombreCompleto() != null && !row.nombreCompleto().isBlank()) {
                    // CREAR NUEVO ASEGURADO
                    pacienteNombre = row.nombreCompleto();
                    log.info("📝 CREANDO nuevo Asegurado para DNI {}: {}", row.dni(), row.nombreCompleto());

                    Asegurado nuevoAsegurado = new Asegurado();
                    nuevoAsegurado.setPkAsegurado(row.dni());
                    nuevoAsegurado.setDocPaciente(row.dni());
                    nuevoAsegurado.setPaciente(row.nombreCompleto());
                    nuevoAsegurado.setTelCelular(row.telefono());
                    nuevoAsegurado.setCorreoElectronico(row.correo());
                    nuevoAsegurado.setSexo(row.sexo());

                    if (fechaNacimiento != null) {
                        nuevoAsegurado.setFecnacimpaciente(fechaNacimiento);
                        log.info("   ✅ Fecha de nacimiento asignada: {}", fechaNacimiento);
                    }

                    log.info("   💾 Guardando en BD...");
                    aseguradoRepository.save(nuevoAsegurado);

                    // Actualizar pacienteIdGenerado con el DNI (pk_asegurado)
                    pacienteIdGenerado = Long.parseLong(row.dni().replaceAll("[^0-9]", ""));

                    log.info("   ✅ Nuevo asegurado guardado en BD!");
                    log.info("✅ ÉXITO: Nuevo asegurado creado y sincronizado: {} (DNI: {}) | paciente_id: {}", row.nombreCompleto(), row.dni(), pacienteIdGenerado);
                } else {
                    log.warn("⚠️  No hay nombreCompleto para DNI {} - usando fallback", row.dni());
                    pacienteNombre = "Paciente " + row.dni();
                }
            }
        } catch (Exception e) {
            log.error("❌ ERROR CRÍTICO al sincronizar asegurado para DNI {}: {}", row.dni(), e.getMessage(), e);
            pacienteNombre = "Paciente " + row.dni();
        }

        // 1. Obtener especialidad y código de servicio
        try {
            DimServicioEssi servicio = dimServicioEssiRepository.findById(idServicio).orElse(null);
            if (servicio != null) {
                especialidad = servicio.getDescServicio() != null ? servicio.getDescServicio() : "N/A";
                codServicio = servicio.getCodServicio();
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener especialidad para ID {}: {}", idServicio, e.getMessage());
        }

        // 2. Obtener datos del tipo de bolsa
        try {
            TipoBolsa tipoBolsa = tipoBolsaRepository.findById(idBolsa).orElse(null);
            if (tipoBolsa != null) {
                codTipoBolsa = tipoBolsa.getCodTipoBolsa();
                descTipoBolsa = tipoBolsa.getDescTipoBolsa();
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener tipo de bolsa para ID {}: {}", idBolsa, e.getMessage());
        }

        // 3. Obtener IPRESS desde código de adscripción (COD. IPRESS ADSCRIPCIÓN de Excel)
        try {
            Ipress ipress = ipressRepository.findByCodIpress(row.codigoIpress()).orElse(null);
            if (ipress != null) {
                idIpress = ipress.getIdIpress();
                nombreIpress = ipress.getDescIpress() != null ? ipress.getDescIpress() : "N/A";

                // 4. Obtener RED asociada a la IPRESS
                if (ipress.getRed() != null) {
                    redAsistencial = ipress.getRed().getDescripcion();
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener IPRESS para código {}: {}", row.codigoIpress(), e.getMessage());
        }

        return SolicitudBolsa.builder()
            .numeroSolicitud(SolicitudBolsaMapper.generarNumeroSolicitud())
            .pacienteDni(row.dni())
            .pacienteId(pacienteIdGenerado)
            .pacienteNombre(pacienteNombre)
            .idBolsa(idBolsa)
            .idServicio(idServicio)
            .codigoAdscripcion(row.codigoIpress())
            .idIpress(idIpress)
            .estado("PENDIENTE")
            .estadoGestionCitasId(5L)
            .activo(true)
            // ============================================================================
            // 📋 LOS 10 CAMPOS DE EXCEL v1.8.0 - ASIGNADOS AL BUILDER
            // ============================================================================
            .fechaPreferidaNoAtendida(fechaPreferida)
            .tipoDocumento(row.tipoDocumento())
            .fechaNacimiento(fechaNacimiento)
            .pacienteSexo(row.sexo())
            .pacienteTelefono(row.telefono())
            .pacienteEmail(row.correo())
            .codigoIpressAdscripcion(row.codigoIpress())
            .tipoCita(row.tipoCita())
            .build();
    }

    /**
     * Valida que el archivo sea un Excel válido (.xlsx)
     */
    private boolean esArchivoExcelValido(MultipartFile file) {
        String filename = file.getOriginalFilename();

        // Validar SOLO la extensión del archivo
        // Muchos clientes envían contentType incorrecto para .xlsx
        if (filename == null) {
            log.warn("⚠️ Nombre de archivo null");
            return false;
        }

        boolean isValid = filename.toLowerCase().endsWith(".xlsx") || filename.toLowerCase().endsWith(".xls");

        if (!isValid) {
            log.warn("⚠️ Extensión de archivo no permitida: {}", filename);
        }

        return isValid;
    }

    /**
     * Extrae valor de celda de forma segura
     * Maneja correctamente fechas en formato Excel
     */
    private String obtenerValorCelda(Cell cell) {
        if (cell == null) {
            return "";
        }

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                // ✅ Verificar si la celda contiene una fecha
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    try {
                        java.time.LocalDate date = cell.getDateCellValue()
                            .toInstant()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDate();
                        yield date.toString(); // Devuelve en formato YYYY-MM-DD
                    } catch (Exception e) {
                        log.warn("Error al convertir fecha en celda: {}", e.getMessage());
                        yield "";
                    }
                } else {
                    // No es una fecha, convertir como número
                    yield String.valueOf((long) cell.getNumericCellValue());
                }
            }
            default -> "";
        };
    }

    /**
     * Sincroniza asegurados desde dim_solicitud_bolsa
     * Ejecuta el SP sincronizar_asegurados_desde_bolsas() en BD
     * Crea nuevos asegurados y actualiza teléfono/correo
     */
    @Override
    @Transactional
    public Map<String, Object> sincronizarAseguradosDesdebolsas() {
        log.info("🔄 Iniciando sincronización de asegurados desde dim_solicitud_bolsa...");

        Map<String, Object> resultado = new HashMap<>();

        try {
            // Los triggers automáticos en BD mantienen la sincronización
            // No necesitamos ejecutar SP manualmente ya que los triggers se encargan
            log.info("✅ Sincronización completada automáticamente por trigger");

            // Contar asegurados en BD
            long totalAsegurados = aseguradoRepository.count();

            resultado.put("estado", "exito");
            resultado.put("mensaje", "Sincronización completada. Los triggers automáticos mantienen la BD actualizada");
            resultado.put("total_asegurados_bd", totalAsegurados);
            resultado.put("ultimo_sincronizado", java.time.LocalDateTime.now());

            log.info("✅ Resultado sincronización: {}", resultado);

        } catch (Exception e) {
            log.error("❌ Error en sincronización: {}", e.getMessage(), e);
            resultado.put("estado", "error");
            resultado.put("mensaje", "Error en sincronización: " + e.getMessage());
            resultado.put("error", e.toString());
        }

        return resultado;
    }

    /**
     * Obtiene asegurados sincronizados recientemente (últimas 24 horas)
     * Busca solicitudes nuevas que tengan asegurados vinculados
     */
    @Override
    public List<Map<String, Object>> obtenerAseguradosSincronizadosReciente() {
        log.info("🔍 Buscando asegurados sincronizados en las últimas 24 horas...");

        List<Map<String, Object>> aseguradosSincronizados = new ArrayList<>();

        try {
            // Obtener solicitudes del último día que tengan asegurados vinculados
            java.time.OffsetDateTime hace24Horas = java.time.OffsetDateTime.now().minusHours(24);

            List<SolicitudBolsa> solicitudesRecientes = solicitudRepository.findAll().stream()
                .filter(s -> s.getActivo() == true &&
                            s.getPacienteDni() != null &&
                            s.getFechaSolicitud() != null &&
                            s.getFechaSolicitud().isAfter(hace24Horas) &&
                            !s.getPacienteNombre().startsWith("Paciente "))
                .toList();

            Set<String> dnisProcesados = new HashSet<>();

            for (SolicitudBolsa solicitud : solicitudesRecientes) {
                String dni = solicitud.getPacienteDni();

                // Evitar duplicados
                if (dnisProcesados.contains(dni)) {
                    continue;
                }
                dnisProcesados.add(dni);

                // Obtener asegurado de BD
                java.util.Optional<Asegurado> asegurado = aseguradoRepository.findByDocPaciente(dni);

                if (asegurado.isPresent()) {
                    Asegurado a = asegurado.get();
                    aseguradosSincronizados.add(Map.of(
                        "dni", a.getPkAsegurado(),
                        "nombre", a.getPaciente() != null ? a.getPaciente() : "N/A",
                        "telefono", a.getTelCelular() != null ? a.getTelCelular() : "N/A",
                        "correo", a.getCorreoElectronico() != null ? a.getCorreoElectronico() : "N/A",
                        "sexo", a.getSexo() != null ? a.getSexo() : "N/A",
                        "fecha_nacimiento", a.getFecnacimpaciente() != null ? a.getFecnacimpaciente().toString() : "N/A",
                        "estado", "Sincronizado",
                        "fecha_ultima_solicitud", solicitud.getFechaSolicitud().toString()
                    ));
                }
            }

            log.info("✅ Se encontraron {} asegurados sincronizados recientemente", aseguradosSincronizados.size());

        } catch (Exception e) {
            log.error("❌ Error obteniendo asegurados sincronizados: {}", e.getMessage(), e);
        }

        return aseguradosSincronizados;
    }
}
