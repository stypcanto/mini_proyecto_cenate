package com.styp.cenate.service.rol.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.styp.cenate.model.Rol;
import com.styp.cenate.repository.RolRepository;
import com.styp.cenate.service.rol.RolService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
public class RolServiceImpl implements RolService {

    private final RolRepository rolRepository;

    @Override
    public List<Rol> getAll() {
        return rolRepository.findAll();
    }

    @Override
    public Rol getById(Integer id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con ID: " + id));
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

        return rolRepository.save(rol);
    }

    @Override
    public Rol updateRol(Integer id, Rol rolActualizado) {
        Rol existente = getById(id);

        if (isProtectedRole(existente.getDescRol())) {
            throw new IllegalArgumentException("No se puede modificar un rol protegido: " + existente.getDescRol());
        }

        existente.setDescRol(rolActualizado.getDescRol());
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
}
