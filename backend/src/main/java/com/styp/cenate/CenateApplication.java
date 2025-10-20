package com.styp.cenate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // ✅ Ya escanea todo com.styp.cenate.*
public class CenateApplication {
    public static void main(String[] args) {
        SpringApplication.run(CenateApplication.class, args);
    }
}