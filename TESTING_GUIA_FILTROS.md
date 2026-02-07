# 🧪 Guía Rápida: Testing Filtros Clínicos

**Componente:** MisECGsRecientes.jsx
**Build Status:** ✅ npm run build SUCCESS
**Compilación:** 2026-02-06 14:30 UTC-5

---

## 🚀 Empezar Testing

### Paso 1: Iniciar Aplicación
```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate/frontend
npm start
```

### Paso 2: Navegar a la Sección
**Para usuarios EXTERNO (IPRESS):**
```
http://localhost:3000/teleecgs/listar
```

**Para usuarios CENATE:**
```
http://localhost:3000/teleecg/recibidas
```

### Paso 3: Ver Filtros (Sección Azul)
```
┌─────────────────────────────────────────────┐
│ 🔍 Filtrar Cargas Recientes                 │
│                                             │
│ [🆔 DNI Paciente   ] [📅 Fecha Carga   ]   │
│ [12345678       ⊗] [2026-02-06        ]   │
│ (cuando hay filtros) [🗑️ Limpiar Filtros]│
└─────────────────────────────────────────────┘
```

---

## ✅ Test Rápidos (2-3 min)

### Test A: Filtro DNI Funciona
**Datos esperados:**
- Tabla con 3 pacientes (últimas cargas)
- Al menos uno con DNI que comience con "1" o "8"

**Pasos:**
1. Tipear "1" en campo DNI
2. ✅ **Debe:** Filtrar a pacientes con DNI que contenga "1"
3. ✅ **Debe:** Ver contador actualizado (ej: "1/3")

**Ejemplo:**
```
Antes:  📋 Cargas Recientes
        • 12345678 - Rosa Flor
        • 87654321 - Juan Pérez
        • 11223344 - María García

Después (tipear "1"):
        📋 Cargas Recientes (2/3)
        • 12345678 - Rosa Flor
        • 11223344 - María García
```

---

### Test B: Filtro Fecha Funciona
**Datos esperados:**
- Cargas de hoy y de otros días

**Pasos:**
1. Click en campo "Fecha Carga"
2. Seleccionar hoy (2026-02-06)
3. ✅ **Debe:** Mostrar solo cargas de hoy
4. ✅ **Debe:** Mensaje "Mostrando cargas de 2026-02-06"

**Ejemplo:**
```
Seleccionar: 2026-02-06
Resultado: 📋 Cargas Recientes (1/3)
           • 06/02 - 14:30 - Rosa Flor (hoy)
```

---

### Test C: Limpiar Filtro
**Pasos:**
1. Tipear "123" en DNI
2. ✅ **Debe:** Ver "🗑️ Limpiar Filtros" botón
3. Click en "🗑️ Limpiar Filtros"
4. ✅ **Debe:** Campo DNI vacío
5. ✅ **Debe:** Botón desaparece
6. ✅ **Debe:** Ver todos los 3 pacientes

---

## 🔬 Tests Detallados (5-10 min)

### Test 1: Búsqueda Parcial DNI
```
Datos:
  • 12345678 - Rosa
  • 87654321 - Juan
  • 11223344 - María

Tipear "234":
  ✅ Debe encontrar: 12345678 (contiene "234")
  ✅ Contador: 1/3
  ✅ Mensaje: "DNI 234 (1 encontrada)"

Tipear "1":
  ✅ Debe encontrar: 12345678, 11223344
  ✅ Contador: 2/3
  ✅ Mensaje: "DNI 1 (2 encontradas)"

Tipear "999":
  ✅ Debe mostrar: Empty state
  ✅ Mensaje: "DNI \"999\" no tiene cargas recientes"
```

---

### Test 2: Filtro Exacto Fecha
```
Datos (hipotético):
  • 2026-02-06 14:30 - Rosa (HOY)
  • 2026-02-05 10:00 - Juan (AYER)
  • 2026-02-04 09:30 - María (HACE 2 DÍAS)

Seleccionar: 2026-02-06
  ✅ Resultado: 1/3
  ✅ Solo Rosa visible
  ✅ Mensaje: "cargas de 2026-02-06 (1 encontrada)"

Seleccionar: 2026-02-05
  ✅ Resultado: 1/3
  ✅ Solo Juan visible
  ✅ Mensaje: "cargas de 2026-02-05 (1 encontrada)"

Seleccionar: 2026-02-01 (sin datos)
  ✅ Empty state: "No hay cargas para la fecha 2026-02-01"
```

---

### Test 3: Filtros Combinados (AND Logic)
```
Datos:
  • 12345678 - Rosa    - 2026-02-06
  • 87654321 - Juan    - 2026-02-06
  • 12345678 - Rosa    - 2026-02-05

Tipear "1234" + Seleccionar "2026-02-06":
  ✅ Resultado: 1/3
  ✅ Solo: 12345678 - Rosa - 2026-02-06
  ✅ Mensaje: "DNI 1234 en 2026-02-06 (1 encontrada)"

  Explicación:
    - 12345678 contiene "1234" ✅ Y fecha es 2026-02-06 ✅ → MOSTRAR
    - 87654321 no contiene "1234" ❌ → OCULTAR
    - 12345678 contiene "1234" ✅ PERO fecha es 2026-02-05 ❌ → OCULTAR
```

---

### Test 4: Clear Individual vs Clear All
```
Escenario: DNI="1234" + Fecha="2026-02-06"

Click X en DNI:
  ✅ DNI campo vacío
  ✅ Fecha sigue: "2026-02-06"
  ✅ Sigue filtrando por fecha
  ✅ Botón "Limpiar Filtros" sigue visible

Click X en Fecha:
  ✅ Fecha campo vacío
  ✅ DNI sigue: "1234"
  ✅ Sigue filtrando por DNI
  ✅ Botón "Limpiar Filtros" sigue visible

Click "🗑️ Limpiar Filtros":
  ✅ Ambos campos vacíos
  ✅ Botón desaparece
  ✅ Ver todos los pacientes
```

---

### Test 5: Responsive Design

#### Desktop (≥1024px)
```
Filtros inline: [DNI] [Fecha] [Limpiar]
Tabla con columnas: Hora | DNI | Paciente | ... | Acciones
```
✅ Todo debe verse alineado horizontalmente

#### Tablet (640-1024px)
```
Filtros 2 cols: [DNI] [Fecha]
                [Limpiar]
Tabla responsive: Columnas ocultas (Hora, Perfil)
```
✅ Dos columnas, botón debajo

#### Mobile (<640px)
```
Filtros 1 col:  [DNI]
                [Fecha]
                [Limpiar]
Tabla vertical: Columnas mínimas
```
✅ Una columna, botón debajo

---

## 🐛 Verificación de Bugs

### Checklist de Comportamiento
- [ ] Sin filtros: muestra todos los pacientes
- [ ] DNI: búsqueda en tiempo real (no necesita Enter)
- [ ] DNI: máximo 8 caracteres
- [ ] Fecha: date picker abre al hacer click
- [ ] Fecha: formato YYYY-MM-DD
- [ ] Limpiar: botón NO aparece cuando no hay filtros
- [ ] Limpiar: botón aparece cuando hay mínimo un filtro
- [ ] Contador: actualiza dinámicamente
- [ ] Empty state: mensaje útil y botón para limpiar
- [ ] Acciones tabla: Ver, Descargar, Info siguen funcionando
- [ ] Refresh: filtros se mantienen activos

---

## 📊 Casos Edge (Esquinas)

### Case 1: DNI con 0 resultados
```
Tipear: "99999999" (no existe)
Resultado:
  ⚠️ No se encontraron cargas
  DNI "99999999" no tiene cargas recientes
  [❌ Limpiar filtros]
```
✅ Empty state bonito y útil

### Case 2: Fecha sin datos
```
Seleccionar: 2020-01-01 (pasado lejano)
Resultado:
  ⚠️ No se encontraron cargas
  No hay cargas para la fecha 2020-01-01
  [❌ Limpiar filtros]
```
✅ Mensajes dinámicos

### Case 3: Ambos filtros sin match
```
DNI: "1234" + Fecha: "2026-01-01"
  (DNI existe pero no en esa fecha)
Resultado:
  ⚠️ No se encontraron cargas
  DNI "1234" no tiene cargas en 2026-01-01
```
✅ Mensaje específico

---

## 📈 Performance Check

### Con 3 pacientes (actual)
```
✅ Filtros: <100ms
✅ Sin lag al tipear
✅ Sin delay al seleccionar fecha
✅ Transiciones suaves
```

### Con 100+ pacientes (futuro)
```
// Cuando implemente pagination o virtualization
✅ useMemo previene re-renders
✅ Performance debe ser aceptable
```

---

## 🎯 Validación Final

**Después de todos los tests, verificar:**

- [ ] ✅ Filtro DNI funciona (búsqueda parcial)
- [ ] ✅ Filtro Fecha funciona (exacta)
- [ ] ✅ Filtros combinados (AND logic)
- [ ] ✅ Limpiar individual (X button)
- [ ] ✅ Limpiar todos ("Limpiar Filtros")
- [ ] ✅ Contador dinámico
- [ ] ✅ Empty state
- [ ] ✅ Responsive (móvil/tablet/desktop)
- [ ] ✅ Acciones tabla preservadas
- [ ] ✅ No hay errores en console

---

## 📞 Si Algo No Funciona

### Checklist de Debug

1. **Verificar console:**
   ```
   F12 → Console tab
   Buscar: errors (rojo)
   Buscar: warnings (amarillo)
   ```

2. **Limpiar cache:**
   ```bash
   # En terminal
   rm -rf node_modules/.cache
   npm start
   ```

3. **Verificar VPN:**
   ```
   Si filtra pero no ve datos → VPN podría estar inactivo
   Backend debe estar corriendo en puerto 8080
   ```

4. **Network requests:**
   ```
   F12 → Network tab
   Tipear en DNI
   Debe NOT ver request al servidor (es filtro client-side)
   Debe ver cambios inmediatos en tabla
   ```

---

## 🎓 Notas Técnicas

### Por qué funciona:
- ✅ Filtros son **client-side** (sin backend calls)
- ✅ Datos ya están en memoria (`ultimas3`)
- ✅ Filtrado es O(n) - muy rápido
- ✅ useMemo optimiza re-renders
- ✅ Usa `fechaEnvio` real (no "Hace 2h" string)

### Performance optimization:
```javascript
const datosFiltrados = useMemo(() => {
  // Solo recalcula cuando cambian estos:
  return aplicarFiltrosCombinados(...);
}, [datosOriginales, filtroDNI, filtroFecha]); // ← dependencies
```

---

## ✨ Conclusión

**Los filtros están completos, compilados y listos para testing.**

Todos los casos de uso médicos están cubiertos:
- ✅ Buscar paciente por DNI
- ✅ Filtrar cargas por fecha
- ✅ Búsquedas combinadas
- ✅ UI profesional (azul médico)
- ✅ Responsive (móvil a desktop)

**Próximo paso:** Abre el navegador y ¡prueba los filtros! 🚀

