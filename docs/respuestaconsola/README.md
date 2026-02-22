# Guía de Documentación de Respuesta de Consola

Esta guía estandariza cómo documentar consultas frontend-backend vistas en consola para diagnóstico, QA y soporte.

## Objetivo

Registrar de forma clara:
- qué endpoint se consultó,
- qué se envió,
- qué devolvió el backend,
- qué se concluyó.

---

## Estructura recomendada por caso

Usa siempre este orden:

1. Contexto del caso
2. Endpoint consultado
3. Datos enviados
4. Respuesta del backend
5. Evidencia (captura/log)
6. Resultado observado en UI
7. Conclusión y acción

---

## Plantilla rápida (copiar y pegar)

## Caso: [Título corto]

### 1) Contexto
- Fecha/hora:
- Módulo:
- Pantalla/ruta:
- Usuario/rol (si aplica):
- DNI o identificador probado:

### 2) Endpoint consultado
- Método:
- URL:
- Fuente (doc directo / fallback / otro):

### 3) Enviado
```json
{
  "dni": "",
  "otros": ""
}
```

### 4) Devuelto por backend
- HTTP status:
- Body:
```json
{
  "...": "..."
}
```

### 5) Evidencia de consola
- Mensaje de inicio:
- Mensaje de fin:
- Captura adjunta: Sí/No

### 6) Resultado en interfaz
- ¿Qué se mostró?:
- ¿Coincide con backend?: Sí/No

### 7) Conclusión
- Causa probable:
- Acción aplicada:
- ¿Requiere cambio backend/frontend?:

---

## Formato de log sugerido en frontend

Para facilitar trazabilidad en DevTools:

- ***** INICIO CONSULTA DNI *****
- ***** Consulta DNI | fuente | dni | HTTP status *****
- Endpoint:
- Método:
- Enviado:
- Devuelto:
- ***** FIN CONSULTA DNI *****

---

## Logger reutilizable (genérico)

Se cuenta con una utilidad reutilizable para cualquier endpoint:

- Archivo: frontend/src/utils/consoleResponseLogger.js
- Función: logRespuestaConsola

### Parámetros principales

- titulo: texto del bloque (ejemplo: Consulta API, Consulta Usuario, Carga Catálogo)
- endpoint: URL consultada
- method: método HTTP (GET, POST, PUT, DELETE)
- enviado: payload o parámetros enviados
- status: código HTTP
- devuelto: respuesta del backend
- fuente: etiqueta de origen (ejemplo: /usuarios, /catalogos, /asegurados/doc)
- identificador (opcional): referencia principal a mostrar
- etiquetaIdentificador (opcional): etiqueta de esa referencia (por defecto: Ref)
- separador (opcional): delimitador visual (por defecto: *****)

### Notas

- No está atado a DNI.
- Si no se envía identificador, intenta detectar automáticamente en enviado: dni, id, codigo, pk.
- Recomendado para trazabilidad en QA, soporte y depuración funcional.

### Ejemplos de uso

#### 1) Consulta por DNI

logRespuestaConsola({
  titulo: "Consulta DNI",
  endpoint: "/api/asegurados/doc/70073164",
  method: "GET",
  enviado: { dni: "70073164" },
  status: 200,
  devuelto: { edad: 45 },
  fuente: "/asegurados/doc",
  etiquetaIdentificador: "DNI"
});

#### 2) Consulta por ID de usuario

logRespuestaConsola({
  titulo: "Consulta Usuario",
  endpoint: "/api/usuarios/10",
  method: "GET",
  enviado: { id: 10 },
  status: 200,
  devuelto: { id: 10, nombre: "Ana" },
  fuente: "/usuarios",
  etiquetaIdentificador: "ID"
});

#### 3) Crear registro (POST)

logRespuestaConsola({
  titulo: "Crear Solicitud",
  endpoint: "/api/solicitudes",
  method: "POST",
  enviado: { codigo: "SOL-001", prioridad: "ALTA" },
  status: 201,
  devuelto: { ok: true, codigo: "SOL-001" },
  fuente: "/solicitudes",
  etiquetaIdentificador: "Código"
});

---

## Checklist mínimo antes de cerrar un caso

- Se probó con DNI válido.
- Se probó con DNI inexistente.
- Se verificó status HTTP y body.
- Se comparó backend vs UI.
- Se dejó evidencia (captura o bloque de log).
- Se documentó conclusión.

---

## Ejemplo breve

### Caso: Edad vacía en modal de Importar Paciente

- Endpoint: GET /api/asegurados/doc/{dni}
- Enviado: dni=70073164
- Devuelto: status 200, body con edad=45
- UI: se muestra "45 años / M"
- Conclusión: OK, backend y frontend alineados.

---

## Convención de nombres de archivos (opcional)

Cuando guardes casos individuales, usa:

`YYYY-MM-DD_modulo_tema.md`

Ejemplo:

`2026-02-22_citas_importar_paciente_dni.md`
