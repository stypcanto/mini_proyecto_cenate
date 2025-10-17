package com.styp.cenate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Esta configuración habilita el procesamiento asíncrono
    // para el registro de logs de auditoría sin bloquear las peticiones
}
