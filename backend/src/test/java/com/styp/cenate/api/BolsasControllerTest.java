package com.styp.cenate.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.styp.cenate.dto.bolsas.*;
import com.styp.cenate.service.bolsas.SolicitudBolsasService;
import com.styp.cenate.service.bolsas.SolicitudBolsasService.EstadisticasSolicitudesDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 🧪 Tests de Integración - BolsasController
 * v1.33.0 - Pruebas de endpoints REST
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests de BolsasController")
@WithMockUser(username = "testuser", roles = {"ADMIN"})
class BolsasControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SolicitudBolsasService solicitudBolsasService;

    private SolicitudBolsaDTO solicitudDTO;
    private AsignarGestoraRequest asignarGestoraRequest;
    private EnviarRecordatorioRequest recordatorioRequest;

    @BeforeEach
    void setUp() {
        // DTO para solicitud
        solicitudDTO = SolicitudBolsaDTO.builder()
            .idSolicitud(1L)
            .numeroSolicitud("BOLSA-20260122-00001")
            .aseguradoId(100L)
            .pacienteNombre("María Gonzales")
            .pacienteDni("12345678")
            .pacienteTelefono("+51987654321")
            .pacienteEmail("maria@test.com")
            .especialidad("Nutrición")
            .estado("APROBADA")
            .responsableGestoraId(50L)
            .responsableGestoraNombre("María García")
            .fechaSolicitud(OffsetDateTime.now().minusDays(5))
            .build();

        // Request para asignar gestora
        asignarGestoraRequest = AsignarGestoraRequest.builder()
            .gestoraId(50L)
            .gestoraNombre("María García")
            .build();

        // Request para recordatorio
        recordatorioRequest = EnviarRecordatorioRequest.builder()
            .tipo("EMAIL")
            .mensaje("Recordatorio de cita")
            .build();
    }

    // ========================================================================
    // 📋 TESTS: OBTENER SOLICITUDES
    // ========================================================================

    @Test
    @DisplayName("✅ GET /api/bolsas/solicitudes - Obtener todas")
    void testObtenerSolicitudes_Success() throws Exception {
        // Arrange
        List<SolicitudBolsaDTO> solicitudes = Arrays.asList(solicitudDTO);
        when(solicitudBolsasService.obtenerTodasLasSolicitudes()).thenReturn(solicitudes);

        // Act & Assert
        mockMvc.perform(get("/api/bolsas/solicitudes")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].idSolicitud", is(1)))
            .andExpect(jsonPath("$[0].pacienteNombre", is("María Gonzales")));

        verify(solicitudBolsasService, times(1)).obtenerTodasLasSolicitudes();
    }

    @Test
    @DisplayName("✅ GET /api/bolsas/solicitudes/{id} - Obtener por ID")
    void testObtenerSolicitudPorId_Success() throws Exception {
        // Arrange
        when(solicitudBolsasService.obtenerSolicitudPorId(1L)).thenReturn(solicitudDTO);

        // Act & Assert
        mockMvc.perform(get("/api/bolsas/solicitudes/1")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.idSolicitud", is(1)))
            .andExpect(jsonPath("$.numeroSolicitud", is("BOLSA-20260122-00001")));

        verify(solicitudBolsasService, times(1)).obtenerSolicitudPorId(1L);
    }

    // ========================================================================
    // ✅ TESTS: CREAR SOLICITUD
    // ========================================================================

    @Test
    @DisplayName("✅ POST /api/bolsas/solicitudes - Crear solicitud")
    void testCrearSolicitud_Success() throws Exception {
        // Arrange
        SolicitudBolsaRequestDTO request = SolicitudBolsaRequestDTO.builder()
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

        when(solicitudBolsasService.crearSolicitud(any()))
            .thenReturn(solicitudDTO);

        // Act & Assert
        mockMvc.perform(post("/api/bolsas/solicitudes")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());

        verify(solicitudBolsasService, times(1)).crearSolicitud(any());
    }

    // ========================================================================
    // ✏️ TESTS: ACTUALIZAR SOLICITUD
    // ========================================================================

    @Test
    @DisplayName("✅ PUT /api/bolsas/solicitudes/{id} - Actualizar")
    void testActualizarSolicitud_Success() throws Exception {
        // Arrange
        SolicitudBolsaRequestDTO request = SolicitudBolsaRequestDTO.builder()
            .aseguradoId(100L)
            .pacienteNombre("María Gonzales (actualizado)")
            .pacienteDni("12345678")
            .pacienteTelefono("+51987654321")
            .pacienteEmail("maria@test.com")
            .especialidad("Nutrición")
            .idBolsa(1L)
            .solicitanteId(1L)
            .solicitanteNombre("Admin")
            .build();

        when(solicitudBolsasService.actualizarSolicitud(eq(1L), any()))
            .thenReturn(solicitudDTO);

        // Act & Assert
        mockMvc.perform(put("/api/bolsas/solicitudes/1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk());

        verify(solicitudBolsasService, times(1)).actualizarSolicitud(eq(1L), any());
    }

    // ========================================================================
    // 👤 TESTS: ASIGNAR A GESTORA
    // ========================================================================

    @Test
    @DisplayName("✅ PATCH /api/bolsas/solicitudes/{id}/asignar - Asignar a gestora")
    void testAsignarAGestora_Success() throws Exception {
        // Arrange
        when(solicitudBolsasService.asignarAGestora(eq(1L), any()))
            .thenReturn(solicitudDTO);

        // Act & Assert
        mockMvc.perform(patch("/api/bolsas/solicitudes/1/asignar")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(asignarGestoraRequest)))
            .andExpect(status().isOk());

        verify(solicitudBolsasService, times(1)).asignarAGestora(eq(1L), any());
    }

    @Test
    @DisplayName("❌ PATCH asignar con datos inválidos")
    void testAsignarAGestora_InvalidRequest() throws Exception {
        // Arrange - request sin gestoraId
        String invalidRequest = "{ \"gestoraNombre\": \"María García\" }";

        // Act & Assert
        mockMvc.perform(patch("/api/bolsas/solicitudes/1/asignar")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidRequest))
            .andExpect(status().isBadRequest());
    }

    // ========================================================================
    // 📄 TESTS: EXPORTAR CSV
    // ========================================================================

    @Test
    @DisplayName("✅ GET /api/bolsas/solicitudes/exportar - Descargar CSV")
    void testExportarCSV_Success() throws Exception {
        // Arrange
        byte[] csvData = "ID,DNI,Nombre\n1,12345678,María Gonzales".getBytes();
        when(solicitudBolsasService.exportarCSV(anyList())).thenReturn(csvData);

        // Act & Assert
        mockMvc.perform(get("/api/bolsas/solicitudes/exportar")
            .param("ids", "1")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(header().exists("Content-Disposition"))
            .andExpect(header().string("Content-Disposition",
                containsString("attachment")));

        verify(solicitudBolsasService, times(1)).exportarCSV(anyList());
    }

    @Test
    @DisplayName("✅ GET exportar CSV sin IDs (todos)")
    void testExportarCSV_AllRecords() throws Exception {
        // Arrange
        byte[] csvData = "ID,DNI,Nombre\n1,12345678,María Gonzales".getBytes();
        when(solicitudBolsasService.obtenerTodasLasSolicitudes())
            .thenReturn(Arrays.asList(solicitudDTO));
        when(solicitudBolsasService.exportarCSV(anyList())).thenReturn(csvData);

        // Act & Assert
        mockMvc.perform(get("/api/bolsas/solicitudes/exportar")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Type",
                containsString("text/csv")));
    }

    // ========================================================================
    // 📧 TESTS: ENVIAR RECORDATORIO
    // ========================================================================

    @Test
    @DisplayName("✅ POST /api/bolsas/solicitudes/{id}/recordatorio - Enviar EMAIL")
    void testEnviarRecordatorio_Email_Success() throws Exception {
        // Arrange
        when(solicitudBolsasService.enviarRecordatorio(eq(1L), any()))
            .thenReturn(solicitudDTO);

        // Act & Assert
        mockMvc.perform(post("/api/bolsas/solicitudes/1/recordatorio")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(recordatorioRequest)))
            .andExpect(status().isOk());

        verify(solicitudBolsasService, times(1)).enviarRecordatorio(eq(1L), any());
    }

    @Test
    @DisplayName("✅ POST recordatorio - Enviar WHATSAPP")
    void testEnviarRecordatorio_Whatsapp_Success() throws Exception {
        // Arrange
        EnviarRecordatorioRequest whatsappRequest = EnviarRecordatorioRequest.builder()
            .tipo("WHATSAPP")
            .mensaje("Recordatorio por WhatsApp")
            .build();

        when(solicitudBolsasService.enviarRecordatorio(eq(1L), any()))
            .thenReturn(solicitudDTO);

        // Act & Assert
        mockMvc.perform(post("/api/bolsas/solicitudes/1/recordatorio")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(whatsappRequest)))
            .andExpect(status().isOk());

        verify(solicitudBolsasService, times(1)).enviarRecordatorio(eq(1L), any());
    }

    @Test
    @DisplayName("❌ POST recordatorio con tipo inválido")
    void testEnviarRecordatorio_InvalidType() throws Exception {
        // Arrange - tipo inválido
        String invalidRequest = "{ \"tipo\": \"TELEGRAM\", \"mensaje\": \"test\" }";

        // Act & Assert
        mockMvc.perform(post("/api/bolsas/solicitudes/1/recordatorio")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidRequest))
            .andExpect(status().isBadRequest());
    }

    // ========================================================================
    // ✅ TESTS: APROBAR SOLICITUD
    // ========================================================================

    @Test
    @DisplayName("✅ PUT /api/bolsas/solicitudes/{id}/aprobar - Aprobar")
    void testAprobarSolicitud_Success() throws Exception {
        // Arrange
        when(solicitudBolsasService.aprobarSolicitud(eq(1L), anyLong(), anyString(), anyString()))
            .thenReturn(solicitudDTO);

        // Act & Assert
        mockMvc.perform(put("/api/bolsas/solicitudes/1/aprobar")
            .param("responsableId", "1")
            .param("responsableNombre", "Admin")
            .param("notas", "Aprobada"))
            .andExpect(status().isOk());

        verify(solicitudBolsasService, times(1)).aprobarSolicitud(eq(1L), anyLong(), anyString(), anyString());
    }

    // ========================================================================
    // 🗑️ TESTS: ELIMINAR SOLICITUD
    // ========================================================================

    @Test
    @DisplayName("✅ DELETE /api/bolsas/solicitudes/{id} - Eliminar")
    void testEliminarSolicitud_Success() throws Exception {
        // Arrange
        doNothing().when(solicitudBolsasService).eliminarSolicitud(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/bolsas/solicitudes/1"))
            .andExpect(status().isNoContent());

        verify(solicitudBolsasService, times(1)).eliminarSolicitud(1L);
    }

    // ========================================================================
    // 📊 TESTS: ESTADÍSTICAS
    // ========================================================================

    @Test
    @DisplayName("✅ GET /api/bolsas/estadisticas - Obtener estadísticas")
    void testObtenerEstadisticas_Success() throws Exception {
        // Arrange
        EstadisticasSolicitudesDTO estadisticas = new EstadisticasSolicitudesDTO(
            10L, 5L, 3L, 2L, 75.0, 1L
        );
        when(solicitudBolsasService.obtenerEstadisticas()).thenReturn(estadisticas);

        // Act & Assert
        mockMvc.perform(get("/api/bolsas/estadisticas")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalSolicitudes", is(10)))
            .andExpect(jsonPath("$.solicitudesPendientes", is(5)))
            .andExpect(jsonPath("$.porcentajeAprobadas", is(75.0)));

        verify(solicitudBolsasService, times(1)).obtenerEstadisticas();
    }
}
