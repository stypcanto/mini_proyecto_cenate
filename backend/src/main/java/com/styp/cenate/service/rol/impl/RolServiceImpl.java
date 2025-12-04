package com.styp.cenate.service.rol.impl;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.styp.cenate.model.Rol;
import com.styp.cenate.repository.segu.RolRepository;
import com.styp.cenate.service.rol.RolService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
public class RolServiceImpl implements RolService {

    private final RolRepository rolRepository;

    @Override
    public List<Rol> getAll() {
        return rolRepository.findAll().stream()
                .map(this::asignarNivelJerarquiaSiNoTiene)
                .collect(Collectors.toList());
    }

    @Override
    public Rol getById(Integer id) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + id));
        return asignarNivelJerarquiaSiNoTiene(rol);
    }

    @Override
    public Rol createRol(Rol rol) {
        // Validar duplicados
        if (rolRepository.existsByDescRol(rol.getDescRol())) {
            throw new IllegalArgumentException("Ya existe un rol con el nombre: " + rol.getDescRol());
        }

        // Proteger nombres reservados
        if (isProtectedRole(rol.getDescRol())) {
            throw new IllegalArgumentException("No se puede crear un rol con nombre reservado: " + rol.getDescRol());
        }

        // Asignar nivel jerárquico automáticamente si no viene definido
        if (rol.getNivelJerarquia() == null || rol.getNivelJerarquia() == 0) {
            rol.setNivelJerarquia(calcularNivelJerarquia(rol.getDescRol()));
        }

        return rolRepository.save(rol);
    }

    @Override
    public Rol updateRol(Integer id, Rol rolActualizado) {
        Rol existente = getById(id);

        if (isProtectedRole(existente.getDescRol())) {
            throw new IllegalArgumentException("No se puede modificar un rol protegido: " + existente.getDescRol());
        }

        existente.setDescRol(rolActualizado.getDescRol());
        existente.setStatRol(rolActualizado.getStatRol());
        existente.setActivo(rolActualizado.isActivo());

        // Asignar nivel jerárquico
        if (rolActualizado.getNivelJerarquia() != null && rolActualizado.getNivelJerarquia() > 0) {
            existente.setNivelJerarquia(rolActualizado.getNivelJerarquia());
        } else {
            existente.setNivelJerarquia(calcularNivelJerarquia(rolActualizado.getDescRol()));
        }

        return rolRepository.save(existente);
    }

    @Override
    public void deleteRol(Integer id) {
        Rol rol = getById(id);

        if (isProtectedRole(rol.getDescRol())) {
            throw new IllegalArgumentException("No se puede eliminar un rol protegido: " + rol.getDescRol());
        }

        rolRepository.deleteById(id);
    }

    // ===========================================================
    // 🛡️ PROTEGE ROLES PRINCIPALES
    // ===========================================================
    private boolean isProtectedRole(String descRol) {
        if (descRol == null) return false;
        String rolUpper = descRol.trim().toUpperCase();
        return rolUpper.equals("SUPERADMIN") || rolUpper.equals("ADMIN");
    }

    // ===========================================================
    // 📊 CALCULAR NIVEL JERÁRQUICO AUTOMÁTICAMENTE
    // ===========================================================
    /**
     * Calcula el nivel jerárquico basándose en el nombre del rol.
     * Nivel 1 = Máxima Autoridad (SUPERADMIN)
     * Nivel 2-3 = Alta Autoridad (ADMIN, DIRECTOR, GERENTE)
     * Nivel 4-5 = Autoridad Media (COORDINADOR, JEFE, SUPERVISOR)
     * Nivel 6-7 = Autoridad Básica (Profesionales de salud)
     * Nivel 8+ = Usuario Estándar
     */
    private Integer calcularNivelJerarquia(String descRol) {
        if (descRol == null) return 10;

        String rol = descRol.trim().toUpperCase();

        // Nivel 1: Máxima Autoridad
        if (rol.equals("SUPERADMIN") || rol.equals("SUPER_ADMIN")) {
            return 1;
        }

        // Nivel 2: Alta Autoridad
        if (rol.equals("ADMIN") || rol.equals("ADMINISTRADOR") ||
            rol.contains("DIRECTOR") || rol.contains("GERENTE")) {
            return 2;
        }

        // Nivel 3: Alta Autoridad (secundaria)
        if (rol.contains("SUBDIRECTOR") || rol.contains("SUBGERENTE")) {
            return 3;
        }

        // Nivel 4: Autoridad Media
        if (rol.contains("COORDINADOR") || rol.contains("JEFE")) {
            return 4;
        }

        // Nivel 5: Autoridad Media (secundaria)
        if (rol.contains("SUPERVISOR") || rol.contains("ENCARGADO")) {
            return 5;
        }

        // Nivel 6: Profesionales de Salud Senior
        if (rol.contains("MEDICO") || rol.equals("MÉDICO") ||
            rol.contains("DOCTOR") || rol.contains("ESPECIALISTA")) {
            return 6;
        }

        // Nivel 7: Profesionales de Salud
        if (rol.contains("ENFERMERIA") || rol.contains("ENFERMERA") || rol.contains("ENFERMERO") ||
            rol.contains("OBSTETRA") || rol.contains("OBSTETRIZ") ||
            rol.contains("FARMACIA") || rol.contains("FARMACEUTICO") ||
            rol.contains("LABORATORIO") || rol.contains("TECNOLOGO") ||
            rol.contains("RADIOLOGIA") || rol.contains("RADIOLOGO") ||
            rol.contains("PSICOLOGO") || rol.contains("PSICOLOGIA") ||
            rol.contains("TERAPISTA") || rol.contains("TERAPEUTA") ||
            rol.contains("NUTRICION") || rol.contains("NUTRICIONISTA") ||
            rol.contains("ODONTOLOGO") || rol.contains("ODONTOLOGIA") ||
            rol.contains("BIOLOGO") || rol.contains("QUIMICO")) {
            return 7;
        }

        // Nivel 8: Personal Técnico
        if (rol.contains("TECNICO") || rol.contains("ASISTENTE") ||
            rol.contains("AUXILIAR")) {
            return 8;
        }

        // Nivel 9: Personal Administrativo
        if (rol.contains("SECRETARIA") || rol.contains("RECEPCION") ||
            rol.contains("ADMISION") || rol.contains("ARCHIVO")) {
            return 9;
        }

        // Nivel 10: Usuario Estándar (default)
        return 10;
    }

    // ===========================================================
    // 🔄 ASIGNAR NIVEL SI NO TIENE
    // ===========================================================
    /**
     * Si el rol no tiene nivel jerárquico asignado, lo calcula y guarda.
     */
    private Rol asignarNivelJerarquiaSiNoTiene(Rol rol) {
        if (rol.getNivelJerarquia() == null || rol.getNivelJerarquia() == 0) {
            rol.setNivelJerarquia(calcularNivelJerarquia(rol.getDescRol()));
            // Guardar el nivel calculado en la base de datos
            rolRepository.save(rol);
        }
        return rol;
    }
}
