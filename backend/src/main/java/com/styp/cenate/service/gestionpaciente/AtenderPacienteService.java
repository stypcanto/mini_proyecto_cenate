package com.styp.cenate.service.gestionpaciente;

import com.styp.cenate.dto.AtenderPacienteRequest;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.AseguradoEnfermedadCronica;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.AseguradoEnfermedadCronicaRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * ✅ v1.47.0: Servicio para registrar atención médica completa
 * - Crear bolsas de Recita
 * - Crear bolsas de Interconsulta
 * - Guardar enfermedades crónicas
 */
@Slf4j
@Service
public class AtenderPacienteService {

    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final AseguradoRepository aseguradoRepository;
    private final AseguradoEnfermedadCronicaRepository enfermedadCronicaRepository;

    public AtenderPacienteService(
            SolicitudBolsaRepository solicitudBolsaRepository,
            AseguradoRepository aseguradoRepository,
            AseguradoEnfermedadCronicaRepository enfermedadCronicaRepository) {
        this.solicitudBolsaRepository = solicitudBolsaRepository;
        this.aseguradoRepository = aseguradoRepository;
        this.enfermedadCronicaRepository = enfermedadCronicaRepository;
    }

    @Transactional
    public void atenderPaciente(Long idSolicitudBolsa, String especialidadActual, AtenderPacienteRequest request) {
        log.info("🏥 [v1.47.0] Registrando atención - Solicitud: {}", idSolicitudBolsa);

        // 1. Obtener solicitud original
        SolicitudBolsa solicitudOriginal = solicitudBolsaRepository.findById(idSolicitudBolsa)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        String pkAsegurado = solicitudOriginal.getPacienteDni();
        Asegurado asegurado = aseguradoRepository.findByDocPaciente(solicitudOriginal.getPacienteDni())
                .orElseThrow(() -> new RuntimeException("Asegurado no encontrado"));

        // ✅ v1.47.0: IMPORTANTE - Marcar la solicitud original como "Atendido"
        // Esto asegura que aparezca como "Atendido" en Mis Pacientes del médico
        log.info("✅ Marcando solicitud original {} como Atendido", idSolicitudBolsa);
        solicitudOriginal.setCondicionMedica("Atendido");

        // Registrar fecha de atención en zona horaria de Perú (UTC-5)
        ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));
        OffsetDateTime fechaAtencion = zonedDateTime.toOffsetDateTime();
        solicitudOriginal.setFechaAtencionMedica(fechaAtencion);
        log.info("✅ Fecha de atención registrada: {}", fechaAtencion);

        // Guardar cambios en la solicitud original
        solicitudBolsaRepository.save(solicitudOriginal);

        // 2. Guardar enfermedades crónicas si aplica
        if (request.getEsCronico() != null && request.getEsCronico() && request.getEnfermedades() != null) {
            guardarEnfermedadesCronicas(pkAsegurado, request.getEnfermedades(), request.getOtroDetalle());
        }

        // 3. Crear bolsa Recita si aplica
        // ✅ v1.47.0: La Recita es una NUEVA SOLICITUD de seguimiento para la gestora
        // NO es información que deba aparecer en "Mis Pacientes" del médico
        if (request.getTieneRecita() != null && request.getTieneRecita()) {
            crearBolsaRecita(solicitudOriginal, especialidadActual, request.getRecitaDias());
            log.info("✅ Nueva bolsa RECITA creada - visible solo para gestora de citas");
        }

        // 4. Crear bolsa Interconsulta si aplica
        if (request.getTieneInterconsulta() != null && request.getTieneInterconsulta()) {
            crearBolsaInterconsulta(solicitudOriginal, request.getInterconsultaEspecialidad());
            log.info("✅ Nueva bolsa INTERCONSULTA creada - visible solo para gestora de citas");
        }

        log.info("✅ [v1.47.0] Atención registrada completamente - Solicitud original marcada como Atendido");
    }

    private void guardarEnfermedadesCronicas(String pkAsegurado, List<String> enfermedades, String otroDetalle) {
        log.info("💾 [v1.47.0] Guardando enfermedades crónicas para: {}", pkAsegurado);

        // Limpiar enfermedades antiguas
        enfermedadCronicaRepository.deleteByPkAsegurado(pkAsegurado);

        // Guardar nuevas
        for (String enfermedad : enfermedades) {
            AseguradoEnfermedadCronica enfermedad_cronica = AseguradoEnfermedadCronica.builder()
                    .pkAsegurado(pkAsegurado)
                    .tipoEnfermedad(enfermedad)
                    .descripcionOtra(enfermedad.equals("Otro") ? otroDetalle : null)
                    .activo(true)
                    .build();
            enfermedadCronicaRepository.save(enfermedad_cronica);
            log.info("  ✅ Guardada: {}", enfermedad);
        }
    }

    private void crearBolsaRecita(SolicitudBolsa solicitudOriginal, String especialidad, Integer dias) {
        log.info("📋 [v1.47.0] Creando bolsa RECITA para días: {}", dias);

        SolicitudBolsa bolsaRecita = SolicitudBolsa.builder()
                .numeroSolicitud(generarNumeroSolicitud("REC"))
                .pacienteDni(solicitudOriginal.getPacienteDni())
                .pacienteNombre(solicitudOriginal.getPacienteNombre())
                .pacienteId(solicitudOriginal.getPacienteId())
                .pacienteSexo(solicitudOriginal.getPacienteSexo())
                .pacienteTelefono(solicitudOriginal.getPacienteTelefono())
                .codigoIpressAdscripcion(solicitudOriginal.getCodigoIpressAdscripcion())
                .tipoCita("RECITA")
                .especialidad(especialidad)
                .estado("PENDIENTE")
                .estadoGestionCitasId(1L) // PENDIENTE CITAR
                .idBolsa(11L) // BOLSA_GENERADA_X_PROFESIONAL
                .idServicio(solicitudOriginal.getIdServicio())
                .fechaAsignacion(OffsetDateTime.now())
                .activo(true)
                .build();

        solicitudBolsaRepository.save(bolsaRecita);
        log.info("✅ Bolsa RECITA creada: {}", bolsaRecita.getIdSolicitud());
    }

    private void crearBolsaInterconsulta(SolicitudBolsa solicitudOriginal, String especialidad) {
        log.info("📋 [v1.47.0] Creando bolsa INTERCONSULTA para especialidad: {}", especialidad);

        SolicitudBolsa bolsaInterconsulta = SolicitudBolsa.builder()
                .numeroSolicitud(generarNumeroSolicitud("INT"))
                .pacienteDni(solicitudOriginal.getPacienteDni())
                .pacienteNombre(solicitudOriginal.getPacienteNombre())
                .pacienteId(solicitudOriginal.getPacienteId())
                .pacienteSexo(solicitudOriginal.getPacienteSexo())
                .pacienteTelefono(solicitudOriginal.getPacienteTelefono())
                .codigoIpressAdscripcion(solicitudOriginal.getCodigoIpressAdscripcion())
                .tipoCita("INTERCONSULTA")
                .especialidad(especialidad)
                .estado("PENDIENTE")
                .estadoGestionCitasId(1L) // PENDIENTE CITAR
                .idBolsa(11L) // BOLSA_GENERADA_X_PROFESIONAL
                .idServicio(solicitudOriginal.getIdServicio())
                .fechaAsignacion(OffsetDateTime.now())
                .activo(true)
                .build();

        solicitudBolsaRepository.save(bolsaInterconsulta);
        log.info("✅ Bolsa INTERCONSULTA creada: {}", bolsaInterconsulta.getIdSolicitud());
    }

    private String generarNumeroSolicitud(String prefijo) {
        return prefijo + "-" + System.currentTimeMillis();
    }
}
