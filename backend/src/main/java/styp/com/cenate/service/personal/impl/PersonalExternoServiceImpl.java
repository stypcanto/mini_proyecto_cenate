package styp.com.cenate.service.personal.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.*;
import styp.com.cenate.exception.ResourceNotFoundException;
import styp.com.cenate.exception.BusinessException;
import styp.com.cenate.model.*;
import styp.com.cenate.repository.*;
import styp.com.cenate.service.personal.PersonalExternoService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de Personal Externo
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalExternoServiceImpl implements PersonalExternoService {
    
    private final PersonalExternoRepository personalExternoRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final IpressRepository ipressRepository;
    private final UsuarioRepository usuarioRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getAllPersonalExterno() {
        log.info("Obteniendo todo el personal externo");
        return personalExternoRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalExternoById(Long id) {
        log.info("Obteniendo personal externo con ID: {}", id);
        PersonalExterno personal = personalExternoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal externo no encontrado con ID: " + id));
        return convertToResponse(personal);
    }
    
    @Override
    @Transactional
    public PersonalResponse createPersonalExterno(PersonalRequest request) {
        log.info("Creando nuevo personal externo: {} {}", request.getNombres(), request.getApellidoPaterno());
        
        // Validar que el número de documento no exista
        if (personalExternoRepository.existsByNumDocExt(request.getNumeroDocumento())) {
            throw new BusinessException("Ya existe personal externo con el número de documento: " + request.getNumeroDocumento());
        }
        
        // Validar IPRESS (obligatorio para personal externo)
        if (request.getIdIpress() == null) {
            throw new BusinessException("El personal externo debe pertenecer a una IPRESS");
        }
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipoDocumento())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado con ID: " + request.getIdTipoDocumento()));
        
        Ipress ipress = ipressRepository.findById(request.getIdIpress())
                .orElseThrow(() -> new ResourceNotFoundException("IPRESS no encontrada con ID: " + request.getIdIpress()));
        
        PersonalExterno personal = PersonalExterno.builder()
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
        
        PersonalExterno saved = personalExternoRepository.save(personal);
        log.info("Personal externo creado exitosamente con ID: {}", saved.getIdPersExt());
        return convertToResponse(saved);
    }
    
    @Override
    @Transactional
    public PersonalResponse updatePersonalExterno(Long id, PersonalRequest request) {
        log.info("Actualizando personal externo con ID: {}", id);
        
        PersonalExterno personal = personalExternoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personal externo no encontrado con ID: " + id));
        
        // Validar número de documento si cambió
        if (!personal.getNumDocExt().equals(request.getNumeroDocumento())) {
            if (personalExternoRepository.existsByNumDocExt(request.getNumeroDocumento())) {
                throw new BusinessException("Ya existe personal externo con el número de documento: " + request.getNumeroDocumento());
            }
        }
        
        TipoDocumento tipoDoc = tipoDocumentoRepository.findById(request.getIdTipoDocumento())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado con ID: " + request.getIdTipoDocumento()));
        
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
        
        // Actualizar IPRESS
        if (request.getIdIpress() != null) {
            Ipress ipress = ipressRepository.findById(request.getIdIpress())
                    .orElseThrow(() -> new ResourceNotFoundException("IPRESS no encontrada con ID: " + request.getIdIpress()));
            personal.setIpress(ipress);
        }
        
        PersonalExterno updated = personalExternoRepository.save(personal);
        log.info("Personal externo actualizado exitosamente");
        return convertToResponse(updated);
    }
    
    @Override
    @Transactional
    public void deletePersonalExterno(Long id) {
        log.info("Eliminando personal externo con ID: {}", id);
        if (!personalExternoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Personal externo no encontrado con ID: " + id);
        }
        personalExternoRepository.deleteById(id);
        log.info("Personal externo eliminado exitosamente");
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> searchPersonalExterno(String searchTerm) {
        log.info("Buscando personal externo con término: {}", searchTerm);
        return personalExternoRepository.findByNomExtContainingIgnoreCaseOrApePaterExtContainingIgnoreCaseOrApeMaterExtContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PersonalResponse> getPersonalExternoByIpress(Long idIpress) {
        log.info("Obteniendo personal externo por IPRESS ID: {}", idIpress);
        return personalExternoRepository.findByIpress_IdIpress(idIpress).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PersonalResponse getPersonalExternoByUsuario(Long idUsuario) {
        log.info("Obteniendo personal externo por usuario ID: {}", idUsuario);
        PersonalExterno personal = personalExternoRepository.findByIdUser(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró personal externo para el usuario ID: " + idUsuario));
        return convertToResponse(personal);
    }
    
    /**
     * Convierte PersonalExterno a PersonalResponse
     */
    private PersonalResponse convertToResponse(PersonalExterno personal) {
        PersonalResponse.PersonalResponseBuilder builder = PersonalResponse.builder()
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
        
        // IPRESS
        if (personal.getIpress() != null) {
            Ipress ipress = personal.getIpress();
            builder.ipress(IpressResponse.builder()
                    .idIpress(ipress.getIdIpress())
                    .codIpress(ipress.getCodIpress())
                    .descIpress(ipress.getDescIpress())
                    .idRed(ipress.getIdRed())
                    .idNivAten(ipress.getIdNivAten())
                    .idModAten(ipress.getIdModAten())
                    .direcIpress(ipress.getDirecIpress())
                    .idTipIpress(ipress.getIdTipIpress())
                    .idDist(ipress.getIdDist())
                    .latIpress(ipress.getLatIpress())
                    .longIpress(ipress.getLongIpress())
                    .gmapsUrlIpress(ipress.getGmapsUrlIpress())
                    .statIpress(ipress.getStatIpress())
                    .createAt(ipress.getCreateAt())
                    .updateAt(ipress.getUpdateAt())
                    .build());
            builder.institucion(ipress.getDescIpress());
        }
        
        // Información de usuario si existe
        if (personal.getIdUser() != null) {
            usuarioRepository.findById(personal.getIdUser()).ifPresent(usuario -> {
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
