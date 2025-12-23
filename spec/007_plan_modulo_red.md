# Plan de Accion: Modulo de Red para Coordinadores

> **Fecha:** 2025-12-23
> **Version:** 1.0
> **Estado:** Pendiente de implementacion
> **Prioridad:** Alta

---

## 1. Objetivo

Crear un modulo exclusivo para **Coordinadores de Red** que les permita visualizar:
- Personal Externo de las IPRESS de su red asignada
- Formularios de Diagnostico de su red
- Estadisticas consolidadas

---

## 2. Alcance

### Incluye:
- Nuevo rol `COORDINADOR_RED`
- Campo `id_red` en tabla de usuarios
- Modulo y pagina en menu dinamico
- Endpoints de backend para dashboard
- Pagina frontend con tabs y estadisticas

### No Incluye:
- Edicion de datos (solo lectura)
- Aprobacion de formularios
- Gestion de IPRESS

---

## 3. Tareas de Implementacion

### 3.1 Base de Datos (SQL)

**Archivo a crear:** `spec/scripts/003_modulo_red_coordinador.sql`

```sql
-- ============================================================
-- Script: Modulo de Red para Coordinadores
-- Fecha: 2025-12-23
-- ============================================================

-- 1. AGREGAR CAMPO id_red A USUARIOS
-- ============================================================
ALTER TABLE dim_usuarios ADD COLUMN IF NOT EXISTS id_red BIGINT;

-- Agregar foreign key (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_usuarios_red'
    ) THEN
        ALTER TABLE dim_usuarios
        ADD CONSTRAINT fk_usuarios_red
        FOREIGN KEY (id_red) REFERENCES dim_red(id_red);
    END IF;
END $$;

-- Indice para optimizacion
CREATE INDEX IF NOT EXISTS idx_usuarios_red ON dim_usuarios(id_red);

-- 2. CREAR ROL COORDINADOR_RED
-- ============================================================
INSERT INTO dim_roles (desc_rol, stat_rol, activo, nivel_jerarquia)
VALUES ('COORDINADOR_RED', 'A', true, 4)
ON CONFLICT (desc_rol) DO NOTHING;

-- 3. CREAR MODULO "Gestion de Red"
-- ============================================================
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion, icono, orden, activo, created_at, updated_at)
VALUES (
    'Gestion de Red',
    'Modulo para coordinadores de red asistencial',
    'Network',
    16,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre_modulo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    updated_at = NOW();

-- 4. CREAR PAGINA "Mi Red"
-- ============================================================
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at)
SELECT
    id_modulo,
    'Mi Red',
    '/red/dashboard',
    'Dashboard de la red asistencial',
    1,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'Gestion de Red'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    updated_at = NOW();

-- 5. PERMISOS PARA COORDINADOR_RED (solo ver y exportar)
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar,
    puede_exportar, puede_importar, puede_aprobar,
    activo, created_at, updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    false,  -- puede_editar
    false,  -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_importar
    false,  -- puede_aprobar
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'COORDINADOR_RED'
AND p.ruta_pagina = '/red/dashboard'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = EXCLUDED.puede_ver,
    puede_exportar = EXCLUDED.puede_exportar,
    updated_at = NOW();

-- 6. PERMISOS PARA SUPERADMIN Y ADMIN (acceso completo)
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar,
    puede_exportar, puede_importar, puede_aprobar,
    activo, created_at, updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true, true, true, true, true, true, true,
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol IN ('SUPERADMIN', 'ADMIN')
AND p.ruta_pagina = '/red/dashboard'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true,
    puede_eliminar = true,
    puede_exportar = true,
    updated_at = NOW();

-- 7. VERIFICACION
-- ============================================================
-- SELECT * FROM dim_roles WHERE desc_rol = 'COORDINADOR_RED';
-- SELECT * FROM dim_modulos_sistema WHERE nombre_modulo = 'Gestion de Red';
-- SELECT * FROM dim_paginas_modulo WHERE ruta_pagina = '/red/dashboard';
-- SELECT r.desc_rol, p.ruta_pagina, prp.*
-- FROM segu_permisos_rol_pagina prp
-- JOIN dim_roles r ON prp.id_rol = r.id_rol
-- JOIN dim_paginas_modulo p ON prp.id_pagina = p.id_pagina
-- WHERE p.ruta_pagina = '/red/dashboard';
```

**Comando de ejecucion:**
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/003_modulo_red_coordinador.sql
```

---

### 3.2 Backend - Modificar Usuario.java

**Archivo:** `backend/src/main/java/com/styp/cenate/model/Usuario.java`

**Agregar relacion con Red:**
```java
// Importar
import com.styp.cenate.model.Red;

// Agregar campo (despues de los otros campos)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "id_red")
private Red red;

// Agregar getter
public Long getIdRed() {
    return red != null ? red.getId() : null;
}

public Red getRed() {
    return red;
}

public void setRed(Red red) {
    this.red = red;
}
```

---

### 3.3 Backend - Crear DTO

**Archivo a crear:** `backend/src/main/java/com/styp/cenate/dto/red/RedDashboardResponse.java`

```java
package com.styp.cenate.dto.red;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedDashboardResponse {

    private RedInfo red;
    private Estadisticas estadisticas;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RedInfo {
        private Long id;
        private String codigo;
        private String nombre;
        private String macroregion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Estadisticas {
        private Long totalIpress;
        private Long totalPersonalExterno;
        private Long totalFormularios;
        private Long formulariosEnProceso;
        private Long formulariosEnviados;
        private Long formulariosAprobados;
    }
}
```

---

### 3.4 Backend - Crear Service

**Archivo a crear:** `backend/src/main/java/com/styp/cenate/service/red/RedDashboardService.java`

```java
package com.styp.cenate.service.red;

import com.styp.cenate.dto.red.RedDashboardResponse;
import com.styp.cenate.dto.PersonalExternoResponse;
import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import java.util.List;

public interface RedDashboardService {
    RedDashboardResponse obtenerDashboard();
    List<PersonalExternoResponse> obtenerPersonalExterno();
    List<FormDiagListResponse> obtenerFormularios();
}
```

**Archivo a crear:** `backend/src/main/java/com/styp/cenate/service/red/impl/RedDashboardServiceImpl.java`

```java
package com.styp.cenate.service.red.impl;

import com.styp.cenate.dto.red.RedDashboardResponse;
import com.styp.cenate.dto.PersonalExternoResponse;
import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.Red;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.personal.PersonalExternoRepository;
import com.styp.cenate.repository.formdiag.FormDiagFormularioRepository;
import com.styp.cenate.service.red.RedDashboardService;
import com.styp.cenate.service.formdiag.FormDiagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedDashboardServiceImpl implements RedDashboardService {

    private final UsuarioRepository usuarioRepository;
    private final IpressRepository ipressRepository;
    private final PersonalExternoRepository personalExternoRepository;
    private final FormDiagFormularioRepository formularioRepository;
    private final FormDiagService formDiagService;

    @Override
    @Transactional(readOnly = true)
    public RedDashboardResponse obtenerDashboard() {
        Usuario usuario = obtenerUsuarioActual();
        Red red = usuario.getRed();

        if (red == null) {
            throw new IllegalStateException("El usuario no tiene una red asignada");
        }

        Long idRed = red.getId();

        // Contar estadisticas
        Long totalIpress = ipressRepository.countByRed_Id(idRed);
        Long totalPersonal = personalExternoRepository.countByIpress_Red_Id(idRed);
        Long totalFormularios = formularioRepository.countByIpress_Red_Id(idRed);
        Long enProceso = formularioRepository.countByIpress_Red_IdAndEstado(idRed, "EN_PROCESO");
        Long enviados = formularioRepository.countByIpress_Red_IdAndEstado(idRed, "ENVIADO");
        Long aprobados = formularioRepository.countByIpress_Red_IdAndEstado(idRed, "APROBADO");

        return RedDashboardResponse.builder()
                .red(RedDashboardResponse.RedInfo.builder()
                        .id(red.getId())
                        .codigo(red.getCodigo())
                        .nombre(red.getDescripcion())
                        .macroregion(red.getMacroregion() != null ?
                            red.getMacroregion().getDescMacro() : null)
                        .build())
                .estadisticas(RedDashboardResponse.Estadisticas.builder()
                        .totalIpress(totalIpress)
                        .totalPersonalExterno(totalPersonal)
                        .totalFormularios(totalFormularios)
                        .formulariosEnProceso(enProceso)
                        .formulariosEnviados(enviados)
                        .formulariosAprobados(aprobados)
                        .build())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonalExternoResponse> obtenerPersonalExterno() {
        Usuario usuario = obtenerUsuarioActual();
        Long idRed = validarRedAsignada(usuario);

        return personalExternoRepository.findByIpress_Red_Id(idRed).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormDiagListResponse> obtenerFormularios() {
        Usuario usuario = obtenerUsuarioActual();
        Long idRed = validarRedAsignada(usuario);

        return formDiagService.listarPorRed(idRed);
    }

    private Usuario obtenerUsuarioActual() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));
    }

    private Long validarRedAsignada(Usuario usuario) {
        if (usuario.getRed() == null) {
            throw new IllegalStateException("El usuario no tiene una red asignada");
        }
        return usuario.getRed().getId();
    }

    private PersonalExternoResponse mapToResponse(com.styp.cenate.model.PersonalExterno pe) {
        // Mapear entidad a DTO (implementar segun estructura existente)
        return PersonalExternoResponse.builder()
                .idPersonalExterno(pe.getIdPersExt())
                .numeroDocumento(pe.getNumDocExt())
                .nombres(pe.getNomExt())
                .apellidoPaterno(pe.getApePaterExt())
                .apellidoMaterno(pe.getApeMaterExt())
                .emailPersonal(pe.getEmailPersExt())
                .emailCorporativo(pe.getEmailCorpExt())
                .telefono(pe.getMovilExt())
                .nombreIpress(pe.getIpress() != null ? pe.getIpress().getDescIpress() : null)
                .build();
    }
}
```

---

### 3.5 Backend - Crear Controller

**Archivo a crear:** `backend/src/main/java/com/styp/cenate/api/red/RedDashboardController.java`

```java
package com.styp.cenate.api.red;

import com.styp.cenate.dto.red.RedDashboardResponse;
import com.styp.cenate.dto.PersonalExternoResponse;
import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.service.red.RedDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/red")
@RequiredArgsConstructor
public class RedDashboardController {

    private final RedDashboardService redDashboardService;

    @GetMapping("/mi-red")
    @CheckMBACPermission(pagina = "/red/dashboard", accion = "ver")
    public ResponseEntity<RedDashboardResponse> obtenerMiRed() {
        return ResponseEntity.ok(redDashboardService.obtenerDashboard());
    }

    @GetMapping("/personal")
    @CheckMBACPermission(pagina = "/red/dashboard", accion = "ver")
    public ResponseEntity<List<PersonalExternoResponse>> obtenerPersonal() {
        return ResponseEntity.ok(redDashboardService.obtenerPersonalExterno());
    }

    @GetMapping("/formularios")
    @CheckMBACPermission(pagina = "/red/dashboard", accion = "ver")
    public ResponseEntity<List<FormDiagListResponse>> obtenerFormularios() {
        return ResponseEntity.ok(redDashboardService.obtenerFormularios());
    }
}
```

---

### 3.6 Backend - Agregar Metodos a Repositorios

**Archivo:** `backend/src/main/java/com/styp/cenate/repository/personal/PersonalExternoRepository.java`

**Agregar metodos:**
```java
// Buscar por Red
List<PersonalExterno> findByIpress_Red_Id(Long idRed);

// Contar por Red
Long countByIpress_Red_Id(Long idRed);
```

**Archivo:** `backend/src/main/java/com/styp/cenate/repository/IpressRepository.java`

**Agregar metodo:**
```java
// Contar IPRESS por Red
Long countByRed_Id(Long idRed);
```

**Archivo:** `backend/src/main/java/com/styp/cenate/repository/formdiag/FormDiagFormularioRepository.java`

**Agregar metodos (si no existen):**
```java
// Contar por Red
Long countByIpress_Red_Id(Long idRed);

// Contar por Red y Estado
Long countByIpress_Red_IdAndEstado(Long idRed, String estado);
```

---

### 3.7 Frontend - Crear Pagina

**Archivo a crear:** `frontend/src/pages/red/RedDashboard.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Network, Users, FileText, Building2, Download, RefreshCw } from 'lucide-react';
import apiClient from '../../lib/apiClient';

export default function RedDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [personal, setPersonal] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, personalRes, formRes] = await Promise.all([
        apiClient.get('/api/red/mi-red'),
        apiClient.get('/api/red/personal'),
        apiClient.get('/api/red/formularios')
      ]);
      setDashboard(dashRes.data);
      setPersonal(personalRes.data);
      setFormularios(formRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    const data = activeTab === 'personal' ? personal : formularios;
    const headers = activeTab === 'personal'
      ? ['DNI', 'Nombres', 'Apellidos', 'Email', 'Telefono', 'IPRESS']
      : ['ID', 'IPRESS', 'Anio', 'Estado', 'Fecha Creacion'];

    const csvContent = [
      headers.join(','),
      ...data.map(item => activeTab === 'personal'
        ? [item.numeroDocumento, item.nombres, `${item.apellidoPaterno} ${item.apellidoMaterno}`, item.emailPersonal, item.telefono, item.nombreIpress].join(',')
        : [item.idFormulario, item.nombreIpress, item.anio, item.estado, item.fechaCreacion].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <Network className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{dashboard?.red?.nombre}</h1>
            <p className="text-blue-200">
              {dashboard?.red?.macroregion} | Codigo: {dashboard?.red?.codigo}
            </p>
          </div>
        </div>
      </div>

      {/* Estadisticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="IPRESS"
          value={dashboard?.estadisticas?.totalIpress || 0}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Personal Externo"
          value={dashboard?.estadisticas?.totalPersonalExterno || 0}
          color="green"
        />
        <StatCard
          icon={FileText}
          label="Formularios"
          value={dashboard?.estadisticas?.totalFormularios || 0}
          color="purple"
        />
        <StatCard
          icon={FileText}
          label="Enviados"
          value={dashboard?.estadisticas?.formulariosEnviados || 0}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b flex">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-3 font-medium ${activeTab === 'personal'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'}`}
          >
            Personal Externo ({personal.length})
          </button>
          <button
            onClick={() => setActiveTab('formularios')}
            className={`px-6 py-3 font-medium ${activeTab === 'formularios'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'}`}
          >
            Formularios ({formularios.length})
          </button>
          <div className="ml-auto p-2">
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'personal' ? (
            <TablaPersonal data={personal} />
          ) : (
            <TablaFormularios data={formularios} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function TablaPersonal({ data }) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-center py-8">No hay personal externo registrado</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefono</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPRESS</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{item.numeroDocumento}</td>
              <td className="px-4 py-3 text-sm font-medium">
                {item.nombres} {item.apellidoPaterno} {item.apellidoMaterno}
              </td>
              <td className="px-4 py-3 text-sm">{item.emailPersonal || item.emailCorporativo || '-'}</td>
              <td className="px-4 py-3 text-sm">{item.telefono || '-'}</td>
              <td className="px-4 py-3 text-sm">{item.nombreIpress || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablaFormularios({ data }) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-center py-8">No hay formularios registrados</p>;
  }

  const estadoColors = {
    'EN_PROCESO': 'bg-yellow-100 text-yellow-800',
    'ENVIADO': 'bg-blue-100 text-blue-800',
    'APROBADO': 'bg-green-100 text-green-800',
    'RECHAZADO': 'bg-red-100 text-red-800'
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPRESS</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anio</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium">{item.idFormulario}</td>
              <td className="px-4 py-3 text-sm">{item.nombreIpress}</td>
              <td className="px-4 py-3 text-sm">{item.anio}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[item.estado] || 'bg-gray-100'}`}>
                  {item.estado}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">{item.fechaCreacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### 3.8 Frontend - Agregar Ruta

**Archivo:** `frontend/src/App.js`

**Agregar importacion:**
```jsx
import RedDashboard from './pages/red/RedDashboard';
```

**Agregar ruta (dentro de rutas protegidas):**
```jsx
<Route
  path="/red/dashboard"
  element={
    <ProtectedRoute requiredPath="/red/dashboard" requiredAction="ver">
      <RedDashboard />
    </ProtectedRoute>
  }
/>
```

---

## 4. Orden de Ejecucion

1. **Ejecutar script SQL** - Crea estructura en BD
2. **Modificar Usuario.java** - Agregar campo red
3. **Crear DTOs** - RedDashboardResponse
4. **Modificar Repositorios** - Agregar metodos de consulta
5. **Crear Service** - RedDashboardServiceImpl
6. **Crear Controller** - RedDashboardController
7. **Crear pagina frontend** - RedDashboard.jsx
8. **Agregar ruta App.js**
9. **Reiniciar backend y frontend**
10. **Probar asignando red a un usuario**

---

## 5. Pruebas

### 5.1 Asignar Red a Usuario de Prueba
```sql
-- Asignar red a usuario existente
UPDATE dim_usuarios
SET id_red = (SELECT id_red FROM dim_red WHERE cod_red = 'R001' LIMIT 1)
WHERE name_user = '44914706';

-- Asignar rol COORDINADOR_RED
INSERT INTO rel_user_roles (id_user, id_rol)
SELECT u.id_user, r.id_rol
FROM dim_usuarios u, dim_roles r
WHERE u.name_user = '44914706'
AND r.desc_rol = 'COORDINADOR_RED'
ON CONFLICT DO NOTHING;
```

### 5.2 Verificar Endpoints
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"44914706","password":"@Cenate2025"}'

# Obtener dashboard de red (usar token obtenido)
curl -X GET http://localhost:8080/api/red/mi-red \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 6. Criterios de Aceptacion

- [ ] Rol COORDINADOR_RED creado en BD
- [ ] Campo id_red agregado a usuarios
- [ ] Modulo "Gestion de Red" visible en menu para COORDINADOR_RED
- [ ] Endpoint GET /api/red/mi-red retorna datos de la red asignada
- [ ] Endpoint GET /api/red/personal retorna solo personal de la red
- [ ] Endpoint GET /api/red/formularios retorna solo formularios de la red
- [ ] Pagina frontend muestra estadisticas correctas
- [ ] Exportacion CSV funciona
- [ ] Usuario sin red asignada recibe error apropiado

---

## 7. Documentacion Relacionada

- Arquitectura MBAC: `spec/004_arquitectura.md`
- Modelo de usuarios: `spec/001_espec_users_bd.md`
- Endpoints API: `spec/003_api_endpoints.md`
- Scripts SQL existentes: `spec/scripts/`

---

*Documento generado: 2025-12-23*
