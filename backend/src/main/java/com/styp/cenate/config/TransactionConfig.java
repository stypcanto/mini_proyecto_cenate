package com.styp.cenate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * 💾 Configuración de Transacciones
 * Define beans personalizados para TransactionTemplate con distintos niveles de acceso
 */
@Configuration
public class TransactionConfig {

    /**
     * 🔧 TransactionTemplate para operaciones de LECTURA (readOnly = true)
     * Optimizado para consultas, mejor rendimiento
     */
    @Bean(name = "readableTransactionTemplate")
    public TransactionTemplate readableTransactionTemplate(PlatformTransactionManager transactionManager) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setReadOnly(true);
        def.setName("readableTransactionTemplate");
        template.setTransactionManager(transactionManager);
        return template;
    }

    /**
     * 🔧 TransactionTemplate para operaciones de ESCRITURA (readOnly = false)
     * Necesario para INSERT, UPDATE, DELETE y funciones PL/pgSQL que modifiquen BD
     */
    @Bean(name = "writableTransactionTemplate")
    @org.springframework.context.annotation.Primary
    public TransactionTemplate writableTransactionTemplate(PlatformTransactionManager transactionManager) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setReadOnly(false);
        def.setName("writableTransactionTemplate");
        template.setTransactionManager(transactionManager);
        return template;
    }
}
