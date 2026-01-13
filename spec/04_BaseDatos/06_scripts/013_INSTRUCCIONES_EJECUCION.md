# 🚀 INSTRUCCIONES DE EJECUCIÓN - Script TeleEKG

**Script:** `013_modulo_teleekgs.sql`
**Ambiente:** Servidor PostgreSQL remoto (10.0.89.13:5432)
**Base de Datos:** maestro_cenate
**Fecha Creación:** 2026-01-13
**DBA Responsable:** [Tu nombre]

---

## 📋 CHECKLIST PRE-EJECUCIÓN

Antes de ejecutar el script, verifica:

- [ ] Backup reciente de la base de datos maestro_cenate
- [ ] Sin usuarios conectados a la BD (`SELECT * FROM pg_stat_activity;`)
- [ ] Espacio disponible en disco (mínimo 500MB libre)
- [ ] Credenciales PostgreSQL disponibles
- [ ] Horario de bajo tráfico (fuera de horas pico)

---

## 🔐 ACCESO AL SERVIDOR

### Opción 1: Conexión SSH + psql (RECOMENDADO)

```bash
# Conectar al servidor
ssh usuario@10.0.89.13

# Conectar a PostgreSQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate -p 5432
```

### Opción 2: DBeaver / pgAdmin

1. Host: `10.0.89.13`
2. Port: `5432`
3. Database: `maestro_cenate`
4. Username: `postgres`
5. Password: `Essalud2025`

---

## ⚡ EJECUCIÓN DEL SCRIPT

### Paso 1: Descargar Script

```bash
# En tu máquina local, copiar archivo al servidor
scp spec/04_BaseDatos/06_scripts/013_modulo_teleekgs.sql \
    usuario@10.0.89.13:/tmp/013_modulo_teleekgs.sql
```

### Paso 2: Ejecutar en PostgreSQL

**OPCIÓN A: Desde terminal psql**

```bash
# Conectar a la BD
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate

# Ejecutar script
\i /tmp/013_modulo_teleekgs.sql

# Ver resultados (última sección valida todo)
\dt tele_ecg*
```

**OPCIÓN B: Desde bash (MEJOR PARA SCRIPTING)**

```bash
# Ejecutar directamente sin conectar interactivamente
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
    -f /tmp/013_modulo_teleekgs.sql > /tmp/ejecucion_013_$(date +%Y%m%d_%H%M%S).log 2>&1

# Ver log
tail -100 /tmp/ejecucion_013_*.log
```

**OPCIÓN C: Desde DBeaver**

1. Click derecho en BD `maestro_cenate` → Execute Script
2. Seleccionar archivo `013_modulo_teleekgs.sql`
3. Click "Execute"
4. Ver output en ventana de resultados

---

## ✅ VALIDACIÓN POST-EJECUCIÓN

Después de ejecutar, verifica que todo se creó correctamente:

### 1️⃣ Validar Tablas

```sql
-- Conectar a BD
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate

-- Listar tablas creadas
\dt tele_ecg*

-- Resultado esperado:
-- tele_ecg_auditoria
-- tele_ecg_estadisticas
-- tele_ecg_imagenes
```

### 2️⃣ Validar Estructura de Tablas

```sql
-- Columnas de tele_ecg_imagenes
\d tele_ecg_imagenes

-- Resultado esperado: 30+ columnas incluyendo contenido_imagen (bytea)
```

### 3️⃣ Validar Índices

```sql
-- Listar índices creados
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename LIKE 'tele_ecg%'
ORDER BY tablename, indexname;

-- Resultado esperado: 9 índices
-- idx_tele_ecg_num_doc
-- idx_tele_ecg_estado
-- idx_tele_ecg_fecha_expiracion
-- idx_tele_ecg_ipress
-- idx_tele_ecg_compuesto_busqueda
-- idx_tele_ecg_limpieza
-- idx_tele_ecg_auditoria_imagen
-- idx_tele_ecg_auditoria_usuario
-- idx_tele_ecg_auditoria_fecha
```

### 4️⃣ Validar Permisos MBAC

```sql
-- Verificar que el módulo TeleEKG fue creado
SELECT id, nombre_modulo, estado_modulo
FROM modulos
WHERE nombre_modulo = 'TELEEKGS';

-- Verificar páginas creadas
SELECT id, url_pagina, descripcion
FROM paginas
WHERE id_modulo IN (SELECT id FROM modulos WHERE nombre_modulo = 'TELEEKGS')
ORDER BY url_pagina;

-- Resultado esperado: 4 páginas
-- /teleekgs/upload
-- /teleekgs/listar
-- /teleekgs/dashboard
-- /teleekgs/auditoria
```

### 5️⃣ Validar Vistas

```sql
-- Listar vistas creadas
SELECT viewname
FROM pg_views
WHERE viewname LIKE 'v_teleekgs%'
ORDER BY viewname;

-- Resultado esperado: 3 vistas
-- v_teleekgs_por_ipress
-- v_teleekgs_proximas_vencer
-- v_teleekgs_recientes
```

### 6️⃣ Validar Triggers y Funciones

```sql
-- Listar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table LIKE 'tele_ecg%';

-- Resultado esperado: 2 triggers
-- trg_update_timestamp_teleekgs
-- trg_validate_fecha_expiracion

-- Listar funciones
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'fn_%teleekgs%';

-- Resultado esperado: 2 funciones
-- fn_update_timestamp_teleekgs
-- fn_validate_fecha_expiracion
```

---

## 📊 VERIFICACIÓN DE PERFORMANCE

Una vez creadas las tablas, ejecuta estas queries para validar performance:

```sql
-- Explain Analyze: Búsqueda por DNI
EXPLAIN ANALYZE
SELECT * FROM tele_ecg_imagenes
WHERE num_doc_paciente = '12345678'
  AND estado = 'PENDIENTE';

-- Resultado esperado: "Index Scan using idx_tele_ecg_compuesto_busqueda..."
-- Tiempo: < 1ms (con datos de prueba)

-- Explain Analyze: Limpieza automática
EXPLAIN ANALYZE
SELECT * FROM tele_ecg_imagenes
WHERE stat_imagen = 'A'
  AND fecha_expiracion < CURRENT_TIMESTAMP;

-- Resultado esperado: "Index Scan using idx_tele_ecg_limpieza..."
```

---

## 🔄 ROLLBACK (Si algo falla)

Si necesitas revertir todos los cambios:

```sql
-- OPCIÓN 1: Ejecutar desde script
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate << EOF

-- Eliminar tablas (cascada elimina todo)
DROP TABLE IF EXISTS tele_ecg_auditoria CASCADE;
DROP TABLE IF EXISTS tele_ecg_imagenes CASCADE;
DROP TABLE IF EXISTS tele_ecg_estadisticas CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS fn_update_timestamp_teleekgs() CASCADE;
DROP FUNCTION IF EXISTS fn_validate_fecha_expiracion() CASCADE;

-- Eliminar vistas
DROP VIEW IF EXISTS v_teleekgs_recientes CASCADE;
DROP VIEW IF EXISTS v_teleekgs_por_ipress CASCADE;
DROP VIEW IF EXISTS v_teleekgs_proximas_vencer CASCADE;

-- Eliminar permisos MBAC (mantener modulo para futura implementación)
DELETE FROM roles_permisos rp
USING paginas p, modulos m
WHERE p.id_modulo = m.id
  AND m.nombre_modulo = 'TELEEKGS'
  AND rp.id_permiso IN (
    SELECT id FROM permisos WHERE id_pagina = p.id
  );

DELETE FROM permisos p
USING paginas pg
WHERE p.id_pagina = pg.id
  AND pg.id_modulo IN (
    SELECT id FROM modulos WHERE nombre_modulo = 'TELEEKGS'
  );

DELETE FROM paginas
WHERE id_modulo IN (SELECT id FROM modulos WHERE nombre_modulo = 'TELEEKGS');

-- Confirmar
COMMIT;

EOF
```

---

## 📝 REPORTE DE EJECUCIÓN

Después de ejecutar, crea un reporte con esta información:

```markdown
# REPORTE DE EJECUCIÓN - Script 013

**Fecha Ejecución:** [Fecha aquí]
**DBA Ejecutante:** [Tu nombre]
**Ambiente:** Producción / Staging
**Duración:** [Tiempo total]

## ✅ RESULTADOS

- [ ] Tablas creadas: 3/3
- [ ] Índices creados: 9/9
- [ ] Triggers creados: 2/2
- [ ] Funciones creadas: 2/2
- [ ] Vistas creadas: 3/3
- [ ] Módulo MBAC creado: 1/1
- [ ] Páginas MBAC creadas: 4/4
- [ ] Permisos MBAC asignados: ✓

## 🚨 ERRORES / ADVERTENCIAS

[Listar aquí si hay alguno]

## 📊 ESTADÍSTICAS

- Tamaño de tele_ecg_imagenes: 0 bytes (sin datos)
- Tamaño de índices: ~100KB
- Espacio total utilizado: ~500KB

## ✨ PRÓXIMOS PASOS

1. Insertar datos de prueba
2. Ejecutar Phase 2 (Backend - Entidades JPA)
3. Ejecutar Phase 3 (Frontend - Componentes React)
```

---

## 🆘 TROUBLESHOOTING

### Error: "permission denied"
```
Solución: Verifica que el usuario postgres tenga permisos en /tmp
chmod 755 /tmp/013_modulo_teleekgs.sql
```

### Error: "BYTEA type not supported"
```
Solución: Actualizar PostgreSQL a 14+
SELECT version();
```

### Error: "FK constraint failed"
```
Solución: Tablas referenciadas (modulos, paginas, roles, usuarios, ipress)
deben existir previamente. Ejecutar scripts previos:
- 001 - 012 (orden numérico)
```

### Error: "Index already exists"
```
Solución: Script ya fue ejecutado. Es seguro ejecutarlo nuevamente
(usa ON CONFLICT DO NOTHING en INSERT).
Para forzar limpieza, ejecutar ROLLBACK arriba.
```

---

## 📚 REFERENCIAS

- Guía de Índices: `013_INDICES_TELEEKGS_GUIA.md`
- Plan Completo: `plan/02_Modulos_Medicos/04_checklist_teleekgs.md`
- Estrategia Almacenamiento: `spec/04_BaseDatos/08_almacenamiento_teleekgs/01_estrategia_almacenamiento_CORREGIDA.md`

---

**Estado:** ✅ Listo para ejecución
**Última Actualización:** 2026-01-13
**Versión:** 1.0.0
