package com.styp.cenate.config;
import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@Slf4j
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "status", 404,
                        "timestamp", LocalDateTime.now().toString(),
                        "path", request.getRequestURI(),
                        "message", "🚫 El recurso solicitado no existe o fue movido.",
                        "tip", "Verifica la URL o contacta al administrador del sistema."
                ));
    }
}
