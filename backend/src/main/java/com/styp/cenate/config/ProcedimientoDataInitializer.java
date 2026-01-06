package com.styp.cenate.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.styp.cenate.model.Procedimiento;
import com.styp.cenate.repository.ProcedimientoRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Inicializador de datos para la tabla dim_proced.
 * Se ejecuta al iniciar la aplicación para asegurar que existan datos base.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProcedimientoDataInitializer implements CommandLineRunner {

    private final ProcedimientoRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            log.info("🚀 Inicializando datos para dim_proced (Procedimientos CPT)...");

            List<Procedimiento> cleanList = Arrays.asList(
                    Procedimiento.builder().codProced("LAB").descProced("LABORATORIO CLINICO").statProced("A")
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),
                    Procedimiento.builder().codProced("IMG").descProced("IMAGENOLOGIA").statProced("A")
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),
                    Procedimiento.builder().codProced("MNU").descProced("MEDICINA NUCLEAR").statProced("A")
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),
                    Procedimiento.builder().codProced("ANP").descProced("ANATOMIA PATOLOGICA").statProced("A")
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),
                    Procedimiento.builder().codProced("END").descProced("ENDOSCOPIAS").statProced("A")
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),
                    Procedimiento.builder().codProced("PRF").descProced("PRUEBAS FUNCIONALES").statProced("A")
                            .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());

            repository.saveAll(cleanList);
            log.info("✅ Se insertaron {} registros en dim_proced.", cleanList.size());
        } else {
            log.info("ℹ️ La tabla dim_proced ya contiene datos. No se requiere inicialización.");
        }
    }
}
