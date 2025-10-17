package com.styp.cenate.service.personal.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.PersonalRequest;
import com.styp.cenate.dto.PersonalResponse;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.exception.BusinessException;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import com.styp.cenate.service.personal.PersonalExternoService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🧩 Implementación del servicio de Personal Externo
 * Gestiona CRUD, validaciones y conversión a DTO.
 */
@Service
@RequiredArgsConstructor
@Slf4j
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
    // 🔹 Conversión de entidad a DTO
    // ============================================================
    private PersonalResponse convertToResponse(PersonalExterno personal) {
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
                .institucion(personal.getIpress() != null ? personal.getIpress().getDescIpress() : null)
                // ✅ Auditoría coherente con DTO (OffsetDateTime)
                .createdAt(personal.getCreatedAt())
                .updatedAt(personal.getUpdatedAt())
                .build();
    }
}