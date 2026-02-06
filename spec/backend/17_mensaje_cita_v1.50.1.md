# Mensaje de Cita v1.50.1 - Notificación al Paciente

**Fecha:** 2026-02-06
**Versión:** v1.50.1
**Estado:** ✅ Implementado

---

## 📋 Descripción

Sistema de generación y envío de mensajes de cita a pacientes con formato profesional. Soporta múltiples canales:
- **WhatsApp** (por defecto)
- **SMS** (versión corta)
- **Email**

---

## 🎯 Objetivo

Notificar al paciente sobre su cita programada con todos los detalles necesarios (médico, especialidad, fecha, hora) en un formato profesional con información legal requerida por CENATE.

---

## 📝 Formato del Mensaje

```
Estimado asegurado(a): HUAMAN ROMERO EZEQUIEL
Recuerde estar pendiente 30 minutos antes de su cita virtual:

👩🏻 MEDICO/LICENCIADO: Dr. ALEGRIA EDMUNDO
⚕️ ESPECIALIDAD: MED.INTERNA
🗓️ DIA: sábado, 07 de febrero
⏰ HORA REFERENCIAL: 10:00 a 11:55

IMPORTANTE: Usted va a ser atendido por el Centro Nacional de Telemedicina (CENATE) - ESSALUD, por su seguridad las atenciones están siendo grabadas.
*Usted autoriza el tratamiento de sus datos personales afines a su atención por Telemedicina.
*Recuerde que se le llamará hasta 24 horas antes para confirmar su cita.
*Recuerde estar pendiente media hora antes de su cita.

El profesional se comunicará con usted a través del siguiente número: 01 2118830

Atte. Centro Nacional de Telemedicina
CENATE de Essalud
```

---

## 🏗️ Arquitectura

### Utilidades

**Clase:** `MensajeCitaFormatter.java`
- Responsable de generar el mensaje formateado
- Métodos estáticos para máxima reutilización
- Soporta locale Perú (es_PE)
- Formatea fechas en español (día de semana, mes completo)

**Métodos principales:**
```java
// Genera mensaje completo con hora fin
generarMensajeCita(
    String nombrePaciente,
    String nombreMedico,
    String especialidad,
    LocalDate fechaAtencion,
    LocalTime horaAtencion,
    LocalTime horaFin
)

// Genera mensaje automáticamente con hora fin +55 minutos
generarMensajeCita(
    String nombrePaciente,
    String nombreMedico,
    String especialidad,
    LocalDate fechaAtencion,
    LocalTime horaAtencion
)

// Genera solo sección de datos de cita (modular)
generarSeccionCita(...)

// Versión para WhatsApp (con formato especial si aplica)
generarMensajeCitaWhatsApp(...)
```

### DTOs

**Entrada:** `EnviarMensajeCitaRequest.java`
```java
{
    "idSolicitud": 12345,
    "nombrePaciente": "HUAMAN ROMERO EZEQUIEL",
    "telefonoPaciente": "987654321",      // o "51987654321"
    "nombreMedico": "Dr. ALEGRIA EDMUNDO",
    "especialidad": "MED.INTERNA",
    "fechaAtencion": "2026-02-07",
    "horaAtencion": "10:00",
    "horaFin": "11:55",                   // opcional, se calcula si no viene
    "canal": "WHATSAPP",                  // WHATSAPP | SMS | EMAIL (default: WHATSAPP)
    "emailPaciente": "paciente@email.com", // solo si canal=EMAIL
    "enviarAlCoordinador": false,          // enviar copia al coordinador
    "emailCoordinador": "coord@email.com",  // solo si enviarAlCoordinador=true
    "notasAdicionales": "..."             // notas opcionales
}
```

**Salida:** `EnviarMensajeCitaResponse.java`
```java
{
    "idSolicitud": 12345,
    "exitoso": true,
    "mensaje": "Mensaje enviado correctamente",
    "idEnvio": "WA-550e8400-e29b-41d4-a716-446655440000",
    "canal": "WHATSAPP",
    "destinatario": "51987654321",
    "enviadoAlCoordinador": false,
    "timestamp": "2026-02-06T10:30:45.123Z",
    "contenidoMensaje": "Estimado asegurado(a): ..."
}
```

### Servicio

**Interfaz:** `MensajeCitaService.java`
- Define contrato para envío de mensajes
- Extensible para múltiples implementaciones

**Implementación:** `MensajeCitaServiceImpl.java`
- Orquesta el envío según canal especificado
- Normaliza teléfonos peruanos (agrega código de país)
- Genera versión corta para SMS (máx 160 caracteres)
- Logged detallado para auditoría

### Controller

**Ruta base:** `/api/citas/mensaje`

**Endpoints:**

#### 1. Envío Automático (detecta canal)
```
POST /api/citas/mensaje/enviar
Body: EnviarMensajeCitaRequest
Response: EnviarMensajeCitaResponse
Status: 200 (exitoso) | 400 (error)
```

#### 2. Envío por WhatsApp
```
POST /api/citas/mensaje/enviar/whatsapp
Body: EnviarMensajeCitaRequest (canal ignorado, siempre WhatsApp)
Response: EnviarMensajeCitaResponse
```

#### 3. Envío por SMS
```
POST /api/citas/mensaje/enviar/sms
Body: EnviarMensajeCitaRequest
Response: EnviarMensajeCitaResponse (mensaje acortado)
```

#### 4. Envío por Email
```
POST /api/citas/mensaje/enviar/email
Body: EnviarMensajeCitaRequest (requiere emailPaciente)
Response: EnviarMensajeCitaResponse
```

#### 5. Vista Previa (sin enviar)
```
POST /api/citas/mensaje/preview
Body: EnviarMensajeCitaRequest
Response:
{
    "contenido_mensaje": "Estimado asegurado(a): ...",
    "canal": "WHATSAPP",
    "destino": "987654321"
}
```

---

## 🔐 Seguridad

**Autenticación:** Bearer token JWT requerido

**Autorización:** Solo roles:
- `COORDINADOR`
- `COORDINADOR_GESTION_CITAS`
- `MEDICO`
- `ADMIN`

**Validación:**
- Todos los campos requeridos validados con `@Valid` + Jakarta validation
- Teléfono normalizado automáticamente
- Email validado si se proporciona
- Fecha y hora validadas (no pueden ser pasadas)

---

## 📚 Ejemplos de Uso

### 1. Enviar por WhatsApp (JavaScript/Frontend)

```javascript
const enviarMensajeCita = async () => {
    const request = {
        idSolicitud: 12345,
        nombrePaciente: "HUAMAN ROMERO EZEQUIEL",
        telefonoPaciente: "987654321",  // sin código de país, se agrega auto
        nombreMedico: "Dr. ALEGRIA EDMUNDO",
        especialidad: "MED.INTERNA",
        fechaAtencion: "2026-02-07",
        horaAtencion: "10:00",
        horaFin: "11:55",
        canal: "WHATSAPP"
    };

    try {
        const response = await fetch('/api/citas/mensaje/enviar/whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(request)
        });

        const respuesta = await response.json();

        if (respuesta.exitoso) {
            console.log('✅ Mensaje enviado!');
            console.log('ID Envío:', respuesta.idEnvio);
            console.log('Destinatario:', respuesta.destinatario);
        } else {
            console.error('❌ Error:', respuesta.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
```

### 2. Vista Previa antes de Enviar

```javascript
const previsualizarMensaje = async (request) => {
    const response = await fetch('/api/citas/mensaje/preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
    });

    const preview = await response.json();
    console.log(preview.contenido_mensaje);
    // Mostrar en modal para confirmación
};
```

### 3. Enviar por Email

```javascript
const request = {
    idSolicitud: 12345,
    nombrePaciente: "HUAMAN ROMERO EZEQUIEL",
    emailPaciente: "paciente@example.com",
    nombreMedico: "Dr. ALEGRIA EDMUNDO",
    especialidad: "MED.INTERNA",
    fechaAtencion: "2026-02-07",
    horaAtencion: "10:00",
    canal: "EMAIL"
};

fetch('/api/citas/mensaje/enviar/email', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
})
.then(r => r.json())
.then(respuesta => {
    if (respuesta.exitoso) {
        toast.success(`Email enviado a ${respuesta.destinatario}`);
    }
});
```

### 4. Con React Hook

```jsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function EnviarMensajeCitaForm({ solicitud }) {
    const [step, setStep] = useState('preview'); // preview | confirmar | enviado

    const enviarMutation = useMutation({
        mutationFn: async (request) => {
            const response = await fetch('/api/citas/mensaje/enviar/whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(request)
            });
            return response.json();
        },
        onSuccess: (data) => {
            if (data.exitoso) {
                toast.success('✅ Mensaje enviado correctamente');
                setStep('enviado');
            } else {
                toast.error('❌ Error: ' + data.mensaje);
            }
        }
    });

    const handleEnviar = () => {
        const request = {
            idSolicitud: solicitud.id,
            nombrePaciente: solicitud.pacienteNombre,
            telefonoPaciente: solicitud.pacienteTelefono,
            nombreMedico: solicitud.nombreMedico,
            especialidad: solicitud.especialidad,
            fechaAtencion: solicitud.fechaAtencion,
            horaAtencion: solicitud.horaAtencion,
            horaFin: solicitud.horaFin
        };

        enviarMutation.mutate(request);
    };

    return (
        <div>
            {step === 'preview' && (
                <button onClick={() => setStep('confirmar')}>
                    Ver Vista Previa
                </button>
            )}
            {step === 'confirmar' && (
                <button
                    onClick={handleEnviar}
                    disabled={enviarMutation.isPending}
                >
                    {enviarMutation.isPending ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
            )}
            {step === 'enviado' && (
                <div className="text-green-600">✅ Mensaje enviado</div>
            )}
        </div>
    );
}
```

---

## 📊 Mapeo de Columnas

| Campo del Mensaje | Fuente en BD | Tabla | Columna |
|--|--|--|--|
| Nombre Paciente | `pacienteNombre` | `dim_solicitud_bolsa` | `paciente_nombre` |
| Teléfono | `pacienteTelefono` | `dim_solicitud_bolsa` | `paciente_telefono` |
| Email | `pacienteEmail` | `dim_solicitud_bolsa` | `paciente_email` |
| Nombre Médico | `nomPers` + `apePaterPers` | `dim_personal_cnt` | `nom_pers` + `ape_pater_pers` |
| Especialidad | `especialidad` | `dim_solicitud_bolsa` | `especialidad` |
| Fecha Cita | `fechaAtencion` | `dim_solicitud_bolsa` | `fecha_atencion` |
| Hora Cita | `horaAtencion` | `dim_solicitud_bolsa` | `hora_atencion` |

---

## 🔄 Flujo de Integración

### Con GestionAsegurado.jsx

1. Usuario hace click en botón "Enviar Mensaje" en tabla
2. Se abre modal con vista previa del mensaje
3. Usuario confirma o cancela
4. Si confirma: llamar a `/api/citas/mensaje/enviar/whatsapp`
5. Toast minimalista confirma envío
6. Guardar en auditoría para tracking

### Datos necesarios para el request:

```javascript
// Desde el paciente en la tabla
{
    idSolicitud: paciente.idSolicitud,
    nombrePaciente: paciente.pacienteNombre,
    telefonoPaciente: paciente.pacienteTelefono,
    emailPaciente: paciente.pacienteEmail,

    // Desde el médico asignado
    nombreMedico: paciente.nombreMedico,
    especialidad: paciente.especialidad,

    // Desde la cita
    fechaAtencion: paciente.fechaAtencion,
    horaAtencion: paciente.horaAtencion,
    horaFin: paciente.horaFin,

    // Por defecto
    canal: 'WHATSAPP'
}
```

---

## 📋 Checklist de Implementación

- ✅ Utilidad `MensajeCitaFormatter.java` creada
- ✅ DTOs `EnviarMensajeCitaRequest.java` y `Response.java` creados
- ✅ Servicio `MensajeCitaService` interfaz + implementación creados
- ✅ Controller `MensajeCitaController.java` creado con 5 endpoints
- ✅ Backend compilación exitosa
- ⏳ **Próximo:** Integrar con frontend en `GestionAsegurado.jsx`
- ⏳ **Próximo:** Integrar API de WhatsApp (Twilio/Meta Business API)
- ⏳ **Próximo:** Tests unitarios del servicio

---

## 🚀 Próximas Fases

### Fase 1: Integración Frontend (v1.50.2)
- Agregar botón "Enviar Mensaje" en tabla
- Crear modal con vista previa
- Implementar llamada al API
- Toast de confirmación

### Fase 2: Integración WhatsApp (v1.50.3)
- Registrarse en Twilio o Meta Business API
- Implementar envío real de WhatsApp
- Tests con teléfonos reales
- Rate limiting y retry logic

### Fase 3: Mejoras (v1.50.4+)
- Agregar SMS fallback
- Soporte para Email
- Historial de mensajes enviados
- Plantillas customizables
- Envío programado (agendar para después)

---

## 🔗 Archivos Creados

```
backend/src/main/java/com/styp/cenate/
├── utils/
│   └── MensajeCitaFormatter.java         (Generador de mensajes)
├── dto/chatbot/
│   ├── EnviarMensajeCitaRequest.java     (DTO entrada)
│   └── EnviarMensajeCitaResponse.java    (DTO salida)
├── service/citas/
│   ├── MensajeCitaService.java           (Interfaz)
│   └── MensajeCitaServiceImpl.java        (Implementación)
└── api/chatbot/
    └── MensajeCitaController.java         (Endpoints REST)
```

---

## 📖 Referencias

- [Normalización de teléfonos Perú](#) - Código de país 51, 9 dígitos
- [Twilio WhatsApp API](#) - Para envío real
- [DateTimeFormatter Java](#) - Formateo de fechas en español

---

**Versión:** v1.50.1
**Compilación:** ✅ BUILD SUCCESSFUL
**Estado:** Listo para integración frontend
