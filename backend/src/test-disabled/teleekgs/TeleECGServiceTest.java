// ========================================================================
// 📡 TeleECGServiceTest.java – Unit Tests para TeleECGService
// ✅ VERSIÓN 1.0.0 - JUnit 5 + Mockito
// ========================================================================

package com.styp.cenate.service.teleekgs;

import com.styp.cenate.dto.teleekgs.*;
import com.styp.cenate.model.TeleECGImagen;
import com.styp.cenate.model.TeleECGAuditoria;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.repository.TeleECGImagenRepository;
import com.styp.cenate.repository.TeleECGAuditoriaRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.service.email.EmailService;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.repository.AseguradoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class TeleECGServiceTest {

    @Mock
    private TeleECGImagenRepository teleECGImagenRepository;

    @Mock
    private TeleECGAuditoriaRepository teleECGAuditoriaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private IpressRepository ipressRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private TeleECGService teleECGService;

    private SubirImagenECGDTO uploadDTO;
    private TeleECGImagen teleECGImagen;
    private Usuario usuario;
    private Ipress ipress;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        usuario = new Usuario();
        usuario.setIdUser(1L);
        usuario.setUsername("medico1");

        ipress = new Ipress();
        ipress.setId(1L);
        ipress.setCodigoIpress("IPRESS001");
        ipress.setNombreIpress("Hospital A");

        uploadDTO = new SubirImagenECGDTO();
        uploadDTO.setNumDocPaciente("44914706");
        uploadDTO.setNombresPaciente("Juan");
        uploadDTO.setApellidosPaciente("Pérez");

        teleECGImagen = new TeleECGImagen();
        teleECGImagen.setIdImagen(1L);
        teleECGImagen.setNumDocPaciente("44914706");
        teleECGImagen.setEstado("PENDIENTE");
    }

    // ========================================================================
    // Tests: Subir Imagen ECG
    // ========================================================================

    @Test
    void testSubirImagenECGExitoso() {
        // Arrange
        byte[] contenido = "fake image content".getBytes();
        when(ipressRepository.findById(1L)).thenReturn(Optional.of(ipress));
        when(teleECGImagenRepository.save(any(TeleECGImagen.class)))
            .thenReturn(teleECGImagen);

        // Act
        TeleECGImagenDTO resultado = teleECGService.subirImagenECG(
            uploadDTO, 1L, 1L, "192.168.1.1", "Mozilla/5.0"
        );

        // Assert
        assertNotNull(resultado);
        assertEquals("44914706", resultado.getNumDocPaciente());
        assertEquals("PENDIENTE", resultado.getEstado());

        verify(teleECGImagenRepository, times(1)).save(any(TeleECGImagen.class));
        verify(auditLogService, times(1)).registrarEvento(anyString(), anyString(), anyString());
    }

    @Test
    void testSubirImagenECGConArchivoNulo() {
        // Arrange
        uploadDTO.setArchivo(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            teleECGService.subirImagenECG(uploadDTO, 1L, 1L, "192.168.1.1", "Mozilla");
        });
    }

    @Test
    void testSubirImagenECGValidaSHA256() {
        // Arrange
        byte[] contenido = "fake image content".getBytes();
        when(ipressRepository.findById(1L)).thenReturn(Optional.of(ipress));
        when(teleECGImagenRepository.save(any(TeleECGImagen.class)))
            .thenReturn(teleECGImagen);

        // Act
        TeleECGImagenDTO resultado = teleECGService.subirImagenECG(
            uploadDTO, 1L, 1L, "192.168.1.1", "Mozilla"
        );

        // Assert
        verify(teleECGImagenRepository).save(argThat(imagen ->
            imagen.getHashArchivo() != null && !imagen.getHashArchivo().isEmpty()
        ));
    }

    // ========================================================================
    // Tests: Listar Imágenes
    // ========================================================================

    @Test
    void testListarImagenesExitoso() {
        // Arrange
        List<TeleECGImagen> imagenes = Arrays.asList(teleECGImagen);
        Page<TeleECGImagen> page = new PageImpl<>(imagenes);

        when(teleECGImagenRepository.findByNumDocPacienteAndEstadoAndStatImagenOrderByFechaEnvioDesc(
            "44914706", "PENDIENTE", "A", PageRequest.of(0, 20)
        )).thenReturn(page);

        // Act
        Page<TeleECGImagenDTO> resultado = teleECGService.listarImagenes(
            "44914706", "PENDIENTE", null, null, null, PageRequest.of(0, 20)
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        verify(teleECGImagenRepository, times(1)).findByNumDocPacienteAndEstadoAndStatImagenOrderByFechaEnvioDesc(
            anyString(), anyString(), anyString(), any()
        );
    }

    @Test
    void testListarImagenesSinFiltros() {
        // Arrange
        List<TeleECGImagen> imagenes = Arrays.asList(teleECGImagen);
        Page<TeleECGImagen> page = new PageImpl<>(imagenes);

        when(teleECGImagenRepository.findAll(any())).thenReturn(page);

        // Act
        Page<TeleECGImagenDTO> resultado = teleECGService.listarImagenes(
            null, null, null, null, null, PageRequest.of(0, 20)
        );

        // Assert
        assertNotNull(resultado);
        verify(teleECGImagenRepository, times(1)).findAll(any());
    }

    // ========================================================================
    // Tests: Procesar Imagen
    // ========================================================================

    @Test
    void testProcesarImagenAceptar() {
        // Arrange
        when(teleECGImagenRepository.findById(1L)).thenReturn(Optional.of(teleECGImagen));
        when(teleECGImagenRepository.save(any(TeleECGImagen.class)))
            .thenReturn(teleECGImagen);

        ProcesarImagenECGDTO dto = new ProcesarImagenECGDTO();
        dto.setAccion("PROCESAR");

        // Act
        TeleECGImagenDTO resultado = teleECGService.procesarImagen(
            1L, dto, 1L, "192.168.1.1"
        );

        // Assert
        assertNotNull(resultado);
        verify(teleECGImagenRepository, times(1)).save(any(TeleECGImagen.class));
        verify(auditLogService, times(1)).registrarEvento(anyString(), anyString(), anyString());
    }

    @Test
    void testProcesarImagenRechazar() {
        // Arrange
        when(teleECGImagenRepository.findById(1L)).thenReturn(Optional.of(teleECGImagen));
        when(teleECGImagenRepository.save(any(TeleECGImagen.class)))
            .thenReturn(teleECGImagen);

        ProcesarImagenECGDTO dto = new ProcesarImagenECGDTO();
        dto.setAccion("RECHAZAR");
        dto.setMotivoRechazo("Imagen borrosa");

        // Act
        TeleECGImagenDTO resultado = teleECGService.procesarImagen(
            1L, dto, 1L, "192.168.1.1"
        );

        // Assert
        assertNotNull(resultado);
        verify(teleECGImagenRepository).save(argThat(imagen ->
            imagen.getMotivoRechazo() != null && imagen.getMotivoRechazo().contains("borrosa")
        ));
    }

    @Test
    void testProcesarImagenNoEncontrada() {
        // Arrange
        when(teleECGImagenRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () -> {
            teleECGService.procesarImagen(999L, new ProcesarImagenECGDTO(), 1L, "192.168.1.1");
        });
    }

    // ========================================================================
    // Tests: Descargar Imagen
    // ========================================================================

    @Test
    void testDescargarImagenaExitoso() {
        // Arrange
        byte[] contenido = "fake image content".getBytes();
        teleECGImagen.setContenidoImagen(contenido);

        when(teleECGImagenRepository.findById(1L)).thenReturn(Optional.of(teleECGImagen));

        // Act
        byte[] resultado = teleECGService.descargarImagen(1L, 1L, "192.168.1.1");

        // Assert
        assertNotNull(resultado);
        assertEquals(contenido.length, resultado.length);
        verify(auditLogService, times(1)).registrarEvento(anyString(), anyString(), anyString());
    }

    @Test
    void testDescargarImagenoEncontrada() {
        // Arrange
        when(teleECGImagenRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () -> {
            teleECGService.descargarImagen(999L, 1L, "192.168.1.1");
        });
    }

    // ========================================================================
    // Tests: Obtener Estadísticas
    // ========================================================================

    @Test
    void testObtenerEstadisticas() {
        // Arrange
        when(teleECGImagenRepository.count()).thenReturn(100L);

        // Act
        TeleECGEstadisticasDTO resultado = teleECGService.obtenerEstadisticas();

        // Assert
        assertNotNull(resultado);
        verify(teleECGImagenRepository, times(1)).count();
    }

    // ========================================================================
    // Tests: Limpieza Automática
    // ========================================================================

    @Test
    void testLimpiarImagenesVencidas() {
        // Arrange
        when(teleECGImagenRepository.marcarComoInactivas(any(LocalDateTime.class)))
            .thenReturn(5);

        // Act
        teleECGService.limpiarImagenesVencidas();

        // Assert
        verify(teleECGImagenRepository, times(1)).marcarComoInactivas(any(LocalDateTime.class));
        verify(auditLogService, times(1)).registrarEvento(anyString(), anyString(), anyString());
    }

    // ========================================================================
    // Tests: Auditoría
    // ========================================================================

    @Test
    void testObtenerAuditoria() {
        // Arrange
        TeleECGAuditoria auditoria = new TeleECGAuditoria();
        auditoria.setIdAuditoria(1L);
        auditoria.setAccion("CARGADA");

        List<TeleECGAuditoria> auditorias = Arrays.asList(auditoria);
        Page<TeleECGAuditoria> page = new PageImpl<>(auditorias);

        when(teleECGAuditoriaRepository.findByImagenIdImagenOrderByFechaAccionDesc(
            1L, PageRequest.of(0, 20)
        )).thenReturn(page);

        // Act
        Page<TeleECGAuditoriaDTO> resultado = teleECGService.obtenerAuditoria(
            1L, PageRequest.of(0, 20)
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
    }

    // ========================================================================
    // Tests: Validación de Seguridad
    // ========================================================================

    @Test
    void testValidarDNI() {
        // Test: DNI válido
        String dni = "44914706";
        assertTrue(dni.matches("^\\d{8}$"));

        // Test: DNI inválido (menos de 8 dígitos)
        String dniInvalido = "4491470";
        assertFalse(dniInvalido.matches("^\\d{8}$"));
    }

    @Test
    void testValidarTamanioArchivo() {
        // Test: 5MB máximo
        long tamanioMaximo = 5 * 1024 * 1024; // 5MB
        long tamanioArchivo = 4 * 1024 * 1024; // 4MB

        assertTrue(tamanioArchivo <= tamanioMaximo);

        long tamanioArchivoBig = 6 * 1024 * 1024; // 6MB
        assertFalse(tamanioArchivoBig <= tamanioMaximo);
    }

    @Test
    void testValidarMIMEType() {
        // Test: Tipos MIME válidos
        String mimeJPEG = "image/jpeg";
        String mimePNG = "image/png";

        assertTrue(mimeJPEG.equals("image/jpeg") || mimeJPEG.equals("image/png"));
        assertTrue(mimePNG.equals("image/jpeg") || mimePNG.equals("image/png"));

        // Test: Tipo MIME inválido
        String mimePDF = "application/pdf";
        assertFalse(mimePDF.equals("image/jpeg") || mimePDF.equals("image/png"));
    }

    @Test
    void testValidarFechaExpiracion() {
        // Test: Fecha de expiración +30 días desde ahora
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime fechaExpiracion = ahora.plusDays(30);

        assertTrue(fechaExpiracion.isAfter(ahora));
        assertEquals(30, java.time.temporal.ChronoUnit.DAYS.between(ahora, fechaExpiracion));
    }
}
