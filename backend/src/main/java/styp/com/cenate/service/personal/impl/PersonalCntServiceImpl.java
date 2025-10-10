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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de Personal CNT
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
    
    @Value("${app.upload.dir:${user.home}/cenate-uploads/personal}")
    private String uploadDir;
    
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getAllPersonalCnt() {
        log.info("Obteniendo todo el personal CNT");
        return personalCntRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalCntById(Long id) {
        log.info("Obteniendo personal CNT con ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));
        return convertToResponse(personal);
    }
    
    @Override
    @Transactional
    public PersonalResponse createPersonalCnt(PersonalRequest request) {
        log.info("Creando nuevo personal CNT: {} {}", request.getNombres(), request.getApellidoPaterno());
        
        // Validar que el número de documento no exista
        if (personalCntRepository.existsByNumDocPers(request.getNumeroDocumento())) {
            throw new BusinessException("Ya existe personal CNT con el número de documento: " + request.getNumeroDocumento());
        }
        
        // Validar campos obligatorios para personal CNT
        if (request.getPeriodo() == null || request.getPeriodo().isEmpty()) {
            throw new BusinessException("El periodo es obligatorio para personal CNT");
        }
        if (request.getEstado() == null || request.getEstado().isEmpty()) {
            throw new BusinessException("El estado es obligatorio para personal CNT");
        }
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipoDocumento())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado con ID: " + request.getIdTipoDocumento()));
        
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
                .idUsuario(request.getIdUsuario())
                .build();
        
        // Asignar régimen laboral si se proporciona
        if (request.getIdRegimenLaboral() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegimenLaboral())
                    .orElseThrow(() -> new ResourceNotFoundException("Régimen laboral no encontrado con ID: " + request.getIdRegimenLaboral()));
            personal.setRegimenLaboral(regimen);
        }
        
        // Asignar área si se proporciona
        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada con ID: " + request.getIdArea()));
            personal.setArea(area);
        }
        
        PersonalCnt saved = personalCntRepository.save(personal);
        log.info("Personal CNT creado exitosamente con ID: {}", saved.getIdPers());
        return convertToResponse(saved);
    }
    
    @Override
    @Transactional
    public PersonalResponse updatePersonalCnt(Long id, PersonalRequest request) {
        log.info("Actualizando personal CNT con ID: {}", id);
        
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));
        
        // Validar número de documento si cambió
        if (!personal.getNumDocPers().equals(request.getNumeroDocumento())) {
            if (personalCntRepository.existsByNumDocPers(request.getNumeroDocumento())) {
                throw new BusinessException("Ya existe personal CNT con el número de documento: " + request.getNumeroDocumento());
            }
        }
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipoDocumento())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado con ID: " + request.getIdTipoDocumento()));
        
        personal.setTipoDocumento(tipoDoc);
        personal.setNumDocPers(request.getNumeroDocumento());
        personal.setNomPers(request.getNombres());
        personal.setApePaterPers(request.getApellidoPaterno());
        personal.setApeMaterPers(request.getApellidoMaterno());
        personal.setPerPers(request.getPeriodo());
        personal.setStatPers(request.getEstado());
        personal.setFechNaciPers(request.getFechaNacimiento());
        personal.setGenPers(request.getGenero());
        personal.setMovilPers(request.getTelefono());
        personal.setEmailPers(request.getEmailPersonal());
        personal.setEmailCorpPers(request.getEmailCorporativo());
        personal.setColegPers(request.getNumeroColegiatura());
        personal.setCodPlanRem(request.getCodigoPlanilla());
        personal.setDirecPers(request.getDireccion());
        personal.setIdUsuario(request.getIdUsuario());
        
        // Actualizar régimen laboral
        if (request.getIdRegimenLaboral() != null) {
            RegimenLaboral regimen = regimenLaboralRepository.findById(request.getIdRegimenLaboral())
                    .orElseThrow(() -> new ResourceNotFoundException("Régimen laboral no encontrado con ID: " + request.getIdRegimenLaboral()));
            personal.setRegimenLaboral(regimen);
        } else {
            personal.setRegimenLaboral(null);
        }
        
        // Actualizar área
        if (request.getIdArea() != null) {
            Area area = areaRepository.findById(request.getIdArea())
                    .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada con ID: " + request.getIdArea()));
            personal.setArea(area);
        } else {
            personal.setArea(null);
        }
        
        PersonalCnt updated = personalCntRepository.save(personal);
        log.info("Personal CNT actualizado exitosamente");
        return convertToResponse(updated);
    }
    
    @Override
    @Transactional
    public void deletePersonalCnt(Long id) {
        log.info("Eliminando personal CNT con ID: {}", id);
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));
        
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
        log.info("Personal CNT eliminado exitosamente");
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> searchPersonalCnt(String searchTerm) {
        log.info("Buscando personal CNT con término: {}", searchTerm);
        return personalCntRepository.findByNomPersContainingIgnoreCaseOrApePaterPersContainingIgnoreCaseOrApeMaterPersContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntByArea(Long idArea) {
        log.info("Obteniendo personal CNT por área ID: {}", idArea);
        return personalCntRepository.findByArea_IdArea(idArea).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntByRegimenLaboral(Long idRegimenLaboral) {
        log.info("Obteniendo personal CNT por régimen laboral ID: {}", idRegimenLaboral);
        return personalCntRepository.findByRegimenLaboral_IdRegLab(idRegimenLaboral).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalCntByUsuario(Long idUsuario) {
        log.info("Obteniendo personal CNT por usuario ID: {}", idUsuario);
        PersonalCnt personal = personalCntRepository.findByIdUsuario(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró personal CNT para el usuario ID: " + idUsuario));
        return convertToResponse(personal);
    }
    
    @Override
    @Transactional
    public PersonalResponse uploadFoto(Long id, MultipartFile file) throws IOException {
        log.info("Subiendo foto para personal CNT ID: {}", id);
        
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));
        
        // Validar que sea una imagen
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("El archivo debe ser una imagen");
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
    
    @Override
    @Transactional
    public void deleteFoto(Long id) throws IOException {
        log.info("Eliminando foto para personal CNT ID: {}", id);
        
        PersonalCnt personal = personalCntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal CNT no encontrado con ID: " + id));
        
        if (personal.getFotoPers() != null) {
            Path filePath = Paths.get(uploadDir, personal.getFotoPers());
            Files.deleteIfExists(filePath);
            
            personal.setFotoPers(null);
            personalCntRepository.save(personal);
            log.info("Foto eliminada exitosamente");
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntActivo() {
        log.info("Obteniendo personal CNT activo");
        return personalCntRepository.findByStatPers("A").stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalCntInactivo() {
        log.info("Obteniendo personal CNT inactivo");
        return personalCntRepository.findByStatPers("I").stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Convierte PersonalCnt a PersonalResponse
     */
    private PersonalResponse convertToResponse(PersonalCnt personal) {
        PersonalResponse.PersonalResponseBuilder builder = PersonalResponse.builder()
                .idPersonal(personal.getIdPers())
                .tipoPersonal("CENATE")
                .numeroDocumento(personal.getNumDocPers())
                .nombres(personal.getNomPers())
                .apellidoPaterno(personal.getApePaterPers())
                .apellidoMaterno(personal.getApeMaterPers())
                .nombreCompleto(personal.getNombreCompleto())
                .fechaNacimiento(personal.getFechNaciPers())
                .edad(personal.getEdad())
                .genero(personal.getGenPers())
                .telefono(personal.getMovilPers())
                .emailPersonal(personal.getEmailPers())
                .emailCorporativo(personal.getEmailCorpPers())
                .institucion("CENATE")
                .estado(personal.getStatPers())
                .periodo(personal.getPerPers())
                .codigoPlanilla(personal.getCodPlanRem())
                .numeroColegiatura(personal.getColegPers())
                .direccion(personal.getDirecPers())
                .foto(personal.getFotoPers())
                .idUsuario(personal.getIdUsuario())
                .createAt(personal.getCreateAt())
                .updateAt(personal.getUpdateAt());
        
        // Tipo de documento
        if (personal.getTipoDocumento() != null) {
            builder.tipoDocumento(TipoDocumentoResponse.builder()
                    .idTipDoc(personal.getTipoDocumento().getIdTipDoc())
                    .descTipDoc(personal.getTipoDocumento().getDescTipDoc())
                    .statTipDoc(personal.getTipoDocumento().getStatTipDoc())
                    .build());
        }
        
        // Régimen laboral
        if (personal.getRegimenLaboral() != null) {
            builder.regimenLaboral(RegimenLaboralResponse.builder()
                    .idRegLab(personal.getRegimenLaboral().getIdRegLab())
                    .descRegLab(personal.getRegimenLaboral().getDescRegLab())
                    .statRegLab(personal.getRegimenLaboral().getStatRegLab())
                    .build());
        }
        
        // Área
        if (personal.getArea() != null) {
            builder.area(AreaResponse.builder()
                    .idArea(personal.getArea().getIdArea())
                    .descArea(personal.getArea().getDescArea())
                    .statArea(personal.getArea().getStatArea())
                    .build());
        }
        
        // Información de usuario si existe
        if (personal.getIdUsuario() != null) {
            usuarioRepository.findById(personal.getIdUsuario()).ifPresent(usuario -> {
                builder.username(usuario.getNameUser())
                        .estadoUsuario(usuario.getStatUser())
                        .ultimoLogin(usuario.getLastLoginAt())
                        .cuentaBloqueada(usuario.isAccountLocked());
                
                // Roles
                if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
                    builder.roles(usuario.getRoles().stream()
                            .map(Rol::getDescRol)
                            .collect(Collectors.toSet()));
                    
                    // Permisos
                    builder.permisos(usuario.getRoles().stream()
                            .flatMap(rol -> rol.getPermisos().stream())
                            .map(Permiso::getDescPermiso)
                            .collect(Collectors.toSet()));
                }
            });
        }
        
        return builder.build();
    }
}
