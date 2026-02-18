#!/usr/bin/env python3
# Script para eliminar campos IPRESS duplicados consecutivos

filePath = r'c:\Users\PC\Desktop\CENATE\mini_proyecto_cenate\frontend\src\pages\bolsas\Solicitudes.jsx'

with open(filePath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Buscar y eliminar duplicados: 4 líneas repetidas de IPRESS - Atención
target_lines = [
    "              idIpressAtencion: solicitud.id_ipress_atencion || null,\n",
    "              codIpressAtencion: solicitud.cod_ipress_atencion || 'N/A',\n",
    "              descIpressAtencion: solicitud.desc_ipress_atencion || 'N/A',\n",
    "              ipressAtencion: solicitud.desc_ipress_atencion || 'N/A',\n",
]

new_lines = []
skip_next = 0

for i in range(len(lines)):
    if skip_next > 0:
        skip_next -= 1
        continue
    
    # Detectar 4 líneas duplicadas consecutivas
    if (i + 7 < len(lines) and 
        lines[i] == target_lines[0] and
        lines[i+1] == target_lines[1] and
        lines[i+2] == target_lines[2] and
        lines[i+3] == target_lines[3] and
        lines[i+4] == target_lines[0] and
        lines[i+5] == target_lines[1] and
        lines[i+6] == target_lines[2] and
        lines[i+7] == target_lines[3]):
        # Agregar solo la primera vez, saltamos la segunda
        for j in range(4):
            new_lines.append(lines[i+j])
        skip_next = 4
    else:
        new_lines.append(lines[i])

with open(filePath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ Duplicados eliminados")
