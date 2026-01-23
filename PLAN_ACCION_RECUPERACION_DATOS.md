# 🎯 PLAN DE ACCIÓN - Recuperación de Datos Asegurados

**Fecha:** 2026-01-23
**Prioridad:** CRÍTICA ⚠️
**Estado:** Listo para ejecutar

---

## 📌 RESUMEN EJECUTIVO

Ya no necesitas buscar en interfaces web antiguas. Los datos están disponibles en **3 opciones prácticas**:

1. **OPCIÓN MÁS RÁPIDA:** Contactar directo a ETIC por email
2. **OPCIÓN INMEDIATA:** Descargar desde UI de explotaDatos (manual)
3. **OPCIÓN TÉCNICA:** Solicitar dump SQL directo de BD

---

## 🚀 OPCIÓN 1: EMAIL A ETIC (RECOMENDADA - HOY MISMO)

**Correo:** [A verificar en intranet EsSalud]

**Asunto:**
```
[URGENTE] Solicitud de Export - Tabla Asegurados Datos_Cenate
```

**Cuerpo del Email:**
```
Estimado Equipo ETIC,

He perdido 4 millones de registros en la tabla asegurados de mi base de datos
(maestro_cenate - CNT CENATE).

Necesito que exporten la tabla de asegurados desde la base de datos Datos_Cenate
(ESSI) en formato:
  ☐ SQL DUMP (pg_dump)
  ☐ CSV (separado por comas)
  ☐ Excel

Mi usuario ESSI: 44914706 (CANTO RONDON STYP)
Centro: CNT CENATE

Urgencia: CRÍTICA - Sistema de citas en producción afectado.

Por favor confirmar recepción y tiempo estimado.

Gracias,
Styp Canto Rondón
```

**Tiempo estimado:**
- Envío: Inmediato
- Respuesta: 2-4 horas
- Recepción de datos: +1-2 horas
- **Total: 4-6 horas**

---

## 📥 OPCIÓN 2: DESCARGAR DESDE EXPLOTADATOS (MANUAL)

Si prefieres obtener los datos tú mismo sin esperar a ETIC:

### Paso 1: Acceder a explotaDatos
```
URL: http://appsgasistexpl.essalud.gob.pe/explotaDatos/
Usuario: 44914706
Contraseña: C4ntE20251
```

### Paso 2: Navegar al Reporte de Asegurados
```
Menú → ADMISIÓN Y CITAS → Reportes de Asegurados
```

O buscar en:
```
Reportes → Listado Completo de Asegurados / Pacientes
```

### Paso 3: Filtros (Opcional)
- Rango de fechas: Dejar en blanco (todos)
- Estado: Activos + Inactivos
- Centro: Todos

### Paso 4: Descargar
```
Botón: Exportar / Descargar
Formato: Excel (.xlsx) o CSV
Destino: Guardar en /tmp/
```

### Paso 5: Importar a maestro_cenate
```bash
# Si es CSV:
COPY asegurados FROM '/tmp/asegurados.csv' WITH CSV HEADER;

# Si es Excel, primero convertir:
ssconvert /tmp/asegurados.xlsx /tmp/asegurados.csv
COPY asegurados FROM '/tmp/asegurados.csv' WITH CSV HEADER;
```

**Tiempo estimado:**
- Login: 5 min
- Navegar: 10 min
- Descargar: 5-30 min (depende de tamaño)
- Importar: 10-60 min
- **Total: 30 min - 2 horas**

---

## 🔧 OPCIÓN 3: SOLICITUD TÉCNICA A ETIC

**Para: Gerencia de Infraestructura / DBA**

```
Comando solicitado:

pg_dump -U postgres Datos_Cenate -t asegurados \
  --file=/tmp/asegurados_$(date +%Y%m%d).dump

O para CSV:

psql -U postgres Datos_Cenate -c \
  "COPY asegurados TO STDOUT WITH CSV HEADER" \
  > /tmp/asegurados.csv

Luego transferir a nuestro servidor:

scp cenate@10.56.1.158:/tmp/asegurados_*.dump /tmp/
```

**Tiempo estimado:**
- Solicitud: Inmediato
- Ejecución: 30 min - 1 hora
- Transferencia: 30 min - 1 hora
- **Total: 2-4 horas**

---

## ✅ CHECKLIST - QUÉ HACER HOY

### Ahora (Próximos 30 minutos)

- [ ] **Enviar email a ETIC** con solicitud de export (Opción 1)
- [ ] **Implementar protecciones** en maestro_cenate:

```sql
-- Conectar como admin a maestro_cenate
REVOKE DELETE ON asegurados FROM backend_user;
REVOKE DELETE ON asegurados FROM chatbot_cnt;

-- Solo SUPERADMIN puede borrar
GRANT DELETE ON asegurados TO postgres;
```

- [ ] **Crear tabla respaldo temporal:**

```sql
CREATE TABLE asegurados_respaldo_$(date +%Y%m%d) AS
  SELECT * FROM asegurados LIMIT 0; -- Solo estructura
```

### Dentro de 4-6 horas (Cuando lleguen los datos)

- [ ] **Recibir archivo de ETIC** (SQL dump o CSV)
- [ ] **Validar integridad:**

```sql
-- Contar registros
SELECT COUNT(*) FROM [tabla_asegurados_nueva];
-- Debe ser ~4,000,000

-- Verificar sin NULLs en campos críticos
SELECT COUNT(*) FROM [tabla_asegurados_nueva]
WHERE paciente_id IS NULL
   OR paciente_nombre IS NULL
   OR id_ipress IS NULL;
-- Debe ser 0
```

- [ ] **Cargar a maestro_cenate:**

```sql
-- Opción A: Si es dump SQL
psql -U postgres maestro_cenate < /tmp/asegurados.dump

-- Opción B: Si es CSV
COPY asegurados FROM '/tmp/asegurados.csv' WITH CSV HEADER;

-- Opción C: Si es Excel (convertir primero)
ssconvert /tmp/asegurados.xlsx /tmp/asegurados.csv
COPY asegurados FROM '/tmp/asegurados.csv' WITH CSV HEADER;
```

### Mañana (Validación)

- [ ] **Ejecutar auditoría de datos:**

```sql
-- 1. Integridad referencial
SELECT a.* FROM asegurados a
WHERE a.id_ipress NOT IN (SELECT id FROM dim_ipress);

-- 2. Duplicados
SELECT paciente_id, COUNT(*)
FROM asegurados
GROUP BY paciente_id
HAVING COUNT(*) > 1;

-- 3. Comparar con solicitudes bolsa
SELECT COUNT(DISTINCT paciente_id) FROM dim_solicitud_bolsa;
-- vs
SELECT COUNT(DISTINCT paciente_id) FROM asegurados;
```

- [ ] **Documentar el incidente** en changelog
- [ ] **Cambiar contraseña ESSI** (la que fue compartida)

---

## 🛡️ PROTECCIONES A IMPLEMENTAR (HOY)

### 1. Backup Automático Diario

**Crear archivo:** `/home/cenate/backup-asegurados.sh`

```bash
#!/bin/bash

BACKUP_DIR="/home/cenate/backups/asegurados"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_HOST="10.0.89.13"
DB_USER="postgres"
DB_NAME="maestro_cenate"

mkdir -p $BACKUP_DIR

# Backup SQL comprimido
docker exec postgres_cenate pg_dump \
  -U $DB_USER $DB_NAME -t asegurados | \
  gzip > $BACKUP_DIR/asegurados_$TIMESTAMP.sql.gz

# Backup CSV comprimido
docker exec postgres_cenate psql \
  -U $DB_USER $DB_NAME -c \
  "COPY asegurados TO STDOUT WITH CSV HEADER" | \
  gzip > $BACKUP_DIR/asegurados_$TIMESTAMP.csv.gz

# Mantener solo últimos 30 días
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "[$(date)] Backup completado" >> $BACKUP_DIR/backup.log
```

**Instalar en crontab:**

```bash
# Ejecutar como cenate user
crontab -e

# Agregar:
0 2 * * * /home/cenate/backup-asegurados.sh >> /var/log/cenate-backup.log 2>&1
```

### 2. Auditoría de DELETE

```sql
-- Crear tabla de auditoría
CREATE TABLE audit_asegurados_delete (
  id SERIAL PRIMARY KEY,
  deleted_records INT,
  deleted_by TEXT,
  deleted_at TIMESTAMP DEFAULT NOW(),
  details TEXT
);

-- Crear función de auditoría
CREATE OR REPLACE FUNCTION audit_asegurados_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_asegurados_delete (deleted_records, deleted_by, details)
  VALUES (1, CURRENT_USER, ROW(OLD)::TEXT);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER audit_delete_asegurados
BEFORE DELETE ON asegurados
FOR EACH ROW
EXECUTE FUNCTION audit_asegurados_delete();
```

### 3. Restricción de Permisos

```sql
-- Revocar permisos DELETE de roles de aplicación
REVOKE DELETE ON asegurados FROM backend_user;
REVOKE DELETE ON asegurados FROM chatbot_cnt;
REVOKE DELETE ON asegurados FROM ro_public_reader;

-- Solo admin puede borrar
GRANT DELETE ON asegurados TO postgres;
GRANT DELETE ON asegurados TO Admin_DBA;
```

---

## 📞 CONTACTOS ETIC ESSALUD

**Búsqueda rápida:**
1. Entrar a ESSI (http://10.56.1.158/sgss/servlet/hmain)
2. Ir a: Tablas del Sistema → Contactos
3. O preguntar en tu IPRESS local

**Correos típicos:**
- etic-soporte@essalud.gob.pe
- dba-sistemas@essalud.gob.pe
- gerencia-sistemas@essalud.gob.pe

**Teléfono:** Llamar a tu Centro Asistencial - Área de Sistemas

---

## 🎯 TIMELINE CRÍTICO

```
HOY (2026-01-23):
  09:00 - Email a ETIC [30 min]
  10:00 - Implementar protecciones [1 hora]
  11:00 - Esperar respuesta ETIC

MAÑANA (2026-01-24):
  08:00 - Recibir datos de ETIC (probable)
  09:00 - Validar e importar [2-4 horas]
  13:00 - Auditoría y validación [1 hora]
  14:00 - Sistema recuperado ✅

Si tarde ETIC:
  - Plan B: Descargar de explotaDatos (manual)
  - Plan C: Replicar desde otra IPRESS que tenga datos
```

---

## ⚠️ ADVERTENCIAS FINALES

1. **Tu contraseña fue expuesta** en esta sesión
   - ✅ Cambiarla inmediatamente después de recuperación

2. **Validar datos antes de cargar**
   - No cargar si count(*) != ~4M

3. **Hacer backups de backup**
   - Guardar copia del dump de ESSI en tu servidor

4. **Documentar el incidente**
   - Para auditoría y lecciones aprendidas

---

## ✨ PRÓXIMO PASO: ENVÍA ESTE EMAIL HOY

**Copia y pega en tu correo de ESSI:**

```
Destinatario: [Buscar en ESSI Tablas del Sistema]

Asunto: [URGENTE] Solicitud Export Tabla Asegurados - Datos_Cenate

Estimado Equipo ETIC,

Requiero asistencia urgente para exportar datos de la tabla asegurados
de la base de datos Datos_Cenate (ESSI).

Detalles:
- Base de datos: Datos_Cenate
- Tabla: asegurados
- Cantidad de registros: ~4,000,000
- Formato preferido: CSV o SQL DUMP
- Urgencia: CRÍTICA (sistema de gestión de citas en producción afectado)

Usuario solicitante:
- Código: 44914706
- Nombre: CANTO RONDON STYP
- Centro: CNT CENATE

Por favor confirmar recepción y tiempo estimado de entrega.

Quedo atento a cualquier información requerida.

Saludos,
Styp Canto Rondón
```

---

**Documento preparado por:** Claude Code
**Fecha:** 2026-01-23 20:50 UTC
**Status:** LISTO PARA EJECUTAR
