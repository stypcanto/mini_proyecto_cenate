# Guía de Migración - CTR_PERIODO v1.0.0

> Guía técnica para migrar de `periodo_medico_disponibilidad` a `ctr_periodo`

---

## 📊 Comparación de Estructuras

### Tabla Anterior: `periodo_medico_disponibilidad`

```sql
-- PK Simple
id_periodo_reg_disp BIGINT PRIMARY KEY AUTO_INCREMENT
anio INTEGER
periodo VARCHAR(6)
descripcion VARCHAR(255)
fecha_inicio DATE
fecha_fin DATE
estado VARCHAR(20)  -- BORRADOR, ACTIVO, CERRADO, ANULADO
```

### Tabla Nueva: `ctr_periodo`

```sql
-- PK Compuesta
periodo VARCHAR(6) NOT NULL      -- Parte 1 de PK
id_area BIGINT NOT NULL          -- Parte 2 de PK (FK a dim_area)
fecha_inicio DATE
fecha_fin DATE
estado VARCHAR(20)               -- ABIERTO, EN_VALIDACION, CERRADO, REABIERTO
id_coordinador BIGINT            -- FK a dim_usuarios
id_usuario_ultima_accion BIGINT  -- FK a dim_usuarios
fecha_creacion TIMESTAMP
fecha_actualizacion TIMESTAMP
PRIMARY KEY (periodo, id_area)
```

---

## 🔄 Mapeo de Campos

| Campo Anterior | Campo Nuevo | Notas |
|----------------|-------------|-------|
| `id_periodo_reg_disp` | - | Eliminado (ya no hay ID autoincremental) |
| `anio` | - | Se calcula desde `periodo.substring(0,4)` |
| `periodo` | `periodo` | Sin cambios, ahora es parte de PK |
| `descripcion` | - | Eliminado |
| `fecha_inicio` | `fecha_inicio` | Sin cambios |
| `fecha_fin` | `fecha_fin` | Sin cambios |
| `estado` | `estado` | Valores cambiados (ver abajo) |
| - | `id_area` | **NUEVO** - Parte de PK compuesta |
| - | `id_coordinador` | **NUEVO** - FK a dim_usuarios |
| - | `id_usuario_ultima_accion` | **NUEVO** - Auditoría |
| - | `fecha_creacion` | **NUEVO** |
| - | `fecha_actualizacion` | **NUEVO** |

---

## 🏷️ Mapeo de Estados

| Estado Anterior | Estado Nuevo | Acción |
|-----------------|--------------|--------|
| `BORRADOR` | `ABIERTO` | Migrar automáticamente |
| `ACTIVO` | `ABIERTO` | Migrar automáticamente |
| `CERRADO` | `CERRADO` | Sin cambios |
| `ANULADO` | `REABIERTO` | Migrar si estaba reabierto, o eliminar |

---

## 📡 Mapeo de Endpoints API

### Anterior → Nuevo

| Operación | Endpoint Anterior | Endpoint Nuevo |
|-----------|-------------------|----------------|
| Listar | `GET /periodos-medicos-disponibilidad` | `GET /ctr-periodos` |
| Obtener uno | `GET /periodos-medicos-disponibilidad/{id}` | `GET /ctr-periodos/{periodo}/area/{idArea}` |
| Crear | `POST /periodos-medicos-disponibilidad` | `POST /ctr-periodos` |
| Actualizar | `PUT /periodos-medicos-disponibilidad/{id}` | `PUT /ctr-periodos/{periodo}/area/{idArea}` |
| Cambiar estado | `PATCH /periodos-medicos-disponibilidad/{id}/estado` | `PATCH /ctr-periodos/{periodo}/area/{idArea}/estado` |
| Eliminar | `DELETE /periodos-medicos-disponibilidad/{id}` | `DELETE /ctr-periodos/{periodo}/area/{idArea}` |

---

## 📦 Mapeo de Request/Response

### Request Anterior:
```json
{
  "anio": 2026,
  "periodo": "202602",
  "descripcion": "Febrero 2026",
  "fechaInicio": "2026-02-01",
  "fechaFin": "2026-02-28"
}
```

### Request Nuevo:
```json
{
  "periodo": "202602",
  "idArea": 1,
  "fechaInicio": "2026-02-01",
  "fechaFin": "2026-02-28",
  "estado": "ABIERTO"
}
```

### Response Anterior:
```json
{
  "idPeriodoRegDisp": 123,
  "anio": 2026,
  "periodo": "202602",
  "descripcion": "Febrero 2026",
  "fechaInicio": "2026-02-01",
  "fechaFin": "2026-02-28",
  "estado": "ACTIVO"
}
```

### Response Nuevo:
```json
{
  "periodo": "202602",
  "idArea": 1,
  "nombreArea": "Cardiología",
  "fechaInicio": "2026-02-01",
  "fechaFin": "2026-02-28",
  "estado": "ABIERTO",
  "idCoordinador": 45,
  "nombreCoordinador": "Dr. García",
  "anio": 2026,
  "mes": 2,
  "fechaCreacion": "2026-02-19T10:30:00",
  "fechaActualizacion": "2026-02-19T10:30:00"
}
```

---

## 🛠️ Pasos de Migración

### Paso 1: Crear tabla nueva (si no existe)

```sql
CREATE TABLE IF NOT EXISTS ctr_periodo (
    periodo VARCHAR(6) NOT NULL,
    id_area BIGINT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'ABIERTO',
    id_coordinador BIGINT,
    id_usuario_ultima_accion BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    PRIMARY KEY (periodo, id_area),
    CONSTRAINT fk_ctr_periodo_area 
        FOREIGN KEY (id_area) REFERENCES dim_area(id_area),
    CONSTRAINT fk_ctr_periodo_coordinador 
        FOREIGN KEY (id_coordinador) REFERENCES dim_usuarios(id_usuario),
    CONSTRAINT fk_ctr_periodo_ultima_accion 
        FOREIGN KEY (id_usuario_ultima_accion) REFERENCES dim_usuarios(id_usuario)
);
```

### Paso 2: Migrar datos (opcional)

```sql
-- Solo si necesitas migrar datos existentes
INSERT INTO ctr_periodo (periodo, id_area, fecha_inicio, fecha_fin, estado, fecha_creacion)
SELECT 
    p.periodo,
    1 AS id_area,  -- Asignar área por defecto o calcular
    p.fecha_inicio,
    p.fecha_fin,
    CASE p.estado
        WHEN 'BORRADOR' THEN 'ABIERTO'
        WHEN 'ACTIVO' THEN 'ABIERTO'
        WHEN 'CERRADO' THEN 'CERRADO'
        WHEN 'ANULADO' THEN 'REABIERTO'
        ELSE 'ABIERTO'
    END AS estado,
    NOW() AS fecha_creacion
FROM periodo_medico_disponibilidad p
WHERE NOT EXISTS (
    SELECT 1 FROM ctr_periodo c 
    WHERE c.periodo = p.periodo AND c.id_area = 1
);
```

### Paso 3: Desplegar backend actualizado

1. Compilar: `./gradlew build`
2. Verificar que no hay errores
3. Desplegar JAR

### Paso 4: Desplegar frontend actualizado

1. Instalar dependencias: `npm install`
2. Build: `npm run build`
3. Desplegar build/

---

## ⚠️ Consideraciones

1. **No hay rollback automático**: La migración es unidireccional
2. **Coordinar despliegue**: Backend y Frontend deben desplegarse juntos
3. **Probar en staging**: Verificar todos los flujos antes de producción
4. **Backup**: Realizar backup de tabla anterior antes de migrar

---

## ✅ Checklist de Verificación

- [ ] Tabla `ctr_periodo` existe con estructura correcta
- [ ] Tabla `dim_area` tiene registros
- [ ] Backend compila sin errores
- [ ] Frontend compila sin errores
- [ ] Endpoint GET `/api/ctr-periodos` responde
- [ ] Crear período funciona
- [ ] Editar período funciona
- [ ] Cambiar estado funciona
- [ ] Eliminar período funciona
- [ ] KPIs muestran datos correctos

---

**Versión de documento:** 1.0.1  
**Última actualización:** 2026-02-19

---

## 🔧 Troubleshooting

### Error: "Referenced column 'periodo' mapped by target property 'id' occurs out of order"

**Causa:** Hibernate 6+ tiene problemas con `@MapsId` en claves compuestas embebidas.

**Solución:**
1. En `CtrPeriodo.java`: Reemplazar `@MapsId("idArea")` por `@JoinColumn(insertable = false, updatable = false)`
2. En entidades relacionadas (ej: `CtrHorario.java`): Usar `@JoinColumns` con ambas columnas de la PK

```java
// Correcto para relaciones con CtrPeriodo
@JoinColumns({
    @JoinColumn(name = "periodo", referencedColumnName = "periodo", insertable = false, updatable = false),
    @JoinColumn(name = "id_area", referencedColumnName = "id_area", insertable = false, updatable = false)
})
private CtrPeriodo periodoObj;
```

