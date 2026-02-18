#!/usr/bin/env python3
import re

# Leer el archivo
with open(r'c:\Users\PC\Desktop\CENATE\mini_proyecto_cenate\frontend\src\pages\bolsas\Solicitudes.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reemplazar los `n literales por saltos de línea reales
content = content.replace('`n', '\n')

# Guardar
with open(r'c:\Users\PC\Desktop\CENATE\mini_proyecto_cenate\frontend\src\pages\bolsas\Solicitudes.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Archivo corregido - saltos de línea restaurados")
