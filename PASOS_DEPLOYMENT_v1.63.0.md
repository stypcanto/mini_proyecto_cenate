# 🚀 PASOS FINALES PARA DEPLOYMENT v1.63.0

**Estado:** ✅ LISTO PARA DEPLOYMENT

---

## ✅ Tareas Completadas

- ✅ npm install xlsx
- ✅ Backend compilado (./gradlew clean build)
- ✅ Frontend buildizado (npm run build)

---

## 📋 Pasos Pendientes (Antes de usar en producción)

### 1️⃣ Ejecutar SQL: Asignar área a médicos

**Base de datos:** PostgreSQL

```sql
-- Verificar coordinadores médicos actuales
SELECT id_pers, nom_pers, ape_pater_pers, ape_mater_pers, area_trabajo
FROM dim_personal_cnt
WHERE area_trabajo IS NULL
  AND stat_pers = 'A'
LIMIT 10;

-- ✅ EJECUTAR: Asignar área a coordinadores médicos
UPDATE dim_personal_cnt
SET area_trabajo = 'TELEURGENCIAS_TELETRIAJE'
WHERE stat_pers = 'A'
  AND area_trabajo IS NULL
  AND id_pers IN (
    SELECT DISTINCT sb.id_personal
    FROM dim_solicitud_bolsa sb
    WHERE sb.id_personal IS NOT NULL
    LIMIT 50
  );

-- Verificar resultado
SELECT COUNT(*) as medicos_con_area
FROM dim_personal_cnt
WHERE area_trabajo = 'TELEURGENCIAS_TELETRIAJE'
  AND stat_pers = 'A';
```

**Alternativa manual:** Si prefieres asignar a coordinadores específicos:
```sql
UPDATE dim_personal_cnt
SET area_trabajo = 'TELEURGENCIAS_TELETRIAJE'
WHERE id_pers IN (12345, 67890, 11111);  -- IDs de coordinadores médicos
```

---

### 2️⃣ Iniciar Backend (con Flyway)

```bash
cd backend

# Opción 1: Con bootRun (desarrollo)
./gradlew bootRun

# Opción 2: JAR (producción)
./gradlew clean build -x test
java -jar build/libs/cenate-*.jar
```

**Qué sucede automáticamente:**
- Flyway detecta migration v4.2.0
- Ejecuta: agregamiento de campo, rol, permisos
- Base de datos actualizada automáticamente

**Verificar que inició correctamente:**
```
✓ Migration v4.2.0 ejecutada
✓ Puerto 8080 abierto
✓ API disponible en http://localhost:8080
```

---

### 3️⃣ Servir Frontend (desarrollo)

**Opción 1: Dev server (desarrollo local)**
```bash
cd frontend
npm start
# http://localhost:3000
```

**Opción 2: Production build (producción)**
```bash
cd frontend
npm install -g serve
serve -s build
# http://localhost:3000 o localhost:5000
```

**Opción 3: Nginx/Apache (recomendado)**
```bash
# Copiar build a servidor web
cp -r build/* /var/www/html/cenate/
```

---

### 4️⃣ Verificar Funcionamiento

#### Backend - Probar endpoints

```bash
# 1. Obtener KPIs
curl -X GET "http://localhost:8080/api/coordinador-medico/kpis" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Respuesta esperada:
{
  "totalPacientes": 150,
  "totalAtendidos": 120,
  "totalPendientes": 25,
  "totalDeserciones": 5,
  ...
}

# 2. Estadísticas por médico
curl -X GET "http://localhost:8080/api/coordinador-medico/estadisticas/medicos" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Respuesta esperada:
[
  {
    "idPers": 1,
    "nombreMedico": "Juan Pérez García",
    "totalAsignados": 30,
    "totalAtendidos": 25,
    ...
  }
]

# 3. Evolución temporal
curl -X GET "http://localhost:8080/api/coordinador-medico/evolucion-temporal" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Frontend - Acceso manual

1. **Navegar a:** `http://localhost:3000/roles/coordinador/dashboard-medico`
2. **Verificar que carga:**
   - ✓ 8 cards con KPIs (Pacientes, Atendidos, Pendientes, etc.)
   - ✓ Tabla de médicos con columnas
   - ✓ Gráfico de evolución temporal
   - ✓ Botón "Exportar Excel"
3. **Probar funcionalidades:**
   - ✓ Cambiar período (Semana/Mes/Año)
   - ✓ Expandir filas en tabla
   - ✓ Click "Ver Detalle" → Modal
   - ✓ Click "Exportar Excel" → Descarga archivo

---

## 🔐 Creación de Usuario Test (Opcional)

Si necesitas un usuario de prueba con rol de coordinador médico:

```sql
-- 1. Crear rol si no existe
INSERT INTO dim_roles (nombre_rol, descripcion_rol, stat_rol)
VALUES ('COORDINADOR_MEDICO_TELEURGENCIAS', 'Coordinador Médico', 'A')
ON CONFLICT DO NOTHING;

-- 2. Crear usuario
INSERT INTO dim_usuarios (name_user, pass_user, stat_user, created_at)
VALUES ('coord_medico_test', 'hashed_password', 'A', NOW())
RETURNING id_user;

-- 3. Asignar a personal
UPDATE dim_personal_cnt
SET id_usuario = :id_user,
    area_trabajo = 'TELEURGENCIAS_TELETRIAJE'
WHERE id_pers = :id_personal;

-- 4. Asignar rol
INSERT INTO dim_usuario_rol (id_usuario, id_rol)
VALUES (:id_user, (SELECT id_rol FROM dim_roles WHERE nombre_rol = 'COORDINADOR_MEDICO_TELEURGENCIAS'));
```

---

## 📊 Verificación Post-Deployment Checklist

- [ ] Backend está corriendo (port 8080)
- [ ] Frontend está corriendo (port 3000)
- [ ] Base de datos: v4.2.0 migration ejecutada
- [ ] campo `area_trabajo` existe en dim_personal_cnt
- [ ] Rol `COORDINADOR_MEDICO_TELEURGENCIAS` existe
- [ ] Al menos 1 coordinador tiene area_trabajo asignado
- [ ] Endpoint `/api/coordinador-medico/kpis` responde
- [ ] Dashboard carga en `/roles/coordinador/dashboard-medico`
- [ ] Tabla de médicos muestra datos
- [ ] Gráfico renderiza correctamente
- [ ] Excel export funciona

---

## 🐛 Troubleshooting

### Error: "Coordinador sin área de trabajo asignada"

**Causa:** Coordinador actual no tiene `area_trabajo`

**Solución:**
```sql
UPDATE dim_personal_cnt
SET area_trabajo = 'TELEURGENCIAS_TELETRIAJE'
WHERE id_usuario = :tu_usuario_id;
```

### Error: "El médico no pertenece al área"

**Causa:** Al reasignar, el médico tiene diferente `area_trabajo`

**Solución:** Asegurar todos los médicos tienen la misma área

```sql
SELECT DISTINCT area_trabajo FROM dim_personal_cnt
WHERE id_pers IN (SELECT DISTINCT id_personal FROM dim_solicitud_bolsa);
```

### Dashboard no muestra datos

**Causas posibles:**
1. No hay médicos con `area_trabajo` = 'TELEURGENCIAS_TELETRIAJE'
2. No hay solicitudes (dim_solicitud_bolsa vacío)
3. CORS bloqueado (frontend a backend)

**Verificar:**
```sql
SELECT COUNT(*) FROM dim_personal_cnt
WHERE area_trabajo = 'TELEURGENCIAS_TELETRIAJE' AND stat_pers = 'A';

SELECT COUNT(*) FROM dim_solicitud_bolsa
WHERE id_personal IN (
  SELECT id_pers FROM dim_personal_cnt
  WHERE area_trabajo = 'TELEURGENCIAS_TELETRIAJE'
);
```

---

## 📞 Soporte

**Documentación técnica:** `spec/backend/13_coordinador_medico_dashboard.md`
**Resumen implementación:** `IMPLEMENTATION_SUMMARY_v1.63.0.md`
**Commit:** `6d77797` (feat) + `f1c9e46` (docs)

---

## ✅ Status Final

- ✅ **Backend:** Compilado y listo para ejecutar
- ✅ **Frontend:** Build optimizado y listo para servir
- ✅ **Base de datos:** Migration preparada (se ejecuta automáticamente)
- ✅ **Documentación:** Completa
- ✅ **Testing:** Checklist incluido

**Próximo paso:** Ejecutar SQL + iniciar backend con `./gradlew bootRun`

