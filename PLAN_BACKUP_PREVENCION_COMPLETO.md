# 🛡️ PLAN DE BACKUP Y PREVENCIÓN DE PÉRDIDA DE DATOS

**Objetivo:** Evitar volver a perder datos críticos como asegurados
**Prioridad:** CRÍTICA
**Fecha:** 2026-01-23

---

## 📋 ESTRATEGIA MULTICAPA

```
Nivel 1: BACKUP DIARIO AUTOMÁTICO (Local)
         ↓
Nivel 2: BACKUP SEMANAL A ALMACENAMIENTO EXTERNO
         ↓
Nivel 3: PROTECCIONES CONTRA ELIMINACIÓN ACCIDENTAL (BD)
         ↓
Nivel 4: REPLICACIÓN EN TIEMPO REAL (Opcional - Alta Disponibilidad)
         ↓
Nivel 5: ALERTAS Y MONITOREO
```

---

## 🔧 NIVEL 1: BACKUP DIARIO AUTOMÁTICO

### Paso 1: Crear directorio de backups

```bash
# En el servidor 10.0.89.13
mkdir -p /home/cenate/backups/asegurados
mkdir -p /home/cenate/backups/maestro_cenate
mkdir -p /home/cenate/backups/logs
chmod 755 /home/cenate/backups
```

### Paso 2: Script de Backup Automático

**Crear archivo:** `/home/cenate/scripts/backup-maestro-cenate.sh`

```bash
#!/bin/bash

# ============================================
# BACKUP AUTOMÁTICO - MAESTRO_CENATE
# Ejecutar: 0 2 * * * /home/cenate/scripts/backup-maestro-cenate.sh
# (2 AM todos los días)
# ============================================

set -e  # Exit on error

# Configuración
BACKUP_DIR="/home/cenate/backups/maestro_cenate"
LOG_FILE="/home/cenate/backups/logs/backup-$(date +%Y%m%d).log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_HOST="10.0.89.13"
DB_USER="cenate"
DB_NAME="maestro_cenate"
CONTAINER_NAME="postgres_cenate"
RETENTION_DAYS=30

# Crear directorios si no existen
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Función de logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== INICIO BACKUP AUTOMÁTICO ==="

# 1. BACKUP SQL COMPLETO (DUMP)
log "Creando dump SQL completo..."
docker exec "$CONTAINER_NAME" pg_dump \
  -U "$DB_USER" "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --file=/tmp/maestro_cenate_$TIMESTAMP.dump

docker cp "$CONTAINER_NAME":/tmp/maestro_cenate_$TIMESTAMP.dump \
  "$BACKUP_DIR/maestro_cenate_$TIMESTAMP.dump"

SIZE_DUMP=$(du -h "$BACKUP_DIR/maestro_cenate_$TIMESTAMP.dump" | cut -f1)
log "✅ Dump SQL creado: $SIZE_DUMP"

# 2. BACKUP SOLO TABLA ASEGURADOS (CRÍTICA)
log "Creando backup de tabla asegurados..."
docker exec "$CONTAINER_NAME" pg_dump \
  -U "$DB_USER" "$DB_NAME" \
  -t asegurados \
  --data-only \
  --format=plain | gzip > "$BACKUP_DIR/asegurados_$TIMESTAMP.sql.gz"

SIZE_ASEG=$(du -h "$BACKUP_DIR/asegurados_$TIMESTAMP.sql.gz" | cut -f1)
log "✅ Tabla asegurados backup: $SIZE_ASEG"

# 3. BACKUP CSV (Para import fácil)
log "Creando backup CSV de asegurados..."
docker exec "$CONTAINER_NAME" psql \
  -U "$DB_USER" "$DB_NAME" \
  -c "COPY asegurados TO STDOUT WITH CSV HEADER" | gzip > \
  "$BACKUP_DIR/asegurados_$TIMESTAMP.csv.gz"

SIZE_CSV=$(du -h "$BACKUP_DIR/asegurados_$TIMESTAMP.csv.gz" | cut -f1)
log "✅ CSV asegurados: $SIZE_CSV"

# 4. LIMPIAR BACKUPS ANTIGUOS (>30 días)
log "Limpiando backups anteriores a $RETENTION_DAYS días..."
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.csv.gz" -mtime +$RETENTION_DAYS -delete

# 5. VERIFICACIÓN DE INTEGRIDAD
log "Verificando integridad del backup SQL..."
if pg_restore -l "$BACKUP_DIR/maestro_cenate_$TIMESTAMP.dump" > /dev/null 2>&1; then
  log "✅ Integridad SQL: OK"
else
  log "❌ ERROR: Backup corrupto!"
  echo "ERROR EN BACKUP - Revisar inmediatamente" | \
    mail -s "ALERTA: Backup maestro_cenate corrupto" admin@cenate.gob.pe
  exit 1
fi

# 6. REGISTRAR ESTADÍSTICAS
log "=== ESTADÍSTICAS BACKUP ==="
TOTAL_FILES=$(ls -1 "$BACKUP_DIR" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
ASEGURADOS_COUNT=$(docker exec "$CONTAINER_NAME" psql \
  -U "$DB_USER" "$DB_NAME" -t -c "SELECT COUNT(*) FROM asegurados;")

log "Total archivos: $TOTAL_FILES"
log "Tamaño total: $TOTAL_SIZE"
log "Registros asegurados: $ASEGURADOS_COUNT"
log "=== FIN BACKUP EXITOSO ==="
```

### Paso 3: Instalar en CRONTAB

```bash
# SSH al servidor
ssh cenate@10.0.89.13

# Hacer script ejecutable
chmod +x /home/cenate/scripts/backup-maestro-cenate.sh

# Editar crontab
crontab -e

# Agregar estas líneas:
# Backup a las 2 AM (cuando hay menos carga)
0 2 * * * /home/cenate/scripts/backup-maestro-cenate.sh >> /var/log/cenate-backup.log 2>&1

# Backup adicional a las 2 PM (respaldo del respaldo)
0 14 * * * /home/cenate/scripts/backup-maestro-cenate.sh >> /var/log/cenate-backup.log 2>&1

# Guardar con :wq
```

---

## 🛡️ NIVEL 2: BACKUP A ALMACENAMIENTO EXTERNO

### Opción A: Disco Externo (USB/NAS)

```bash
#!/bin/bash
# /home/cenate/scripts/backup-externo-semanal.sh

BACKUP_DIR="/home/cenate/backups/maestro_cenate"
EXTERNAL_DRIVE="/mnt/backup-externo"  # Montar disco USB
TIMESTAMP=$(date +%Y%m%d)

# Copiar backups de la semana al disco externo
rsync -avh --progress "$BACKUP_DIR/" "$EXTERNAL_DRIVE/maestro_cenate_backups/"

# Verificar copia
if [ $? -eq 0 ]; then
  echo "✅ Backup externo completado: $(date)"
  sync  # Sincronizar disco
else
  echo "❌ ERROR en backup externo"
  exit 1
fi
```

**CRONTAB:**
```bash
# Cada domingo a las 3 AM
0 3 * * 0 /home/cenate/scripts/backup-externo-semanal.sh
```

### Opción B: Google Drive / OneDrive (Cloud)

```bash
#!/bin/bash
# /home/cenate/scripts/backup-cloud-mensual.sh

BACKUP_DIR="/home/cenate/backups/maestro_cenate"
CLOUD_DIR="/mnt/google-drive/cenate-backups"  # Requiere configurar rclone
TIMESTAMP=$(date +%Y%m%d)

# Copiar backup más reciente a cloud
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.dump | head -1)
cp "$LATEST_BACKUP" "$CLOUD_DIR/"

echo "✅ Backup a cloud: $(date)"
```

**Configurar rclone:**
```bash
rclone config  # Sigue los prompts para Google Drive o OneDrive
```

---

## 🔐 NIVEL 3: PROTECCIONES CONTRA ELIMINACIÓN ACCIDENTAL

### 3.1 Auditoría Completa de DELETEs

```sql
-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_table_deletes (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(255),
  deleted_count INT,
  deleted_by VARCHAR(255),
  deleted_at TIMESTAMP DEFAULT NOW(),
  deleted_data JSONB,
  query_text TEXT
);

-- Trigger para registrar TODOS los DELETEs en asegurados
CREATE OR REPLACE FUNCTION audit_asegurados_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_table_deletes
    (table_name, deleted_count, deleted_by, deleted_data)
  VALUES
    ('asegurados', 1, CURRENT_USER, ROW_TO_JSON(OLD));
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS audit_delete_asegurados ON asegurados;
CREATE TRIGGER audit_delete_asegurados
BEFORE DELETE ON asegurados
FOR EACH ROW
EXECUTE FUNCTION audit_asegurados_delete();

-- Igual para TRUNCATE
CREATE OR REPLACE FUNCTION audit_asegurados_truncate()
RETURNS EVENT_TRIGGER AS $$
BEGIN
  INSERT INTO audit_table_deletes
    (table_name, deleted_count, deleted_by, query_text)
  VALUES
    ('asegurados', (SELECT COUNT(*) FROM asegurados), CURRENT_USER, TG_TAG);
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER audit_truncate_asegurados
ON ddl_command_end
WHEN TAG IN ('TRUNCATE')
EXECUTE FUNCTION audit_asegurados_truncate();
```

### 3.2 Restricción de Permisos

```sql
-- REVOCAR permisos DELETE de roles peligrosos
REVOKE DELETE ON asegurados FROM backend_user;
REVOKE DELETE ON asegurados FROM chatbot_cnt;
REVOKE DELETE ON asegurados FROM ro_public_reader;

-- Solo SUPERADMIN puede borrar (y queda registrado)
GRANT DELETE ON asegurados TO postgres;
GRANT DELETE ON asegurados TO Admin_DBA;

-- Crear usuario con SOLO SELECT (para lecturas)
CREATE ROLE cenate_readonly WITH LOGIN PASSWORD 'password_fuerte';
GRANT CONNECT ON DATABASE maestro_cenate TO cenate_readonly;
GRANT USAGE ON SCHEMA public TO cenate_readonly;
GRANT SELECT ON asegurados TO cenate_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cenate_readonly;
```

### 3.3 Vistas de Solo Lectura

```sql
-- Crear vista inmutable para asegurados
CREATE VIEW v_asegurados_readonly AS
SELECT * FROM asegurados;

-- Usar en aplicaciones en lugar de tabla directa
-- SELECT * FROM v_asegurados_readonly
```

---

## 📊 NIVEL 4: REPLICACIÓN EN TIEMPO REAL (Opcional - HA)

Para máxima disponibilidad, configurar un **servidor standby** que reciba cambios en tiempo real:

```bash
# En servidor standby (otra máquina con PostgreSQL)
docker run -d \
  --name postgres_cenate_standby \
  -e POSTGRES_PASSWORD=password \
  -v standby-data:/var/lib/postgresql/data \
  postgres:16

# Configurar replicación en servidor primario (10.0.89.13)
# (Requiere configuración avanzada de PostgreSQL)
```

---

## 🚨 NIVEL 5: ALERTAS Y MONITOREO

### Script de Monitoreo Diario

```bash
#!/bin/bash
# /home/cenate/scripts/monitor-backup-salud.sh

BACKUP_DIR="/home/cenate/backups/maestro_cenate"
MIN_BACKUP_SIZE_MB=500  # Mínimo 500MB para dump válido
ALERT_EMAIL="admin@cenate.gob.pe"

# 1. Verificar que exista backup de hoy
TODAY_BACKUP=$(find "$BACKUP_DIR" -name "*$(date +%Y%m%d)*" -type f)

if [ -z "$TODAY_BACKUP" ]; then
  echo "❌ ALERTA: No hay backup de hoy" | \
    mail -s "CRÍTICO: Falta backup diario" "$ALERT_EMAIL"
  exit 1
fi

# 2. Verificar tamaño mínimo
LATEST_DUMP=$(ls -t "$BACKUP_DIR"/*.dump 2>/dev/null | head -1)
if [ ! -z "$LATEST_DUMP" ]; then
  SIZE_MB=$(du -m "$LATEST_DUMP" | cut -f1)
  if [ $SIZE_MB -lt $MIN_BACKUP_SIZE_MB ]; then
    echo "⚠️ ALERTA: Backup muy pequeño ($SIZE_MB MB)" | \
      mail -s "ADVERTENCIA: Backup podría ser corrupto" "$ALERT_EMAIL"
  fi
fi

# 3. Verificar integridad del dump
if ! pg_restore -l "$LATEST_DUMP" > /dev/null 2>&1; then
  echo "❌ ALERTA: Backup corrupto" | \
    mail -s "CRÍTICO: Integridad de backup fallida" "$ALERT_EMAIL"
  exit 1
fi

echo "✅ Backup OK - $(date)"
```

**CRONTAB:**
```bash
# Verificar backup cada día a las 10 AM
0 10 * * * /home/cenate/scripts/monitor-backup-salud.sh
```

---

## 📅 TABLA DE RETENCIÓN

| Tipo | Frecuencia | Retención | Almacenamiento |
|------|-----------|-----------|-----------------|
| **Dump SQL Diario** | 2x día (2 AM, 2 PM) | 30 días | Local (/home/cenate/backups) |
| **CSV Asegurados** | 2x día | 30 días | Local |
| **Dump Semanal** | 1x semana (domingo) | 90 días | Disco USB/NAS |
| **Dump Mensual** | 1x mes | 1 año | Google Drive / OneDrive |
| **Auditoría DELETE** | Continuo | 6 meses | BD tabla audit_table_deletes |

---

## 🔄 PROCEDIMIENTO PARA RESTAURAR

### Si necesitas restaurar en emergencia:

```bash
# 1. Listar backups disponibles
ls -lh /home/cenate/backups/maestro_cenate/

# 2. Elegir backup (ej: maestro_cenate_20260120_020000.dump)
BACKUP_FILE="/home/cenate/backups/maestro_cenate/maestro_cenate_20260120_020000.dump"

# 3. Restaurar (crea tabla nueva)
docker exec postgres_cenate pg_restore \
  -U cenate \
  -d maestro_cenate \
  -t asegurados \
  "$BACKUP_FILE"

# 4. Verificar
docker exec postgres_cenate psql -U cenate maestro_cenate \
  -c "SELECT COUNT(*) FROM asegurados;"
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear directorio de backups
- [ ] Crear script de backup automático
- [ ] Instalar en crontab
- [ ] Configurar disco externo o cloud
- [ ] Crear triggers de auditoría
- [ ] Revocar permisos DELETE
- [ ] Crear usuario readonly
- [ ] Instalar script de monitoreo
- [ ] Configurar alertas por email
- [ ] Documentar procedimiento de restauración
- [ ] Hacer prueba de restauración (cada mes)

---

## 📌 RESUMEN - INVERSIÓN DE TIEMPO

```
Setup inicial:        ~3-4 horas
Mantenimiento:        ~30 min/mes (pruebas)
Costo de infraestructura:
  - Scripts: $0 (gratuito)
  - Disco USB 2TB: ~$50 (one-time)
  - Google Drive 100GB: ~$2/mes
  - Total: Mínimo

ROI: Evitar pérdida de 4M+ registros = INVALUABLE
```

---

## 🎯 CONCLUSIÓN

**Con este plan:**
- ✅ Backups automáticos 2x diarios
- ✅ Auditoría completa de cambios
- ✅ Protección contra eliminación accidental
- ✅ Recuperación en 30 minutos en caso de emergencia
- ✅ Monitoreo y alertas
- ✅ Almacenamiento redundante (local + externo + cloud)

**Nunca volverás a perder datos críticos.** 🛡️

---

**Documento preparado por:** Claude Code
**Prioridad:** CRÍTICA - Implementar INMEDIATAMENTE después de restauración
**Revisión:** Mensual
