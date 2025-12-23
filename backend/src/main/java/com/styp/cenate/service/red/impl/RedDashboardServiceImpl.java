package com.styp.cenate.service.red.impl;

import com.styp.cenate.dto.IpressResponse;
import com.styp.cenate.dto.PersonalExternoResponse;
import com.styp.cenate.dto.TipoDocumentoResponse;
import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import com.styp.cenate.dto.red.RedDashboardResponse;
import com.styp.cenate.model.PersonalExterno;
import com.styp.cenate.model.Red;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.PersonalExternoRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.formdiag.FormDiagFormularioRepository;
import com.styp.cenate.service.formdiag.FormDiagService;
import com.styp.cenate.service.red.RedDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementacion del servicio para el modulo de Red (Coordinadores de Red)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedDashboardServiceImpl implements RedDashboardService {

    private final UsuarioRepository usuarioRepository;
    private final IpressRepository ipressRepository;
    private final PersonalExternoRepository personalExternoRepository;
    private final FormDiagFormularioRepository formularioRepository;
    private final FormDiagService formDiagService;

    @Override
    @Transactional(readOnly = true)
    public RedDashboardResponse obtenerDashboard() {
        Usuario usuario = obtenerUsuarioActual();
        Red red = validarRedAsignada(usuario);
        Long idRed = red.getId();

        log.info("Obteniendo dashboard para red {} - usuario {}", idRed, usuario.getNameUser());

        // Contar estadisticas
        Long totalIpress = ipressRepository.countByRed_Id(idRed);
        Long totalPersonal = personalExternoRepository.countByIpress_Red_Id(idRed);
        Long totalFormularios = formularioRepository.countByIpress_Red_Id(idRed);
        Long enProceso = formularioRepository.countByIpress_Red_IdAndEstado(idRed, "EN_PROCESO");
        Long enviados = formularioRepository.countByIpress_Red_IdAndEstado(idRed, "ENVIADO");
        Long aprobados = formularioRepository.countByIpress_Red_IdAndEstado(idRed, "APROBADO");

        return RedDashboardResponse.builder()
                .red(RedDashboardResponse.RedInfo.builder()
                        .id(red.getId())
                        .codigo(red.getCodigo())
                        .nombre(red.getDescripcion())
                        .macroregion(red.getMacroregion() != null ?
                                red.getMacroregion().getDescMacro() : null)
                        .idMacroregion(red.getMacroregion() != null ?
                                red.getMacroregion().getIdMacro() : null)
                        .build())
                .estadisticas(RedDashboardResponse.Estadisticas.builder()
                        .totalIpress(totalIpress != null ? totalIpress : 0L)
                        .totalPersonalExterno(totalPersonal != null ? totalPersonal : 0L)
                        .totalFormularios(totalFormularios != null ? totalFormularios : 0L)
                        .formulariosEnProceso(enProceso != null ? enProceso : 0L)
                        .formulariosEnviados(enviados != null ? enviados : 0L)
                        .formulariosAprobados(aprobados != null ? aprobados : 0L)
                        .build())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonalExternoResponse> obtenerPersonalExterno() {
        Usuario usuario = obtenerUsuarioActual();
        Red red = validarRedAsignada(usuario);
        Long idRed = red.getId();

        log.info("Obteniendo personal externo para red {} - usuario {}", idRed, usuario.getNameUser());

        return personalExternoRepository.findByIpress_Red_Id(idRed).stream()
                .map(this::mapToPersonalExternoResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormDiagListResponse> obtenerFormularios() {
        Usuario usuario = obtenerUsuarioActual();
        Red red = validarRedAsignada(usuario);
        Long idRed = red.getId();

        log.info("Obteniendo formularios para red {} - usuario {}", idRed, usuario.getNameUser());

        // Reutiliza el metodo existente de FormDiagService
        return formDiagService.listarPorRed(idRed);
    }

    /**
     * Obtiene el usuario autenticado actual
     */
    private Usuario obtenerUsuarioActual() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado: " + username));
    }

    /**
     * Valida que el usuario tenga una red asignada
     */
    private Red validarRedAsignada(Usuario usuario) {
        if (usuario.getRed() == null) {
            throw new IllegalStateException(
                    "El usuario " + usuario.getNameUser() + " no tiene una red asignada. " +
                    "Contacte al administrador para asignar una red."
            );
        }
        return usuario.getRed();
    }

    /**
     * Mapea PersonalExterno a PersonalExternoResponse
     */
    private PersonalExternoResponse mapToPersonalExternoResponse(PersonalExterno pe) {
        String nombreCompleto = String.format("%s %s %s",
                pe.getNomExt() != null ? pe.getNomExt() : "",
                pe.getApePaterExt() != null ? pe.getApePaterExt() : "",
                pe.getApeMaterExt() != null ? pe.getApeMaterExt() : ""
        ).trim();

        Integer edad = null;
        if (pe.getFechNaciExt() != null) {
            edad = Period.between(pe.getFechNaciExt(), LocalDate.now()).getYears();
        }

        return PersonalExternoResponse.builder()
                .idPersExt(pe.getIdPersExt())
                .tipoDocumento(pe.getTipoDocumento() != null ?
                        TipoDocumentoResponse.builder()
                                .idTipDoc(pe.getTipoDocumento().getIdTipDoc())
                                .descTipDoc(pe.getTipoDocumento().getDescTipDoc())
                                .build() : null)
                .numDocExt(pe.getNumDocExt())
                .nomExt(pe.getNomExt())
                .apePaterExt(pe.getApePaterExt())
                .apeMaterExt(pe.getApeMaterExt())
                .nombreCompleto(nombreCompleto)
                .fechNaciExt(pe.getFechNaciExt())
                .edad(edad)
                .genExt(pe.getGenExt())
                .ipress(pe.getIpress() != null ?
                        IpressResponse.builder()
                                .idIpress(pe.getIpress().getIdIpress())
                                .codIpress(pe.getIpress().getCodIpress())
                                .descIpress(pe.getIpress().getDescIpress())
                                .build() : null)
                .nombreInstitucion(pe.getIpress() != null ? pe.getIpress().getDescIpress() :
                        (pe.getInstExt() != null ? pe.getInstExt() : "Sin institucion"))
                .movilExt(pe.getMovilExt())
                .emailPersExt(pe.getEmailPersExt())
                .idUser(pe.getIdUser())
                .createAt(pe.getCreatedAt() != null ? pe.getCreatedAt().toLocalDateTime() : null)
                .updateAt(pe.getUpdatedAt() != null ? pe.getUpdatedAt().toLocalDateTime() : null)
                .build();
    }
}
