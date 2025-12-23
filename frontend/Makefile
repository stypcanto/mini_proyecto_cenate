# ============================================================
# Makefile - Frontend CENATE (React)
# ============================================================
# Uso: make <comando>
# ============================================================

.PHONY: help dev start build clean test install lint format

# Colores para output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
NC     := \033[0m # No Color

# Variables
NPM = npm
PORT_LOCAL = 3000
API_LOCAL = http://localhost:8080
API_NETWORK = http://10.0.89.239:8080

# ============================================================
# AYUDA
# ============================================================
help:
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  Makefile - Frontend CENATE (React)$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@echo ""
	@echo "  $(GREEN)make dev$(NC)          - Iniciar en desarrollo (API local)"
	@echo "  $(GREEN)make dev-network$(NC)  - Iniciar en desarrollo (API red)"
	@echo "  $(GREEN)make start$(NC)        - Iniciar aplicación"
	@echo "  $(GREEN)make build$(NC)        - Compilar para producción"
	@echo "  $(GREEN)make install$(NC)      - Instalar dependencias"
	@echo "  $(GREEN)make clean$(NC)        - Limpiar node_modules y build"
	@echo "  $(GREEN)make lint$(NC)         - Ejecutar linter"
	@echo "  $(GREEN)make test$(NC)         - Ejecutar tests"
	@echo "  $(GREEN)make open$(NC)         - Abrir en navegador"
	@echo "  $(GREEN)make deps$(NC)         - Ver dependencias instaladas"
	@echo "  $(GREEN)make update$(NC)       - Actualizar dependencias"
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""

# ============================================================
# DESARROLLO
# ============================================================

## Iniciar en modo desarrollo (API localhost)
dev:
	@echo "$(GREEN)🚀 Iniciando frontend en modo desarrollo...$(NC)"
	@echo "$(YELLOW)   Puerto: $(PORT_LOCAL)$(NC)"
	@echo "$(YELLOW)   API: $(API_LOCAL)$(NC)"
	@echo ""
	REACT_APP_API_URL=$(API_LOCAL)/api $(NPM) start

## Iniciar en modo desarrollo (API en red)
dev-network:
	@echo "$(GREEN)🚀 Iniciando frontend (API en red)...$(NC)"
	@echo "$(YELLOW)   Puerto: $(PORT_LOCAL)$(NC)"
	@echo "$(YELLOW)   API: $(API_NETWORK)$(NC)"
	@echo ""
	REACT_APP_API_URL=$(API_NETWORK)/api $(NPM) start

## Alias para dev
start: dev

## Iniciar con hot-reload más agresivo
dev-fast:
	@echo "$(GREEN)🚀 Iniciando frontend (modo rápido)...$(NC)"
	FAST_REFRESH=true $(NPM) start

# ============================================================
# COMPILACIÓN
# ============================================================

## Compilar para producción
build:
	@echo "$(GREEN)🔨 Compilando para producción...$(NC)"
	$(NPM) run build
	@echo "$(GREEN)✅ Build completado en: build/$(NC)"
	@du -sh build/ 2>/dev/null || true

## Compilar y analizar bundle
build-analyze:
	@echo "$(GREEN)🔍 Compilando y analizando bundle...$(NC)"
	$(NPM) run build -- --stats
	@echo "$(YELLOW)Usa 'npx webpack-bundle-analyzer build/bundle-stats.json' para ver el análisis$(NC)"

## Servir build de producción localmente
serve:
	@echo "$(GREEN)🌐 Sirviendo build de producción...$(NC)"
	@npx serve -s build -l $(PORT_LOCAL) 2>/dev/null || \
		(echo "$(YELLOW)Instalando serve...$(NC)" && npm install -g serve && npx serve -s build -l $(PORT_LOCAL))

# ============================================================
# DEPENDENCIAS
# ============================================================

## Instalar dependencias
install:
	@echo "$(GREEN)📦 Instalando dependencias...$(NC)"
	$(NPM) install

## Instalar dependencias (limpio)
install-clean:
	@echo "$(GREEN)📦 Instalación limpia...$(NC)"
	rm -rf node_modules package-lock.json
	$(NPM) install

## Actualizar dependencias
update:
	@echo "$(GREEN)⬆️  Actualizando dependencias...$(NC)"
	$(NPM) update

## Ver dependencias desactualizadas
outdated:
	@echo "$(GREEN)📋 Dependencias desactualizadas:$(NC)"
	$(NPM) outdated || true

## Mostrar dependencias instaladas
deps:
	@echo "$(GREEN)📦 Dependencias del proyecto:$(NC)"
	$(NPM) list --depth=0

## Auditar seguridad
audit:
	@echo "$(GREEN)🔒 Auditoría de seguridad:$(NC)"
	$(NPM) audit || true

## Corregir vulnerabilidades
audit-fix:
	@echo "$(GREEN)🔧 Corrigiendo vulnerabilidades...$(NC)"
	$(NPM) audit fix || true

# ============================================================
# CALIDAD DE CÓDIGO
# ============================================================

## Ejecutar linter
lint:
	@echo "$(GREEN)🔍 Ejecutando linter...$(NC)"
	$(NPM) run lint 2>/dev/null || npx eslint src/ --ext .js,.jsx

## Corregir errores de linting
lint-fix:
	@echo "$(GREEN)🔧 Corrigiendo errores de linting...$(NC)"
	$(NPM) run lint:fix 2>/dev/null || npx eslint src/ --ext .js,.jsx --fix

## Formatear código con Prettier
format:
	@echo "$(GREEN)✨ Formateando código...$(NC)"
	npx prettier --write "src/**/*.{js,jsx,css,json}" 2>/dev/null || \
		echo "$(YELLOW)Prettier no instalado. Ejecuta: npm install -D prettier$(NC)"

# ============================================================
# TESTS
# ============================================================

## Ejecutar tests
test:
	@echo "$(GREEN)🧪 Ejecutando tests...$(NC)"
	$(NPM) test -- --watchAll=false

## Ejecutar tests en modo watch
test-watch:
	@echo "$(GREEN)🧪 Tests en modo watch...$(NC)"
	$(NPM) test

## Ejecutar tests con cobertura
test-coverage:
	@echo "$(GREEN)🧪 Tests con cobertura...$(NC)"
	$(NPM) test -- --coverage --watchAll=false

# ============================================================
# LIMPIEZA
# ============================================================

## Limpiar node_modules y build
clean:
	@echo "$(YELLOW)🧹 Limpiando proyecto...$(NC)"
	rm -rf node_modules build .cache
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

## Limpiar solo build
clean-build:
	@echo "$(YELLOW)🧹 Limpiando build...$(NC)"
	rm -rf build
	@echo "$(GREEN)✅ Build eliminado$(NC)"

## Limpiar cache
clean-cache:
	@echo "$(YELLOW)🧹 Limpiando cache...$(NC)"
	rm -rf .cache node_modules/.cache
	$(NPM) cache clean --force
	@echo "$(GREEN)✅ Cache limpiado$(NC)"

# ============================================================
# UTILIDADES
# ============================================================

## Abrir en navegador
open:
	@echo "$(GREEN)🌐 Abriendo en navegador...$(NC)"
	@open http://localhost:$(PORT_LOCAL) 2>/dev/null || \
		xdg-open http://localhost:$(PORT_LOCAL) 2>/dev/null || \
		echo "$(YELLOW)Abre manualmente: http://localhost:$(PORT_LOCAL)$(NC)"

## Mostrar puertos en uso
ports:
	@echo "$(GREEN)🔌 Puertos en uso:$(NC)"
	@lsof -i :$(PORT_LOCAL) 2>/dev/null || echo "$(YELLOW)Puerto $(PORT_LOCAL) libre$(NC)"

## Matar proceso en puerto 3000
kill:
	@echo "$(YELLOW)🔪 Matando proceso en puerto $(PORT_LOCAL)...$(NC)"
	@lsof -ti :$(PORT_LOCAL) | xargs kill -9 2>/dev/null && echo "$(GREEN)✅ Proceso terminado$(NC)" || \
		echo "$(YELLOW)No hay proceso en puerto $(PORT_LOCAL)$(NC)"

## Ver tamaño de node_modules
size:
	@echo "$(GREEN)📊 Tamaño de directorios:$(NC)"
	@du -sh node_modules 2>/dev/null || echo "node_modules: no existe"
	@du -sh build 2>/dev/null || echo "build: no existe"

## Generar árbol de componentes
tree:
	@echo "$(GREEN)🌳 Estructura de componentes:$(NC)"
	@find src/components -name "*.jsx" -o -name "*.js" | head -30

# ============================================================
# INFORMACIÓN
# ============================================================

## Mostrar información del proyecto
info:
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  CENATE Frontend - Información$(NC)"
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "  $(YELLOW)Puerto:$(NC)        $(PORT_LOCAL)"
	@echo "  $(YELLOW)API Local:$(NC)     $(API_LOCAL)"
	@echo "  $(YELLOW)API Network:$(NC)   $(API_NETWORK)"
	@echo "  $(YELLOW)Node:$(NC)          $$(node -v 2>/dev/null || echo 'No instalado')"
	@echo "  $(YELLOW)NPM:$(NC)           $$(npm -v 2>/dev/null || echo 'No instalado')"
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════$(NC)"
	@echo ""

## Verificar versiones
versions:
	@echo "$(GREEN)📋 Versiones:$(NC)"
	@echo "  Node: $$(node -v 2>/dev/null || echo 'No instalado')"
	@echo "  NPM:  $$(npm -v 2>/dev/null || echo 'No instalado')"
	@echo "  React: $$(cat package.json | grep '\"react\":' | head -1 | awk -F'\"' '{print $$4}')"

# Default target
.DEFAULT_GOAL := help
