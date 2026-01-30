# 🚀 GUÍA RÁPIDA - Atenciones Clínicas Módulo 107

## Acceso a la Página

**URL**: `http://localhost:3000/bolsas/modulo107/atenciones-clinicas`

O desde el menú lateral:
- Módulo 107 → **Atenciones Clínicas**

---

## 📊 Dashboard de Estadísticas

Al cargar la página, verás 3 tarjetas:

| Tarjeta | Color | Descripción |
|---------|-------|-------------|
| **Total de Atenciones** | 🔵 Azul | Cantidad total de registros |
| **Pendientes** | 🟠 Naranja | Atenciones sin atender |
| **Atendidos** | 🟢 Verde | Atenciones ya atendidas |

---

## 🔍 Sistema de Filtros

### Expandir/Ocultar Filtros
Botón arriba a la derecha: **"Mostrar filtros"** / **"Ocultar filtros"**

### Filtros Disponibles

#### 1️⃣ Búsqueda General (siempre visible)
- **Placeholder**: "Buscar por nombre, DNI o número de solicitud..."
- Busca en: nombre paciente, DNI, número solicitud
- **Actualiza en tiempo real**

#### 2️⃣ Estado
```
Opciones:
├── Todos los estados (default)
├── Pendiente
└── Atendido
```

#### 3️⃣ Tipo de Documento
```
Opciones:
├── Todos (default)
├── DNI
├── Carné de Extranjería
└── Pasaporte (si existen en BD)
```

#### 4️⃣ Documento
- Campo de texto libre
- Ingresa número de DNI, CE o Pasaporte

#### 5️⃣ Fecha Solicitud
- **Desde**: Seleccionar fecha inicio
- **Hasta**: Seleccionar fecha fin
- Ambas son opcionales

#### 6️⃣ Macrorregión
```
Opciones dinámicas según datos:
├── Todas (default)
├── LIMA
├── CALLAO
└── ...otros
```

#### 7️⃣ Red
```
Opciones dinámicas según datos:
├── Todas (default)
├── RED METROPOLITANA
├── RED CALLAO
└── ...otros
```

#### 8️⃣ IPRESS
```
Opciones dinámicas según datos:
├── Todas (default)
├── Hospital Principal
├── Centro Médico Bellavista
└── ...otros
```

#### 9️⃣ Derivación Interna
```
Opciones fijas:
├── Todas (default)
├── MEDICINA CENATE
├── NUTRICION CENATE
└── PSICOLOGIA CENATE
```

### 🧹 Botón Limpiar Filtros
- Reset completo de todos los filtros
- Vuelve a página 1
- Actualiza tabla

---

## 📋 Tabla de Atenciones

### Columnas (12 totales)

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | **ID Solicitud** | Texto | Identificador único (ej: SOL-001) |
| 2 | **Nro Solicitud** | Número | Número secuencial (ej: 001) |
| 3 | **Nombre Paciente** | Texto | Nombre completo |
| 4 | **DNI** | Número | Documento del paciente |
| 5 | **Edad** | Número | Calculada de fecha nacimiento |
| 6 | **Sexo** | Letra | M = Masculino, F = Femenino |
| 7 | **Teléfono** | Número | Contacto del paciente |
| 8 | **IPRESS** | Texto | Centro asistencial |
| 9 | **Derivación** | Badge Morado | MEDICINA / NUTRICION / PSICOLOGIA |
| 10 | **Estado** | Badge Color | 🟠 Pendiente / 🟢 Atendido |
| 11 | **Fecha Solicitud** | Fecha | YYYY-MM-DD |
| 12 | **Acciones** | Botón | Ver (azul) |

### Estados Visuales

**PENDIENTE** (Naranja)
```
┌─────────────┐
│  PENDIENTE  │
└─────────────┘
```

**ATENDIDO** (Verde)
```
┌─────────────┐
│  ATENDIDO   │
└─────────────┘
```

### Derivaciones (Badge Morado)
- MEDICINA CENATE
- NUTRICION CENATE
- PSICOLOGIA CENATE

---

## 📄 Paginación

### Controles
- **Anterior**: Página anterior (deshabilitado en página 1)
- **Números**: Saltar a página específica
- **Siguiente**: Página siguiente (deshabilitado en última página)
- **Info**: "Mostrando X a Y de Z registros"

### Registros por Página
- 25 registros por página (configurable en backend)
- Total de páginas calculado automáticamente

### Ejemplo
```
Página 1: Registros 1-25
Página 2: Registros 26-50
Página 3: Registros 51-75
...
```

---

## 🎯 Casos de Uso Comunes

### 1️⃣ Ver todas las atenciones pendientes
1. Haz clic en "Mostrar filtros"
2. En **Estado**, selecciona "Pendiente"
3. La tabla se actualiza automáticamente

### 2️⃣ Buscar paciente específico
1. En el campo de búsqueda (siempre visible), escribe:
   - Nombre: "Juan"
   - DNI: "12345678"
   - Solicitud: "001"
2. Se filtran los resultados en tiempo real

### 3️⃣ Filtrar por período
1. Haz clic en "Mostrar filtros"
2. En **Fecha Solicitud - Desde**, selecciona 01/01/2026
3. En **Fecha Solicitud - Hasta**, selecciona 31/01/2026
4. Se muestran solo atenciones en ese período

### 4️⃣ Buscar por especialidad
1. En **Derivación Interna**, selecciona "MEDICINA CENATE"
2. Se muestran solo atenciones de esa especialidad

### 5️⃣ Filtro combinado
1. Estado: "PENDIENTE"
2. IPRESS: "Hospital Principal"
3. Derivación: "NUTRICION CENATE"
4. Se aplican todos los filtros simultáneamente

---

## 🎨 Colores y Estilos

### Encabezados
- **Azul oscuro (#0D5BA9)**: Cabecera de tabla, botones primarios

### Estados
- 🔵 **Azul**: Total, información general
- 🟠 **Naranja**: Pendiente, atención requerida
- 🟢 **Verde**: Atendido, completado
- 🟣 **Morado**: Derivación interna
- 🩶 **Gris**: Elementos neutros, deshabilitados

### Hover Effects
- Filas de tabla: Fondo azul claro al pasar mouse
- Botones: Cambio de color al pasar mouse
- Enlaces: Subrayado azul

---

## ⚠️ Mensajes de Estado

### Cargando
```
⏳ Cargando atenciones clínicas...
```

### Sin Resultados
```
⚠️ No se encontraron atenciones 
   con los filtros aplicados
```

### Error
```
❌ Error al cargar los datos de atenciones clínicas
   [Botón Reintentar]
```

---

## 💡 Tips y Trucos

✅ **Búsqueda rápida**: Usa la barra de búsqueda para búsquedas simples

✅ **Filtros avanzados**: Usa múltiples filtros simultáneamente

✅ **Paginación**: Navega entre páginas sin perder los filtros aplicados

✅ **Limpieza**: Botón "Limpiar Filtros" para reset completo

✅ **Datos actualizados**: Actualiza el navegador (F5) para ver cambios desde backend

⚠️ **Rendimiento**: Con muchos registros, usa filtros para limitar resultados

---

## 🔧 Troubleshooting

### Problema: La tabla está vacía
**Solución**: 
1. Verifica que hay datos en la base de datos
2. Haz clic en "Limpiar Filtros"
3. Recarga la página (F5)

### Problema: Los filtros no funcionan
**Solución**:
1. Verifica que escribes correctamente (sensible a mayúsculas en algunos casos)
2. Intenta limpiar filtros y aplicarlos uno a uno
3. Abre consola (F12) para ver errores

### Problema: Paginación congelada
**Solución**:
1. Recarga la página
2. Vuelve a aplicar filtros
3. Navega a página 1 primero

---

## 📞 Contacto y Soporte

- **Módulo**: Atenciones Clínicas - Módulo 107
- **Versión**: 2.0.0
- **Última actualización**: 30 Enero 2026
- **Desarrollador**: CENATE

---

**¡Listo para usar!** 🎉

