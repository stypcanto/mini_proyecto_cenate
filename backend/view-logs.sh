#!/bin/bash

# ============================================================
# 📋 CENATE - VER LOGS DEL BACKEND
# ============================================================

LOG_DIR="./logs"

echo "============================================================"
echo "📋 CENATE - VISUALIZADOR DE LOGS"
echo "============================================================"
echo ""

# Verificar si existe el directorio de logs
if [ ! -d "$LOG_DIR" ]; then
    echo "❌ No se encontró el directorio de logs: $LOG_DIR"
    echo ""
    echo "💡 Opciones:"
    echo "   1. Inicia el backend con: ./dev-start.sh"
    echo "   2. Los logs se crearán automáticamente en ./logs/"
    exit 1
fi

# Verificar si hay archivos de log
if [ -z "$(ls -A $LOG_DIR/*.log 2>/dev/null)" ]; then
    echo "❌ No se encontraron archivos de log"
    echo ""
    echo "💡 Inicia el backend primero con: ./dev-start.sh"
    exit 1
fi

echo "📁 Archivos de log disponibles:"
echo ""
ls -lh $LOG_DIR/*.log 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo "============================================================"
echo ""

# Mostrar opciones
echo "Selecciona una opción:"
echo ""
echo "  1) Ver log general (últimas 50 líneas)"
echo "  2) Ver solo ERRORES (últimas 30 líneas)"
echo "  3) Ver log completo en tiempo real (tail -f)"
echo "  4) Ver log de errores en tiempo real"
echo "  5) Buscar texto específico en los logs"
echo "  6) Ver estadísticas de errores"
echo ""
read -p "Opción [1-6]: " option

case $option in
    1)
        echo ""
        echo "📄 Últimas 50 líneas del log general:"
        echo "============================================================"
        tail -n 50 "$LOG_DIR"/cenate-backend.log
        ;;
    2)
        echo ""
        echo "❌ Últimas 30 líneas de ERRORES:"
        echo "============================================================"
        if [ -f "$LOG_DIR/cenate-backend-error.log" ]; then
            tail -n 30 "$LOG_DIR"/cenate-backend-error.log
        else
            echo "✅ No hay errores registrados"
        fi
        ;;
    3)
        echo ""
        echo "📡 Monitoreando log en tiempo real (Ctrl+C para salir)..."
        echo "============================================================"
        tail -f "$LOG_DIR"/cenate-backend.log
        ;;
    4)
        echo ""
        echo "📡 Monitoreando ERRORES en tiempo real (Ctrl+C para salir)..."
        echo "============================================================"
        if [ -f "$LOG_DIR/cenate-backend-error.log" ]; then
            tail -f "$LOG_DIR"/cenate-backend-error.log
        else
            echo "✅ No hay archivo de errores aún"
        fi
        ;;
    5)
        echo ""
        read -p "Texto a buscar: " search_text
        echo ""
        echo "🔍 Resultados de búsqueda para: '$search_text'"
        echo "============================================================"
        grep -i "$search_text" "$LOG_DIR"/*.log 2>/dev/null | tail -n 50
        ;;
    6)
        echo ""
        echo "📊 Estadísticas de errores:"
        echo "============================================================"
        if [ -f "$LOG_DIR/cenate-backend-error.log" ]; then
            echo "Total de líneas de error: $(wc -l < "$LOG_DIR"/cenate-backend-error.log)"
            echo ""
            echo "Top 10 errores más frecuentes:"
            grep "ERROR" "$LOG_DIR"/*.log 2>/dev/null | \
                sed 's/.*ERROR //' | \
                cut -d' ' -f1-3 | \
                sort | uniq -c | sort -rn | head -10
        else
            echo "✅ No hay errores registrados"
        fi
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "============================================================"
