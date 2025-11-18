#!/usr/bin/env python3
"""
Script para aplicar el parche del modal automáticamente
"""

# Leer el parche
with open('/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend/PARCHE_MODAL_COMPLETO.jsx', 'r') as f:
    parche = f.read()

# Leer el archivo original
with open('/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend/src/pages/admin/UsersManagement.jsx', 'r') as f:
    contenido = f.read()

# Encontrar el inicio del componente VerDetalleModal
inicio_marker = "const VerDetalleModal = ({ user, onClose }) => {"

# Encontrar el final (antes de ConfirmDialog)
fin_marker = "const ConfirmDialog = ({ show, user, onConfirm, onCancel }) => {"

# Buscar las posiciones
inicio_pos = contenido.find(inicio_marker)
fin_pos = contenido.find(fin_marker)

if inicio_pos == -1:
    print("❌ Error: No se encontró el componente VerDetalleModal")
    exit(1)

if fin_pos == -1:
    print("❌ Error: No se encontró el componente ConfirmDialog")
    exit(1)

# Retroceder desde fin_pos para encontrar el final real del componente VerDetalleModal
# Buscamos la línea anterior que tenga "};"
lineas_antes_confirm = contenido[:fin_pos].split('\n')
fin_real = None
for i in range(len(lineas_antes_confirm) - 1, -1, -1):
    linea = lineas_antes_confirm[i].strip()
    if linea == '};':
        fin_real = sum(len(l) + 1 for l in lineas_antes_confirm[:i+1])
        break

if fin_real is None:
    print("❌ Error: No se encontró el final del componente VerDetalleModal")
    exit(1)

# Crear el nuevo contenido
nuevo_contenido = (
    contenido[:inicio_pos] +
    "// ========================================================================\n" +
    "// 💼 Modal: Ver Detalle Usuario (CORREGIDO - Mapea campos correctamente)\n" +
    "// ========================================================================\n" +
    parche.replace("// ========================================================================\n// 💼 COMPONENTE CORREGIDO: Ver Detalle Usuario\n// Este componente mapea correctamente los campos del endpoint /api/personal/total\n// ========================================================================\n\n// INSTRUCCIONES: \n// 1. Copia todo este código\n// 2. En UsersManagement.jsx, busca \"const VerDetalleModal = ({ user, onClose }) => {\"\n// 3. Reemplaza TODO el componente VerDetalleModal (hasta antes de \"const ConfirmDialog\")\n//    con este código\n// ========================================================================\n\n", "") +
    "\n\n// ========================================================================\n" +
    "// ⚙️ Modal: Confirmación de Eliminación\n" +
    "// ========================================================================\n" +
    contenido[fin_pos:]
)

# Guardar el archivo parcheado
with open('/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend/src/pages/admin/UsersManagement.jsx', 'w') as f:
    f.write(nuevo_contenido)

print("✅ Parche aplicado exitosamente!")
print("📋 Archivo modificado: UsersManagement.jsx")
print("")
print("🔄 Ahora reinicia el frontend:")
print("   1. En la terminal del frontend presiona Ctrl+C")
print("   2. Ejecuta: npm start")
print("")
print("🎉 El modal ahora mostrará todos los datos correctamente!")
