package com.styp.cenate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {
        "com.styp.cenate",
        "com.styp.cenate.api",
        "com.styp.cenate.service",
        "com.styp.cenate.repository",
        "com.styp.cenate.model",
        "com.styp.cenate.config",
        "com.styp.cenate.security"
})
public class CenateApplication {
    public static void main(String[] args) {
        SpringApplication.run(CenateApplication.class, args);
    }
}