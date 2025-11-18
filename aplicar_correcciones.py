#!/usr/bin/env python3
"""
🔧 Script de Corrección Automática - Estados de Usuarios
=======================================================
Aplica las correcciones necesarias al frontend
para solucionar el problema de estados ACTIVO/INACTIVO
"""

import os
import sys
from pathlib import Path

# Rutas de archivos
FRONTEND_FILE = Path("frontend/src/pages/admin/GestionUsuariosPermisos.jsx")

def aplicar_correcciones_frontend():
    """Aplica todas las correcciones al archivo del frontend"""
    print("📝 Aplicando correcciones al frontend...")
    
    if not FRONTEND_FILE.exists():
        print(f"❌ ERROR: No se encontró el archivo {FRONTEND_FILE}")
        return False
    
    # Leer el archivo
    print(f"📖 Leyendo {FRONTEND_FILE}...")
    with open(FRONTEND_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    cambios = 0
    
    # ============================================================
    # Corrección 1: Cambiar estado_usuario a estado en filtros
    # ============================================================
    if "if (filters.estado) filtered = filtered.filter(u => u.estado_usuario === filters.estado);" in content:
        content = content.replace(
            "if (filters.estado) filtered = filtered.filter(u => u.estado_usuario === filters.estado);",
            "if (filters.estado) filtered = filtered.filter(u => u.estado === filters.estado);"
        )
        print("✅ Corrección 1: Filtro de estado actualizado")
        cambios += 1
    else:
        print("⚠️  Corrección 1: Ya estaba aplicada o no encontrada")
    
    # ============================================================
    # Corrección 2: Actualizar estadísticas
    # ============================================================
    old_stats = """  const stats = useMemo(() => {
    const total = users.length;
    const internos = users.filter(u => u.tipo_personal === 'CENATE').length;
    const externos = users.filter(u => u.tipo_personal === 'EXTERNO').length;
    const conAccesoAdmin = users.filter(u => 
      u.roles && (u.roles.includes('SUPERADMIN') || u.roles.includes('ADMIN'))
    ).length;
    return { total, internos, externos, conAccesoAdmin };
  }, [users]);"""
    
    new_stats = """  const stats = useMemo(() => {
    const total = users.length;
    const internos = users.filter(u => u.tipo_personal === 'CENATE').length;
    const externos = users.filter(u => u.tipo_personal === 'EXTERNO').length;
    const conAccesoAdmin = users.filter(u => 
      u.roles && (u.roles.includes('SUPERADMIN') || u.roles.includes('ADMIN'))
    ).length;
    const activos = users.filter(u => u.estado === 'ACTIVO').length;
    const inactivos = users.filter(u => u.estado === 'INACTIVO').length;
    return { total, internos, externos, conAccesoAdmin, activos, inactivos };
  }, [users]);"""
    
    if old_stats in content:
        content = content.replace(old_stats, new_stats)
        print("✅ Corrección 2: Estadísticas actualizadas")
        cambios += 1
    else:
        print("⚠️  Corrección 2: Ya estaba aplicada o no encontrada")
    
    # ============================================================
    # Corrección 3: Función handleToggleEstado
    # ============================================================
    old_toggle = """  const handleToggleEstado = async (user) => {
    try {
      const nuevoEstado = user.estado_usuario === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      setUsers(users.map(u => 
        u.id_user === user.id_user ? { ...u, estado_usuario: nuevoEstado } : u
      ));
      console.log(`Usuario ${user.username} ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al cambiar el estado del usuario:', error);
    }
  };"""
    
    new_toggle = """  const handleToggleEstado = async (user) => {
    try {
      const nuevoEstado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      const idUsuario = user.id_usuario;

      // Actualizar en el backend
      if (nuevoEstado === 'ACTIVO') {
        await api.put(`/usuarios/${idUsuario}/activar`);
      } else {
        await api.put(`/usuarios/${idUsuario}/desactivar`);
      }

      // Actualizar estado local
      setUsers(users.map(u => 
        u.id_usuario === idUsuario ? { ...u, estado: nuevoEstado } : u
      ));
      
      console.log(`✅ Usuario ${user.username || user.nombre_completo} ${nuevoEstado}`);
    } catch (error) {
      console.error('❌ Error al cambiar el estado del usuario:', error);
      alert('Error al cambiar el estado. Por favor intente nuevamente.');
    }
  };"""
    
    if old_toggle in content:
        content = content.replace(old_toggle, new_toggle)
        print("✅ Corrección 3: Función handleToggleEstado actualizada")
        cambios += 1
    else:
        print("⚠️  Corrección 3: Ya estaba aplicada o no encontrada")
    
    # ============================================================
    # Corrección 4: Cambiar estado_usuario a estado en TableView
    # ============================================================
    replacements = [
        ("checked={user.estado_usuario === 'ACTIVO'}", "checked={user.estado === 'ACTIVO'}"),
        ("${user.estado_usuario === 'ACTIVO'", "${user.estado === 'ACTIVO'"),
        ("{user.estado_usuario}", "{user.estado}")
    ]
    
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            cambios += 1
    
    print(f"✅ Corrección 4: Componentes TableView y CardsView actualizados")
    
    # ============================================================
    # Guardar si hubo cambios
    # ============================================================
    if content != original_content:
        print(f"\n💾 Guardando cambios ({cambios} correcciones aplicadas)...")
        with open(FRONTEND_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Archivo {FRONTEND_FILE} actualizado correctamente")
        return True
    else:
        print("ℹ️  No se detectaron cambios necesarios")
        return True

def main():
    """Función principal"""
    print("🔧 Iniciando correcciones automáticas...")
    print("=" * 60)
    
    # Verificar que estamos en el directorio correcto
    if not Path("frontend").exists() or not Path("backend").exists():
        print("❌ ERROR: Debes ejecutar este script desde el directorio raíz del proyecto")
        print("   Ubicación esperada: .../cenate/")
        sys.exit(1)
    
    # Aplicar correcciones
    frontend_ok = aplicar_correcciones_frontend()
    
    print("\n" + "=" * 60)
    if frontend_ok:
        print("✅ ¡Correcciones aplicadas exitosamente!")
        print("\n📋 Siguientes pasos:")
        print("1. Reiniciar el frontend:")
        print("   cd frontend && npm start")
        print("\n2. Verificar que los usuarios activos/inactivos se muestren correctamente")
        print("\n3. Probar el toggle de estado (debe llamar al backend)")
    else:
        print("⚠️  Algunas correcciones no pudieron aplicarse")
        print("Por favor, revisa los mensajes de error anteriores")

if __name__ == "__main__":
    main()
