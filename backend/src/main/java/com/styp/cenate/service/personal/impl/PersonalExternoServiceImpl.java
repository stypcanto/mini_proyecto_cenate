package com.styp.cenate.service.personal.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.*;
import com.styp.cenate.exception.BusinessException;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.PersonalExterno;
import com.styp.cenate.model.Red;
import com.styp.cenate.model.Macroregion;
import com.styp.cenate.model.TipoDocumento;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.PersonalExternoRepository;
import com.styp.cenate.repository.TipoDocumentoRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.personal.PersonalExternoService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 🧩 Implementación del servicio de Personal Externo
 * Gestiona CRUD, validaciones y conversión a DTO.
 * Incluye información de IPRESS, Red y Macroregión.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Data
public class PersonalExternoServiceImpl implements PersonalExternoService {

    private final PersonalExternoRepository personalExternoRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final IpressRepository ipressRepository;
    private final UsuarioRepository usuarioRepository;

    // ============================================================
    // 🔹 Listar todo el personal externo
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getAllPersonalExterno() {
        return personalExternoRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 Obtener por ID
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalExternoById(Long id) {
        PersonalExterno personal = personalExternoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró personal externo con ID: " + id));
        return convertToResponse(personal);
    }

    // ============================================================
    // 🔹 Crear nuevo registro
    // ============================================================
    @Override
    @Transactional
    public PersonalResponse createPersonalExterno(PersonalRequest request) {
        if (personalExternoRepository.existsByNumDocExt(request.getNumeroDocumento())) {
            throw new BusinessException("Ya existe personal externo con ese número de documento.");
        }

        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipoDocumento())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado."));

        Ipress ipress = ipressRepository.findById(request.getIdIpress())
                .orElseThrow(() -> new ResourceNotFoundException("IPRESS no encontrada."));

        PersonalExterno nuevo = PersonalExterno.builder()
                .tipoDocumento(tipoDoc)
                .numDocExt(request.getNumeroDocumento())
                .nomExt(request.getNombres())
                .apePaterExt(request.getApellidoPaterno())
                .apeMaterExt(request.getApellidoMaterno())
                .fechNaciExt(request.getFechaNacimiento())
                .genExt(request.getGenero())
                .ipress(ipress)
                .movilExt(request.getTelefono())
                .emailPersExt(request.getEmailPersonal())
                .emailCorpExt(request.getEmailCorporativo())
                .idUser(request.getIdUsuario())
                .build();

        PersonalExterno saved = personalExternoRepository.save(nuevo);
        return convertToResponse(saved);
    }

    // ============================================================
    // 🔹 Actualizar registro existente
    // ============================================================
    @Override
    @Transactional
    public PersonalResponse updatePersonalExterno(Long id, PersonalRequest request) {
        PersonalExterno personal = personalExternoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró personal externo con ID: " + id));

        if (!personal.getNumDocExt().equals(request.getNumeroDocumento())
                && personalExternoRepository.existsByNumDocExt(request.getNumeroDocumento())) {
            throw new BusinessException("Ya existe personal externo con ese número de documento.");
        }

        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipoDocumento())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado."));

        Ipress ipress = ipressRepository.findById(request.getIdIpress())
                .orElseThrow(() -> new ResourceNotFoundException("IPRESS no encontrada."));

        personal.setTipoDocumento(tipoDoc);
        personal.setNumDocExt(request.getNumeroDocumento());
        personal.setNomExt(request.getNombres());
        personal.setApePaterExt(request.getApellidoPaterno());
        personal.setApeMaterExt(request.getApellidoMaterno());
        personal.setFechNaciExt(request.getFechaNacimiento());
        personal.setGenExt(request.getGenero());
        personal.setMovilExt(request.getTelefono());
        personal.setEmailPersExt(request.getEmailPersonal());
        personal.setEmailCorpExt(request.getEmailCorporativo());
        personal.setIdUser(request.getIdUsuario());
        personal.setIpress(ipress);

        return convertToResponse(personalExternoRepository.save(personal));
    }

    // ============================================================
    // 🔹 Eliminar registro
    // ============================================================
    @Override
    @Transactional
    public void deletePersonalExterno(Long id) {
        if (!personalExternoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Personal externo no encontrado con ID: " + id);
        }
        personalExternoRepository.deleteById(id);
    }

    // ============================================================
    // 🔹 Búsqueda por nombre o apellido
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> searchPersonalExterno(String searchTerm) {
        return personalExternoRepository
                .findByNomExtContainingIgnoreCaseOrApePaterExtContainingIgnoreCaseOrApeMaterExtContainingIgnoreCase(
                        searchTerm, searchTerm, searchTerm)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 Listar por IPRESS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalExternoByIpress(Long idIpress) {
        return personalExternoRepository.findByIpress_IdIpress(idIpress)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 Buscar por usuario asociado
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalExternoByUsuario(Long idUsuario) {
        PersonalExterno personal = personalExternoRepository.findByIdUser(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró personal externo para el usuario ID: " + idUsuario));
        return convertToResponse(personal);
    }

    // ============================================================
    // 🔹 Listar personal externo activo
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalExternoActivo() {
        return personalExternoRepository.findAll().stream()
                .filter(p -> p.getIdUser() != null &&
                        usuarioRepository.findById(p.getIdUser())
                                .map(u -> "A".equalsIgnoreCase(u.getStatUser()))
                                .orElse(false))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 Listar personal externo inactivo
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalExternoInactivo() {
        return personalExternoRepository.findAll().stream()
                .filter(p -> p.getIdUser() != null &&
                        usuarioRepository.findById(p.getIdUser())
                                .map(u -> !"A".equalsIgnoreCase(u.getStatUser()))
                                .orElse(false))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 Conversión de entidad a DTO (con IPRESS, Red, Macroregión)
    // ============================================================
    private PersonalResponse convertToResponse(PersonalExterno personal) {
        Ipress ipress = personal.getIpress();
        Red red = ipress != null ? ipress.getRed() : null;
        Macroregion macro = red != null ? red.getMacroregion() : null;

        // Construir MacroregionResponse
        MacroregionResponse macroResponse = null;
        if (macro != null) {
            macroResponse = MacroregionResponse.builder()
                    .idMacro(macro.getIdMacro())
                    .descMacro(macro.getDescMacro())
                    .statMacro(macro.getStatMacro())
                    .build();
        }

        // Construir RedResponse
        RedResponse redResponse = null;
        if (red != null) {
            redResponse = RedResponse.builder()
                    .idRed(red.getId())
                    .codRed(red.getCodigo())
                    .descRed(red.getDescripcion())
                    .macroregion(macroResponse)
                    .idMacro(macro != null ? macro.getIdMacro() : null)
                    .build();
        }

        // Construir IpressResponse
        IpressResponse ipressResponse = null;
        if (ipress != null) {
            ipressResponse = IpressResponse.builder()
                    .idIpress(ipress.getIdIpress())
                    .codIpress(ipress.getCodIpress())
                    .descIpress(ipress.getDescIpress())
                    .red(redResponse)
                    .idRed(red != null ? red.getId() : null)
                    .idNivAten(ipress.getIdNivAten())
                    .idModAten(ipress.getIdModAten())
                    .idTipIpress(ipress.getIdTipIpress())
                    .idDist(ipress.getIdDist())
                    .direcIpress(ipress.getDirecIpress())
                    .latIpress(ipress.getLatIpress())
                    .longIpress(ipress.getLongIpress())
                    .gmapsUrlIpress(ipress.getGmapsUrlIpress())
                    .statIpress(ipress.getStatIpress())
                    .createAt(ipress.getCreateAt())
                    .updateAt(ipress.getUpdateAt())
                    .build();
        }

        return PersonalResponse.builder()
                .idPersonal(personal.getIdPersExt())
                .tipoPersonal("EXTERNO")
                .numeroDocumento(personal.getNumDocExt())
                .nombres(personal.getNomExt())
                .apellidoPaterno(personal.getApePaterExt())
                .apellidoMaterno(personal.getApeMaterExt())
                .nombreCompleto(personal.getNombreCompleto())
                .fechaNacimiento(personal.getFechNaciExt())
                .edad(personal.getEdad())
                .genero(personal.getGenExt())
                .telefono(personal.getMovilExt())
                .emailPersonal(personal.getEmailPersExt())
                .emailCorporativo(personal.getEmailCorpExt())
                .idUsuario(personal.getIdUser())
                .institucion(ipress != null ? ipress.getDescIpress() : null)
                // 🏥 Nuevos campos de IPRESS, Red y Macroregión
                .ipress(ipressResponse)
                .descIpress(ipress != null ? ipress.getDescIpress() : null)
                .descRed(red != null ? red.getDescripcion() : null)
                .descMacroregion(macro != null ? macro.getDescMacro() : null)
                // Auditoría
                .createdAt(personal.getCreatedAt())
                .updatedAt(personal.getUpdatedAt())
                .build();
    }

    @Override
    public Long getUsuarioXCorreo(String correo) {
        return personalExternoRepository.findByEmailCorpExt(correo)
                .map(p -> Long.valueOf(p.getIdUsuario()))
                .orElse(null);
    }

    @Override
    public boolean existsByEmailCorpExt(String emailCorpPers) {
        return personalExternoRepository.existsByEmailCorpExt(emailCorpPers);
    }

    @Override
    public boolean existsByEmailPersExt(String emailPersExt) {
        return personalExternoRepository.existsByEmailPersExt(emailPersExt);
    }

    @Override
    public Long getUsuarioXCorreoPersonal(String correo) {
        return personalExternoRepository.findByEmailPersExt(correo)
                .map(PersonalExterno::getIdUserPrincipal)
                .orElse(null);
    }

    @Override
    public String getCorreoPersonalDeUsuario(Long idUsuario) {
        return personalExternoRepository.findByIdUser(idUsuario)
                .map(PersonalExterno::getEmailPersExt)
                .orElse(null);
    }
}
