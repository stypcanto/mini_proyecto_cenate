package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import styp.com.cenate.dto.AreaResponse;
import styp.com.cenate.dto.PersonalCntRequest;
import styp.com.cenate.dto.PersonalCntResponse;
import styp.com.cenate.dto.RegimenLaboralResponse;
import styp.com.cenate.dto.TipoDocumentoResponse;
import styp.com.cenate.model.Area;
import styp.com.cenate.model.PersonalCnt;
import styp.com.cenate.model.RegimenLaboral;
import styp.com.cenate.model.TipoDocumento;
import styp.com.cenate.repository.AreaRepository;
import styp.com.cenate.repository.PersonalCntRepository;
import styp.com.cenate.repository.RegimenLaboralRepository;
import styp.com.cenate.repository.TipoDocumentoRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalCntService {
    
    private final PersonalCntRepository personalCntRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final AreaRepository areaRepository;
    private final RegimenLaboralRepository regimenLaboralRepository;
    
    @Value("${app.upload.dir:${user.home}/cenate-uploads/personal}")
    private String uploadDir;
    
    @Transactional(readOnly = true)
    public List<PersonalCntResponse> getAllPersonal() {
        log.info("Obteniendo todo el personal");
        return personalCntRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PersonalCntResponse getPersonalById(Long id) {
        log.info("Obteniendo personal con ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado"));
        return convertToResponse(personal);
    }
    
    @Transactional
    public PersonalCntResponse createPersonal(PersonalCntRequest request) {
        log.info("Creando nuevo personal: {} {}", request.getNomPers(), request.getApePaterPers());
        
        // Validar que el número de documento no exista
        if (personalCntRepository.existsByNumDocPers(request.getNumDocPers())) {
            throw new RuntimeException("Ya existe personal con ese número de documento");
        }
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipDoc())
                .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado"));
        
        PersonalCnt personal = PersonalCnt.builder()
                .tipoDocumento(tipoDoc)
                .numDocPers(request.getNumDocPers())
                .nomPers(request.getNomPers())
                .apePaterPers(request.getApePaterPers())
                .apeMaterPers(request.getApeMaterPers())
                .perPers(request.getPerPers())
                .statPers(request.getStatPers())
                .fechNaciPers(request.getFechNaciPers())
                .genPers(request.getGenPers())
                .movilPers(request.getMovilPers())
                .emailPers(request.getEmailPers())
                .emailCorpPers(request.getEmailCorpPers())
                .colegPers(request.getColegPers())
                .codPlanRem(request.getCodPlanRem())
                .direcPers(request.getDirecPers())
                .idUsuario(request.getIdUsuario())
                .build();
        
        if (request.getIdRegLab() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegLab())
                    .orElseThrow(() -> new RuntimeException("Régimen laboral no encontrado"));
            personal.setRegimenLaboral(regimen);
        }
        
        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new RuntimeException("Área no encontrada"));
            personal.setArea(area);
        }
        
        PersonalCnt saved = personalCntRepository.save(personal);
        log.info("Personal creado exitosamente con ID: {}", saved.getIdPers());
        return convertToResponse(saved);
    }
    
    @Transactional
    public PersonalCntResponse updatePersonal(Long id, PersonalCntRequest request) {
        log.info("Actualizando personal con ID: {}", id);
        
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado"));
        
        // Validar número de documento si cambió
        if (!personal.getNumDocPers().equals(request.getNumDocPers())) {
            if (personalCntRepository.existsByNumDocPers(request.getNumDocPers())) {
                throw new RuntimeException("Ya existe personal con ese número de documento");
            }
        }
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipDoc())
                .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado"));
        
        personal.setTipoDocumento(tipoDoc);
        personal.setNumDocPers(request.getNumDocPers());
        personal.setNomPers(request.getNomPers());
        personal.setApePaterPers(request.getApePaterPers());
        personal.setApeMaterPers(request.getApeMaterPers());
        personal.setPerPers(request.getPerPers());
        personal.setStatPers(request.getStatPers());
        personal.setFechNaciPers(request.getFechNaciPers());
        personal.setGenPers(request.getGenPers());
        personal.setMovilPers(request.getMovilPers());
        personal.setEmailPers(request.getEmailPers());
        personal.setEmailCorpPers(request.getEmailCorpPers());
        personal.setColegPers(request.getColegPers());
        personal.setCodPlanRem(request.getCodPlanRem());
        personal.setDirecPers(request.getDirecPers());
        personal.setIdUsuario(request.getIdUsuario());
        
        if (request.getIdRegLab() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegLab())
                    .orElseThrow(() -> new RuntimeException("Régimen laboral no encontrado"));
            personal.setRegimenLaboral(regimen);
        } else {
            personal.setRegimenLaboral(null);
        }
        
        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new RuntimeException("Área no encontrada"));
            personal.setArea(area);
        } else {
            personal.setArea(null);
        }
        
        PersonalCnt updated = personalCntRepository.save(personal);
        log.info("Personal actualizado exitosamente");
        return convertToResponse(updated);
    }
    
    /**
     * ✅ NUEVO: Subir foto del personal
     */
    @Transactional
    public PersonalCntResponse uploadFoto(Long id, MultipartFile file) throws IOException {
        log.info("Subiendo foto para personal ID: {}", id);
        
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado"));
        
        // Validar que sea una imagen
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("El archivo debe ser una imagen");
        }
        
        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Eliminar foto anterior si existe
        if (personal.getFotoPers() != null) {
            try {
                Path oldFile = Paths.get(uploadDir, personal.getFotoPers());
                Files.deleteIfExists(oldFile);
            } catch (IOException e) {
                log.warn("No se pudo eliminar la foto anterior: {}", e.getMessage());
            }
        }
        
        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : ".jpg";
        String fileName = "personal_" + id + "_" + UUID.randomUUID().toString() + extension;
        
        // Guardar archivo
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Actualizar ruta en la base de datos
        personal.setFotoPers(fileName);
        PersonalCnt updated = personalCntRepository.save(personal);
        
        log.info("Foto subida exitosamente: {}", fileName);
        return convertToResponse(updated);
    }
    
    /**
     * ✅ NUEVO: Eliminar foto del personal
     */
    @Transactional
    public void deleteFoto(Long id) throws IOException {
        log.info("Eliminando foto para personal ID: {}", id);
        
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado"));
        
        if (personal.getFotoPers() != null) {
            Path filePath = Paths.get(uploadDir, personal.getFotoPers());
            Files.deleteIfExists(filePath);
            
            personal.setFotoPers(null);
            personalCntRepository.save(personal);
            log.info("Foto eliminada exitosamente");
        }
    }
    
    @Transactional
    public void deletePersonal(Long id) {
        log.info("Eliminando personal con ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado"));
        
        // Eliminar foto si existe
        if (personal.getFotoPers() != null) {
            try {
                Path filePath = Paths.get(uploadDir, personal.getFotoPers());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.warn("No se pudo eliminar la foto: {}", e.getMessage());
            }
        }
        
        personalCntRepository.deleteById(id);
        log.info("Personal eliminado exitosamente");
    }
    
    @Transactional(readOnly = true)
    public List<PersonalCntResponse> searchPersonal(String searchTerm) {
        log.info("Buscando personal con término: {}", searchTerm);
        return personalCntRepository.findByNomPersContainingIgnoreCaseOrApePaterPersContainingIgnoreCaseOrApeMaterPersContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    private PersonalCntResponse convertToResponse(PersonalCnt personal) {
        PersonalCntResponse.PersonalCntResponseBuilder builder = PersonalCntResponse.builder()
                .idPers(personal.getIdPers())
                .numDocPers(personal.getNumDocPers())
                .nomPers(personal.getNomPers())
                .apePaterPers(personal.getApePaterPers())
                .apeMaterPers(personal.getApeMaterPers())
                .nombreCompleto(personal.getNombreCompleto())
                .perPers(personal.getPerPers())
                .statPers(personal.getStatPers())
                .fechNaciPers(personal.getFechNaciPers())
                .edad(personal.getEdad())           // ✅ NUEVO
                .genPers(personal.getGenPers())
                .movilPers(personal.getMovilPers())
                .emailPers(personal.getEmailPers())
                .emailCorpPers(personal.getEmailCorpPers())
                .colegPers(personal.getColegPers())
                .codPlanRem(personal.getCodPlanRem())
                .direcPers(personal.getDirecPers())
                .fotoPers(personal.getFotoPers())   // ✅ NUEVO
                .idUsuario(personal.getIdUsuario())
                .createAt(personal.getCreateAt())
                .updateAt(personal.getUpdateAt());
        
        if (personal.getTipoDocumento() != null) {
            TipoDocumentoResponse tipoDocResp = TipoDocumentoResponse.builder()
                    .idTipDoc(personal.getTipoDocumento().getIdTipDoc())
                    .descTipDoc(personal.getTipoDocumento().getDescTipDoc())
                    .statTipDoc(personal.getTipoDocumento().getStatTipDoc())
                    .build();
            builder.tipoDocumento(tipoDocResp);
        }
        
        if (personal.getRegimenLaboral() != null) {
            RegimenLaboralResponse regimenResp = RegimenLaboralResponse.builder()
                    .idRegLab(personal.getRegimenLaboral().getIdRegLab())
                    .descRegLab(personal.getRegimenLaboral().getDescRegLab())
                    .statRegLab(personal.getRegimenLaboral().getStatRegLab())
                    .build();
            builder.regimenLaboral(regimenResp);
        }
        
        if (personal.getArea() != null) {
            AreaResponse areaResp = AreaResponse.builder()
                    .idArea(personal.getArea().getIdArea())
                    .descArea(personal.getArea().getDescArea())
                    .statArea(personal.getArea().getStatArea())
                    .build();
            builder.area(areaResp);
        }
        
        return builder.build();
    }
}
