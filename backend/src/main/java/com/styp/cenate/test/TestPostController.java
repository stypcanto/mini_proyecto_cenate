package com.styp.cenate.test;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

/**
 * ✅ Controller de prueba para verificar si POST se registra en otro paquete
 */
@RestController
@RequestMapping("/api/test-post")
@Slf4j
public class TestPostController {

    /**
     * GET de prueba
     */
    @GetMapping("/hello")
    public ResponseEntity<String> testGet() {
        log.info("✅ GET /api/test-post/hello funcionó");
        return ResponseEntity.ok("GET funciona");
    }

    /**
     * POST de prueba SIN parámetros
     */
    @PostMapping("/simple")
    public ResponseEntity<String> testPostSimple() {
        log.info("✅ POST /api/test-post/simple funcionó");
        return ResponseEntity.ok("POST funciona");
    }

    /**
     * POST con parámetro de query
     */
    @PostMapping("/with-param")
    public ResponseEntity<String> testPostWithParam(@RequestParam String message) {
        log.info("✅ POST /api/test-post/with-param funcionó: {}", message);
        return ResponseEntity.ok("POST con parámetro funciona: " + message);
    }

    /**
     * POST con body JSON
     */
    @PostMapping("/with-body")
    public ResponseEntity<String> testPostWithBody(@RequestBody String body) {
        log.info("✅ POST /api/test-post/with-body funcionó: {}", body);
        return ResponseEntity.ok("POST con body funciona: " + body);
    }
}
