#!/usr/bin/env python3
"""
Script para agregar el mapeo de tipo profesional en UsuarioServiceImpl.java
"""

import re
from pathlib import Path
from datetime import datetime

# Ruta del archivo
FILE_PATH = Path("/Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate/backend/src/main/java/com/styp/cenate/service/usuario/UsuarioServiceImpl.java")

# Código a agregar para el mapeo
MAPEO_TIPO_PROF = """
		// ============================================================
		// 👔 MAPEO DE TIPO DE PROFESIONAL (dim_tipo_personal)
		// ============================================================
		Long idTipoProfesional = null;
		String nombreTipoProfesional = null;

		if (personalCnt != null && personalCnt.getIdPers() != null) {
			log.debug("🔍 Buscando tipo de profesional para personal ID: {}", personalCnt.getIdPers());
			
			// 🚀 OPTIMIZACIÓN: Usar la relación ya cargada (evita query N+1)
			// Los tipos profesionales ya están cargados mediante @EntityGraph en findAllWithRelations()
			Set<com.styp.cenate.model.PersonalTipoPers> tiposProfesionales = personalCnt.getTiposProfesionales();
			
			if (tiposProfesionales != null && !tiposProfesionales.isEmpty()) {
				// Tomar el primer tipo de profesional
				com.styp.cenate.model.PersonalTipoPers tipoProfPrincipal = tiposProfesionales.iterator().next();
				
				if (tipoProfPrincipal.getTipoPersonal() != null) {
					idTipoProfesional = tipoProfPrincipal.getTipoPersonal().getIdTipPers();
					nombreTipoProfesional = tipoProfPrincipal.getTipoPersonal().getDescTipPers();
					
					log.debug("✅ Tipo profesional cargado para {}: {}", 
						usuario.getNameUser(), nombreTipoProfesional);
				}
			} else {
				log.debug("ℹ️ No hay tipo de profesional registrado para {}", usuario.getNameUser());
			}
		}
"""

# Código a agregar en el builder
BUILDER_CAMPOS = """				// ✨ TIPO DE PROFESIONAL (NUEVO)
				.idTipoProfesional(idTipoProfesional)
				.nombreTipoProfesional(nombreTipoProfesional)
				.descTipPers(nombreTipoProfesional)
				.tipoProfesionalDesc(nombreTipoProfesional)
"""

def main():
    if not FILE_PATH.exists():
        print(f"❌ Error: Archivo no encontrado: {FILE_PATH}")
        return 1
    
    print(f"📝 Leyendo archivo: {FILE_PATH}")
    content = FILE_PATH.read_text(encoding='utf-8')
    
    # Crear backup
    backup_path = FILE_PATH.with_suffix(f'.java.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"💾 Backup creado: {backup_path}")
    
    # ============================================================
    # MODIFICACIÓN 1: Agregar mapeo de tipo profesional
    # ============================================================
    pattern1 = r'(String codigoPlanilla = personalCnt != null \? personalCnt\.getCodPlanRem\(\) : null;\s+String periodoIngreso = personalCnt != null \? personalCnt\.getPerPers\(\) : null;)\s+(// ============================================================\s+// 🏗️ CONSTRUCCIÓN DEL RESPONSE)'
    
    if re.search(pattern1, content):
        replacement1 = r'\1' + MAPEO_TIPO_PROF + r'\n\n\t\t\2'
        content = re.sub(pattern1, replacement1, content)
        print("✅ Modificación 1: Mapeo de tipo profesional agregado")
    else:
        print("⚠️ Advertencia: No se encontró el patrón 1 para el mapeo")
        # Intentar patrón alternativo
        pattern1_alt = r'(String periodoIngreso = personalCnt != null \? personalCnt\.getPerPers\(\) : null;)'
        if re.search(pattern1_alt, content):
            replacement1_alt = r'\1' + MAPEO_TIPO_PROF
            content = re.sub(pattern1_alt, replacement1_alt, content)
            print("✅ Modificación 1: Mapeo de tipo profesional agregado (patrón alternativo)")
        else:
            print("❌ Error: No se pudo agregar el mapeo de tipo profesional")
            return 1
    
    # ============================================================
    # MODIFICACIÓN 2: Agregar campos al builder
    # ============================================================
    pattern2 = r'(\.periodoIngreso\(periodoIngreso\))\s+(// IPRESS)'
    
    if re.search(pattern2, content):
        replacement2 = r'\1' + '\n' + BUILDER_CAMPOS + '\n\t\t\t\t\2'
        content = re.sub(pattern2, replacement2, content)
        print("✅ Modificación 2: Campos agregados al builder")
    else:
        print("⚠️ Advertencia: No se encontró el patrón 2 para el builder")
        # Intentar patrón alternativo
        pattern2_alt = r'(\.periodoIngreso\(periodoIngreso\))'
        if re.search(pattern2_alt, content):
            replacement2_alt = r'\1' + '\n' + BUILDER_CAMPOS
            content = re.sub(pattern2_alt, replacement2_alt, content, count=1)
            print("✅ Modificación 2: Campos agregados al builder (patrón alternativo)")
        else:
            print("❌ Error: No se pudo agregar los campos al builder")
            return 1
    
    # Guardar archivo modificado
    FILE_PATH.write_text(content, encoding='utf-8')
    print(f"✅ Archivo modificado exitosamente: {FILE_PATH}")
    print("\n🚀 Ahora reinicia el backend con: ./gradlew bootRun")
    return 0

if __name__ == "__main__":
    exit(main())
