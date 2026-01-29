# 📋 PLAN DE IMPLEMENTACIÓN - FASE 1: FUNDACIÓN
## Módulo Asignación de Gestora de Citas en Bolsas

**Fase:** 1 de 4
**Duración Estimada:** 4 horas
**Prioridad:** P0 (CRÍTICA)
**Fecha Inicio:** 2026-01-29

---

## 🎯 OBJETIVOS FASE 1

1. ✅ Restaurar campos de BD necesarios
2. ✅ Actualizar entidad JPA
3. ✅ Implementar lógica de servicio
4. ✅ Agregar validación de seguridad

---

## 📋 TAREAS DETALLADAS

### TAREA 1.1: Migration SQL - Agregar Campos BD
**Duración:** 30 min
**Archivos:**
- `spec/database/06_scripts/V3_0_5__agregar_campos_asignacion_gestora.sql`

**Acciones:**
1. [ ] Crear archivo migration SQL
2. [ ] Agregar columnas `responsable_gestora_id` y `fecha_asignacion`
3. [ ] Crear FK a `dim_usuarios`
4. [ ] Crear índice en `responsable_gestora_id`
5. [ ] Ejecutar en BD y verificar

---

### TAREA 1.2: Actualizar Entity SolicitudBolsa
**Duración:** 30 min
**Archivo:** `backend/src/main/java/com/styp/cenate/model/bolsas/SolicitudBolsa.java`

**Cambios:**
1. [ ] Agregar campo `responsableGestoraId` (Long, nullable)
2. [ ] Agregar campo `fechaAsignacion` (OffsetDateTime, nullable)
3. [ ] Agregar anotación JPA `@ManyToOne` (lazy loading)
4. [ ] Generar getters/setters con Lombok

---

### TAREA 1.3: Inyectar UsuarioRepository en Service
**Duración:** 15 min
**Archivo:** `backend/src/main/java/com/styp/cenate/service/bolsas/SolicitudBolsaServiceImpl.java`

**Cambios:**
1. [ ] Agregar `@Autowired UsuarioRepository usuarioRepository`
2. [ ] Importar clases necesarias

---

### TAREA 1.4: Implementar asignarGestora() en Service
**Duración:** 1 hora 30 min
**Archivo:** `backend/src/main/java/com/styp/cenate/service/bolsas/SolicitudBolsaServiceImpl.java`

**Código:**
```java
@Override
@Transactional
public void asignarGestora(Long idSolicitud, Long idGestora) {
    log.info("🔄 Asignando gestora {} a solicitud {}", idGestora, idSolicitud);

    // 1. Validar solicitud existe y está activa
    SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
        .orElseThrow(() -> new NotFoundException(
            "Solicitud " + idSolicitud + " no encontrada"
        ));

    if (!solicitud.getActivo()) {
        throw new BadRequestException("No se puede asignar gestora a solicitud inactiva");
    }

    // 2. Validar gestora existe y tiene rol correcto
    Usuario gestora = usuarioRepository.findById(idGestora)
        .orElseThrow(() -> new NotFoundException(
            "Usuario " + idGestora + " no encontrado"
        ));

    // Verificar rol GESTOR_DE_CITAS
    boolean tieneRolGestora = gestora.getRoles().stream()
        .anyMatch(rol -> "GESTOR_DE_CITAS".equals(rol.getDescRol().toUpperCase()));

    if (!tieneRolGestora) {
        throw new BadRequestException(
            "El usuario " + gestora.getNameUser() +
            " no tiene el rol GESTOR_DE_CITAS"
        );
    }

    // Verificar usuario activo
    if (!"A".equals(gestora.getStatUser())) {
        throw new BadRequestException(
            "El usuario " + gestora.getNameUser() + " está inactivo"
        );
    }

    // 3. Actualizar asignación
    solicitud.setResponsableGestoraId(idGestora);
    solicitud.setFechaAsignacion(OffsetDateTime.now());

    // 4. Guardar
    solicitudRepository.save(solicitud);

    log.info("✅ Solicitud {} asignada a gestora {} ({})",
        idSolicitud, idGestora, gestora.getNameUser());
}
```

**Cambios:**
1. [ ] Reemplazar método stub (líneas 658-664)
2. [ ] Implementar lógica completa
3. [ ] Agregar excepciones personalizadas (NotFoundException, BadRequestException)
4. [ ] Compilar y verificar sin errores

---

### TAREA 1.5: Agregar @CheckMBACPermission al Controller
**Duración:** 15 min
**Archivo:** `backend/src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaController.java`

**Cambios:**
1. [ ] Línea 193: Agregar `@CheckMBACPermission(modulo = "BOLSAS", accion = "ASIGNAR_GESTORA")`
2. [ ] Cambiar endpoint de `@RequestParam` a `@RequestBody` (opcional pero recomendado)
3. [ ] Actualizar manejadores de excepciones

**Código:**
```java
@PatchMapping("/{id}/asignar")
@CheckMBACPermission(modulo = "BOLSAS", accion = "ASIGNAR_GESTORA")
public ResponseEntity<?> asignarGestora(
        @PathVariable Long id,
        @RequestParam("idGestora") Long idGestora) {

    try {
        log.info("Asignando gestora {} a solicitud {}", idGestora, id);
        solicitudBolsaService.asignarGestora(id, idGestora);

        return ResponseEntity.ok(Map.of(
            "mensaje", "Gestora asignada exitosamente",
            "idSolicitud", id,
            "idGestora", idGestora
        ));
    } catch (NotFoundException e) {
        log.error("❌ Entidad no encontrada: ", e);
        return ResponseEntity.status(404).body(
            Map.of("error", e.getMessage())
        );
    } catch (BadRequestException e) {
        log.error("❌ Solicitud inválida: ", e);
        return ResponseEntity.badRequest().body(
            Map.of("error", e.getMessage())
        );
    } catch (Exception e) {
        log.error("❌ Error inesperado: ", e);
        return ResponseEntity.status(500).body(
            Map.of("error", "Error interno del servidor")
        );
    }
}
```

---

### TAREA 1.6: Configurar Permisos MBAC (SQL)
**Duración:** 20 min
**Archivos:**
- `spec/database/06_scripts/V3_0_6__configurar_mbac_asignacion_gestora.sql`

**SQL:**
```sql
-- 1. Agregar módulo
INSERT INTO dim_modulos_mbac (codigo_modulo, desc_modulo, activo)
VALUES ('BOLSAS', 'Módulo de Bolsas de Pacientes', true)
ON CONFLICT DO NOTHING;

-- 2. Agregar acción
INSERT INTO dim_acciones_mbac (id_modulo, codigo_accion, desc_accion, activo)
SELECT id_modulo, 'ASIGNAR_GESTORA', 'Asignar gestora a solicitud de bolsa', true
FROM dim_modulos_mbac
WHERE codigo_modulo = 'BOLSAS'
ON CONFLICT DO NOTHING;

-- 3. Asignar permiso al rol COORDINADOR_DE_CITAS
INSERT INTO dim_permisos (id_rol, id_modulo, id_accion, permite_lectura, permite_escritura)
SELECT
    r.id_rol,
    m.id_modulo,
    a.id_accion,
    true,
    true
FROM dim_roles r
CROSS JOIN dim_modulos_mbac m
CROSS JOIN dim_acciones_mbac a
WHERE r.desc_rol = 'COORDINADOR_DE_CITAS'
  AND m.codigo_modulo = 'BOLSAS'
  AND a.codigo_accion = 'ASIGNAR_GESTORA'
ON CONFLICT DO NOTHING;
```

**Acciones:**
1. [ ] Crear archivo SQL
2. [ ] Ejecutar en BD de desarrollo
3. [ ] Verificar permisos creados correctamente

---

### TAREA 1.7: Verificación & Testing Básico
**Duración:** 1 hora
**Acciones:**

1. [ ] Compilar backend: `./gradlew clean build`
2. [ ] Ejecutar tests: `./gradlew test`
3. [ ] Levantar servidor: `./gradlew bootRun`
4. [ ] Test manual con Postman/curl:
   ```bash
   # Obtener token
   curl -X POST http://localhost:8080/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"coordinador", "password":"pass"}'

   # Asignar gestora
   curl -X PATCH http://localhost:8080/api/bolsas/solicitudes/1/asignar?idGestora=100 \
     -H "Authorization: Bearer <token>"
   ```
5. [ ] Verificar respuesta exitosa (200 OK con mensaje)
6. [ ] Verificar auditoría en BD (si aplica)

---

## 📊 CHECKLIST FASE 1

### Pre-Implementación
- [ ] Análisis arquitectural aprobado (✅ DONE)
- [ ] Permisos de acceso a repositorio (✅ DONE)
- [ ] Entorno de desarrollo configurado (✅ DONE)

### Implementación
- [ ] TAREA 1.1: Migration SQL ejecutada
- [ ] TAREA 1.2: Entity actualizada y compilada
- [ ] TAREA 1.3: UsuarioRepository inyectado
- [ ] TAREA 1.4: Método asignarGestora() implementado
- [ ] TAREA 1.5: @CheckMBACPermission agregado
- [ ] TAREA 1.6: Permisos MBAC configurados
- [ ] TAREA 1.7: Tests básicos pasados

### Post-Implementación
- [ ] Commits creados en git
- [ ] Código compilado sin warnings
- [ ] Tests unitarios > 80% coverage
- [ ] Documentación actualizada

---

## 🚀 EJECUCIÓN

**Próximos Pasos:**
1. Comenzar TAREA 1.1 (Migration SQL)
2. Ejecutar tareas en orden secuencial
3. Al completar todas: ✅ FASE 1 COMPLETADA
4. Proceder a FASE 2 (Integración)

**Responsable:** Developers
**Revisión:** Architect-Reviewer

---

**Status Inicial:** ⏳ PENDIENTE
**Fecha de Creación:** 2026-01-29
