# 🚀 Cheat Sheet - Mesa de Ayuda (v1.64.0)

## ⚡ Respuestas Rápidas

### ¿Cuántas tablas hay?
**3 tablas:**
- `dim_motivos_mesadeayuda` - Catálogo (7 motivos fijos)
- `dim_ticket_mesa_ayuda` - Transaccional (tickets creados)
- `dim_secuencia_tickets` - Numeración (contador por año)

### ¿Se fusionaron o eliminaron tablas?
**NO.** Las 3 tablas existen y se usan todas. Son independientes pero relacionadas.

### ¿Qué relación tienen?
```
dim_motivos_mesadeayuda
         │
         │ 1:N (Un motivo → Muchos tickets)
         │ FK: id_motivo
         ▼
dim_ticket_mesa_ayuda
         │
         │ Genera números
         │
         ▼
dim_secuencia_tickets
```

### ¿Cómo se genera el número de ticket?
```
Format: XXX-YYYY (ej: 001-2026, 002-2026, 003-2026)
  ├─ XXX = Contador (001 a 999)
  └─ YYYY = Año (2026, 2027, etc.)

Algoritmo:
  1. Obtener año actual
  2. Buscar registro en dim_secuencia_tickets WHERE anio = 2026
  3. UPDATE contador = contador + 1 (NATIVE SQL - ATOMIC)
  4. numeroTicket = String.format("%03d-%04d", contador, year)
```

### ¿Cuál es el número máximo de tickets por año?
**999** (formato XXX = 001 a 999)
- Si exceedes 999, necesitas lógica adicional
- Generalmente: 100-500 tickets/año es realista

### ¿Qué pasa si se intenta crear el mismo ticket dos veces?
```sql
UNIQUE constraint en numero_ticket → Error
Cada ticket obtiene número único garantizado
No hay duplicados posibles
```

### ¿Se pueden eliminar motivos?
```
Sí, pero con cuidado:
  ├─ ON DELETE SET NULL en FK
  ├─ Tickets existentes no se borran
  ├─ Solo id_motivo se pone en NULL
  └─ Mejor: marcar como inactivo (activo=FALSE)
```

### ¿Se pueden modificar las observaciones?
```
Sí, es un campo de texto libre.
Mejor práctica: guardar historial si necesario.
```

### ¿Es thread-safe?
**SÍ.** Usa UPDATE nativo en SQL:
```sql
UPDATE dim_secuencia_tickets
SET contador = contador + 1
WHERE anio = 2026
```
No es read-modify-write (evita race conditions)

---

## 📊 Endpoints API

### Obtener Motivos
```
GET /api/mesa-ayuda/motivos
Public: ✅ SÍ
Auth: ❌ NO requerida
Respuesta:
  [
    { id: 1, codigo: "PS_CITAR_ADICIONAL", descripcion: "..." },
    { id: 2, codigo: "PS_ACTUALIZAR_LISTADO", descripcion: "..." },
    ...
  ]
```

### Crear Ticket
```
POST /api/mesa-ayuda/tickets
Auth: ✅ SÍ requerida
Body:
  {
    idMotivo: 1,
    observaciones: "texto opcional",
    prioridad: "MEDIA",
    idMedico: 123,
    nombreMedico: "Dr. Pérez",
    dniPaciente: "12345678",
    nombrePaciente: "Juan García",
    especialidad: "Cardiología",
    ipress: "IPRESS CENTRAL",
    idSolicitudBolsa: 456
  }
Respuesta:
  {
    id: 1,
    numeroTicket: "001-2026",
    titulo: "PROFESIONAL DE SALUD...",
    idMotivo: 1,
    nombreMotivo: "...",
    observaciones: "...",
    estado: "ABIERTO",
    prioridad: "MEDIA",
    fechaCreacion: "2026-02-19T12:30:45"
  }
```

---

## 💻 Código Rápido

### En Frontend - Obtener motivos
```javascript
// mesaAyudaService.js
export const obtenerMotivos = async () => {
  const response = await axiosInstance.get('/mesa-ayuda/motivos');
  return response.data;
}

// En componente
useEffect(() => {
  mesaAyudaService.obtenerMotivos()
    .then(motivos => setMotivos(motivos))
    .catch(err => setError(err));
}, [isOpen]);
```

### En Frontend - Crear ticket
```javascript
const handleSubmit = async () => {
  const ticketData = {
    idMotivo: 1,
    observaciones: "...",
    prioridad: "MEDIA",
    idMedico: 123,
    // ... más datos
  };

  const response = await mesaAyudaService.crearTicket(ticketData);
  console.log("Ticket creado:", response.numeroTicket); // "001-2026"
}
```

### En Backend - Service
```java
@Service
public class TicketMesaAyudaService {

  // Obtener motivos para dropdown
  public List<MotivoMesaAyudaDTO> obtenerMotivos() {
    return motivoRepository.findByActivoTrueOrderByOrdenAsc()
      .stream()
      .map(m -> MotivoMesaAyudaDTO.builder()
        .id(m.getId())
        .descripcion(m.getDescripcion())
        .build())
      .collect(Collectors.toList());
  }

  // Crear ticket
  public TicketMesaAyudaResponseDTO crearTicket(
      TicketMesaAyudaRequestDTO request) {

    // 1. Validar motivo
    DimMotivosMesaAyuda motivo =
      motivoRepository.findById(request.getIdMotivo())
        .orElseThrow();

    // 2. Generar número
    String numeroTicket = generarNumeroTicket();

    // 3. Crear y guardar
    DimTicketMesaAyuda ticket = DimTicketMesaAyuda.builder()
      .numeroTicket(numeroTicket)
      .idMotivo(request.getIdMotivo())
      .titulo(motivo.getDescripcion())
      .observaciones(request.getObservaciones())
      .estado("ABIERTO")
      .build();

    return toResponseDTO(ticketRepository.save(ticket));
  }

  // Generar número (THREAD-SAFE)
  private String generarNumeroTicket() {
    int year = LocalDateTime.now().getYear();

    Optional<DimSecuenciaTickets> seq =
      secuenciaRepository.findByAnio(year);

    if (seq.isEmpty()) {
      secuenciaRepository.save(
        DimSecuenciaTickets.builder()
          .anio(year)
          .contador(0)
          .build()
      );
    }

    // ATOMIC UPDATE
    secuenciaRepository.incrementarContador(year);

    DimSecuenciaTickets secActualizada =
      secuenciaRepository.findByAnio(year).get();

    return String.format("%03d-%04d",
      secActualizada.getContador(), year);
  }
}
```

### En BD - Consultas útiles
```sql
-- Obtener todos los motivos activos
SELECT id, descripcion FROM dim_motivos_mesadeayuda
WHERE activo = TRUE ORDER BY orden;

-- Obtener tickets de un médico
SELECT * FROM dim_ticket_mesa_ayuda
WHERE id_medico = 123 AND deleted_at IS NULL
ORDER BY fecha_creacion DESC;

-- Obtener ticket por número
SELECT * FROM dim_ticket_mesa_ayuda
WHERE numero_ticket = '001-2026';

-- Contador actual del año
SELECT contador FROM dim_secuencia_tickets
WHERE anio = 2026;

-- Tickets por motivo
SELECT id_motivo, COUNT(*) as total
FROM dim_ticket_mesa_ayuda
GROUP BY id_motivo;

-- Próximo número que se asignará
SELECT
  anio,
  contador + 1 as proximo_numero,
  CONCAT(LPAD(contador + 1, 3, '0'), '-', anio) as proximo_ticket
FROM dim_secuencia_tickets
WHERE anio = 2026;
```

---

## 🔒 Seguridad

### ¿Quién puede crear tickets?
Médicos con rol `MEDICO` (controlado por `@PreAuthorize`)

### ¿Es público el endpoint de motivos?
SÍ (en SecurityConfig está en `permitAll()`)
Motivo: Frontend necesita cargarlos sin JWT

### ¿Se valida el motivo?
SÍ. Debe existir en `dim_motivos_mesadeayuda` y estar activo

### ¿Se puede cambiar el título del ticket?
NO. Se auto-genera desde la descripción del motivo
(Esto garantiza consistencia)

---

## 📈 Performance

### Índices
```sql
idx_motivos_activo             ✓ Búsqueda de motivos activos
idx_motivos_orden              ✓ Ordenamiento
idx_ticket_mesa_numero         ✓ Búsqueda por número de ticket
idx_ticket_mesa_estado         ✓ Filtro por estado
idx_ticket_mesa_medico         ✓ Buscar tickets del médico
idx_ticket_mesa_fecha_creacion ✓ Ordenar cronológicamente
idx_secuencia_tickets_anio     ✓ Búsqueda por año
```

### Consultas optimizadas
```
✓ Motivos: findByActivoTrueOrderByOrdenAsc() (INDEX)
✓ Tickets: findAllByDeletedAtIsNullOrderByFechaCreacionDesc() (INDEX)
✓ Secuencia: findByAnio() (INDEX)
✓ Incremento: UPDATE nativo (ATOMIC)
```

### Tiempo estimado por operación
```
GET /api/mesa-ayuda/motivos     ~50ms (7 registros)
POST /api/mesa-ayuda/tickets    ~100ms (con número generado)
```

---

## 🐛 Troubleshooting

### Problema: "Motivo no encontrado"
```
Solución: Verificar que id_motivo existe en dim_motivos_mesadeayuda
y que activo = TRUE
```

### Problema: "Número de ticket duplicado"
```
Imposible (UNIQUE constraint).
Si ocurre: Error en BD, revisar lógica de incremento
```

### Problema: "Endpoint retorna 403"
```
Causas:
  ├─ /motivos no está en permitAll() → Agregar a SecurityConfig
  └─ Token JWT inválido → Refrescar sesión
```

### Problema: "número_ticket no se asigna"
```
Causas:
  ├─ dim_secuencia_tickets no existe → Correr SQL script
  ├─ contador no se incrementa → Revisar UPDATE nativo
  └─ Backend no recompilado → Hacer clean build
```

### Problema: "Número empieza en 1 nuevamente en 2027"
```
Esperado. Algoritmo:
  ├─ 2026: 001-999
  └─ 2027: 001-999 (reinicia)
```

---

## 📋 Tabla Comparativa (2 vs 3 tablas)

| Aspecto | Resultado |
|---------|-----------|
| ¿Se fusionaron? | ❌ NO |
| ¿Se eliminaron? | ❌ NO |
| ¿Ambas se usan? | ✅ SÍ |
| Relación | 1:N (FK) |
| FK column | id_motivo |
| Uso de dim_motivos_mesadeayuda | Dropdown en modal |
| Uso de dim_ticket_mesa_ayuda | Guardar tickets |
| Uso de dim_secuencia_tickets | Generar números |

---

## 🎓 Conceptos Clave

| Término | Significado |
|---------|------------|
| **Catálogo** | dim_motivos_mesadeayuda (datos maestros) |
| **Transaccional** | dim_ticket_mesa_ayuda (datos operacionales) |
| **1:N** | Un motivo → Muchos tickets |
| **FK** | Foreign Key (id_motivo → dim_motivos) |
| **Soft Delete** | deleted_at (no borrar, marcar) |
| **ATOMIC** | Operación indivisible (thread-safe) |
| **UNIQUE** | No permite duplicados en numero_ticket |
| **Índice** | Mejora velocidad de búsqueda |

---

## 🚀 Próximos Pasos

- [ ] Entender la relación 1:N
- [ ] Revisar los 3 diagramas PlantUML
- [ ] Probar crear 3 tickets en el modal
- [ ] Verificar números incrementados (001, 002, 003)
- [ ] Revisar tabla dim_ticket_mesa_ayuda en BD
- [ ] Crear test unitario para generarNumeroTicket()
- [ ] Documentar cambios futuros aquí

---

**Última actualización:** 2026-02-19
**Versión:** v1.64.0-1
