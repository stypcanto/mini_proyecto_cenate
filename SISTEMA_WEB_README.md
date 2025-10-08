# 🏥 Sistema Web CENATE - Documentación Completa

## 📋 Descripción del Proyecto

Sistema web completo para el Centro Nacional de Telemedicina (CENATE) de EsSalud, que incluye:

- **Página de Inicio (Home)** con información institucional
- **Sistema de Autenticación** con login de usuarios
- **Gestión de Pacientes**
- **Formulario de Transferencia de Exámenes de Laboratorio**
- **Sistema de Roles** (Superadmin, Administrador, Usuario)

---

## 🗂️ Estructura del Proyecto Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header_template.jsx        ✅ NUEVO
│   │   ├── Footer/
│   │   │   └── Footer_azul.jsx            ✅ NUEVO
│   │   ├── ConfirmDialog.jsx              ✅
│   │   ├── ExamenModal.jsx                ✅
│   │   └── PacienteCard.jsx               ✅
│   ├── pages/
│   │   ├── Home.jsx                       ✅ NUEVO
│   │   ├── Login.jsx                      ✅ NUEVO
│   │   ├── PacientesPage.jsx              ✅
│   │   └── TransferenciaExamenesPage.jsx  ✅
│   ├── Server/
│   │   └── Api.js                         ✅ NUEVO
│   ├── api/
│   │   └── examenes.js                    ✅
│   ├── hooks/
│   │   └── useExamenes.js                 ✅
│   └── App.js                             🔄 ACTUALIZADO
```

---

## 🚀 Instalación Rápida

### Paso 1: Instalar Dependencias

```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend
npm install
```

### Paso 2: Ejecutar en Desarrollo

```bash
npm start
```

Abre tu navegador en `http://localhost:3000`

---

## 🌐 Rutas Disponibles

### 📄 Rutas Públicas (sin login)

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio con información de CENATE |
| `/login` | Página de inicio de sesión |

### 🔒 Rutas Protegidas (requieren login)

| Ruta | Descripción | Roles |
|------|-------------|-------|
| `/pacientes` | Gestión de pacientes | Todos |
| `/transferencia-examenes` | Transferencia de exámenes | Todos |
| `/superadmin` | Panel de administración | Superadmin, Administrador |
| `/portaladmin` | Portal de usuario | Usuario |

---

## 🔐 Sistema de Autenticación

### Cómo Funciona

1. **Usuario accede a Home** (`/`)
2. **Click en "Iniciar sesión"** → Redirige a `/login`
3. **Ingresa DNI y contraseña**
4. **Frontend envía petición** a `POST /api/auth/login`
5. **Backend valida** y devuelve token + datos de usuario
6. **Frontend guarda** en localStorage:
   - `token`: JWT token
   - `user`: Datos del usuario
7. **Redirige según rol**:
   - Superadmin → `/superadmin`
   - Administrador → `/superadmin`
   - Usuario → `/portaladmin`

### Estructura de la Respuesta del Backend

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "dni": "12345678",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "Usuario"
  }
}
```

---

## 📦 Componentes Creados

### 1. Header_template
- Logo EsSalud + Título + Logo CENATE
- Gradiente azul
- Espacio para botones adicionales

### 2. Footer_azul
- Información de CENATE
- Enlaces rápidos
- Contacto
- Redes sociales

### 3. Home
- Página principal institucional
- Información sobre Telesalud
- Enlaces externos
- Botón "Iniciar sesión"

### 4. Login
- Diseño moderno con gradiente
- Campo DNI (8 dígitos)
- Campo contraseña (con mostrar/ocultar)
- Validaciones
- Loading state
- Links a registro y recuperar contraseña

---

## 🔧 Backend - Endpoints Necesarios

### POST `/api/auth/login`

**Request:**
```json
{
  "dni": "12345678",
  "password": "password123"
}
```

**Response Success:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": 1,
    "dni": "12345678",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "Usuario"
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Credenciales incorrectas"
}
```

---

## 📝 Próximos Pasos

### Frontend ✅ COMPLETADO
- [x] Página Home
- [x] Página Login
- [x] Header y Footer
- [x] Sistema de rutas
- [x] Protección de rutas
- [x] Integración con API (estructura)

### Backend ⏳ PENDIENTE
- [ ] Crear entidad Usuario
- [ ] Crear endpoints de autenticación
- [ ] Implementar JWT
- [ ] Configurar Spring Security
- [ ] Crear tabla usuarios en PostgreSQL

### Por Implementar
- [ ] Página de Registro
- [ ] Página de Recuperar Contraseña
- [ ] Panel de Superadmin
- [ ] Portal de Usuario
- [ ] Cerrar sesión

---

## 🐳 Docker

### Reconstruir Frontend

```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate
docker-compose build --no-cache frontend
docker-compose up -d
```

### Ver Logs

```bash
docker logs cenate-frontend -f
```

---

## 🎨 Diseño y Estilos

### Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Azul Oscuro | #0a5ba9 | Primario |
| Azul Medio | #1d4f8a | Secundario |
| Azul Claro | #2e63a6 | Terciario |
| Azul Muy Claro | #def4fe | Fondos |
| Gris | #252546 | Hover |

### Tipografía
- Font: Sistema (sans-serif)
- Títulos: Bold
- Cuerpo: Regular

---

## 📱 Responsive

Todas las páginas son responsive y se adaptan a:
- 📱 Móviles (< 768px)
- 💻 Tablets (768px - 1024px)
- 🖥️ Desktop (> 1024px)

---

## ✨ Características Implementadas

### Home
- [x] Header con logos
- [x] Botón de login
- [x] Tarjeta de presentación
- [x] Información de Telesalud
- [x] Enlaces externos
- [x] Footer completo

### Login
- [x] Validación de DNI (8 dígitos)
- [x] Mostrar/ocultar contraseña
- [x] Loading state
- [x] Mensajes de error
- [x] Redirección por rol
- [x] Links adicionales

### Sistema
- [x] Rutas protegidas
- [x] Verificación de token
- [x] Verificación de rol
- [x] LocalStorage para sesión

---

## 🔒 Seguridad

### Frontend
- Validación de formularios
- Protección de rutas
- Verificación de token
- Verificación de roles
- No exponer información sensible

### Backend (Por Implementar)
- Hash de contraseñas (BCrypt)
- JWT tokens
- CORS configurado
- Validación de datos
- Rate limiting

---

## 📞 Soporte

Para cualquier duda o problema:
- Revisar logs: `docker logs cenate-frontend`
- Consola del navegador: F12 → Console
- Verificar que backend esté corriendo en puerto 8080

---

## 📄 Licencia

© 2025 CENATE - EsSalud. Todos los derechos reservados.

---

**Última actualización:** 08/10/2025  
**Versión:** 2.0  
**Estado:** Frontend ✅ | Backend ⏳
