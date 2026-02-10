package com.styp.cenate.service.specification;

import com.styp.cenate.model.AtencionClinica107;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.JoinType;
import java.time.LocalDateTime;

/**
 * 🔧 AtencionClinica107Specification
 * Propósito: Proporcionar especificaciones reutilizables para filtros complejos
 * Módulo: 107
 * Patrón: Specification Pattern (Spring Data JPA)
 * 
 * ✅ ACTUALIZADO: Agregado soporte completo para filtros de macrorregión y red
 */
public class AtencionClinica107Specification {

    /**
     * Filtra por estado de gestión de citas (usando ID, no string)
     */
    public static Specification<AtencionClinica107> conEstadoGestionCitas(Long estadoId) {
        return (root, query, cb) -> cb.equal(root.get("estadoGestionCitasId"), estadoId);
    }

    /**
     * Filtra por ID de Bolsa (OBLIGATORIO para Módulo 107)
     */
    public static Specification<AtencionClinica107> conIdBolsa(Long idBolsa) {
        return (root, query, cb) -> cb.equal(root.get("idBolsa"), idBolsa);
    }

    /**
     * Filtra por estado (PENDIENTE, ATENDIDO)
     * Busca en el campo 'estado'
     */
    public static Specification<AtencionClinica107> conEstado(String estado) {
        return (root, query, cb) -> cb.equal(cb.upper(root.get("estado")), estado.toUpperCase());
    }

    /**
     * Filtra por tipo de documento (DNI, CE, PASAPORTE)
     */
    public static Specification<AtencionClinica107> conTipoDocumento(String tipoDocumento) {
        return (root, query, cb) -> cb.equal(root.get("tipoDocumento"), tipoDocumento);
    }

    /**
     * Filtra por número de documento (búsqueda parcial)
     */
    public static Specification<AtencionClinica107> conDocumento(String documento) {
        return (root, query, cb) -> cb.like(root.get("pacienteDni"), "%" + documento + "%");
    }

    /**
     * Filtra por rango de fechas de solicitud
     */
    public static Specification<AtencionClinica107> conFechaSolicitudEntre(LocalDateTime inicio, LocalDateTime fin) {
        return (root, query, cb) -> cb.between(root.get("fechaSolicitud"), inicio, fin);
    }

    /**
     * Filtra por IPRESS (por ID)
     */
    public static Specification<AtencionClinica107> conIdIpress(Long idIpress) {
        return (root, query, cb) -> cb.equal(root.get("idIpress"), idIpress);
    }

    /**
     * Filtra por IPRESS (por código)
     */
    public static Specification<AtencionClinica107> conCodigoIpress(String codigoIpress) {
        return (root, query, cb) -> cb.equal(root.get("codigoIpress"), codigoIpress);
    }

    /**
     * Filtra por derivación interna
     */
    public static Specification<AtencionClinica107> conDerivacionInterna(String derivacion) {
        return (root, query, cb) -> cb.equal(cb.upper(root.get("derivacionInterna")), derivacion.toUpperCase());
    }

    /**
     * 🆕 Filtra por condición médica (Pendiente, Atendido, Deserción)
     * Nota: NULL se considera como "Pendiente"
     */
    public static Specification<AtencionClinica107> conCondicionMedica(String condicion) {
        return (root, query, cb) -> {
            if ("Pendiente".equalsIgnoreCase(condicion)) {
                // Para "Pendiente", incluir tanto 'Pendiente' como NULL
                return cb.or(
                    cb.equal(cb.lower(root.get("condicionMedica")), "pendiente"),
                    cb.isNull(root.get("condicionMedica"))
                );
            } else {
                // Para otros valores, búsqueda exacta
                return cb.equal(cb.lower(root.get("condicionMedica")), condicion.toLowerCase());
            }
        };
    }

    /**
     * 🆕 Filtra por macrorregión usando JOIN con dim_ipress -> dim_red -> dim_macroregion
     */
    public static Specification<AtencionClinica107> conMacrorregion(String macrorregion) {
        return (root, query, cb) -> {
            try {
                System.out.println("[DEBUG SPEC] Aplicando filtro macrorregión: " + macrorregion);
                
                // JOIN: AtencionClinica107 -> dim_ipress -> dim_red -> dim_macroregion
                var ipressJoin = root.join("ipress", JoinType.INNER);
                var redJoin = ipressJoin.join("red", JoinType.INNER);
                var macroJoin = redJoin.join("macroregion", JoinType.INNER);
                
                return cb.equal(cb.upper(macroJoin.get("descMacro")), macrorregion.toUpperCase());
            } catch (Exception e) {
                System.err.println("[ERROR SPEC] Error en filtro macrorregión: " + e.getMessage());
                e.printStackTrace();
                return cb.conjunction(); // Devolver condición vacía en caso de error
            }
        };
    }

    /**
     * 🆕 Filtra por red usando JOIN con dim_ipress -> dim_red
     */
    public static Specification<AtencionClinica107> conRed(String red) {
        return (root, query, cb) -> {
            try {
                System.out.println("[DEBUG SPEC] Aplicando filtro red: " + red);
                
                // JOIN: AtencionClinica107 -> dim_ipress -> dim_red
                var ipressJoin = root.join("ipress", JoinType.INNER);
                var redJoin = ipressJoin.join("red", JoinType.INNER);
                
                return cb.equal(cb.upper(redJoin.get("descripcion")), red.toUpperCase());
            } catch (Exception e) {
                System.err.println("[ERROR SPEC] Error en filtro red: " + e.getMessage());
                e.printStackTrace();
                return cb.conjunction(); // Devolver condición vacía en caso de error
            }
        };
    }

    /**
     * Filtra por especialidad
     */
    public static Specification<AtencionClinica107> conEspecialidad(String especialidad) {
        return (root, query, cb) -> cb.equal(cb.upper(root.get("especialidad")), especialidad.toUpperCase());
    }

    /**
     * Filtra por tipo de cita
     */
    public static Specification<AtencionClinica107> conTipoCita(String tipoCita) {
        return (root, query, cb) -> cb.equal(root.get("tipoCita"), tipoCita);
    }

    /**
     * Búsqueda general en nombre, DNI, número de solicitud
     */
    public static Specification<AtencionClinica107> conBusquedaGeneral(String search) {
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("pacienteNombre")), "%" + search.toLowerCase() + "%"),
            cb.like(root.get("pacienteDni"), "%" + search + "%"),
            cb.like(root.get("numeroSolicitud"), "%" + search + "%")
        );
    }

    /**
     * Combina múltiples especificaciones en un solo filtro
     * Manejo inteligente: ignora valores null o "todos"
     * 🆕 Agregado soporte para filtros de macrorregión y red
     */
    public static Specification<AtencionClinica107> conFiltros(
        Long idBolsa,
        Long estadoGestionCitasId,
        String estado,
        String tipoDocumento,
        String documento,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        Long idIpress,
        String macrorregion,
        String red,
        String derivacion,
        String especialidad,
        String tipoCita,
        String search,
        String condicionMedica
    ) {
        Specification<AtencionClinica107> spec = Specification.where(null);

        // Filtro ID Bolsa (OBLIGATORIO)
        if (idBolsa != null) {
            spec = spec.and(conIdBolsa(idBolsa));
        }

        // Filtro Estado de Gestión de Citas (ID)
        if (estadoGestionCitasId != null) {
            spec = spec.and(conEstadoGestionCitas(estadoGestionCitasId));
        }
        
        // Filtro Estado (String: PENDIENTE, ATENDIDO)
        if (estado != null && !estado.isEmpty() && !estado.equals("todos")) {
            System.out.println("[DEBUG] Aplicando filtro de estado: " + estado); // Debug temporal
            spec = spec.and(conEstado(estado));
        }

        // Filtro Tipo Documento
        if (tipoDocumento != null && !tipoDocumento.isEmpty() && !tipoDocumento.equals("todos")) {
            spec = spec.and(conTipoDocumento(tipoDocumento));
        }

        // Filtro Documento
        if (documento != null && !documento.isEmpty()) {
            spec = spec.and(conDocumento(documento));
        }

        // Filtro Rango Fechas
        if (fechaInicio != null && fechaFin != null) {
            spec = spec.and(conFechaSolicitudEntre(fechaInicio, fechaFin));
        }

        // Filtro IPRESS
        if (idIpress != null) {
            spec = spec.and(conIdIpress(idIpress));
        }

        // 🆕 Filtro Macrorregión
        if (macrorregion != null && !macrorregion.isEmpty() && !macrorregion.equals("todas")) {
            System.out.println("[DEBUG SPEC] Aplicando filtro de macrorregión: " + macrorregion);
            spec = spec.and(conMacrorregion(macrorregion));
        }

        // 🆕 Filtro Red
        if (red != null && !red.isEmpty() && !red.equals("todas")) {
            System.out.println("[DEBUG SPEC] Aplicando filtro de red: " + red);
            spec = spec.and(conRed(red));
        }

        // Filtro Derivación
        if (derivacion != null && !derivacion.isEmpty() && !derivacion.equals("todas")) {
            System.out.println("[DEBUG SPEC] Aplicando filtro de derivación: " + derivacion);
            spec = spec.and(conDerivacionInterna(derivacion));
        }

        // Filtro Especialidad
        if (especialidad != null && !especialidad.isEmpty() && !especialidad.equals("todas")) {
            spec = spec.and(conEspecialidad(especialidad));
        }

        // Filtro Tipo de Cita
        if (tipoCita != null && !tipoCita.isEmpty() && !tipoCita.equals("todas")) {
            spec = spec.and(conTipoCita(tipoCita));
        }

        // Filtro Búsqueda General
        if (search != null && !search.isEmpty()) {
            spec = spec.and(conBusquedaGeneral(search));
        }

        // 🆕 Filtro Condición Médica (Pendiente, Atendido, Deserción)
        if (condicionMedica != null && !condicionMedica.isEmpty() && !condicionMedica.equals("todos")) {
            spec = spec.and(conCondicionMedica(condicionMedica));
        }

        return spec;
    }
}
