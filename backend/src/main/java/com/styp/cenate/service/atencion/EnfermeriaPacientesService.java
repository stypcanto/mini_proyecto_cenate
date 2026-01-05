package com.styp.cenate.service.atencion;

import com.styp.cenate.dto.EnfermeriaPacienteDTO;
import com.styp.cenate.dto.EnfermeriaPacienteDetalleDTO;
import com.styp.cenate.dto.EnfermeriaEstadisticasDTO;
import com.styp.cenate.dto.AtencionClinicaResponseDTO;
import com.styp.cenate.dto.DiagnosticoCie10DTO;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar pacientes atendidos por enfermería
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.1 - Corregida para usar repositories
 * @since 2026-01-03
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnfermeriaPacientesService {

    private final AtencionClinicaRepository atencionRepository;
    private final AseguradoRepository aseguradoRepository;
    private final UsuarioRepository usuarioRepository;
    private final IpressRepository ipressRepository;
    private final TipoAtencionTelemedicinaRepository tipoAtencionRepository;
    private final PersonalCntRepository personalCntRepository;
    private final AtencionDiagnosticoCie10Repository diagnosticoCie10Repository;
    private final DimCie10Repository dimCie10Repository;

    /**
     * Obtener todos los pacientes atendidos por la enfermera logueada
     *
     * @param pageable Objeto de paginación
     * @return Page de pacientes con su última atención
     */
    public Page<EnfermeriaPacienteDTO> obtenerMisPacientes(Pageable pageable) {
        Long idPersonalEnfermera = obtenerIdPersonalLogueado();

        log.info("Obteniendo pacientes atendidos por enfermera id_pers: {}", idPersonalEnfermera);

        // Obtener todas las atenciones creadas por esta enfermera
        List<AtencionClinica> atenciones = atencionRepository.findByIdPersonalCreador(idPersonalEnfermera);

        // Agrupar por paciente (pk_asegurado)
        Map<String, List<AtencionClinica>> atencionesPorPaciente = atenciones.stream()
                .collect(Collectors.groupingBy(AtencionClinica::getPkAsegurado));

        // Construir lista de DTOs
        List<EnfermeriaPacienteDTO> pacientes = new ArrayList<>();

        for (Map.Entry<String, List<AtencionClinica>> entry : atencionesPorPaciente.entrySet()) {
            String pkAsegurado = entry.getKey();
            List<AtencionClinica> atencionesDelPaciente = entry.getValue();

            // Ordenar por fecha DESC para obtener la última
            atencionesDelPaciente.sort(Comparator.comparing(AtencionClinica::getFechaAtencion).reversed());
            AtencionClinica ultimaAtencion = atencionesDelPaciente.get(0);

            // Buscar datos del asegurado
            Asegurado asegurado = aseguradoRepository.findById(pkAsegurado)
                    .orElseThrow(() -> new ResourceNotFoundException("Asegurado no encontrado: " + pkAsegurado));

            // Obtener diagnóstico principal
            String diagnosticoPrincipal = obtenerDiagnosticoPrincipal(ultimaAtencion.getIdAtencion());

            // Obtener nombres mediante repositories
            String nombreTipoAtencion = obtenerNombreTipoAtencion(ultimaAtencion.getIdTipoAtencion());
            String nombreIpress = obtenerNombreIpress(asegurado);

            // Calcular edad
            Integer edad = calcularEdad(asegurado.getFecnacimpaciente());

            // Obtener teléfono (priorizar celular sobre fijo)
            String telefono = asegurado.getTelCelular() != null ?
                            asegurado.getTelCelular() : asegurado.getTelFijo();

            EnfermeriaPacienteDTO dto = EnfermeriaPacienteDTO.builder()
                    .pkAsegurado(pkAsegurado)
                    .numDoc(asegurado.getDocPaciente())
                    .apellidosNombres(asegurado.getPaciente())
                    .edad(edad)
                    .sexo(asegurado.getSexo())
                    .telefono(telefono)
                    .ultimaAtencionId(ultimaAtencion.getIdAtencion())
                    .ultimaFechaAtencion(ultimaAtencion.getFechaAtencion().toLocalDateTime())
                    .ultimaTipoAtencion(nombreTipoAtencion)
                    .ultimaDiagnosticoPrincipal(diagnosticoPrincipal)
                    .totalAtenciones((long) atencionesDelPaciente.size())
                    .requiereTelemonitoreo(ultimaAtencion.getRequiereTelemonitoreo())
                    .ipress(nombreIpress)
                    .build();

            pacientes.add(dto);
        }

        // Ordenar por fecha de última atención DESC
        pacientes.sort(Comparator.comparing(EnfermeriaPacienteDTO::getUltimaFechaAtencion).reversed());

        // Aplicar paginación manual
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), pacientes.size());

        List<EnfermeriaPacienteDTO> paginatedList = pacientes.subList(start, end);

        return new PageImpl<>(paginatedList, pageable, pacientes.size());
    }

    /**
     * Obtener detalle completo de un paciente con su historial de atenciones
     *
     * @param pkAsegurado PK del asegurado
     * @return DTO con detalle completo del paciente
     */
    public EnfermeriaPacienteDetalleDTO obtenerDetallePaciente(String pkAsegurado) {
        Long idPersonalEnfermera = obtenerIdPersonalLogueado();

        log.info("Obteniendo detalle del paciente {} para enfermera id_pers: {}", pkAsegurado, idPersonalEnfermera);

        // Verificar que el asegurado existe
        Asegurado asegurado = aseguradoRepository.findById(pkAsegurado)
                .orElseThrow(() -> new ResourceNotFoundException("Asegurado no encontrado: " + pkAsegurado));

        // Obtener todas las atenciones del paciente
        List<AtencionClinica> todasAtenciones = atencionRepository.findByPkAseguradoOrderByFechaAtencionDesc(pkAsegurado);

        // Filtrar solo las atenciones de enfermería creadas por esta enfermera
        List<AtencionClinica> atencionesEnfermeria = todasAtenciones.stream()
                .filter(a -> a.getIdPersonalCreador().equals(idPersonalEnfermera))
                .toList();

        if (atencionesEnfermeria.isEmpty()) {
            throw new ResourceNotFoundException("No hay atenciones de enfermería para este paciente");
        }

        // Convertir atenciones a DTOs
        List<AtencionClinicaResponseDTO> atencionesDTO = todasAtenciones.stream()
                .map(this::convertirAtencionADTO)
                .toList();

        // Calcular estadísticas
        long atencionesEnfermeriaCount = atencionesEnfermeria.size();
        long atencionesMedicasCount = todasAtenciones.size() - atencionesEnfermeriaCount;

        // Calcular edad
        Integer edad = calcularEdad(asegurado.getFecnacimpaciente());

        // Obtener teléfono
        String telefono = asegurado.getTelCelular() != null ?
                        asegurado.getTelCelular() : asegurado.getTelFijo();

        // Obtener nombre IPRESS
        String nombreIpress = obtenerNombreIpress(asegurado);

        return EnfermeriaPacienteDetalleDTO.builder()
                .pkAsegurado(pkAsegurado)
                .numDoc(asegurado.getDocPaciente())
                .apellidosNombres(asegurado.getPaciente())
                .edad(edad)
                .sexo(asegurado.getSexo())
                .telefono(telefono)
                .tipoPaciente(asegurado.getTipoPaciente())
                .tipoSeguro(asegurado.getTipoSeguro())
                .ipress(nombreIpress)
                .totalAtenciones((long) todasAtenciones.size())
                .atencionesEnfermeria(atencionesEnfermeriaCount)
                .atencionesMedicas(atencionesMedicasCount)
                .primeraAtencion(todasAtenciones.get(todasAtenciones.size() - 1).getFechaAtencion().toLocalDateTime())
                .ultimaAtencion(todasAtenciones.get(0).getFechaAtencion().toLocalDateTime())
                .requiereTelemonitoreo(todasAtenciones.get(0).getRequiereTelemonitoreo())
                .atenciones(atencionesDTO)
                .build();
    }

    /**
     * 3️⃣ Obtener estadísticas generales del módulo de Enfermería
     * Endpoint para SUPERADMIN - muestra datos agregados sin información de pacientes individuales
     *
     * @return Estadísticas generales del módulo de enfermería
     */
    public EnfermeriaEstadisticasDTO obtenerEstadisticasGenerales() {
        log.info("📊 Obteniendo estadísticas generales del módulo de Enfermería");

        // 1. Obtener IDs de todas las enfermeras
        List<Long> idsEnfermeras = obtenerIdsTodasEnfermeras();
        Long totalEnfermeras = (long) idsEnfermeras.size();

        // 2. Obtener todas las atenciones de enfermería (creadas por enfermeras)
        List<AtencionClinica> todasAtenciones = atencionRepository.findAll().stream()
                .filter(a -> idsEnfermeras.contains(a.getIdPersonalCreador()))
                .toList();

        // 3. Total de pacientes únicos atendidos
        Long totalPacientes = todasAtenciones.stream()
                .map(AtencionClinica::getPkAsegurado)
                .distinct()
                .count();

        // 4. Total de atenciones
        Long totalAtenciones = (long) todasAtenciones.size();

        // 5. Pacientes con telemonitoreo
        Long pacientesConTelemonitoreo = todasAtenciones.stream()
                .filter(AtencionClinica::getRequiereTelemonitoreo)
                .map(AtencionClinica::getPkAsegurado)
                .distinct()
                .count();

        // 6. Distribución por IPRESS (top 10)
        Map<Long, List<AtencionClinica>> porIpress = todasAtenciones.stream()
                .collect(Collectors.groupingBy(AtencionClinica::getIdIpress));

        List<EnfermeriaEstadisticasDTO.EstadisticaPorIpress> distribucionIpress = porIpress.entrySet().stream()
                .map(entry -> {
                    Long idIpress = entry.getKey();
                    List<AtencionClinica> atenciones = entry.getValue();
                    String nombreIpress = obtenerNombreIpress(idIpress);

                    return EnfermeriaEstadisticasDTO.EstadisticaPorIpress.builder()
                            .codigoIpress(String.valueOf(idIpress))
                            .nombreIpress(nombreIpress)
                            .totalAtenciones((long) atenciones.size())
                            .pacientesUnicos((long) atenciones.stream()
                                    .map(AtencionClinica::getPkAsegurado)
                                    .distinct()
                                    .count())
                            .build();
                })
                .sorted((a, b) -> b.getTotalAtenciones().compareTo(a.getTotalAtenciones()))
                .limit(10)
                .toList();

        // 7. Distribución por mes (últimos 6 meses)
        Map<String, List<AtencionClinica>> porMes = todasAtenciones.stream()
                .collect(Collectors.groupingBy(a ->
                    a.getFechaAtencion().getYear() + "-" +
                    String.format("%02d", a.getFechaAtencion().getMonthValue())
                ));

        List<EnfermeriaEstadisticasDTO.EstadisticaPorMes> atencionesUltimos6Meses = porMes.entrySet().stream()
                .map(entry -> EnfermeriaEstadisticasDTO.EstadisticaPorMes.builder()
                        .mes(entry.getKey())
                        .totalAtenciones((long) entry.getValue().size())
                        .pacientesUnicos((long) entry.getValue().stream()
                                .map(AtencionClinica::getPkAsegurado)
                                .distinct()
                                .count())
                        .build())
                .sorted((a, b) -> b.getMes().compareTo(a.getMes()))
                .limit(6)
                .toList();

        log.info("✅ Estadísticas: {} enfermeras, {} pacientes, {} atenciones",
                totalEnfermeras, totalPacientes, totalAtenciones);

        return EnfermeriaEstadisticasDTO.builder()
                .totalEnfermeras(totalEnfermeras)
                .totalPacientesAtendidos(totalPacientes)
                .totalAtenciones(totalAtenciones)
                .pacientesConTelemonitoreo(pacientesConTelemonitoreo)
                .distribucionPorIpress(distribucionIpress)
                .atencionesUltimos6Meses(atencionesUltimos6Meses)
                .build();
    }

    /**
     * Convertir entidad AtencionClinica a DTO
     */
    private AtencionClinicaResponseDTO convertirAtencionADTO(AtencionClinica atencion) {
        // Obtener diagnósticos CIE-10 como lista de DTOs
        List<DiagnosticoCie10DTO> diagnosticosCie10 = diagnosticoCie10Repository
                .findByIdAtencionOrderByOrdenAsc(atencion.getIdAtencion())
                .stream()
                .map(d -> {
                    String descripcion = obtenerDescripcionCie10(d.getCie10Codigo());
                    return DiagnosticoCie10DTO.builder()
                            .cie10Codigo(d.getCie10Codigo())
                            .cie10Descripcion(descripcion)
                            .esPrincipal(d.getEsPrincipal())
                            .orden(d.getOrden())
                            .build();
                })
                .collect(Collectors.toList());

        // Obtener nombres mediante repositories
        String nombreAsegurado = obtenerNombreAsegurado(atencion.getPkAsegurado());
        String nombreIpress = obtenerNombreIpress(atencion.getIdIpress());
        String nombreTipoAtencion = obtenerNombreTipoAtencion(atencion.getIdTipoAtencion());
        String siglaTipoAtencion = obtenerSiglaTipoAtencion(atencion.getIdTipoAtencion());
        String nombreProfesional = obtenerNombrePersonal(atencion.getIdPersonalCreador());
        String nombreEspecialidad = obtenerEspecialidadPersonal(atencion.getIdPersonalCreador());

        // Construir SignosVitalesDTO
        AtencionClinicaResponseDTO.SignosVitalesDTO signosVitales =
            AtencionClinicaResponseDTO.SignosVitalesDTO.builder()
                .presionArterial(atencion.getPresionArterial())
                .temperatura(atencion.getTemperatura())
                .saturacionO2(atencion.getSaturacionO2())
                .frecuenciaCardiaca(atencion.getFrecuenciaCardiaca())
                .frecuenciaRespiratoria(atencion.getFrecuenciaRespiratoria())
                .pesoKg(atencion.getPesoKg())
                .tallaCm(atencion.getTallaCm())
                .imc(atencion.getImc())
                .build();

        return AtencionClinicaResponseDTO.builder()
                .idAtencion(atencion.getIdAtencion())
                .pkAsegurado(atencion.getPkAsegurado())
                .nombreAsegurado(nombreAsegurado)
                .fechaAtencion(atencion.getFechaAtencion())
                .idIpress(atencion.getIdIpress())
                .nombreIpress(nombreIpress)
                .nombreTipoAtencion(nombreTipoAtencion)
                .siglaTipoAtencion(siglaTipoAtencion)
                .nombreProfesional(nombreProfesional)
                .nombreEspecialidad(nombreEspecialidad)
                .motivoConsulta(atencion.getMotivoConsulta())
                .antecedentes(atencion.getAntecedentes())
                .diagnostico(atencion.getDiagnostico())
                .cie10Codigo(atencion.getCie10Codigo())
                .diagnosticosCie10(diagnosticosCie10)
                .recomendacionEspecialista(atencion.getRecomendacionEspecialista())
                .tratamiento(atencion.getTratamiento())
                .observacionesGenerales(atencion.getObservacionesGenerales())
                .signosVitales(signosVitales)
                .idTipoAtencion(atencion.getIdTipoAtencion())
                .tieneSignosVitales(atencion.tieneSignosVitales())
                .requiereTelemonitoreo(atencion.getRequiereTelemonitoreo())
                .idPersonalCreador(atencion.getIdPersonalCreador())
                .createdAt(atencion.getCreatedAt())
                .updatedAt(atencion.getUpdatedAt())
                .isCompleta(atencion.isCompleta())
                .build();
    }

    // ==================== MÉTODOS AUXILIARES ====================

    /**
     * Obtener el id_pers del personal logueado
     */
    private Long obtenerIdPersonalLogueado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (usuario.getPersonalCnt() == null) {
            throw new IllegalStateException("El usuario no tiene personal asociado");
        }

        return usuario.getPersonalCnt().getIdPers();
    }

    /**
     * Obtener nombre del asegurado
     */
    private String obtenerNombreAsegurado(String pkAsegurado) {
        return aseguradoRepository.findById(pkAsegurado)
                .map(Asegurado::getPaciente)
                .orElse("Asegurado Desconocido");
    }

    /**
     * Obtener nombre de IPRESS por ID
     */
    private String obtenerNombreIpress(Long idIpress) {
        if (idIpress == null) return null;
        return ipressRepository.findById(idIpress)
                .map(Ipress::getDescIpress)
                .orElse(null);
    }

    /**
     * Obtener nombre de IPRESS del asegurado (basado en CAS_ADSCRIPCION)
     */
    private String obtenerNombreIpress(Asegurado asegurado) {
        // Retornar el nombre de la IPRESS de adscripción si existe
        return asegurado.getCasAdscripcion() != null ?
               asegurado.getCasAdscripcion() : "Sin IPRESS asignada";
    }

    /**
     * Obtener nombre del tipo de atención
     */
    private String obtenerNombreTipoAtencion(Long idTipoAtencion) {
        if (idTipoAtencion == null) return null;
        return tipoAtencionRepository.findById(idTipoAtencion)
                .map(TipoAtencionTelemedicina::getDescTipoAtencion)
                .orElse(null);
    }

    /**
     * Obtener sigla del tipo de atención
     */
    private String obtenerSiglaTipoAtencion(Long idTipoAtencion) {
        if (idTipoAtencion == null) return null;
        return tipoAtencionRepository.findById(idTipoAtencion)
                .map(TipoAtencionTelemedicina::getSigla)
                .orElse(null);
    }

    /**
     * Obtener nombre completo del personal
     */
    private String obtenerNombrePersonal(Long idPersonal) {
        if (idPersonal == null) return null;
        return personalCntRepository.findById(idPersonal)
                .map(PersonalCnt::getNombreCompleto)
                .orElse("Personal Desconocido");
    }

    /**
     * Obtener especialidad del personal (retorna descripción genérica)
     */
    private String obtenerEspecialidadPersonal(Long idPersonal) {
        if (idPersonal == null) return "Sin especialidad";

        // Retornar descripción genérica ya que no hay relación directa
        return personalCntRepository.findById(idPersonal)
                .map(p -> {
                    // Verificar si tiene área asignada
                    if (p.getArea() != null) {
                        return p.getArea().getDescArea();
                    }
                    return "Sin especialidad";
                })
                .orElse("Sin especialidad");
    }

    /**
     * Obtener descripción de código CIE-10
     */
    private String obtenerDescripcionCie10(String codigo) {
        if (codigo == null) return "";
        return dimCie10Repository.findDescripcionByCodigo(codigo)
                .orElse("");
    }

    /**
     * Obtener diagnóstico principal de una atención
     */
    private String obtenerDiagnosticoPrincipal(Long idAtencion) {
        return diagnosticoCie10Repository.findByIdAtencionOrderByOrdenAsc(idAtencion)
                .stream()
                .filter(AtencionDiagnosticoCie10::getEsPrincipal)
                .findFirst()
                .map(d -> d.getCie10Codigo() + " - " + obtenerDescripcionCie10(d.getCie10Codigo()))
                .orElse("Sin diagnóstico");
    }

    /**
     * Calcular edad a partir de fecha de nacimiento
     */
    private Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) return null;
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }

    /**
     * Obtener IDs de personal de todas las enfermeras activas
     */
    private List<Long> obtenerIdsTodasEnfermeras() {
        return usuarioRepository.findAll().stream()
                .filter(Usuario::isActive)
                .filter(usuario -> usuario.getRoles() != null &&
                        usuario.getRoles().stream()
                                .anyMatch(rol -> "ENFERMERIA".equals(rol.getDescRol())))
                .filter(usuario -> usuario.getPersonalCnt() != null)
                .map(usuario -> usuario.getPersonalCnt().getIdPers())
                .toList();
    }
}
