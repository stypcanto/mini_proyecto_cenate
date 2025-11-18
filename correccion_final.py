#!/usr/bin/env python3
"""
🔧 CORRECCIÓN FINAL - Arregla el problema de estados DEFINITIVAMENTE
"""

from pathlib import Path

FRONTEND_FILE = Path("frontend/src/pages/admin/GestionUsuariosPermisos.jsx")

def corregir_load_users():
    """Corrige la función loadUsers para que consulte los datos correctos"""
    print("🔧 Aplicando corrección final...")
    
    with open(FRONTEND_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar la función loadUsers actual
    old_function = """  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/personal/total');
      setUsers(response);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los usuarios. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };"""
    
    # Nueva función que combina datos correctamente
    new_function = """  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener usuarios autenticados
      const usuarios = await api.get('/usuarios');
      
      // Obtener datos del personal
      const personal = await api.get('/personal/total');
      
      // Crear un mapa de usuarios por id para acceso rápido
      const usuariosMap = new Map(usuarios.map(u => [u.idUser, u]));
      
      // Combinar datos: tomar estado de autenticación de usuarios
      const combined = personal.map(p => {
        const usuario = usuariosMap.get(p.id_usuario);
        return {
          ...p,
          // Usar el estado de autenticación si existe
          estado: usuario ? usuario.estado : (p.estado || 'INACTIVO'),
          username: usuario ? usuario.username : p.username
        };
      });
      
      // Filtrar duplicados por id_usuario
      const uniqueUsers = combined.reduce((acc, current) => {
        const existing = acc.find(u => u.id_usuario === current.id_usuario);
        if (!existing) {
          acc.push(current);
        } else if (current.tipo_personal === 'CENATE' && existing.tipo_personal !== 'CENATE') {
          // Preferir el registro de CENATE sobre EXTERNO
          const index = acc.indexOf(existing);
          acc[index] = current;
        }
        return acc;
      }, []);
      
      console.log(`✅ Cargados ${uniqueUsers.length} usuarios únicos`);
      setUsers(uniqueUsers);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los usuarios. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };"""
    
    if old_function in content:
        content = content.replace(old_function, new_function)
        print("✅ Función loadUsers actualizada")
        
        with open(FRONTEND_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Corrección aplicada exitosamente")
        return True
    else:
        print("❌ No se encontró la función loadUsers original")
        return False

def main():
    print("🔧 CORRECCIÓN FINAL DE ESTADOS")
    print("=" * 60)
    
    if not Path("frontend").exists():
        print("❌ ERROR: Ejecuta desde el directorio raíz del proyecto")
        return
    
    if corregir_load_users():
        print("\n" + "=" * 60)
        print("✅ ¡CORRECCIÓN APLICADA!")
        print("\n📋 Ahora reinicia el frontend:")
        print("   cd frontend && npm start")
        print("\n🎯 Resultado esperado:")
        print("   - Usuarios ACTIVOS con toggle verde")
        print("   - Usuarios INACTIVOS con toggle gris")
        print("   - Sin duplicados")
    else:
        print("\n❌ Error al aplicar corrección")

if __name__ == "__main__":
    main()
