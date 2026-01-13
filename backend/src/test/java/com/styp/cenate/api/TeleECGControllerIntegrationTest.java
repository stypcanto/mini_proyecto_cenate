// ========================================================================
// 📡 TeleECGControllerIntegrationTest.java – Integration Tests
// ✅ VERSIÓN 1.0.0 - Spring Boot Test + MockMvc
// ========================================================================

package com.styp.cenate.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.styp.cenate.dto.teleekgs.*;
import com.styp.cenate.service.teleekgs.TeleECGService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TeleECGControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TeleECGService teleECGService;

    private TeleECGImagenDTO imagenDTO;
    private ProcesarImagenECGDTO procesarDTO;

    @BeforeEach
    void setUp() {
        imagenDTO = new TeleECGImagenDTO();
        imagenDTO.setIdImagen(1L);
        imagenDTO.setNumDocPaciente("44914706");
        imagenDTO.setNombresPaciente("Juan");
        imagenDTO.setApellidosPaciente("Pérez");
        imagenDTO.setEstado("PENDIENTE");
        imagenDTO.setVigencia("VIGENTE");
        imagenDTO.setDiasRestantes(25);

        procesarDTO = new ProcesarImagenECGDTO();
        procesarDTO.setAccion("PROCESAR");
    }

    // ========================================================================
    // Tests: Listar Imágenes - GET /api/teleekgs/listar
    // ========================================================================

    @Test
    @WithMockUser(roles = "MEDICO")
    void testListarImagenesExitoso() throws Exception {
        // Arrange
        Page<TeleECGImagenDTO> page = new PageImpl<>(Arrays.asList(imagenDTO));
        when(teleECGService.listarImagenes(
            anyString(), anyString(), any(), any(), any(), any()
        )).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/teleekgs/listar")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.data.content[0].numDocPaciente").value("44914706"));

        verify(teleECGService, times(1)).listarImagenes(
            anyString(), anyString(), any(), any(), any(), any()
        );
    }

    @Test
    @WithMockUser(roles = "MEDICO")
    void testListarImagenesConFiltros() throws Exception {
        // Arrange
        Page<TeleECGImagenDTO> page = new PageImpl<>(Arrays.asList(imagenDTO));
        when(teleECGService.listarImagenes(
            "44914706", "PENDIENTE", null, null, null, PageRequest.of(0, 20)
        )).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/teleekgs/listar")
            .param("numDoc", "44914706")
            .param("estado", "PENDIENTE")
            .param("page", "0")
            .param("size", "20")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(200));

        verify(teleECGService, times(1)).listarImagenes(
            eq("44914706"), eq("PENDIENTE"), any(), any(), any(), any()
        );
    }

    @Test
    void testListarImagenesSinAutenticacion() throws Exception {
        // Act & Assert - Sin token JWT
        mockMvc.perform(get("/api/teleekgs/listar")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isUnauthorized());
    }

    // ========================================================================
    // Tests: Obtener Detalles - GET /api/teleekgs/{id}/detalles
    // ========================================================================

    @Test
    @WithMockUser(roles = "MEDICO")
    void testObtenerDetallesExitoso() throws Exception {
        // Arrange
        when(teleECGService.obtenerDetallesImagen(1L, any(), anyString()))
            .thenReturn(imagenDTO);

        // Act & Assert
        mockMvc.perform(get("/api/teleekgs/1/detalles")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.data.idImagen").value(1))
            .andExpect(jsonPath("$.data.estado").value("PENDIENTE"));

        verify(teleECGService, times(1)).obtenerDetallesImagen(1L, any(), anyString());
    }

    @Test
    @WithMockUser(roles = "MEDICO")
    void testObtenerDetallesNoEncontrada() throws Exception {
        // Arrange
        when(teleECGService.obtenerDetallesImagen(999L, any(), anyString()))
            .thenThrow(new Exception("Imagen no encontrada"));

        // Act & Assert
        mockMvc.perform(get("/api/teleekgs/999/detalles")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
    }

    // ========================================================================
    // Tests: Procesar Imagen - PUT /api/teleekgs/{id}/procesar
    // ========================================================================

    @Test
    @WithMockUser(roles = "MEDICO")
    void testProcesarImagenExitoso() throws Exception {
        // Arrange
        imagenDTO.setEstado("PROCESADA");
        when(teleECGService.procesarImagen(1L, procesarDTO, any(), anyString()))
            .thenReturn(imagenDTO);

        // Act & Assert
        mockMvc.perform(put("/api/teleekgs/1/procesar")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(procesarDTO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.data.estado").value("PROCESADA"));

        verify(teleECGService, times(1)).procesarImagen(1L, procesarDTO, any(), anyString());
    }

    @Test
    @WithMockUser(roles = "MEDICO")
    void testRechazarImagenConMotivo() throws Exception {
        // Arrange
        ProcesarImagenECGDTO rechazarDTO = new ProcesarImagenECGDTO();
        rechazarDTO.setAccion("RECHAZAR");
        rechazarDTO.setMotivoRechazo("Imagen borrosa");

        imagenDTO.setEstado("RECHAZADA");
        when(teleECGService.procesarImagen(1L, rechazarDTO, any(), anyString()))
            .thenReturn(imagenDTO);

        // Act & Assert
        mockMvc.perform(put("/api/teleekgs/1/procesar")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(rechazarDTO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.data.estado").value("RECHAZADA"));
    }

    // ========================================================================
    // Tests: Descargar Imagen - GET /api/teleekgs/{id}/descargar
    // ========================================================================

    @Test
    @WithMockUser(roles = "MEDICO")
    void testDescargarImagenExitoso() throws Exception {
        // Arrange
        byte[] contenido = "fake image content".getBytes();
        when(teleECGService.descargarImagen(1L, any(), anyString()))
            .thenReturn(contenido);

        // Act & Assert
        mockMvc.perform(get("/api/teleekgs/1/descargar")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.IMAGE_JPEG));

        verify(teleECGService, times(1)).descargarImagen(1L, any(), anyString());
    }

    // ========================================================================
    // Tests: Estadísticas - GET /api/teleekgs/estadisticas
    // ========================================================================

    @Test
    @WithMockUser(roles = "ADMIN")
    void testObtenerEstadisticasExitoso() throws Exception {
        // Arrange
        TeleECGEstadisticasDTO estadisticas = new TeleECGEstadisticasDTO();
        estadisticas.setTotalImagenesCargadas(100);
        estadisticas.setTotalImagenesProcesadas(85);
        estadisticas.setTotalImagenesRechazadas(15);
        estadisticas.setTotalImagenesVinculadas(80);

        when(teleECGService.obtenerEstadisticas()).thenReturn(estadisticas);

        // Act & Assert
        mockMvc.perform(get("/api/teleekgs/estadisticas")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.data.totalImagenesCargadas").value(100))
            .andExpect(jsonPath("$.data.totalImagenesProcesadas").value(85));

        verify(teleECGService, times(1)).obtenerEstadisticas();
    }

    // ========================================================================
    // Tests: Próximas a Vencer - GET /api/teleekgs/proximas-vencer
    // ========================================================================

    @Test
    @WithMockUser(roles = "ADMIN")
    void testObtenerProximasVencerExitoso() throws Exception {
        // Arrange
        List<TeleECGImagenDTO> proximas = Arrays.asList(imagenDTO);
        when(teleECGService.obtenerProximasVencer()).thenReturn(proximas);

        // Act & Assert
        mockMvc.perform(get("/api/teleekgs/proximas-vencer")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.data", hasSize(1)));

        verify(teleECGService, times(1)).obtenerProximasVencer();
    }

    // ========================================================================
    // Tests: Validación de Permisos MBAC
    // ========================================================================

    @Test
    @WithMockUser(roles = "EXTERNO")
    void testUploadPermitidoPara INSTITUCION_EX() throws Exception {
        // Solo INSTITUCION_EX puede subir
        // Requiere @CheckMBACPermission configurado
        mockMvc.perform(post("/api/teleekgs/upload")
            .contentType(MediaType.MULTIPART_FORM_DATA))
            .andExpect(status().is4xxClientError()); // Sin archivo
    }

    // ========================================================================
    // Tests: Manejo de Errores
    // ========================================================================

    @Test
    @WithMockUser(roles = "MEDICO")
    void testErrorArchivoInvalido() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/teleekgs/upload")
            .contentType(MediaType.MULTIPART_FORM_DATA))
            .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(roles = "MEDICO")
    void testErrorDNIInvalido() throws Exception {
        // Act & Assert - DNI vacío
        mockMvc.perform(post("/api/teleekgs/upload")
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .param("numDocPaciente", ""))
            .andExpect(status().is4xxClientError());
    }

    // ========================================================================
    // Tests: Respuesta de API
    // ========================================================================

    @Test
    @WithMockUser(roles = "MEDICO")
    void testRespuestaFormatoJSON() throws Exception {
        // Arrange
        Page<TeleECGImagenDTO> page = new PageImpl<>(Arrays.asList(imagenDTO));
        when(teleECGService.listarImagenes(
            anyString(), anyString(), any(), any(), any(), any()
        )).thenReturn(page);

        // Act & Assert
        MvcResult result = mockMvc.perform(get("/api/teleekgs/listar")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").isNumber())
            .andExpect(jsonPath("$.message").isString())
            .andExpect(jsonPath("$.data").isMap())
            .andReturn();

        // Validar estructura JSON
        String responseBody = result.getResponse().getContentAsString();
        assertTrue(responseBody.contains("\"status\""));
        assertTrue(responseBody.contains("\"message\""));
        assertTrue(responseBody.contains("\"data\""));
    }
}
