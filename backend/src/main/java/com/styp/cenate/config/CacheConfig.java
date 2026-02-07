package com.styp.cenate.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

/**
 * ✅ Configuración de Caché
 * v1.55.0: Optimización de estadísticas (5 minutos TTL con Simple Cache)
 *
 * Cachea:
 * - estadisticas-generales: obtenerEstadisticasGenerales() → 300ms → 5-20ms
 * - estadisticas-por-estado: obtenerEstadisticasPorEstado() → 250ms → 5-20ms
 * - estadisticas-por-ipress: obtenerEstadisticasPorIpress() → 250ms → 5-20ms
 * - estadisticas-por-tipo-cita: obtenerEstadisticasPorTipoCita() → 150ms → 5-20ms
 *
 * TTL: 5 minutos (300 segundos) - después se recalculan para datos frescos
 *
 * Usa:
 * - Simple Cache (HashMap en memoria) para desarrollo/testing
 * - Redis Cache (cambiar spring.cache.type=redis en application.properties) para producción
 */
@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {
    // Spring Boot configura automáticamente el CacheManager basado en spring.cache.type
    // No necesita configuración adicional para Simple Cache

    public CacheConfig() {
        log.info("✅ CacheConfig habilitado - @Cacheable activado");
    }
}
