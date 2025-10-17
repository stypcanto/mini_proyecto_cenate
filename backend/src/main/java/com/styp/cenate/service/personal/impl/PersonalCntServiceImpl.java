package com.styp.cenate.service.personal.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.styp.cenate.dto.*;
import com.styp.cenate.exception.BusinessException;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import com.styp.cenate.service.personal.PersonalCntService;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 🧩 Servicio para la gestión del personal CNT (interno).
 * Cubre CRUD, manejo de foto, eliminación segura y conversión a DTO.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalCntServiceImpl implements PersonalCntService {

    private final PersonalCntRepository personalCntRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final AreaRepository areaRepository;
    private final RegimenLaboralRepository regimenLaboralRepository;
    private final UsuarioRepository usuarioRepository;

    // Relaciones N:N
    private final PersonalProfRepository personalProfRepository;
    private final PersonalTipoRepository personalTipoRepository;
    private final PersonalOcRepository personalOcRepository;
    private final PersonalFirmaRepository personalFirmaRepository;

    @Value("${app.upload.dir:${user.home}/cenate-uploads/personal}")
    private String uploadDir;

    // ==========================================================
    // 🔹 Listar / Obtener
    // ==========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getAllPersonalCnt() {
        log.info("📋 Listando todo el personal CNT");
        return personalCntRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalCntById(Long id) {
        log.info("🔍 Buscando personal CNT con ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));
        return convertToResponse(personal);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalCntByUsuario(Long idUsuario) {
        log.info("👤 Buscando personal CNT asociado al usuario ID: {}", idUsuario);
        PersonalCnt personal = personalCntRepository.findByUsuario_IdUser(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró personal CNT vinculado al usuario con ID: " + idUsuario
                ));
        return convertToResponse(personal);
    }

    // ==========================================================
    // 🔹 Crear / Actualizar / Eliminar
    // ==========================================================
    @Override
    @Transactional
    public PersonalResponse createPersonalCnt(PersonalRequest request) {
        log.info("🆕 Creando nuevo personal CNT: {}", request.getNombres());

        if (personalCntRepository.existsByNumDocPers(request.getNumeroDocumento())) {
            throw new BusinessException("Ya existe un personal CNT con el mismo número de documento.");
        }

        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipoDocumento())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado."));

        Usuario usuario = (request.getIdUsuario() != null)
                ? usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + request.getIdUsuario()))
                : null;

        PersonalCnt personal = PersonalCnt.builder()
                .tipoDocumento(tipoDoc)
                .numDocPers(request.getNumeroDocumento())
                .nomPers(request.getNombres())
                .apePaterPers(request.getApellidoPaterno())
                .apeMaterPers(request.getApellidoMaterno())
                .fechNaciPers(request.getFechaNacimiento())
                .genPers(request.getGenero())
                .movilPers(request.getTelefono())
                .emailPers(request.getEmailPersonal())
                .emailCorpPers(request.getEmailCorporativo())
                .colegPers(request.getNumeroColegiatura())
                .codPlanRem(request.getCodigoPlanilla())
                .direcPers(request.getDireccion())
                .perPers(request.getPeriodo())
                .statPers(request.getEstado() != null ? request.getEstado() : "A")
                .usuario(usuario)
                .build();

        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada."));
            personal.setArea(area);
        }

        if (request.getIdRegimenLaboral() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegimenLaboral())
                    .orElseThrow(() -> new ResourceNotFoundException("Régimen laboral no encontrado."));
            personal.setRegimenLaboral(regimen);
        }

        PersonalCnt saved = personalCntRepository.save(personal);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public PersonalResponse updatePersonalCnt(Long id, PersonalRequest request) {
        log.info("✏️ Actualizando personal CNT ID: {}", id);

        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));

        if (request.getIdTipoDocumento() != null) {
            TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipoDocumento())
                    .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado."));
            personal.setTipoDocumento(tipoDoc);
        }

        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada."));
            personal.setArea(area);
        } else {
            personal.setArea(null);
        }

        if (request.getIdRegimenLaboral() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegimenLaboral())
                    .orElseThrow(() -> new ResourceNotFoundException("Régimen laboral no encontrado."));
            personal.setRegimenLaboral(regimen);
        } else {
            personal.setRegimenLaboral(null);
        }

        if (request.getIdUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + request.getIdUsuario()));
            personal.setUsuario(usuario);
        } else {
            personal.setUsuario(null);
        }

        // Campos simples
        if (request.getNumeroDocumento() != null) personal.setNumDocPers(request.getNumeroDocumento());
        personal.setNomPers(request.getNombres());
        personal.setApePaterPers(request.getApellidoPaterno());
        personal.setApeMaterPers(request.getApellidoMaterno());
        personal.setFechNaciPers(request.getFechaNacimiento());
        personal.setGenPers(request.getGenero());
        personal.setMovilPers(request.getTelefono());
        personal.setEmailPers(request.getEmailPersonal());
        personal.setEmailCorpPers(request.getEmailCorporativo());
        personal.setColegPers(request.getNumeroColegiatura());
        personal.setCodPlanRem(request.getCodigoPlanilla());
        personal.setDirecPers(request.getDireccion());
        personal.setPerPers(request.getPeriodo());
        if (request.getEstado() != null) personal.setStatPers(request.getEstado());

        PersonalCnt updated = personalCntRepository.save(personal);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public void deletePersonalCnt(Long id) {
        log.info("🗑️ Eliminando personal CNT con ID: {}", id);

        if (!personalCntRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe personal CNT con ID: " + id);
        }

        // Eliminar relaciones dependientes manualmente
        personalProfRepository.deleteByPersonal_IdPers(id);
        personalTipoRepository.deleteByPersonal_IdPers(id);
        personalOcRepository.deleteByPersonal_IdPers(id);
        personalFirmaRepository.deleteByPersonal_IdPers(id);

        personalCntRepository.deleteById(id);
        log.info("✅ Personal CNT eliminado (ID: {})", id);
    }

    // ==========================================================
    // 🔹 Búsquedas / Filtros
    // ==========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> searchPersonalCnt(String searchTerm) {
        log.info("🔎 Buscando personal CNT: {}", searchTerm);
        return personalCntRepository
                .findByNomPersContainingIgnoreCaseOrApePaterPersContainingIgnoreCaseOrApeMaterPersContainingIgnoreCase(
                        searchTerm, searchTerm, searchTerm)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntByArea(Long idArea) {
        log.info("📂 Listando personal por área: {}", idArea);
        return personalCntRepository.findAll().stream()
                .filter(p -> p.getArea() != null && p.getArea().getIdArea().equals(idArea))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntByRegimenLaboral(Long idRegimenLaboral) {
        log.info("🧾 Listando personal por régimen laboral: {}", idRegimenLaboral);
        return personalCntRepository.findAll().stream()
                .filter(p -> p.getRegimenLaboral() != null
                        && p.getRegimenLaboral().getIdRegLab().equals(idRegimenLaboral))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntActivo() {
        log.info("✅ Listando personal CNT activo");
        return personalCntRepository.findAll().stream()
                .filter(PersonalCnt::isActivo)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntInactivo() {
        log.info("🚫 Listando personal CNT inactivo");
        return personalCntRepository.findAll().stream()
                .filter(p -> !p.isActivo())
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ==========================================================
    // 🔹 Foto (subir / eliminar)
    // ==========================================================
    @Override
    @Transactional
    public PersonalResponse uploadFoto(Long id, MultipartFile file) {
        try {
            log.info("🖼️ Subiendo foto para personal CNT ID: {}", id);

            PersonalCnt personal = personalCntRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));

            if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
                throw new BusinessException("El archivo debe ser una imagen válida.");
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            if (personal.getFotoPers() != null) {
                Files.deleteIfExists(uploadPath.resolve(personal.getFotoPers()));
            }

            String fileName = "personal_" + id + "_" + UUID.randomUUID() + ".jpg";
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

            personal.setFotoPers(fileName);
            personalCntRepository.save(personal);

            return convertToResponse(personal);
        } catch (IOException e) {
            log.error("Error al subir la foto del personal CNT: {}", e.getMessage());
            throw new BusinessException("Error al procesar el archivo de imagen.");
        }
    }

    @Override
    @Transactional
    public void deleteFoto(Long id) {
        log.info("🧹 Eliminando foto para personal CNT ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));

        if (personal.getFotoPers() != null) {
            try {
                Files.deleteIfExists(Paths.get(uploadDir).resolve(personal.getFotoPers()));
            } catch (IOException e) {
                log.warn("No se pudo eliminar la foto anterior: {}", e.getMessage());
            }
            personal.setFotoPers(null);
            personalCntRepository.save(personal);
        }
    }

    // ==========================================================
    // 🔹 Conversión a DTO
    // ==========================================================
    private PersonalResponse convertToResponse(PersonalCnt personal) {
        Long idPers = personal.getIdPers();

        PersonalResponse.PersonalResponseBuilder builder = PersonalResponse.builder()
                .idPersonal(idPers)
                .numeroDocumento(personal.getNumDocPers())
                .nombres(personal.getNomPers())
                .apellidoPaterno(personal.getApePaterPers())
                .apellidoMaterno(personal.getApeMaterPers())
                .nombreCompleto(personal.getNombreCompleto())
                .estado(personal.getStatPers())
                .foto(personal.getFotoPers() != null
                        ? String.format("/api/personal-cnt/%d/foto", idPers)
                        : null)
                .telefono(personal.getMovilPers())
                .emailPersonal(personal.getEmailPers())
                .emailCorporativo(personal.getEmailCorpPers())
                .direccion(personal.getDirecPers())
                .codigoPlanilla(personal.getCodPlanRem())
                .numeroColegiatura(personal.getColegPers())
                .periodo(personal.getPerPers())
                .createdAt(personal.getCreatedAt())
                .updatedAt(personal.getUpdatedAt())
                .institucion(null);

        if (personal.getTipoDocumento() != null) {
            TipoDocumento tipoDoc = personal.getTipoDocumento();
            builder.tipoDocumento(TipoDocumentoResponse.builder()
                    .idTipDoc(tipoDoc.getIdTipDoc())
                    .descTipDoc(tipoDoc.getDescTipDoc())
                    .build());
        }

        if (personal.getArea() != null) {
            builder.area(AreaResponse.builder()
                    .idArea(personal.getArea().getIdArea())
                    .descArea(personal.getArea().getDescArea())
                    .build());
        }

        if (personal.getRegimenLaboral() != null) {
            builder.regimenLaboral(RegimenLaboralResponse.builder()
                    .idRegLab(personal.getRegimenLaboral().getIdRegLab())
                    .descRegLab(personal.getRegimenLaboral().getDescRegLab())
                    .build());
        }

        builder.profesiones(personalProfRepository.findProfesionesByPersonalId(idPers));
        builder.tiposPersonal(personalTipoRepository.findTiposByPersonalId(idPers));
        builder.ocs(personalOcRepository.findOCsByPersonalId(idPers));
        builder.firmas(personalFirmaRepository.findFirmasByPersonalId(idPers));

        if (personal.getUsuario() != null) {
            builder.idUsuario(personal.getUsuario().getIdUser());
            builder.username(personal.getUsuario().getNameUser());
            if (personal.getUsuario().getRoles() != null) {
                builder.roles(
                        personal.getUsuario().getRoles().stream()
                                .map(Rol::getDescRol)
                                .collect(Collectors.toSet())
                );
            }
        }

        return builder.build();
    }
}