package com.styp.cenate.service.permiso.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.model.Permiso;
import com.styp.cenate.repository.PermisoRepository;
import com.styp.cenate.service.permiso.PermisoService;

import java.util.List;
import java.util.Map;

/**
 * 🧩 Implementación del servicio de permisos
 * Gestiona la lectura, actualización y edición granular de permisos por rol.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PermisoServiceImpl implements PermisoService {

    private final PermisoRepository permisoRepository;

    // ==============================================================
    // 🔍 Consultas
    // ==============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Permiso> getAllPermisos() {
        log.info("📋 Obteniendo todos los permisos del sistema");
        return permisoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permiso> getPermisosByRol(Integer idRol) {
        log.info("🔍 Buscando permisos asociados al rol ID: {}", idRol);
        return permisoRepository.findByRol_IdRol(idRol);
    }

    // ==============================================================
    // ✏️ Actualización completa
    // ==============================================================

    @Override
    @Transactional
    public Permiso updatePermiso(Long id, Permiso permisoActualizado) {
        log.info("✏️ Actualizando permiso ID {}", id);

        return permisoRepository.findById(id)
                .map(p -> {
                    // ✅ Actualizar flags principales
                    p.setPuedeVer(permisoActualizado.isPuedeVer());
                    p.setPuedeCrear(permisoActualizado.isPuedeCrear());
                    p.setPuedeEditar(permisoActualizado.isPuedeEditar());
                    p.setPuedeEliminar(permisoActualizado.isPuedeEliminar());
                    p.setPuedeExportar(permisoActualizado.isPuedeExportar());
                    p.setPuedeAprobar(permisoActualizado.isPuedeAprobar());

                    Permiso actualizado = permisoRepository.save(p);
                    log.info("✅ Permiso actualizado correctamente: {}", actualizado.getDescPermiso());
                    return actualizado;
                })
                .orElseThrow(() -> new IllegalArgumentException("❌ Permiso no encontrado con ID: " + id));
    }

    // ==============================================================
    // ⚙️ Actualización parcial (campos dinámicos)
    // ==============================================================

    @Override
    @Transactional
    public Permiso updateCamposPermiso(Long id, Map<String, Object> cambios) {
        log.info("⚙️ Actualizando campos del permiso ID {}: {}", id, cambios);

        return permisoRepository.findById(id)
                .map(p -> {
                    cambios.forEach((campo, valor) -> {
                        try {
                            switch (campo) {
                                case "puedeVer" -> p.setPuedeVer((Boolean) valor);
                                case "puedeCrear" -> p.setPuedeCrear((Boolean) valor);
                                case "puedeEditar" -> p.setPuedeEditar((Boolean) valor);
                                case "puedeEliminar" -> p.setPuedeEliminar((Boolean) valor);
                                case "puedeExportar" -> p.setPuedeExportar((Boolean) valor);
                                case "puedeAprobar" -> p.setPuedeAprobar((Boolean) valor);
                                default -> log.warn("⚠️ Campo no reconocido: {}", campo);
                            }
                        } catch (ClassCastException e) {
                            log.error("❌ Tipo de dato inválido para el campo '{}': {}", campo, valor);
                        }
                    });

                    Permiso actualizado = permisoRepository.save(p);
                    log.info("✅ Campos actualizados correctamente para permiso ID {}", id);
                    return actualizado;
                })
                .orElseThrow(() -> new IllegalArgumentException("❌ Permiso no encontrado con ID: " + id));
    }
}