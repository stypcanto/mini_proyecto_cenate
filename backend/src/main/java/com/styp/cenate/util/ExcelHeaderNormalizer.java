package com.styp.cenate.util;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 🔧 Normalizador inteligente de cabeceras de Excel
 * -----------------------------------------------
 * Mapea variaciones comunes de nombres de columnas a nombres estándar.
 * Resuelve problemas de:
 * - Mayúsculas/minúsculas
 * - Espacios extras
 * - Tildes/acentos
 * - Variaciones ortográficas
 *
 * @author Styp Canto Rondon
 * @version 1.15.0
 */
public class ExcelHeaderNormalizer {

    // Mapa de variaciones conocidas -> nombre estándar
    private static final Map<String, String> COLUMN_MAPPINGS = new HashMap<>();

    static {
        // REGISTRO
        COLUMN_MAPPINGS.put("registro", "REGISTRO");
        COLUMN_MAPPINGS.put("reg", "REGISTRO");
        COLUMN_MAPPINGS.put("nro registro", "REGISTRO");

        // OPCIONES DE INGRESO DE LLAMADA
        COLUMN_MAPPINGS.put("opciones de ingreso de llamada", "OPCIONES DE INGRESO DE LLAMADA");
        COLUMN_MAPPINGS.put("opcion de ingreso", "OPCIONES DE INGRESO DE LLAMADA");
        COLUMN_MAPPINGS.put("opciones ingreso", "OPCIONES DE INGRESO DE LLAMADA");
        COLUMN_MAPPINGS.put("tipo de ingreso", "OPCIONES DE INGRESO DE LLAMADA");
        COLUMN_MAPPINGS.put("ingreso", "OPCIONES DE INGRESO DE LLAMADA");

        // TELEFONO
        COLUMN_MAPPINGS.put("telefono", "TELEFONO");
        COLUMN_MAPPINGS.put("teléfono", "TELEFONO");
        COLUMN_MAPPINGS.put("tel", "TELEFONO");
        COLUMN_MAPPINGS.put("celular", "TELEFONO");
        COLUMN_MAPPINGS.put("movil", "TELEFONO");
        COLUMN_MAPPINGS.put("móvil", "TELEFONO");

        // TIPO DE DOCUMENTO (variaciones más comunes)
        COLUMN_MAPPINGS.put("tipo de documento", "TIPO DE DOCUMENTO");
        COLUMN_MAPPINGS.put("tipo documento", "TIPO DE DOCUMENTO");
        COLUMN_MAPPINGS.put("tipo_documento", "TIPO DE DOCUMENTO");
        COLUMN_MAPPINGS.put("tipodocumento", "TIPO DE DOCUMENTO");
        COLUMN_MAPPINGS.put("tipo doc", "TIPO DE DOCUMENTO");
        COLUMN_MAPPINGS.put("tipo_doc", "TIPO DE DOCUMENTO");
        COLUMN_MAPPINGS.put("tip doc", "TIPO DE DOCUMENTO");

        // DNI
        COLUMN_MAPPINGS.put("dni", "DNI");
        COLUMN_MAPPINGS.put("numero de documento", "DNI");
        COLUMN_MAPPINGS.put("numero documento", "DNI");
        COLUMN_MAPPINGS.put("nro documento", "DNI");
        COLUMN_MAPPINGS.put("nro doc", "DNI");
        COLUMN_MAPPINGS.put("documento", "DNI");

        // APELLIDOS Y NOMBRES
        COLUMN_MAPPINGS.put("apellidos y nombres", "APELLIDOS Y NOMBRES");
        COLUMN_MAPPINGS.put("nombres y apellidos", "APELLIDOS Y NOMBRES");
        COLUMN_MAPPINGS.put("nombre completo", "APELLIDOS Y NOMBRES");
        COLUMN_MAPPINGS.put("paciente", "APELLIDOS Y NOMBRES");
        COLUMN_MAPPINGS.put("nombres", "APELLIDOS Y NOMBRES");
        COLUMN_MAPPINGS.put("apellidos", "APELLIDOS Y NOMBRES");

        // SEXO
        COLUMN_MAPPINGS.put("sexo", "SEXO");
        COLUMN_MAPPINGS.put("genero", "SEXO");
        COLUMN_MAPPINGS.put("género", "SEXO");
        COLUMN_MAPPINGS.put("sex", "SEXO");

        // FECHA NACIMIENTO (variaciones críticas)
        COLUMN_MAPPINGS.put("fechanacimiento", "FechaNacimiento");
        COLUMN_MAPPINGS.put("fecha nacimiento", "FechaNacimiento");
        COLUMN_MAPPINGS.put("fecha de nacimiento", "FechaNacimiento");
        COLUMN_MAPPINGS.put("fec nacimiento", "FechaNacimiento");
        COLUMN_MAPPINGS.put("fec nac", "FechaNacimiento");
        COLUMN_MAPPINGS.put("fecha nac", "FechaNacimiento");
        COLUMN_MAPPINGS.put("f nacimiento", "FechaNacimiento");
        COLUMN_MAPPINGS.put("f nac", "FechaNacimiento");
        COLUMN_MAPPINGS.put("fecha_nacimiento", "FechaNacimiento");

        // DEPARTAMENTO
        COLUMN_MAPPINGS.put("departamento", "DEPARTAMENTO");
        COLUMN_MAPPINGS.put("depto", "DEPARTAMENTO");
        COLUMN_MAPPINGS.put("dpto", "DEPARTAMENTO");
        COLUMN_MAPPINGS.put("dep", "DEPARTAMENTO");

        // PROVINCIA
        COLUMN_MAPPINGS.put("provincia", "PROVINCIA");
        COLUMN_MAPPINGS.put("prov", "PROVINCIA");

        // DISTRITO
        COLUMN_MAPPINGS.put("distrito", "DISTRITO");
        COLUMN_MAPPINGS.put("dist", "DISTRITO");

        // MOTIVO DE LA LLAMADA
        COLUMN_MAPPINGS.put("motivo de la llamada", "MOTIVO DE LA LLAMADA");
        COLUMN_MAPPINGS.put("motivo llamada", "MOTIVO DE LA LLAMADA");
        COLUMN_MAPPINGS.put("motivo", "MOTIVO DE LA LLAMADA");
        COLUMN_MAPPINGS.put("motivo de consulta", "MOTIVO DE LA LLAMADA");

        // AFILIACION
        COLUMN_MAPPINGS.put("afiliacion", "AFILIACION");
        COLUMN_MAPPINGS.put("afiliación", "AFILIACION");
        COLUMN_MAPPINGS.put("tipo afiliacion", "AFILIACION");
        COLUMN_MAPPINGS.put("tipo afiliación", "AFILIACION");

        // DERIVACION INTERNA
        COLUMN_MAPPINGS.put("derivacion interna", "DERIVACION INTERNA");
        COLUMN_MAPPINGS.put("derivación interna", "DERIVACION INTERNA");
        COLUMN_MAPPINGS.put("derivacion", "DERIVACION INTERNA");
        COLUMN_MAPPINGS.put("derivación", "DERIVACION INTERNA");
        COLUMN_MAPPINGS.put("deriva", "DERIVACION INTERNA");

        // ============================================================================
        // 📦 CAMPOS v1.8.0 - IMPORTACIÓN DE BOLSAS DE PACIENTES (NUEVO)
        // ============================================================================

        // FECHA PREFERIDA QUE NO FUE ATENDIDA (variaciones)
        COLUMN_MAPPINGS.put("fecha preferida que no fue atendida", "FECHA PREFERIDA QUE NO FUE ATENDIDA");
        COLUMN_MAPPINGS.put("fecha preferida no atendida", "FECHA PREFERIDA QUE NO FUE ATENDIDA");
        COLUMN_MAPPINGS.put("fecha preferida", "FECHA PREFERIDA QUE NO FUE ATENDIDA");
        COLUMN_MAPPINGS.put("fecha no atendida", "FECHA PREFERIDA QUE NO FUE ATENDIDA");
        COLUMN_MAPPINGS.put("fecha cita no atendida", "FECHA PREFERIDA QUE NO FUE ATENDIDA");

        // CORREO (variaciones)
        COLUMN_MAPPINGS.put("correo", "CORREO");
        COLUMN_MAPPINGS.put("email", "CORREO");
        COLUMN_MAPPINGS.put("correo electronico", "CORREO");
        COLUMN_MAPPINGS.put("correo electrónico", "CORREO");
        COLUMN_MAPPINGS.put("mail", "CORREO");

        // COD. IPRESS ADSCRIPCIÓN (variaciones críticas)
        COLUMN_MAPPINGS.put("cod. ipress adscripcion", "COD. IPRESS ADSCRIPCIÓN");
        COLUMN_MAPPINGS.put("cod. ipress adscripción", "COD. IPRESS ADSCRIPCIÓN");
        COLUMN_MAPPINGS.put("codigo ipress adscripcion", "COD. IPRESS ADSCRIPCIÓN");
        COLUMN_MAPPINGS.put("código ipress adscripción", "COD. IPRESS ADSCRIPCIÓN");
        COLUMN_MAPPINGS.put("cod ipress", "COD. IPRESS ADSCRIPCIÓN");
        COLUMN_MAPPINGS.put("codigo ipress", "COD. IPRESS ADSCRIPCIÓN");
        COLUMN_MAPPINGS.put("ipress adscripcion", "COD. IPRESS ADSCRIPCIÓN");
        COLUMN_MAPPINGS.put("ipress adscripción", "COD. IPRESS ADSCRIPCIÓN");
        COLUMN_MAPPINGS.put("ipress", "COD. IPRESS ADSCRIPCIÓN");

        // TIPO CITA (variaciones)
        COLUMN_MAPPINGS.put("tipo cita", "TIPO CITA");
        COLUMN_MAPPINGS.put("tipo de cita", "TIPO CITA");
        COLUMN_MAPPINGS.put("cita", "TIPO CITA");
        COLUMN_MAPPINGS.put("tipo atencion", "TIPO CITA");
        COLUMN_MAPPINGS.put("tipo atención", "TIPO CITA");
        COLUMN_MAPPINGS.put("tipo consulta", "TIPO CITA");
        COLUMN_MAPPINGS.put("tipo consulta medica", "TIPO CITA");
        COLUMN_MAPPINGS.put("tipo consulta médica", "TIPO CITA");

        // ASEGURADO (variaciones adicionales)
        COLUMN_MAPPINGS.put("asegurado", "ASEGURADO");
        COLUMN_MAPPINGS.put("nombre del asegurado", "ASEGURADO");
        COLUMN_MAPPINGS.put("nombre asegurado", "ASEGURADO");
        COLUMN_MAPPINGS.put("paciente nombre", "ASEGURADO");

        // TIPO DE DOCUMENTO (variaciones adicionales para bolsas)
        COLUMN_MAPPINGS.put("tipo de documento", "TIPO DOCUMENTO");
        COLUMN_MAPPINGS.put("tipo documento", "TIPO DOCUMENTO");
        COLUMN_MAPPINGS.put("tipo_documento", "TIPO DOCUMENTO");
        COLUMN_MAPPINGS.put("tipodocumento", "TIPO DOCUMENTO");
        COLUMN_MAPPINGS.put("tipo doc", "TIPO DOCUMENTO");
        COLUMN_MAPPINGS.put("tipo_doc", "TIPO DOCUMENTO");

        // TELÉFONO (más variaciones para bolsas)
        COLUMN_MAPPINGS.put("teléfono", "TELÉFONO");
        COLUMN_MAPPINGS.put("telefono", "TELÉFONO");
        COLUMN_MAPPINGS.put("tel", "TELÉFONO");
        COLUMN_MAPPINGS.put("celular", "TELÉFONO");
        COLUMN_MAPPINGS.put("movil", "TELÉFONO");
        COLUMN_MAPPINGS.put("móvil", "TELÉFONO");

        // FECHA DE NACIMIENTO (más variaciones)
        COLUMN_MAPPINGS.put("fecha de nacimiento", "FECHA DE NACIMIENTO");
        COLUMN_MAPPINGS.put("fecha nacimiento", "FECHA DE NACIMIENTO");
        COLUMN_MAPPINGS.put("fechanacimiento", "FECHA DE NACIMIENTO");
        COLUMN_MAPPINGS.put("fecha_nacimiento", "FECHA DE NACIMIENTO");
        COLUMN_MAPPINGS.put("fec nacimiento", "FECHA DE NACIMIENTO");
        COLUMN_MAPPINGS.put("fec nac", "FECHA DE NACIMIENTO");

        // SEXO (más variaciones)
        COLUMN_MAPPINGS.put("sexo", "SEXO");
        COLUMN_MAPPINGS.put("genero", "SEXO");
        COLUMN_MAPPINGS.put("género", "SEXO");
        COLUMN_MAPPINGS.put("gender", "SEXO");
        COLUMN_MAPPINGS.put("sex", "SEXO");

        // DNI (más variaciones)
        COLUMN_MAPPINGS.put("dni", "DNI");
        COLUMN_MAPPINGS.put("numero de documento", "DNI");
        COLUMN_MAPPINGS.put("numero documento", "DNI");
        COLUMN_MAPPINGS.put("nro documento", "DNI");
        COLUMN_MAPPINGS.put("nro doc", "DNI");
        COLUMN_MAPPINGS.put("documento", "DNI");
        COLUMN_MAPPINGS.put("numero identificacion", "DNI");
    }

    /**
     * Normaliza una cabecera a su forma estándar
     * @param rawHeader Cabecera original del Excel
     * @return Cabecera normalizada o null si no se reconoce
     */
    public static String normalize(String rawHeader) {
        if (rawHeader == null || rawHeader.isBlank()) {
            return null;
        }

        // Limpiar: quitar espacios extras, convertir a minúsculas
        String cleaned = rawHeader.trim()
                                  .replaceAll("\\s+", " ")
                                  .toLowerCase(Locale.ROOT);

        // Buscar en el mapeo
        return COLUMN_MAPPINGS.getOrDefault(cleaned, null);
    }

    /**
     * Normaliza una lista completa de cabeceras
     * @param rawHeaders Lista de cabeceras originales
     * @return Lista de cabeceras normalizadas (null para no reconocidas)
     */
    public static List<String> normalizeAll(List<String> rawHeaders) {
        return rawHeaders.stream()
                         .map(ExcelHeaderNormalizer::normalize)
                         .toList();
    }

    /**
     * Verifica si una cabecera es reconocida
     * @param rawHeader Cabecera a verificar
     * @return true si puede normalizarse, false si no
     */
    public static boolean isRecognized(String rawHeader) {
        return normalize(rawHeader) != null;
    }

    /**
     * Obtiene las columnas esperadas en orden
     * @return Lista de nombres estándar de columnas
     */
    public static List<String> getExpectedColumns() {
        return List.of(
            "REGISTRO",
            "OPCIONES DE INGRESO DE LLAMADA",
            "TELEFONO",
            "TIPO DE DOCUMENTO",
            "DNI",
            "APELLIDOS Y NOMBRES",
            "SEXO",
            "FechaNacimiento",
            "DEPARTAMENTO",
            "PROVINCIA",
            "DISTRITO",
            "MOTIVO DE LA LLAMADA",
            "AFILIACION",
            "DERIVACION INTERNA"
        );
    }

    /**
     * Genera un reporte de normalización
     * @param original Lista original de cabeceras
     * @param normalized Lista normalizada
     * @return Mapa con información de cambios
     */
    public static Map<String, Object> generateReport(List<String> original, List<String> normalized) {
        Map<String, Object> report = new HashMap<>();
        int changes = 0;
        int unrecognized = 0;

        for (int i = 0; i < original.size(); i++) {
            String orig = original.get(i);
            String norm = i < normalized.size() ? normalized.get(i) : null;

            if (norm == null) {
                unrecognized++;
            } else if (!orig.equals(norm)) {
                changes++;
            }
        }

        report.put("total_columns", original.size());
        report.put("normalized", changes);
        report.put("unrecognized", unrecognized);
        report.put("success_rate", original.isEmpty() ? 0.0 :
            ((double)(original.size() - unrecognized) / original.size() * 100));

        return report;
    }
}
