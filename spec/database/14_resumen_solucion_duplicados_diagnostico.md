# 🔒 Solución Completa: Duplicación de Formularios de Diagnóstico

**Fecha:** 2026-01-26
**Versión:** v1.36.0
**Status:** ✅ COMPLETAMENTE IMPLEMENTADO

---

## 📋 Resumen Ejecutivo

Se identificó y **solucionó completamente** el problema de duplicación de formularios de diagnóstico situacional en el módulo de "Llenado de Diagnóstico de IPRESS" (Red Asistencial).

**Problema:** Aparecían múltiples registros duplicados para la misma IPRESS en el dashboard de diagnosis.

**Solución:** Implementación de **protección triple** (Frontend → Backend → Base de Datos).

---

## 🎯 Problema Identificado

### Síntomas
- Tabla de dashboard mostraba registros **duplicados**
- Ejemplo: "HI ANDAHUAYLAS" (código 068) aparecía **5 veces**
- Todos con estado "En Proceso" y la misma fecha (26/1/2026)

### Causa Raíz
1. **Backend sin validación:** `FormDiagServiceImpl.guardarBorrador()` creaba SIEMPRE un nuevo registro si no tenía `idFormulario`
2. **Sin check de existencia:** No validaba si ya existía un formulario EN_PROCESO para esa IPRESS en ese año
3. **Múltiples peticiones:** Cada clic en "Guardar" (si el cliente no recibía ID rápido) generaba un nuevo registro

### Escenarios de Duplicación
```
Scenario 1: Doble-clic en UI
  Clic 1: POST /formulario-diagnostico/borrador { idFormulario: null }
            → Backend crea registro (id=123)
  Clic 2: POST /formulario-diagnostico/borrador { idFormulario: null }
            → Backend crea OTRO registro (id=124) ❌ DUPLICADO

Scenario 2: Red lenta
  POST /formulario-diagnostico/borrador envía
  → Espera respuesta por 5+ segundos
  → Usuario hace clic "Guardar" otra vez
  → Se crea duplicado

Scenario 3: Múltiples usuarios
  Usuario A y Usuario B de la misma IPRESS guardan simultáneamente
  → Ambos crean registros (no hay sincronización)
  → 2 registros para la misma IPRESS en el mismo año
```

---

## ✅ Solución Implementada

### **CAPA 1: Frontend (Prevención de Doble-Clic)**

**Archivo:** `frontend/src/pages/roles/externo/FormularioDiagnostico.jsx`

```jsx
// Estado guardando previene clics adicionales
const [guardando, setGuardando] = useState(false);

const handleSaveProgress = async () => {
    setGuardando(true);
    try {
        const response = await formularioDiagnosticoService.guardarBorrador(...);
        if (response) {
            setIdFormulario(response.idFormulario);
        }
    } finally {
        setGuardando(false);
    }
};

// Botón deshabilitado mientras se guarda
<button
    onClick={handleSaveProgress}
    disabled={guardando || estadoFormulario === "ENVIADO"}  // ← PROTECCIÓN
>
    {guardando ? "Guardando..." : "Guardar Progreso"}
</button>
```

**Protección:** Imposibilita clic mientras se procesa la petición.

---

### **CAPA 2: Backend (Validación Lógica)**

**Archivo:** `backend/src/main/java/com/styp/cenate/service/formdiag/impl/FormDiagServiceImpl.java`
**Líneas:** 102-121

```java
@Override
public FormDiagResponse guardarBorrador(FormDiagRequest request, String username) {
    if (request.getIdFormulario() != null) {
        // El cliente tiene ID → ACTUALIZAR ese formulario
        return actualizar(request.getIdFormulario(), request, username);
    } else {
        // El cliente NO tiene ID → BUSCAR si existe uno EN_PROCESO
        int anioActual = Year.now().getValue();
        var formularioExistente = formularioRepo.findEnProcesoPorIpressAndAnio(
            request.getIdIpress(),
            anioActual
        );

        if (formularioExistente.isPresent()) {
            // ✅ ENCONTRADO: ACTUALIZAR en lugar de crear
            log.info("Formulario EN_PROCESO encontrado para IPRESS: {} - Actualizando",
                     request.getIdIpress());
            return actualizar(
                formularioExistente.get().getIdFormulario(),
                request,
                username
            );
        } else {
            // ✅ NO ENCONTRADO: CREAR uno nuevo
            return crear(request, username);
        }
    }
}
```

**Patrón:** "Upsert" (Update or Insert)
**Protección:** Backend busca duplicados ANTES de crear, imposibilita a nivel lógico.

---

### **CAPA 3: Base de Datos (Protección Garantizada)**

**Archivos:**
- `spec/database/06_scripts/049_clean_duplicated_formularios_diagnostico.sql` - Limpieza
- `spec/database/06_scripts/050_add_unique_constraint_formulario_diagnostico.sql` - UNIQUE Index

#### Paso 1: Limpiar Duplicados Existentes

```sql
DELETE FROM form_diag_formulario
WHERE id_formulario IN (
    SELECT id_formulario
    FROM (
        SELECT
            id_formulario,
            ROW_NUMBER() OVER (
                PARTITION BY id_ipress, anio
                ORDER BY fecha_creacion DESC
            ) as rn
        FROM form_diag_formulario
        WHERE estado = 'EN_PROCESO'
    ) ranked
    WHERE rn > 1  -- Elimina todos excepto el más reciente
);
```

**Resultado Ejecutado:**
```
Duplicados encontrados:
  - IPRESS 55 año 2026: 5 registros → eliminados 4, mantuvo 1 (más reciente)
  - IPRESS 391 año 2026: 2 registros → eliminado 1, mantuvo 1 (más reciente)

Total eliminados: 5 registros
```

#### Paso 2: Crear UNIQUE Index Parcial

```sql
CREATE UNIQUE INDEX idx_uq_formulario_en_proceso_por_ipress_anio
ON form_diag_formulario (id_ipress, anio)
WHERE estado = 'EN_PROCESO';
```

**Características:**
- ✅ **Partial Index:** Solo restringe filas donde `estado = 'EN_PROCESO'`
- ✅ **Eficiente:** No incluye ENVIADO, APROBADO, RECHAZADO
- ✅ **Flexible:** Permite múltiples formularios EN_PROCESO para AÑOS diferentes
- ✅ **Seguro:** Imposible burlar a nivel de almacenamiento

**Testing Exitoso:**
```
Intento: INSERT formulario (id_ipress=55, anio=2026, estado='EN_PROCESO')
Resultado: ❌ ERROR - duplicate key value violates unique constraint
Detail: Key (id_ipress, anio)=(55, 2026) already exists
```

---

## 🏛️ Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────┐
│                          USUARIO                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            CAPA 1: FRONTEND (React)                          │
│                                                              │
│  - Estado: guardando = true mientras se procesa             │
│  - Botón deshabilitado: disabled={guardando}                │
│  - Previene: Doble-clic, clics rápidos                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ POST /formulario-diagnostico/borrador
                       ▼
┌─────────────────────────────────────────────────────────────┐
│        CAPA 2: BACKEND (Spring Boot Java)                   │
│                                                              │
│  guardarBorrador(request):                                  │
│    IF idFormulario != null:                                 │
│        ACTUALIZAR formulario existente                      │
│    ELSE:                                                     │
│        BUSCAR formulario EN_PROCESO para IPRESS+AÑO        │
│        IF ENCONTRADO:                                        │
│            ACTUALIZAR ese (UPSERT pattern)                  │
│        ELSE:                                                 │
│            CREAR uno nuevo                                  │
│                                                              │
│  Protección: Lógica de negocio + transacciones              │
└──────────────────────┬──────────────────────────────────────┘
                       │ INSERT / UPDATE
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          CAPA 3: BASE DE DATOS (PostgreSQL)                │
│                                                              │
│  UNIQUE INDEX: idx_uq_formulario_en_proceso_por_ipress_anio │
│  ON (id_ipress, anio) WHERE estado = 'EN_PROCESO'          │
│                                                              │
│  Protección: Imposible insertar duplicados, rechaza a BD   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Impacto de la Solución

| Escenario | Antes | Después |
|-----------|-------|---------|
| **Doble-clic "Guardar"** | ❌ Crea 2 registros | ✅ Actualiza el mismo |
| **Red lenta + retry** | ❌ Crea duplicados | ✅ UPSERT lo actualiza |
| **Múltiples usuarios** | ❌ Crea varios registros | ✅ BD rechaza (UNIQUE) |
| **API atacada directamente** | ❌ Sin protección | ✅ BD lo bloquea |
| **Bug futuro en código** | ❌ Vulnerable | ✅ BD lo previene |

---

## 🔄 Flujo Completo (Caso de Uso: Guardado Exitoso)

```
1. Usuario abre formulario diagnóstico para IPRESS 068
   └─ Frontend: carga formulario en estado EN_PROCESO

2. Usuario completa campos y hace clic "Guardar"
   └─ Frontend: setGuardando(true), deshabilita botón
   └─ Envía: POST /formulario-diagnostico/borrador { idFormulario: null }

3. Backend recibe petición
   └─ guardarBorrador() verifica: ¿idFormulario != null?
   └─ Respuesta: NO (null)
   └─ Busca: ¿Existe formulario EN_PROCESO para IPRESS=068, año=2026?
   └─ Respuesta: NO (primera vez)
   └─ Acción: Crea nuevo (id=101)

4. Backend responde
   └─ { idFormulario: 101, estado: "EN_PROCESO", ... }
   └─ Frontend: setIdFormulario(101), setGuardando(false)

5. Usuario vuelve a hacer clic "Guardar" (sin esperar)
   └─ Frontend: setGuardando(true), deshabilita botón
   └─ Envía: POST /formulario-diagnostico/borrador { idFormulario: 101 }

6. Backend recibe petición
   └─ guardarBorrador() verifica: ¿idFormulario != null?
   └─ Respuesta: SÍ (101)
   └─ Acción: Actualiza registro 101 (NO crea otro)

7. RESULTADO: 1 único registro, sin duplicados ✅
```

---

## 🧪 Testing Realizado

### Test 1: Limpieza de Duplicados
```sql
SELECT COUNT(*)
FROM form_diag_formulario
WHERE estado = 'EN_PROCESO'
GROUP BY id_ipress, anio
HAVING COUNT(*) > 1;

Resultado: (0 filas)  ✅ Sin duplicados
```

### Test 2: UNIQUE Index Funciona
```sql
INSERT INTO form_diag_formulario
(id_ipress, anio, estado, fecha_creacion, usuario_registro)
VALUES (55, 2026, 'EN_PROCESO', NOW(), 'test');

Resultado:
❌ ERROR: duplicate key value violates unique constraint
   "idx_uq_formulario_en_proceso_por_ipress_anio"
   Key (id_ipress, anio)=(55, 2026) already exists.
```

### Test 3: UNIQUE Index NO Afecta Otros Estados
```sql
INSERT INTO form_diag_formulario
(id_ipress, anio, estado, fecha_creacion, usuario_registro)
VALUES (55, 2026, 'ENVIADO', NOW(), 'test');

Resultado: ✅ OK - Se inserta correctamente
```

---

## 📁 Archivos Modificados/Creados

```
v1.36.0 - Solución Completa de Duplicados
├── Backend
│   └── src/main/java/com/styp/cenate/service/formdiag/impl/
│       └── FormDiagServiceImpl.java (líneas 102-121)
│
├── Base de Datos
│   └── spec/database/06_scripts/
│       ├── 049_clean_duplicated_formularios_diagnostico.sql (NUEVO)
│       └── 050_add_unique_constraint_formulario_diagnostico.sql (NUEVO)
│
├── Documentación
│   ├── spec/troubleshooting/03_fix_duplicacion_formularios_diagnostico.md (NUEVO)
│   ├── spec/database/14_resumen_solucion_duplicados_diagnostico.md (ESTE ARCHIVO)
│   └── checklist/01_Historial/01_changelog.md
```

---

## 🚀 Deploy Checklist

- [x] Fix Backend: FormDiagServiceImpl.guardarBorrador() ✅
- [x] Clean BD: Ejecutar script 049 ✅
- [x] Create Index: Ejecutar script 050 ✅
- [x] Verify Index: Consulta \d form_diag_formulario en psql ✅
- [x] Test: Intentar insertar duplicado (rechazado) ✅
- [x] Documentación: Todas actualizado ✅
- [x] Changelog: v1.36.0 completado ✅

## 🔄 Reversión (si es necesario)

```sql
-- Paso 1: Eliminar UNIQUE Index
DROP INDEX IF EXISTS idx_uq_formulario_en_proceso_por_ipress_anio;

-- Paso 2: Revertir código de Backend (hacer commit anterior)
git revert <commit-hash>
```

---

## 📞 Referencias

- **Issue/Problema:** Duplicación de formularios diagnóstico en dashboard
- **Commits:**
  - `567388b` - 🔧 fix(diagnostico): Prevenir duplicación formularios
  - `a942e00` - 🛡️ feat(db): UNIQUE Index + limpieza duplicados
- **Documentos:**
  - `spec/troubleshooting/03_fix_duplicacion_formularios_diagnostico.md`
  - `checklist/01_Historial/01_changelog.md` (v1.36.0)

---

## ✅ Estado Final

| Aspecto | Status |
|---------|--------|
| **Backend Fix** | ✅ Compilado y testeado |
| **BD Limpieza** | ✅ 5 duplicados eliminados |
| **BD Protección** | ✅ UNIQUE Index activo |
| **Frontend** | ✅ Ya tenía protección |
| **Testing** | ✅ Exitoso |
| **Documentación** | ✅ Completa |
| **Deploy** | ✅ Listo |

**SOLUCIÓN COMPLETAMENTE IMPLEMENTADA Y TESTEADA** 🎉

