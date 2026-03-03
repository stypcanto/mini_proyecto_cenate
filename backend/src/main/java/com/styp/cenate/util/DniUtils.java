package com.styp.cenate.util;

/**
 * Utilidad para normalizar DNIs peruanos.
 *
 * Regla: El DNI peruano es siempre de 8 dígitos numéricos.
 * Si llega con menos dígitos (p.ej. 7 dígitos) se completa con ceros a la izquierda.
 * Ejemplos:
 *   "1045003"  → "01045003"  (1 cero)
 *   "345678"   → "00345678"  (2 ceros)
 *   "01045003" → "01045003"  (ya correcto, no se modifica)
 *
 * Los documentos NO numéricos (CE, pasaporte, etc.) se devuelven sin cambios.
 */
public final class DniUtils {

    private DniUtils() {}

    /**
     * Normaliza un DNI a 8 dígitos con ceros a la izquierda.
     * Solo actúa sobre valores puramente numéricos con menos de 8 dígitos.
     *
     * @param dni valor crudo del documento (puede venir del Excel o de la UI)
     * @return DNI normalizado, o el valor original si no es numérico o ya tiene 8+ dígitos
     */
    public static String normalizar(String dni) {
        if (dni == null || dni.isBlank()) return dni;
        String v = dni.trim();
        // Solo normalizar si es puramente numérico con < 8 dígitos
        if (v.matches("\\d{1,7}")) {
            return String.format("%08d", Long.parseLong(v));
        }
        return v;
    }
}
