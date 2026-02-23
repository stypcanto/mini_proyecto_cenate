# 🛠️ Configurar Backend en STS (Spring Tool Suite)

## 📋 Requisitos Previos
- **Java 17** instalado
- **STS (Spring Tool Suite)** instalado
- **Gradle** (incluido en el proyecto con gradlew)

---

## 🚀 Comandos para Limpiar y Preparar el Proyecto

Ejecutar desde la carpeta `backend`:

```powershell
# 1. Limpiar y construir el proyecto
.\gradlew clean build -x test

# 2. Generar archivos de configuración de Eclipse
.\gradlew eclipse

# 3. (Opcional) Eliminar caché de STS
Remove-Item -Recurse -Force .settings -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force bin -ErrorAction SilentlyContinue
```

---

## 📥 Importar Proyecto en STS

### Opción 1: Primera Importación

1. **File** → **Import**
2. **General** → **Existing Projects into Workspace**
3. **Select root directory:** `[ruta]\backend`
4. Marcar el proyecto `backend`
5. **Finish**

### Opción 2: Si ya está importado con errores

1. **Clic derecho en `backend`** → **Delete**
   - ⚠️ **DESMARCAR** "Delete project contents on disk"
2. **Cerrar y abrir STS**
3. Seguir **Opción 1**

---

## 🔧 Configuración Post-Importación

Después de importar:

1. **Refrescar Gradle:**
   - Clic derecho en `backend`
   - **Gradle** → **Refresh Gradle Project**

2. **Limpiar proyecto:**
   - **Project** → **Clean...**
   - Seleccionar `backend`
   - **Clean**

3. **Verificar Java 17:**
   - Clic derecho en `backend` → **Properties**
   - **Java Build Path** → **Libraries**
   - Debe aparecer **JavaSE-17**
   - Si no, **Edit** y seleccionar **JavaSE-17**

---

## ▶️ Ejecutar la Aplicación

1. Buscar: `src/main/java/com/styp/cenate/CenateApplication.java`
2. Clic derecho → **Run As** → **Spring Boot App**

---

## 🐛 Solución de Problemas Comunes

### Error: "Missing Gradle project"

```powershell
.\gradlew clean build -x test
.\gradlew eclipse
```

Luego reimportar en STS.

### Error: "Cannot resolve AbstractHttpConfigurer, AccessDeniedException"

- Significa que las dependencias no están sincronizadas
- Solución: **Gradle** → **Refresh Gradle Project**

### Error al ejecutar: "Internal error occurred"

1. Eliminar proyecto de STS (sin borrar archivos)
2. Ejecutar comandos de limpieza
3. Reimportar siguiendo **Opción 1**

### Build falla en terminal

Verificar Java 17:
```powershell
java -version
```

Debe mostrar: `java version "17.x.x"`

---

## 📝 Estructura del Proyecto

```
backend/
├── src/main/java/          # Código fuente
├── src/main/resources/     # application.properties
├── build.gradle            # Configuración Gradle
├── gradlew                 # Gradle Wrapper (Unix)
└── gradlew.bat             # Gradle Wrapper (Windows)
```

---

## ✅ Verificación Exitosa

Si todo está bien configurado:
- ✅ No hay errores en Package Explorer
- ✅ Carpeta `src/main/java` tiene icono de código fuente
- ✅ Se puede ejecutar `CenateApplication.java` sin errores
- ✅ Consola muestra: `Started CenateApplication in X seconds`

---

## 📞 Comandos Útiles

```powershell
# Limpiar proyecto
.\gradlew clean

# Construir sin tests
.\gradlew build -x test

# Ver dependencias
.\gradlew dependencies

# Ejecutar aplicación desde terminal
.\gradlew bootRun
```

---

**Última actualización:** Febrero 2026  
**Versión del proyecto:** v1.34.0
