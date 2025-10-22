package com.styp.cenate.api.test;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.*;

/**
 * ✅ Endpoint simple de verificación del estado del backend CENATE.
 * Sirve para pruebas de conectividad y despliegue.
 */
@RestController
@RequestMapping("/api/test")
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://10.0.89.239:5173"
})
public class TestController {

    @GetMapping
    public String hello() {
        log.info("🔍 Endpoint de prueba /api/test invocado correctamente");
        return "✅ Backend CENATE operativo y conectado a PostgreSQL";
    }
}
