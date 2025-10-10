package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.*;
import styp.com.cenate.model.PersonalCnt;
import styp.com.cenate.model.PersonalExterno;
import styp.com.cenate.model.Usuario;
import styp.com.cenate.repository.PersonalCntRepository;
import styp.com.cenate.repository.PersonalExternoRepository;
import styp.com.cenate.repository.UsuarioRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio unificado para gestionar tanto personal interno (CENATE) como externo (otras instituciones)
 * Proporciona una vista consolidada con filtros avanzados
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalUnificadoService {
    
    private final PersonalCntRepository personalCntRepository;
    private final PersonalExternoRepository personalExternoRepository;
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Obtiene TODO el personal (interno y externo) del sistema
     */
    @Transactional(readOnly = true)
    public List<PersonalUnificadoResponse> getAllPersonal() {
        log.info("Obteniendo todo el personal (CENATE + Externos)");
        
        List<PersonalUnificadoResponse> result = new ArrayList<>();
        
        // Obtener personal CENATE
        List<PersonalCnt> personalCenate = personalCntRepository.findAll();
        result.addAll(personalCenate.stream()
                .map(this::convertPersonalCntToUnificado)
                .collect(Collectors.toList()));
        
        // Obtener personal externo
        List<PersonalExterno> personalExterno = personalExternoRepository.findAll();
        result.addAll(personalExterno.stream()
                .map(this::convertPersonalExternoToUnificado)
                .collect(Collectors.toList()));
        
        log.info("Total personal encontrado: {} (CENATE: {}, Externos: {})", 
                result.size(), personalCenate.size(), personalExterno.size());
        
        return result;
    }
    
    /**
     * Obtiene personal con filtros avanzados
     * 
     * @param tipoPersonal Filtro por tipo: "CENATE", "EXTERNO" o null para todos
     * @param mesCumpleanos Filtro por mes de cumpleaños (1-12)
     * @param estado Filtro por estado ("A", "I" para CENATE, o "ACTIVO"/"INACTIVO" para todos)
     * @param idArea Filtro por área (solo aplica para personal CENATE)
     * @param searchTerm Término de búsqueda en nombre, apellidos o documento
     * @return Lista filtrada de personal
     */
    @Transactional(readOnly = true)
    public List<PersonalUnificadoResponse> getPersonalConFiltros(
            String tipoPersonal,
            Integer mesCumpleanos,
            String estado,
            Integer idArea,
            String searchTerm) {
        
        log.info("Buscando personal con filtros - Tipo: {}, Mes: {}, Estado: {}, Área: {}, Búsqueda: {}", 
                tipoPersonal, mesCumpleanos, estado, idArea, searchTerm);
        
        List<PersonalUnificadoResponse> resultado = new ArrayList<>();
        
        // Determinar qué tipos de personal incluir
        boolean incluirCenate = tipoPersonal == null || "CENATE".equalsIgnoreCase(tipoPersonal);
        boolean incluirExterno = tipoPersonal == null || "EXTERNO".equalsIgnoreCase(tipoPersonal);
        
        // ===== PERSONAL CENATE =====
        if (incluirCenate) {
            List<PersonalCnt> personalCenate = personalCntRepository.findAll();
            
            // Aplicar filtros específicos
            if (idArea != null) {
                personalCenate = personalCenate.stream()
                        .filter(p -> p.getArea() != null && p.getArea().getIdArea().equals(idArea))
                        .collect(Collectors.toList());
            }
            
            if (estado != null) {
                String estadoCenate = estado.equalsIgnoreCase("ACTIVO") ? "A" : 
                                     estado.equalsIgnoreCase("INACTIVO") ? "I" : estado;
                personalCenate = personalCenate.stream()
                        .filter(p -> estadoCenate.equals(p.getStatPers()))
                        .collect(Collectors.toList());
            }
            
            if (mesCumpleanos != null) {
                personalCenate = personalCenate.stream()
                        .filter(p -> p.getFechNaciPers() != null && 
                                   p.getFechNaciPers().getMonthValue() == mesCumpleanos)
                        .collect(Collectors.toList());
            }
            
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                String searchLower = searchTerm.toLowerCase();
                personalCenate = personalCenate.stream()
                        .filter(p -> 
                            p.getNomPers().toLowerCase().contains(searchLower) ||
                            p.getApePaterPers().toLowerCase().contains(searchLower) ||
                            (p.getApeMaterPers() != null && p.getApeMaterPers().toLowerCase().contains(searchLower)) ||
                            p.getNumDocPers().contains(searchTerm)
                        )
                        .collect(Collectors.toList());
            }
            
            resultado.addAll(personalCenate.stream()
                    .map(this::convertPersonalCntToUnificado)
                    .collect(Collectors.toList()));
        }
        
        // ===== PERSONAL EXTERNO =====
        if (incluirExterno) {
            List<PersonalExterno> personalExterno = personalExternoRepository.findAll();
            
            // Para externos, verificamos el estado del usuario asociado si existe
            if (estado != null && estado.equalsIgnoreCase("ACTIVO")) {
                personalExterno = personalExterno.stream()
                        .filter(p -> p.getIdUser() != null && 
                                   usuarioRepository.findById(p.getIdUser())
                                           .map(u -> "ACTIVO".equals(u.getStatUser()))
                                           .orElse(false))
                        .collect(Collectors.toList());
            } else if (estado != null && estado.equalsIgnoreCase("INACTIVO")) {
                personalExterno = personalExterno.stream()
                        .filter(p -> p.getIdUser() == null || 
                                   usuarioRepository.findById(p.getIdUser())
                                           .map(u -> !"ACTIVO".equals(u.getStatUser()))
                                           .orElse(true))
                        .collect(Collectors.toList());
            }
            
            if (mesCumpleanos != null) {
                personalExterno = personalExterno.stream()
                        .filter(p -> p.getFechNaciExt() != null && 
                                   p.getFechNaciExt().getMonthValue() == mesCumpleanos)
                        .collect(Collectors.toList());
            }
            
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                String searchLower = searchTerm.toLowerCase();
                personalExterno = personalExterno.stream()
                        .filter(p -> 
                            p.getNomExt().toLowerCase().contains(searchLower) ||
                            p.getApePaterExt().toLowerCase().contains(searchLower) ||
                            (p.getApeMaterExt() != null && p.getApeMaterExt().toLowerCase().contains(searchLower)) ||
                            p.getNumDocExt().contains(searchTerm)
                        )
                        .collect(Collectors.toList());
            }
            
            resultado.addAll(personalExterno.stream()
                    .map(this::convertPersonalExternoToUnificado)
                    .collect(Collectors.toList()));
        }
        
        log.info("Personal filtrado encontrado: {}", resultado.size());
        return resultado;
    }
    
    /**
     * Obtiene estadísticas del personal
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getEstadisticasPersonal() {
        long totalCenate = personalCntRepository.count();
        long totalExterno = personalExternoRepository.count();
        long totalActivos = personalCntRepository.findByStatPers("A").size();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCenate", totalCenate);
        stats.put("totalExterno", totalExterno);
        stats.put("totalGeneral", totalCenate + totalExterno);
        stats.put("totalActivosCenate", totalActivos);
        stats.put("totalInactivosCenate", totalCenate - totalActivos);
        
        return stats;
    }
    
    /**
     * Obtiene personal que cumple años en un mes específico
     */
    @Transactional(readOnly = true)
    public List<PersonalUnificadoResponse> getPersonalPorMesCumpleanos(Integer mes) {
        if (mes < 1 || mes > 12) {
            throw new IllegalArgumentException("El mes debe estar entre 1 y 12");
        }
        
        return getPersonalConFiltros(null, mes, null, null, null);
    }
    
    /**
     * Convierte PersonalCnt a PersonalUnificadoResponse
     */
    private PersonalUnificadoResponse convertPersonalCntToUnificado(PersonalCnt personal) {
        PersonalUnificadoResponse.PersonalUnificadoResponseBuilder builder = PersonalUnificadoResponse.builder()
                .id(personal.getIdPers())
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
        
        // Área
        if (personal.getArea() != null) {
            builder.area(AreaResponse.builder()
                    .idArea(personal.getArea().getIdArea())
                    .descArea(personal.getArea().getDescArea())
                    .statArea(personal.getArea().getStatArea())
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
        
        // Usuario asociado
        if (personal.getIdUsuario() != null) {
            usuarioRepository.findById(personal.getIdUsuario()).ifPresent(usuario -> 
                builder.usuario(convertUsuarioToResponse(usuario))
            );
        }
        
        return builder.build();
    }
    
    /**
     * Convierte PersonalExterno a PersonalUnificadoResponse
     */
    private PersonalUnificadoResponse convertPersonalExternoToUnificado(PersonalExterno personal) {
        PersonalUnificadoResponse.PersonalUnificadoResponseBuilder builder = PersonalUnificadoResponse.builder()
                .id(personal.getIdPersExt())
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
        
        // IPRESS (Institución)
        if (personal.getIpress() != null) {
            builder.institucion(personal.getIpress().getDescIpress());
            builder.ipress(IpressResponse.builder()
                    .idIpress(personal.getIpress().getIdIpress())
                    .codIpress(personal.getIpress().getCodIpress())
                    .descIpress(personal.getIpress().getDescIpress())
                    .idRed(personal.getIpress().getIdRed())
                    .idNivAten(personal.getIpress().getIdNivAten())
                    .idModAten(personal.getIpress().getIdModAten())
                    .direcIpress(personal.getIpress().getDirecIpress())
                    .idTipIpress(personal.getIpress().getIdTipIpress())
                    .idDist(personal.getIpress().getIdDist())
                    .latIpress(personal.getIpress().getLatIpress())
                    .longIpress(personal.getIpress().getLongIpress())
                    .gmapsUrlIpress(personal.getIpress().getGmapsUrlIpress())
                    .statIpress(personal.getIpress().getStatIpress())
                    .createAt(personal.getIpress().getCreateAt())
                    .updateAt(personal.getIpress().getUpdateAt())
                    .build());
        }
        
        // Usuario asociado
        if (personal.getIdUser() != null) {
            usuarioRepository.findById(personal.getIdUser()).ifPresent(usuario -> {
                builder.usuario(convertUsuarioToResponse(usuario));
                // Para externos, el estado se basa en el usuario
                builder.estado(usuario.getStatUser());
            });
        }
        
        return builder.build();
    }
    
    /**
     * Convierte Usuario a UsuarioResponse
     */
    private UsuarioResponse convertUsuarioToResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .idUser(usuario.getIdUser())
                .username(usuario.getNameUser())
                .nameUser(usuario.getNameUser())
                .estado(usuario.getStatUser())
                .statUser(usuario.getStatUser())
                .createAt(usuario.getCreateAt())
                .updateAt(usuario.getUpdateAt())
                .lastLoginAt(usuario.getLastLoginAt())
                .build();
    }
}
