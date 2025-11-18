#!/usr/bin/env python3
"""
🎨 Script para agregar tarjetas visuales de estadísticas
========================================================
Agrega las tarjetas de Usuarios Activos e Inactivos
"""

from pathlib import Path

FRONTEND_FILE = Path("frontend/src/pages/admin/GestionUsuariosPermisos.jsx")

def agregar_tarjetas_estadisticas():
    """Agrega las tarjetas visuales de activos/inactivos"""
    print("🎨 Agregando tarjetas visuales de estadísticas...")
    
    if not FRONTEND_FILE.exists():
        print(f"❌ ERROR: No se encontró el archivo {FRONTEND_FILE}")
        return False
    
    with open(FRONTEND_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar donde termina la última tarjeta actual (Con Acceso Admin)
    marker = """              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-purple-900 mb-1">{stats.conAccesoAdmin}</p>
                <p className="text-sm text-purple-700 font-medium">Con Acceso Admin</p>
              </div>
            </div>"""
    
    # Las nuevas tarjetas
    new_cards = """              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-purple-900 mb-1">{stats.conAccesoAdmin}</p>
                <p className="text-sm text-purple-700 font-medium">Con Acceso Admin</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-green-900 mb-1">{stats.activos}</p>
                <p className="text-sm text-green-700 font-medium">Usuarios Activos</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-gray-500/10 rounded-xl flex items-center justify-center">
                    <Circle className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-gray-900 mb-1">{stats.inactivos}</p>
                <p className="text-sm text-gray-700 font-medium">Usuarios Inactivos</p>
              </div>
            </div>"""
    
    # Cambiar también el grid de 4 a 6 columnas
    old_grid = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">'
    new_grid = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">'
    
    if marker in content:
        content = content.replace(marker, new_cards)
        content = content.replace(old_grid, new_grid)
        print("✅ Tarjetas de activos/inactivos agregadas")
        
        with open(FRONTEND_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Archivo actualizado correctamente")
        return True
    else:
        print("⚠️  Marcador no encontrado, es posible que ya estén agregadas las tarjetas")
        return False

def main():
    print("🎨 Agregando tarjetas visuales...")
    print("=" * 60)
    
    if not Path("frontend").exists():
        print("❌ ERROR: Debes ejecutar este script desde el directorio raíz del proyecto")
        return
    
    if agregar_tarjetas_estadisticas():
        print("\n✅ ¡Tarjetas agregadas exitosamente!")
        print("\n📋 Ahora puedes reiniciar el frontend:")
        print("   cd frontend && npm start")
    else:
        print("\n⚠️  Las tarjetas pueden ya estar agregadas")

if __name__ == "__main__":
    main()
