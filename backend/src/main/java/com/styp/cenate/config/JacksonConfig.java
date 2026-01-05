package com.styp.cenate.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * 🔧 Configuración de Jackson para manejo correcto de fechas
 *
 * 🆕 v1.15.16: Solución al bug de timezone en LocalDate
 *
 * PROBLEMA:
 * - Frontend envía: "2025-05-02"
 * - Backend recibía: 2025-05-01 (restaba 1 día por conversión UTC → GMT-5)
 *
 * SOLUCIÓN:
 * - Deserializar LocalDate sin conversión de timezone
 * - Serializar LocalDate en formato ISO (YYYY-MM-DD) sin hora
 *
 * @author Ing. Styp Canto Rondon
 * @since 2026-01-02
 */
@Configuration
public class JacksonConfig {

    /**
     * Formato estándar ISO para fechas: YYYY-MM-DD
     */
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    /**
     * Configura ObjectMapper personalizado con manejo correcto de LocalDate
     *
     * IMPORTANTE:
     * - @Primary asegura que este ObjectMapper se use en toda la aplicación
     * - JavaTimeModule maneja tipos java.time.*
     * - LocalDateDeserializer SIN timezone adjustment
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Módulo para tipos java.time (LocalDate, LocalDateTime, etc.)
        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // 🔧 LocalDate: Deserializar sin conversión UTC
        // Acepta: "2025-05-02" (string) → LocalDate(2025, 05, 02)
        javaTimeModule.addDeserializer(
            LocalDate.class,
            new LocalDateDeserializer(DATE_FORMATTER)
        );

        // 🔧 LocalDate: Serializar en formato ISO sin hora
        // Produce: LocalDate(2025, 05, 02) → "2025-05-02" (string)
        javaTimeModule.addSerializer(
            LocalDate.class,
            new LocalDateSerializer(DATE_FORMATTER)
        );

        mapper.registerModule(javaTimeModule);

        // Configuraciones adicionales
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // No usar timestamps numéricos
        mapper.disable(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE); // 🔑 NO ajustar timezone
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false); // Ignorar campos desconocidos

        return mapper;
    }
}
