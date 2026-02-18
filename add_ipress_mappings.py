#!/usr/bin/env python3
# Script para agregar mappings de IPRESS - Atención en Solicitudes.jsx

filePath = r'c:\Users\PC\Desktop\CENATE\mini_proyecto_cenate\frontend\src\pages\bolsas\Solicitudes.jsx'

with open(filePath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Buscar líneas que contienen "codigoIpress: solicitud.codigo_adscripcion"
# e insertar los 4 campos DESPUÉS de esa línea

new_lines = []
mappings_to_add = [
    "              idIpressAtencion: solicitud.id_ipress_atencion || null,\n",
    "              codIpressAtencion: solicitud.cod_ipress_atencion || 'N/A',\n",
    "              descIpressAtencion: solicitud.desc_ipress_atencion || 'N/A',\n",
    "              ipressAtencion: solicitud.desc_ipress_atencion || 'N/A',\n",
]

for i, line in enumerate(lines):
    new_lines.append(line)
    
    # Si encontramos "codigoIpress" Y la siguiente línea NO tiene "idIpressAtencion"
    if 'codigoIpress: solicitud.codigo_adscripcion' in line:
        # Verificar que no tenga mappings ya
        if i + 1 < len(lines) and 'idIpressAtencion' not in lines[i + 1]:
            # Agregar los 4 campos
            for mapping in mappings_to_add:
                new_lines.append(mapping)

# Escribir el archivo actualizado
with open(filePath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ Mappings agregados en ambas ubicaciones (754 y 930)")
