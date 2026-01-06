package com.styp.cenate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication(scanBasePackages = "com.styp.cenate")
@EnableAsync
public class CenateApplication {

    private static final String TIMEZONE_LIMA = "America/Lima";

    public static void main(String[] args) {
        // Configurar zona horaria antes de iniciar Spring
        TimeZone.setDefault(TimeZone.getTimeZone(TIMEZONE_LIMA));
        SpringApplication.run(CenateApplication.class, args);
    }

    @PostConstruct
    public void init() {
        // Asegurar zona horaria después de iniciar Spring
        TimeZone.setDefault(TimeZone.getTimeZone(TIMEZONE_LIMA));
    }
}