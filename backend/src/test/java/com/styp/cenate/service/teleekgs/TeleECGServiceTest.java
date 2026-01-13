// ========================================================================
// 📡 TeleECGServiceTest.java – Unit Tests para TeleECGService
// ✅ VERSIÓN 2.0.0 - Filesystem Storage + JUnit 5 + Mockito
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
import com.styp.cenate.service.storage.FileStorageService;
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

/**
 * Tests para TeleECGService (v2.0.0 - Filesystem Storage)
 *
 * Nota: Algunos tests están simplificados porque requieren
 * operaciones de filesystem que son complejas de mockear.
 * Los tests más críticos están en FileStorageServiceTest.
 */
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

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private AseguradoRepository aseguradoRepository;

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

        ipress = new Ipress();
        ipress.setIdIpress(1L);
        ipress.setCodIpress("001");
        ipress.setDescIpress("Hospital A");

        uploadDTO = new SubirImagenECGDTO();
        uploadDTO.setNumDocPaciente("44914706");
        uploadDTO.setNombresPaciente("Juan");
        uploadDTO.setApellidosPaciente("Pérez");

        teleECGImagen = new TeleECGImagen();
        teleECGImagen.setIdImagen(1L);
        teleECGImagen.setNumDocPaciente("44914706");
        teleECGImagen.setEstado("PENDIENTE");
        teleECGImagen.setStatImagen("A");
        teleECGImagen.setSha256("abc123def456");
    }

    // ========================================================================
    // Tests: Listar Imágenes
    // ========================================================================

    @Test
    void testListarImagenesExitoso() {
        // Arrange
        List<TeleECGImagen> imagenes = Arrays.asList(teleECGImagen);
        Page<TeleECGImagen> page = new PageImpl<>(imagenes);

        when(teleECGImagenRepository.buscarFlexible(
            "44914706", "PENDIENTE", null, null, null, PageRequest.of(0, 20)
        )).thenReturn(page);

        // Act
        Page<TeleECGImagenDTO> resultado = teleECGService.listarImagenes(
            "44914706", "PENDIENTE", null, null, null, PageRequest.of(0, 20)
        );

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        verify(teleECGImagenRepository, times(1)).buscarFlexible(
            anyString(), anyString(), any(), any(), any(), any()
        );
    }

    @Test
    void testListarImagenesSinFiltros() {
        // Arrange
        List<TeleECGImagen> imagenes = Arrays.asList(teleECGImagen);
        Page<TeleECGImagen> page = new PageImpl<>(imagenes);

        when(teleECGImagenRepository.buscarFlexible(
            null, null, null, null, null, PageRequest.of(0, 20)
        )).thenReturn(page);

        // Act
        Page<TeleECGImagenDTO> resultado = teleECGService.listarImagenes(
            null, null, null, null, null, PageRequest.of(0, 20)
        );

        // Assert
        assertNotNull(resultado);
    }

    // ========================================================================
    // Tests: Obtener Detalles de Imagen
    // ========================================================================

    @Test
    void testObtenerDetallesImagenExitoso() {
        // Arrange
        when(teleECGImagenRepository.findById(1L)).thenReturn(Optional.of(teleECGImagen));

        // Act
        TeleECGImagenDTO resultado = teleECGService.obtenerDetallesImagen(
            1L, 1L, "192.168.1.1"
        );

        // Assert
        assertNotNull(resultado);
        verify(teleECGImagenRepository, times(1)).findById(1L);
        verify(teleECGAuditoriaRepository, times(1)).save(any(TeleECGAuditoria.class));
    }

    @Test
    void testObtenerDetallesImagenNoEncontrada() {
        // Arrange
        when(teleECGImagenRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () -> {
            teleECGService.obtenerDetallesImagen(999L, 1L, "192.168.1.1");
        });
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
        verify(teleECGAuditoriaRepository, times(1)).save(any(TeleECGAuditoria.class));
    }

    @Test
    void testProcesarImagenRechazar() {
        // Arrange
        when(teleECGImagenRepository.findById(1L)).thenReturn(Optional.of(teleECGImagen));
        when(teleECGImagenRepository.save(any(TeleECGImagen.class)))
            .thenReturn(teleECGImagen);

        ProcesarImagenECGDTO dto = new ProcesarImagenECGDTO();
        dto.setAccion("RECHAZAR");
        dto.setMotivo("Imagen borrosa");

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
    // Tests: Obtener Estadísticas
    // ========================================================================

    @Test
    void testObtenerEstadisticas() {
        // Arrange
        when(teleECGImagenRepository.count()).thenReturn(100L);
        when(teleECGImagenRepository.countByEstadoAndStatImagenEquals("PENDIENTE", "A")).thenReturn(50L);
        when(teleECGImagenRepository.countByEstadoAndStatImagenEquals("PROCESADA", "A")).thenReturn(40L);
        when(teleECGImagenRepository.countByEstadoAndStatImagenEquals("RECHAZADA", "A")).thenReturn(10L);

        // Act
        TeleECGEstadisticasDTO resultado = teleECGService.obtenerEstadisticas();

        // Assert
        assertNotNull(resultado);
        verify(teleECGImagenRepository, atLeast(1)).count();
    }

    // ========================================================================
    // Tests: Obtener Imágenes Próximas a Vencer
    // ========================================================================

    @Test
    void testObtenerProximasVencer() {
        // Arrange
        teleECGImagen.setStatImagen("A");
        teleECGImagen.setFechaExpiracion(LocalDateTime.now().plusDays(2)); // Dentro de 3 días

        List<TeleECGImagen> allImages = Arrays.asList(teleECGImagen);
        when(teleECGImagenRepository.findAll()).thenReturn(allImages);

        // Act
        List<TeleECGImagenDTO> resultado = teleECGService.obtenerProximasVencer();

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(teleECGImagenRepository, times(1)).findAll();
    }

    // ========================================================================
    // Tests: Obtener Auditoría
    // ========================================================================

    @Test
    void testObtenerAuditoria() {
        // Arrange
        TeleECGAuditoria auditoria = new TeleECGAuditoria();
        auditoria.setIdAuditoria(1L);
        auditoria.setAccion("VISUALIZADA");

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
}
