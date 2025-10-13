package styp.com.cenate.service.personal.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import styp.com.cenate.dto.*;
import styp.com.cenate.exception.BusinessException;
import styp.com.cenate.exception.ResourceNotFoundException;
import styp.com.cenate.model.*;
import styp.com.cenate.repository.*;
import styp.com.cenate.service.personal.PersonalCntService;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalCntServiceImpl implements PersonalCntService {

    private final PersonalCntRepository personalCntRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final AreaRepository areaRepository;
    private final RegimenLaboralRepository regimenLaboralRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${app.upload.dir:${user.home}/cenate-uploads/personal}")
    private String uploadDir;

    // ==========================================================
    // 🔹 Listar y obtener
    // ==========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getAllPersonalCnt() {
        log.info("📋 Obteniendo todo el personal CNT");
        return personalCntRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalCntById(Long id) {
        log.info("🔍 Obteniendo personal CNT con ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));
        return convertToResponse(personal);
    }

    // ==========================================================
    // ✅ Nuevo método requerido
    // ==========================================================
    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalCntByUsuario(Long idUsuario) {
        log.info("👤 Buscando personal CNT por ID de usuario: {}", idUsuario);

        PersonalCnt personal = personalCntRepository.findByUsuario_IdUser(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró personal CNT asociado al usuario con ID: " + idUsuario
                ));

        return convertToResponse(personal);
    }

    // ==========================================================
    // 🔹 Crear y actualizar
    // ==========================================================
    @Override
    @Transactional
    public PersonalResponse createPersonalCnt(PersonalRequest request) {
        log.info("🆕 Creando nuevo personal CNT: {}", request.getNombres());

        if (personalCntRepository.existsByNumDocPers(request.getNumeroDocumento())) {
            throw new BusinessException("Ya existe personal CNT con el número de documento: " + request.getNumeroDocumento());
        }

        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipoDocumento())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado"));

        Usuario usuario = null;
        if (request.getIdUsuario() != null) {
            usuario = usuarioRepository.findById(request.getIdUsuario())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + request.getIdUsuario()));
        }

        // ✅ Conversión LocalDate → LocalDateTime segura
        LocalDate fechaNacimiento = request.getFechaNacimiento();

        PersonalCnt personal = PersonalCnt.builder()
                .tipoDocumento(tipoDoc)
                .numDocPers(request.getNumeroDocumento())
                .nomPers(request.getNombres())
                .apePaterPers(request.getApellidoPaterno())
                .apeMaterPers(request.getApellidoMaterno())
                .perPers(request.getPeriodo())
                .statPers(request.getEstado())
                .fechNaciPers(request.getFechaNacimiento())
                .genPers(request.getGenero())
                .movilPers(request.getTelefono())
                .emailPers(request.getEmailPersonal())
                .emailCorpPers(request.getEmailCorporativo())
                .colegPers(request.getNumeroColegiatura())
                .codPlanRem(request.getCodigoPlanilla())
                .direcPers(request.getDireccion())
                .usuario(usuario)
                .build();

        if (request.getIdRegimenLaboral() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegimenLaboral())
                    .orElseThrow(() -> new ResourceNotFoundException("Régimen laboral no encontrado"));
            personal.setRegimenLaboral(regimen);
        }

        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada"));
            personal.setArea(area);
        }

        PersonalCnt saved = personalCntRepository.save(personal);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public PersonalResponse updatePersonalCnt(Long id, PersonalRequest request) {
        log.info("✏️ Actualizando personal CNT con ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));

        personal.setNomPers(request.getNombres());
        personal.setApePaterPers(request.getApellidoPaterno());
        personal.setApeMaterPers(request.getApellidoMaterno());
        personal.setNumDocPers(request.getNumeroDocumento());
        personal.setPerPers(request.getPeriodo());
        personal.setStatPers(request.getEstado());

        // ✅ Conversión LocalDate → LocalDateTime segura
        LocalDate fechaNacimiento = request.getFechaNacimiento();
        personal.setFechNaciPers(request.getFechaNacimiento());

        personal.setGenPers(request.getGenero());
        personal.setMovilPers(request.getTelefono());
        personal.setEmailPers(request.getEmailPersonal());
        personal.setEmailCorpPers(request.getEmailCorporativo());
        personal.setColegPers(request.getNumeroColegiatura());
        personal.setCodPlanRem(request.getCodigoPlanilla());
        personal.setDirecPers(request.getDireccion());

        if (request.getIdUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + request.getIdUsuario()));
            personal.setUsuario(usuario);
        } else {
            personal.setUsuario(null);
        }

        if (request.getIdRegimenLaboral() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegimenLaboral())
                    .orElseThrow(() -> new ResourceNotFoundException("Régimen laboral no encontrado"));
            personal.setRegimenLaboral(regimen);
        } else {
            personal.setRegimenLaboral(null);
        }

        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada"));
            personal.setArea(area);
        } else {
            personal.setArea(null);
        }

        PersonalCnt updated = personalCntRepository.save(personal);
        return convertToResponse(updated);
    }

    // ==========================================================
    // 🔹 Eliminar
    // ==========================================================
    @Override
    @Transactional
    public void deletePersonalCnt(Long id) {
        log.info("🗑️ Eliminando personal CNT con ID: {}", id);
        personalCntRepository.deleteById(id);
    }

    // ==========================================================
    // 🔹 Búsquedas
    // ==========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> searchPersonalCnt(String searchTerm) {
        log.info("🔎 Buscando personal CNT con término: {}", searchTerm);
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
        return personalCntRepository.findByArea_IdArea(idArea).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntByRegimenLaboral(Long idRegimenLaboral) {
        return personalCntRepository.findByRegimenLaboral_IdRegLab(idRegimenLaboral).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ==========================================================
    // 🔹 Foto (subir / eliminar)
    // ==========================================================
    @Override
    @Transactional
    public PersonalResponse uploadFoto(Long id, MultipartFile file) throws IOException {
        log.info("🖼️ Subiendo foto para personal CNT ID: {}", id);

        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("El archivo debe ser una imagen válida");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        if (personal.getFotoPers() != null) {
            Files.deleteIfExists(Paths.get(uploadDir, personal.getFotoPers()));
        }

        String fileName = "personal_" + id + "_" + UUID.randomUUID() + ".jpg";
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

        personal.setFotoPers(fileName);
        personalCntRepository.save(personal);

        return convertToResponse(personal);
    }

    @Override
    @Transactional
    public void deleteFoto(Long id) {
        log.info("🗑️ Eliminando foto de personal CNT ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));

        if (personal.getFotoPers() != null) {
            try {
                Files.deleteIfExists(Paths.get(uploadDir, personal.getFotoPers()));
            } catch (IOException e) {
                log.warn("⚠️ No se pudo eliminar la foto del sistema de archivos: {}", e.getMessage());
            }

            personal.setFotoPers(null);
            personalCntRepository.save(personal);
        }
    }

    // ==========================================================
    // 🔹 Estado
    // ==========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntActivo() {
        return personalCntRepository.findByStatPers("A").stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntInactivo() {
        return personalCntRepository.findByStatPers("I").stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ==========================================================
    // 🧩 Conversión de entidad a DTO
    // ==========================================================
    private PersonalResponse convertToResponse(PersonalCnt personal) {
        PersonalResponse.PersonalResponseBuilder builder = PersonalResponse.builder()
                .idPersonal(personal.getIdPers())
                .numeroDocumento(personal.getNumDocPers())
                .nombres(personal.getNomPers())
                .apellidoPaterno(personal.getApePaterPers())
                .apellidoMaterno(personal.getApeMaterPers())
                .nombreCompleto(personal.getNombreCompleto())
                .estado(personal.getStatPers())
                .foto(personal.getFotoPers())
                .idUsuario(personal.getUsuario() != null ? personal.getUsuario().getIdUser() : null)
                .createAt(personal.getCreateAt())
                .updateAt(personal.getUpdateAt());

        if (personal.getTipoDocumento() != null) {
            builder.tipoDocumento(TipoDocumentoResponse.builder()
                    .idTipDoc(personal.getTipoDocumento().getIdTipDoc())
                    .descTipDoc(personal.getTipoDocumento().getDescTipDoc())
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

        return builder.build();
    }
}