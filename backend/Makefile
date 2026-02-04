# ============================================================
# Makefile - Backend CENATE (Spring Boot)
# ============================================================
# Uso: make <comando>
# ============================================================

.PHONY: help dev run build clean test logs db-check deps

# Colores para output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
NC     := \033[0m # No Color

# Variables
GRADLE = ./gradlew
PORT = 8080

# ============================================================
# AYUDA
# ============================================================
help:
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Makefile - Backend CENATE (Spring Boot)$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@echo ""
	@echo "  $(GREEN)make dev$(NC)        - Ejecutar en modo desarrollo (con hot-reload)"
	@echo "  $(GREEN)make run$(NC)        - Ejecutar aplicación"
	@echo "  $(GREEN)make build$(NC)      - Compilar proyecto"
	@echo "  $(GREEN)make clean$(NC)      - Limpiar archivos compilados"
	@echo "  $(GREEN)make test$(NC)       - Ejecutar tests"
	@echo "  $(GREEN)make deps$(NC)       - Mostrar dependencias"
	@echo "  $(GREEN)make db-check$(NC)   - Verificar conexión a BD"
	@echo "  $(GREEN)make logs$(NC)       - Ver logs en tiempo real"
	@echo "  $(GREEN)make jar$(NC)        - Generar JAR ejecutable"
	@echo "  $(GREEN)make swagger$(NC)    - Abrir Swagger UI"
	@echo "  $(GREEN)make health$(NC)     - Verificar health del API"
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""

# ============================================================
# DESARROLLO
# ============================================================

## Ejecutar en modo desarrollo con hot-reload
dev:
	@echo "$(GREEN)🚀 Iniciando backend en modo desarrollo...$(NC)"
	@echo "$(YELLOW)   Puerto: $(PORT)$(NC)"
	@echo "$(YELLOW)   Hot-reload: activado$(NC)"
	@echo "$(YELLOW)   Perfil: dev$(NC)"
	@echo ""
	$(GRADLE) bootRun --continuous --args='--spring.profiles.active=dev'

## Ejecutar aplicación normalmente
run:
	@echo "$(GREEN)🚀 Iniciando backend...$(NC)"
	$(GRADLE) bootRun --args='--spring.profiles.active=dev'

## Ejecutar en background
run-bg:
	@echo "$(GREEN)🚀 Iniciando backend en background...$(NC)"
	nohup $(GRADLE) bootRun > logs/app.log 2>&1 &
	@echo "$(YELLOW)   Logs en: logs/app.log$(NC)"

# ============================================================
# COMPILACIÓN
# ============================================================

## Compilar proyecto
build:
	@echo "$(GREEN)🔨 Compilando proyecto...$(NC)"
	$(GRADLE) build -x test

## Compilar con tests
build-test:
	@echo "$(GREEN)🔨 Compilando proyecto con tests...$(NC)"
	$(GRADLE) build

## Limpiar archivos compilados
clean:
	@echo "$(YELLOW)🧹 Limpiando archivos compilados...$(NC)"
	$(GRADLE) clean

## Limpiar y compilar
rebuild: clean build

## Generar JAR ejecutable
jar:
	@echo "$(GREEN)📦 Generando JAR...$(NC)"
	$(GRADLE) bootJar
	@echo "$(GREEN)✅ JAR generado en: build/libs/$(NC)"
	@ls -la build/libs/*.jar 2>/dev/null || echo "No se encontró JAR"

# ============================================================
# TESTS
# ============================================================

## Ejecutar todos los tests
test:
	@echo "$(GREEN)🧪 Ejecutando tests...$(NC)"
	$(GRADLE) test

## Ejecutar tests con reporte
test-report:
	@echo "$(GREEN)🧪 Ejecutando tests con reporte...$(NC)"
	$(GRADLE) test jacocoTestReport
	@echo "$(GREEN)📊 Reporte en: build/reports/tests/test/index.html$(NC)"

# ============================================================
# BASE DE DATOS
# ============================================================

## Verificar conexión a PostgreSQL
db-check:
	@echo "$(GREEN)🔍 Verificando conexión a PostgreSQL...$(NC)"
	@PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate -c "SELECT version();" 2>/dev/null && \
		echo "$(GREEN)✅ Conexión exitosa$(NC)" || \
		echo "$(YELLOW)⚠️  No se pudo conectar (psql no instalado o BD inaccesible)$(NC)"

## Mostrar estadísticas de BD
db-stats:
	@echo "$(GREEN)📊 Estadísticas de BD...$(NC)"
	@PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate -c "\
		SELECT \
			pg_size_pretty(pg_database_size('maestro_cenate')) as tamano, \
			(SELECT count(*) FROM dim_usuarios) as usuarios, \
			(SELECT count(*) FROM dim_roles) as roles \
	" 2>/dev/null || echo "$(YELLOW)⚠️  No se pudo conectar$(NC)"

# ============================================================
# UTILIDADES
# ============================================================

## Mostrar dependencias del proyecto
deps:
	@echo "$(GREEN)📦 Dependencias del proyecto:$(NC)"
	$(GRADLE) dependencies --configuration compileClasspath | head -50

## Ver logs en tiempo real
logs:
	@echo "$(GREEN)📋 Logs del backend:$(NC)"
	@tail -f logs/app.log 2>/dev/null || echo "$(YELLOW)No hay archivo de logs. Ejecuta 'make run-bg' primero.$(NC)"

## Abrir Swagger UI en navegador
swagger:
	@echo "$(GREEN)📖 Abriendo Swagger UI...$(NC)"
	@open http://localhost:$(PORT)/swagger-ui.html 2>/dev/null || \
		xdg-open http://localhost:$(PORT)/swagger-ui.html 2>/dev/null || \
		echo "$(YELLOW)Abre manualmente: http://localhost:$(PORT)/swagger-ui.html$(NC)"

## Verificar health del API
health:
	@echo "$(GREEN)🏥 Verificando health del API...$(NC)"
	@curl -s http://localhost:$(PORT)/api/health 2>/dev/null && echo "" || \
		echo "$(YELLOW)⚠️  API no disponible en puerto $(PORT)$(NC)"

## Verificar estado del sistema
system-health:
	@echo "$(GREEN)🖥️  Estado del sistema:$(NC)"
	@curl -s http://localhost:$(PORT)/api/admin/dashboard/system-health 2>/dev/null | python3 -m json.tool 2>/dev/null || \
		echo "$(YELLOW)⚠️  API no disponible o no autenticado$(NC)"

## Mostrar puertos en uso
ports:
	@echo "$(GREEN)🔌 Puertos en uso:$(NC)"
	@lsof -i :$(PORT) 2>/dev/null || echo "$(YELLOW)Puerto $(PORT) libre$(NC)"

## Matar proceso en puerto 8080
kill:
	@echo "$(YELLOW)🔪 Matando proceso en puerto $(PORT)...$(NC)"
	@lsof -ti :$(PORT) | xargs kill -9 2>/dev/null && echo "$(GREEN)✅ Proceso terminado$(NC)" || \
		echo "$(YELLOW)No hay proceso en puerto $(PORT)$(NC)"

# ============================================================
# INFORMACIÓN
# ============================================================

## Mostrar información del proyecto
info:
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  CENATE Backend - Información$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "  $(YELLOW)Puerto:$(NC)      $(PORT)"
	@echo "  $(YELLOW)BD Host:$(NC)     10.0.89.241:5432"
	@echo "  $(YELLOW)BD Nombre:$(NC)   maestro_cenate"
	@echo "  $(YELLOW)Swagger:$(NC)     http://localhost:$(PORT)/swagger-ui.html"
	@echo "  $(YELLOW)Health:$(NC)      http://localhost:$(PORT)/api/health"
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""

# Default target
.DEFAULT_GOAL := help
