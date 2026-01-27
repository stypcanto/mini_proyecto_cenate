package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.*;
import com.styp.cenate.model.SolicitudBolsa;
import com.styp.cenate.repository.SolicitudBolsaRepository;
import com.styp.cenate.service.email.EmailService;
import com.styp.cenate.service.bolsas.impl.SolicitudBolsasServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 🧪 Tests Unitarios - SolicitudBolsasService
 * v1.33.0 - Pruebas de métodos de servicio
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de SolicitudBolsasService")
class SolicitudBolsasServiceTest {

    @Mock
    private SolicitudBolsaRepository solicitudBolsaRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private SolicitudBolsasServiceImpl solicitudBolsasService;

    private SolicitudBolsa solicitudMock;
    private SolicitudBolsaRequestDTO solicitudRequestDTO;

    @BeforeEach
    void setUp() {
        // Crear solicitud mock
        solicitudMock = SolicitudBolsa.builder()
            .idSolicitud(1L)
            .numeroSolicitud("BOLSA-20260122-00001")
            .aseguradoId(100L)
            .pacienteNombre("María Gonzales")
            .pacienteDni("12345678")
            .pacienteTelefono("+51987654321")
            .pacienteEmail("maria@test.com")
            .especialidad("Nutrición")
            .estado("APROBADA")
            .responsableGestoraId(null)
            .responsableGestoraNombre(null)
            .recordatorioEnviado(false)
            .estadoGestionCitasId(1L) // CITADO
            .fechaSolicitud(OffsetDateTime.now().minusDays(5))
            .activo(true)
            .build();

        // Crear DTO mock
        solicitudRequestDTO = SolicitudBolsaRequestDTO.builder()
            .aseguradoId(100L)
            .pacienteNombre("María Gonzales")
            .pacienteDni("12345678")
            .pacienteTelefono("+51987654321")
            .pacienteEmail("maria@test.com")
            .especialidad("Nutrición")
            .idBolsa(1L)
            .solicitanteId(1L)
            .solicitanteNombre("Admin")
            .build();
    }

    // ========================================================================
    // 👤 TESTS: ASIGNAR A GESTORA
    // ========================================================================

    @Test
    @DisplayName("✅ Asignar solicitud aprobada a gestora")
    void testAsignarAGestora_Success() {
        // Arrange
        AsignarGestoraRequest request = AsignarGestoraRequest.builder()
            .gestoraId(50L)
            .gestoraNombre("María García")
            .build();

        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class))).thenReturn(solicitudMock);

        // Act
        SolicitudBolsaDTO resultado = solicitudBolsasService.asignarAGestora(1L, request);

        // Assert
        assertNotNull(resultado);
        verify(solicitudBolsaRepository, times(1)).findById(1L);
        verify(solicitudBolsaRepository, times(1)).save(any(SolicitudBolsa.class));
    }

    @Test
    @DisplayName("❌ Asignar solicitud no aprobada debe fallar")
    void testAsignarAGestora_NotApproved() {
        // Arrange
        solicitudMock.setEstado("PENDIENTE");
        AsignarGestoraRequest request = AsignarGestoraRequest.builder()
            .gestoraId(50L)
            .gestoraNombre("María García")
            .build();

        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));

        // Act & Assert
        assertThrows(RuntimeException.class,
            () -> solicitudBolsasService.asignarAGestora(1L, request));

        verify(solicitudBolsaRepository, times(1)).findById(1L);
        verify(solicitudBolsaRepository, never()).save(any(SolicitudBolsa.class));
    }

    @Test
    @DisplayName("❌ Asignar solicitud inexistente debe fallar")
    void testAsignarAGestora_NotFound() {
        // Arrange
        AsignarGestoraRequest request = AsignarGestoraRequest.builder()
            .gestoraId(50L)
            .gestoraNombre("María García")
            .build();

        when(solicitudBolsaRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class,
            () -> solicitudBolsasService.asignarAGestora(999L, request));

        verify(solicitudBolsaRepository, times(1)).findById(999L);
    }

    // ========================================================================
    // 📄 TESTS: EXPORTAR CSV
    // ========================================================================

    @Test
    @DisplayName("✅ Exportar solicitudes a CSV")
    void testExportarCSV_Success() {
        // Arrange
        List<SolicitudBolsa> solicitudes = Arrays.asList(solicitudMock);
        when(solicitudBolsaRepository.findAllById(anyList())).thenReturn(solicitudes);

        // Act
        byte[] csv = solicitudBolsasService.exportarCSV(Arrays.asList(1L));

        // Assert
        assertNotNull(csv);
        assertTrue(csv.length > 0);
        String csvContent = new String(csv);
        assertTrue(csvContent.contains("María Gonzales"));
        assertTrue(csvContent.contains("12345678"));
        verify(solicitudBolsaRepository, times(1)).findAllById(anyList());
    }

    @Test
    @DisplayName("✅ Exportar CSV vacío")
    void testExportarCSV_Empty() {
        // Arrange
        when(solicitudBolsaRepository.findAllById(anyList())).thenReturn(new ArrayList<>());

        // Act
        byte[] csv = solicitudBolsasService.exportarCSV(Arrays.asList());

        // Assert
        assertNotNull(csv);
        String csvContent = new String(csv);
        assertTrue(csvContent.contains("ID,Número,DNI,Paciente"));
    }

    // ========================================================================
    // 📧 TESTS: ENVIAR RECORDATORIO
    // ========================================================================

    @Test
    @DisplayName("✅ Enviar recordatorio por EMAIL")
    void testEnviarRecordatorio_Email_Success() {
        // Arrange
        EnviarRecordatorioRequest request = EnviarRecordatorioRequest.builder()
            .tipo("EMAIL")
            .mensaje("Recordatorio de cita")
            .build();

        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class))).thenReturn(solicitudMock);

        // Act
        SolicitudBolsaDTO resultado = solicitudBolsasService.enviarRecordatorio(1L, request);

        // Assert
        assertNotNull(resultado);
        verify(solicitudBolsaRepository, times(1)).findById(1L);
        verify(solicitudBolsaRepository, times(1)).save(any(SolicitudBolsa.class));
    }

    @Test
    @DisplayName("✅ Enviar recordatorio por WHATSAPP")
    void testEnviarRecordatorio_Whatsapp_Success() {
        // Arrange
        EnviarRecordatorioRequest request = EnviarRecordatorioRequest.builder()
            .tipo("WHATSAPP")
            .mensaje("")
            .build();

        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class))).thenReturn(solicitudMock);

        // Act
        SolicitudBolsaDTO resultado = solicitudBolsasService.enviarRecordatorio(1L, request);

        // Assert
        assertNotNull(resultado);
        verify(solicitudBolsaRepository, times(1)).save(any(SolicitudBolsa.class));
    }

    @Test
    @DisplayName("❌ Enviar recordatorio sin paciente citado debe fallar")
    void testEnviarRecordatorio_NotCited() {
        // Arrange
        solicitudMock.setEstadoGestionCitasId(null); // No citado

        EnviarRecordatorioRequest request = EnviarRecordatorioRequest.builder()
            .tipo("EMAIL")
            .build();

        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));

        // Act & Assert
        assertThrows(RuntimeException.class,
            () -> solicitudBolsasService.enviarRecordatorio(1L, request));

        verify(solicitudBolsaRepository, never()).save(any(SolicitudBolsa.class));
    }

    @Test
    @DisplayName("❌ Enviar email sin email registrado debe fallar")
    void testEnviarRecordatorio_NoEmail() {
        // Arrange
        solicitudMock.setPacienteEmail(null);

        EnviarRecordatorioRequest request = EnviarRecordatorioRequest.builder()
            .tipo("EMAIL")
            .build();

        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));

        // Act & Assert
        assertThrows(RuntimeException.class,
            () -> solicitudBolsasService.enviarRecordatorio(1L, request));
    }

    // ========================================================================
    // 📋 TESTS: OBTENER SOLICITUDES
    // ========================================================================

    @Test
    @DisplayName("✅ Obtener todas las solicitudes")
    void testObtenerTodasLasSolicitudes_Success() {
        // Arrange
        List<SolicitudBolsa> solicitudes = Arrays.asList(solicitudMock);
        when(solicitudBolsaRepository.findByActivoOrderByFechaSolicitudDesc(true)).thenReturn(solicitudes);

        // Act
        List<SolicitudBolsaDTO> resultado = solicitudBolsasService.obtenerTodasLasSolicitudes();

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(solicitudBolsaRepository, times(1)).findByActivoOrderByFechaSolicitudDesc(true);
    }

    @Test
    @DisplayName("✅ Obtener solicitud por ID")
    void testObtenerSolicitudPorId_Success() {
        // Arrange
        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));

        // Act
        SolicitudBolsaDTO resultado = solicitudBolsasService.obtenerSolicitudPorId(1L);

        // Assert
        assertNotNull(resultado);
        assertEquals("María Gonzales", resultado.getPacienteNombre());
        verify(solicitudBolsaRepository, times(1)).findById(1L);
    }

    // ========================================================================
    // ✅ TESTS: CREAR SOLICITUD
    // ========================================================================

    @Test
    @DisplayName("✅ Crear nueva solicitud")
    void testCrearSolicitud_Success() {
        // Arrange
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class))).thenReturn(solicitudMock);

        // Act
        SolicitudBolsaDTO resultado = solicitudBolsasService.crearSolicitud(solicitudRequestDTO);

        // Assert
        assertNotNull(resultado);
        assertEquals("BOLSA-20260122-00001", resultado.getNumeroSolicitud());
        verify(solicitudBolsaRepository, times(1)).save(any(SolicitudBolsa.class));
    }

    // ========================================================================
    // ✏️ TESTS: ACTUALIZAR SOLICITUD
    // ========================================================================

    @Test
    @DisplayName("✅ Actualizar solicitud pendiente")
    void testActualizarSolicitud_Success() {
        // Arrange
        solicitudMock.setEstado("PENDIENTE");
        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class))).thenReturn(solicitudMock);

        // Act
        SolicitudBolsaDTO resultado = solicitudBolsasService.actualizarSolicitud(1L, solicitudRequestDTO);

        // Assert
        assertNotNull(resultado);
        verify(solicitudBolsaRepository, times(1)).save(any(SolicitudBolsa.class));
    }

    @Test
    @DisplayName("❌ Actualizar solicitud aprobada debe fallar")
    void testActualizarSolicitud_NotPending() {
        // Arrange
        solicitudMock.setEstado("APROBADA");
        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));

        // Act & Assert
        assertThrows(RuntimeException.class,
            () -> solicitudBolsasService.actualizarSolicitud(1L, solicitudRequestDTO));

        verify(solicitudBolsaRepository, never()).save(any(SolicitudBolsa.class));
    }

    // ========================================================================
    // 🗑️ TESTS: ELIMINAR SOLICITUD
    // ========================================================================

    @Test
    @DisplayName("✅ Eliminar solicitud pendiente")
    void testEliminarSolicitud_Success() {
        // Arrange
        solicitudMock.setEstado("PENDIENTE");
        when(solicitudBolsaRepository.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(solicitudBolsaRepository.save(any(SolicitudBolsa.class))).thenReturn(solicitudMock);

        // Act
        solicitudBolsasService.eliminarSolicitud(1L);

        // Assert
        verify(solicitudBolsaRepository, times(1)).findById(1L);
        verify(solicitudBolsaRepository, times(1)).save(any(SolicitudBolsa.class));
    }
}
