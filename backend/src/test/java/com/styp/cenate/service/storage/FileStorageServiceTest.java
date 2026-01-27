package com.styp.cenate.service.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit Tests para FileStorageService (sin Spring Context)
 * Cubre: guardar, leer, eliminar, integridad, validación, seguridad
 */
@DisplayName("FileStorageService Unit Tests")
class FileStorageServiceTest {

    private FileStorageService fileStorageService;
    private String testBasePath;

    @BeforeEach
    void setUp() throws IOException {
        testBasePath = "/tmp/teleekgs-test";

        // Instanciar service sin Spring
        fileStorageService = new FileStorageService();

        // Inyectar basePath usando reflection
        ReflectionTestUtils.setField(fileStorageService, "basePath", testBasePath);

        // Limpiar directorio de pruebas
        Path testDir = Paths.get(testBasePath);
        if (Files.exists(testDir)) {
            Files.walk(testDir)
                .sorted(Comparator.reverseOrder())
                .forEach(path -> {
                    try {
                        Files.delete(path);
                    } catch (IOException e) {
                        // Ignore
                    }
                });
        }
        Files.createDirectories(testDir);
    }

    // ============================================================
    // TEST: Guardar Archivo
    // ============================================================

    @Test
    @DisplayName("Guardar archivo ECG exitosamente")
    void testGuardarArchivo_Success() throws IOException {
        // Arrange
        byte[] contenido = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x45}; // JPEG magic
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test_ecg.jpg",
            "image/jpeg",
            contenido
        );

        // Act
        String ruta = fileStorageService.guardarArchivo(file, "12345678", "001");

        // Assert
        assertNotNull(ruta);
        assertTrue(ruta.contains("IPRESS_001"));
        assertTrue(ruta.contains("12345678_"));
        assertTrue(ruta.endsWith(".jpg"));
        assertTrue(Files.exists(Paths.get(ruta)));
    }

    @Test
    @DisplayName("Estructura de directorios YYYY/MM/DD/IPRESS_XXX")
    void testGuardarArchivo_DirectorioEstructura() throws IOException {
        // Arrange
        byte[] contenido = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x45};
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", contenido
        );

        // Act
        String ruta = fileStorageService.guardarArchivo(file, "87654321", "002");

        // Assert - Verificar estructura de carpetas
        assertTrue(ruta.matches(".*\\d{4}/\\d{2}/\\d{2}/IPRESS_002/.*"));
    }

    // ============================================================
    // TEST: Calcular SHA256
    // ============================================================

    @Test
    @DisplayName("Calcular SHA256 correctamente")
    void testCalcularSHA256() throws IOException {
        // Arrange
        byte[] contenido = "test content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", contenido
        );

        // Act
        String sha256 = fileStorageService.calcularSHA256(file);

        // Assert
        assertNotNull(sha256);
        assertEquals(64, sha256.length()); // SHA256 = 64 hex chars
        assertTrue(sha256.matches("[a-f0-9]{64}")); // Solo hex
    }

    @Test
    @DisplayName("SHA256 diferente para contenidos diferentes")
    void testCalcularSHA256_Diferente() throws IOException {
        // Arrange
        MockMultipartFile file1 = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", "contenido1".getBytes()
        );
        MockMultipartFile file2 = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", "contenido2".getBytes()
        );

        // Act
        String sha1 = fileStorageService.calcularSHA256(file1);
        String sha2 = fileStorageService.calcularSHA256(file2);

        // Assert
        assertNotEquals(sha1, sha2);
    }

    // ============================================================
    // TEST: Validación y Seguridad
    // ============================================================

    @Test
    @DisplayName("Rechazar intento de path traversal")
    void testGuardarArchivo_PathTraversal_Rechazado() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "../../../etc/passwd",
            "image/jpeg",
            new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}
        );

        // Act & Assert
        assertThrows(IOException.class, () -> {
            fileStorageService.guardarArchivo(file, "12345678", "001");
        });
    }

    @Test
    @DisplayName("Rechazar archivo vacío")
    void testGuardarArchivo_ArchivoVacio_Rechazado() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", new byte[0]
        );

        // Act & Assert
        assertThrows(IOException.class, () -> {
            fileStorageService.guardarArchivo(file, "12345678", "001");
        });
    }

    @Test
    @DisplayName("Rechazar extensión inválida")
    void testGuardarArchivo_ExtensionInvalida_Rechazada() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file", "malicious.exe", "image/jpeg",
            new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}
        );

        // Act & Assert
        assertThrows(IOException.class, () -> {
            fileStorageService.guardarArchivo(file, "12345678", "001");
        });
    }

    @Test
    @DisplayName("Rechazar archivo mayor a 5MB")
    void testGuardarArchivo_TamanioExcedido_Rechazado() {
        // Arrange - Simular archivo de 6MB
        byte[] contenido = new byte[6 * 1024 * 1024];
        // Agregar JPEG magic bytes
        contenido[0] = (byte) 0xFF;
        contenido[1] = (byte) 0xD8;
        contenido[2] = (byte) 0xFF;

        MockMultipartFile file = new MockMultipartFile(
            "file", "grande.jpg", "image/jpeg", contenido
        );

        // Act & Assert
        assertThrows(IOException.class, () -> {
            fileStorageService.guardarArchivo(file, "12345678", "001");
        });
    }

    @Test
    @DisplayName("Rechazar MIME type inválido")
    void testGuardarArchivo_MimeTypeInvalido_Rechazado() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.jpg", "application/pdf",
            new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}
        );

        // Act & Assert
        assertThrows(IOException.class, () -> {
            fileStorageService.guardarArchivo(file, "12345678", "001");
        });
    }

    @Test
    @DisplayName("Rechazar magic bytes inválidos")
    void testGuardarArchivo_MagicBytesInvalidos_Rechazados() {
        // Arrange - No tiene JPEG magic (FF D8 FF) ni PNG magic (89 50 4E 47)
        MockMultipartFile file = new MockMultipartFile(
            "file", "fake.jpg", "image/jpeg",
            new byte[]{0x00, 0x00, 0x00, 0x00}
        );

        // Act & Assert
        assertThrows(IOException.class, () -> {
            fileStorageService.guardarArchivo(file, "12345678", "001");
        });
    }

    // ============================================================
    // TEST: Leer Archivo
    // ============================================================

    @Test
    @DisplayName("Leer archivo exitosamente")
    void testLeerArchivo_Success() throws IOException {
        // Arrange
        byte[] contenidoOriginal = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x45};
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", contenidoOriginal
        );
        String ruta = fileStorageService.guardarArchivo(file, "12345678", "001");

        // Act
        byte[] contenidoLeido = fileStorageService.leerArchivo(ruta);

        // Assert
        assertNotNull(contenidoLeido);
        assertTrue(contenidoLeido.length > 0);
        assertEquals(contenidoOriginal.length, contenidoLeido.length);
    }

    @Test
    @DisplayName("Error al leer archivo inexistente")
    void testLeerArchivo_NoExiste_Error() {
        // Arrange
        String rutaInexistente = "/tmp/teleekgs-test/2026/01/13/IPRESS_999/inexistente.jpg";

        // Act & Assert
        assertThrows(IOException.class, () -> {
            fileStorageService.leerArchivo(rutaInexistente);
        });
    }

    @Test
    @DisplayName("Rechazar intento de path traversal en lectura")
    void testLeerArchivo_PathTraversal_Rechazado() {
        // Act & Assert - Usar ruta absoluta que está fuera del basePath
        assertThrows(SecurityException.class, () -> {
            fileStorageService.leerArchivo("/etc/passwd");
        });
    }

    // ============================================================
    // TEST: Verificar Integridad
    // ============================================================

    @Test
    @DisplayName("Verificar integridad correcta")
    void testVerificarIntegridad_Valida() throws IOException {
        // Arrange
        byte[] contenido = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x45};
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", contenido
        );
        String ruta = fileStorageService.guardarArchivo(file, "12345678", "001");
        String sha256 = fileStorageService.calcularSHA256(file);

        // Act
        boolean valido = fileStorageService.verificarIntegridad(ruta, sha256);

        // Assert
        assertTrue(valido);
    }

    @Test
    @DisplayName("Detectar integridad comprometida")
    void testVerificarIntegridad_Invalida() throws IOException {
        // Arrange
        byte[] contenido = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x45};
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", contenido
        );
        String ruta = fileStorageService.guardarArchivo(file, "12345678", "001");
        String sha256Incorrecto = "0000000000000000000000000000000000000000000000000000000000000000";

        // Act
        boolean valido = fileStorageService.verificarIntegridad(ruta, sha256Incorrecto);

        // Assert
        assertFalse(valido);
    }

    // ============================================================
    // TEST: Eliminar Archivo
    // ============================================================

    @Test
    @DisplayName("Eliminar archivo exitosamente")
    void testEliminarArchivo_Success() throws IOException {
        // Arrange
        byte[] contenido = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x45};
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", contenido
        );
        String ruta = fileStorageService.guardarArchivo(file, "12345678", "001");
        assertTrue(Files.exists(Paths.get(ruta)));

        // Act
        boolean eliminado = fileStorageService.eliminarArchivo(ruta);

        // Assert
        assertTrue(eliminado);
        assertFalse(Files.exists(Paths.get(ruta)));
    }

    @Test
    @DisplayName("Eliminar archivo inexistente retorna false")
    void testEliminarArchivo_NoExiste_RetornaFalse() {
        // Arrange
        String rutaInexistente = "/tmp/teleekgs-test/2026/01/13/IPRESS_999/inexistente.jpg";

        // Act
        boolean eliminado = fileStorageService.eliminarArchivo(rutaInexistente);

        // Assert
        assertFalse(eliminado);
    }

    // ============================================================
    // TEST: Archivar Archivo
    // ============================================================

    @Test
    @DisplayName("Archivar archivo exitosamente")
    void testArchivarArchivo_Success() throws IOException {
        // Arrange
        byte[] contenido = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x45};
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.jpg", "image/jpeg", contenido
        );
        String ruta = fileStorageService.guardarArchivo(file, "12345678", "001");

        // Act
        String rutaArchive = fileStorageService.archivarArchivo(ruta);

        // Assert
        assertNotNull(rutaArchive);
        assertTrue(rutaArchive.contains("/archive/"));
        assertTrue(Files.exists(Paths.get(rutaArchive)));
        assertFalse(Files.exists(Paths.get(ruta))); // Original debe estar eliminado
    }

    // ============================================================
    // TEST: Integración Completa
    // ============================================================

    @Test
    @DisplayName("Flujo completo: Guardar → Calcular SHA → Verificar → Leer → Archivar")
    void testFlujoCompleto() throws IOException {
        // Arrange
        byte[] contenido = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x45, 0x01, 0x02};
        MockMultipartFile file = new MockMultipartFile(
            "file", "completo.jpg", "image/jpeg", contenido
        );

        // Act 1: Guardar
        String ruta = fileStorageService.guardarArchivo(file, "99999999", "005");
        assertTrue(Files.exists(Paths.get(ruta)));

        // Act 2: Calcular SHA
        String sha256 = fileStorageService.calcularSHA256(file);
        assertNotNull(sha256);

        // Act 3: Verificar integridad
        boolean valido = fileStorageService.verificarIntegridad(ruta, sha256);
        assertTrue(valido);

        // Act 4: Leer contenido
        byte[] leido = fileStorageService.leerArchivo(ruta);
        assertEquals(contenido.length, leido.length);

        // Act 5: Archivar
        String rutaArchive = fileStorageService.archivarArchivo(ruta);
        assertTrue(rutaArchive.contains("/archive/"));
        assertTrue(Files.exists(Paths.get(rutaArchive)));
        assertFalse(Files.exists(Paths.get(ruta)));

        // Assert - Verificar lectura desde archive
        byte[] leidoArchive = fileStorageService.leerArchivo(rutaArchive);
        assertEquals(contenido.length, leidoArchive.length);
    }
}
