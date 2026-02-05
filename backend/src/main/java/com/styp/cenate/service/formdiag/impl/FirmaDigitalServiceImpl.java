package com.styp.cenate.service.formdiag.impl;

import com.styp.cenate.dto.formdiag.FirmaDigitalRequest;
import com.styp.cenate.dto.formdiag.FirmaDigitalResponse;
import com.styp.cenate.model.formdiag.FormDiagFormulario;
import com.styp.cenate.repository.formdiag.FormDiagFormularioRepository;
import com.styp.cenate.service.formdiag.FirmaDigitalService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Implementación del servicio de firma digital para formularios de diagnóstico
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FirmaDigitalServiceImpl implements FirmaDigitalService {

    private final FormDiagFormularioRepository formularioRepo;

    @Override
    public FirmaDigitalResponse firmarFormulario(FirmaDigitalRequest request, String username) {
        log.info("Firmando formulario ID: {} por usuario: {}", request.getIdFormulario(), username);

        try {
            // 1. Obtener el formulario
            FormDiagFormulario formulario = formularioRepo.findById(request.getIdFormulario())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Formulario no encontrado: " + request.getIdFormulario()));

            // 2. Verificar que el formulario está en estado correcto
            if (!"EN_PROCESO".equals(formulario.getEstado()) && !"ENVIADO".equals(formulario.getEstado())) {
                return FirmaDigitalResponse.builder()
                        .exitoso(false)
                        .mensaje("El formulario no está en un estado válido para firmar. Estado actual: " + formulario.getEstado())
                        .idFormulario(request.getIdFormulario())
                        .build();
            }

            // 3. Verificar que no esté ya firmado
            if (formulario.getFirmaDigital() != null && !formulario.getFirmaDigital().isEmpty()) {
                return FirmaDigitalResponse.builder()
                        .exitoso(false)
                        .mensaje("El formulario ya está firmado")
                        .idFormulario(request.getIdFormulario())
                        .fechaFirma(formulario.getFechaFirma())
                        .dniFirmante(formulario.getDniFirmante())
                        .nombreFirmante(formulario.getNombreFirmante())
                        .build();
            }

            // 4. Decodificar y validar el certificado
            FirmaDigitalResponse.CertificadoInfo certInfo = validarCertificado(request.getCertificado());
            if (!certInfo.isEsValido()) {
                return FirmaDigitalResponse.builder()
                        .exitoso(false)
                        .mensaje("El certificado no es válido o ha expirado")
                        .idFormulario(request.getIdFormulario())
                        .certificadoInfo(certInfo)
                        .build();
            }

            // 5. Decodificar el PDF
            byte[] pdfBytes = Base64.getDecoder().decode(request.getPdfBase64());

            // 6. Calcular hash del PDF para verificación
            String hashCalculado = calcularHash(pdfBytes);

            // 7. Guardar todos los datos en la entidad
            formulario.setPdfFirmado(pdfBytes);
            formulario.setFirmaDigital(request.getFirmaDigital());
            formulario.setCertificadoFirmante(request.getCertificado());
            formulario.setHashDocumento(hashCalculado);
            formulario.setFechaFirma(LocalDateTime.now());
            formulario.setDniFirmante(request.getDniFirmante());
            formulario.setNombreFirmante(request.getNombreFirmante());
            formulario.setEntidadCertificadora(certInfo.getEmisor());
            formulario.setNumeroSerieCertificado(extraerNumeroSerie(request.getCertificado()));
            formulario.setPdfTamanio((long) pdfBytes.length);
            formulario.setPdfNombre(generarNombrePdf(formulario));

            // 8. Cambiar estado a FIRMADO
            formulario.setEstado("FIRMADO");
            formulario.setFechaEnvio(LocalDateTime.now());

            formularioRepo.save(formulario);

            log.info("Formulario {} firmado exitosamente por {}", request.getIdFormulario(), request.getDniFirmante());

            return FirmaDigitalResponse.builder()
                    .exitoso(true)
                    .mensaje("Formulario firmado exitosamente")
                    .idFormulario(formulario.getIdFormulario())
                    .hashDocumento(hashCalculado)
                    .fechaFirma(formulario.getFechaFirma())
                    .dniFirmante(formulario.getDniFirmante())
                    .nombreFirmante(formulario.getNombreFirmante())
                    .entidadCertificadora(formulario.getEntidadCertificadora())
                    .numeroSerieCertificado(formulario.getNumeroSerieCertificado())
                    .pdfTamanio(formulario.getPdfTamanio())
                    .estado(formulario.getEstado())
                    .certificadoInfo(certInfo)
                    .build();

        } catch (Exception e) {
            log.error("Error al firmar formulario {}: {}", request.getIdFormulario(), e.getMessage(), e);
            return FirmaDigitalResponse.builder()
                    .exitoso(false)
                    .mensaje("Error al firmar el formulario: " + e.getMessage())
                    .idFormulario(request.getIdFormulario())
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public FirmaDigitalResponse verificarFirma(Integer idFormulario) {
        log.info("Verificando firma del formulario ID: {}", idFormulario);

        FormDiagFormulario formulario = formularioRepo.findById(idFormulario)
                .orElseThrow(() -> new EntityNotFoundException("Formulario no encontrado: " + idFormulario));

        if (formulario.getFirmaDigital() == null || formulario.getFirmaDigital().isEmpty()) {
            return FirmaDigitalResponse.builder()
                    .exitoso(false)
                    .mensaje("El formulario no está firmado")
                    .idFormulario(idFormulario)
                    .build();
        }

        try {
            // Verificar integridad del documento
            String hashActual = calcularHash(formulario.getPdfFirmado());
            boolean integridadOk = hashActual.equals(formulario.getHashDocumento());

            // Validar certificado
            FirmaDigitalResponse.CertificadoInfo certInfo = validarCertificado(formulario.getCertificadoFirmante());

            return FirmaDigitalResponse.builder()
                    .exitoso(integridadOk && certInfo.isEsValido())
                    .mensaje(integridadOk ? "Firma válida" : "El documento ha sido modificado")
                    .idFormulario(idFormulario)
                    .hashDocumento(formulario.getHashDocumento())
                    .fechaFirma(formulario.getFechaFirma())
                    .dniFirmante(formulario.getDniFirmante())
                    .nombreFirmante(formulario.getNombreFirmante())
                    .entidadCertificadora(formulario.getEntidadCertificadora())
                    .numeroSerieCertificado(formulario.getNumeroSerieCertificado())
                    .pdfTamanio(formulario.getPdfTamanio())
                    .estado(formulario.getEstado())
                    .certificadoInfo(certInfo)
                    .build();

        } catch (Exception e) {
            log.error("Error al verificar firma del formulario {}: {}", idFormulario, e.getMessage());
            return FirmaDigitalResponse.builder()
                    .exitoso(false)
                    .mensaje("Error al verificar la firma: " + e.getMessage())
                    .idFormulario(idFormulario)
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] obtenerPdfFirmado(Integer idFormulario) {
        FormDiagFormulario formulario = formularioRepo.findById(idFormulario)
                .orElseThrow(() -> new EntityNotFoundException("Formulario no encontrado: " + idFormulario));

        return formulario.getPdfFirmado();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean estaFirmado(Integer idFormulario) {
        return formularioRepo.findById(idFormulario)
                .map(f -> f.getFirmaDigital() != null && !f.getFirmaDigital().isEmpty())
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarZipPdfs(List<Integer> ids) {
        log.info("🗜️  Generando ZIP con {} PDFs", ids.size());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            int pdfsProcesados = 0;
            int pdfsError = 0;

            for (Integer id : ids) {
                try {
                    // Obtener PDF del formulario
                    byte[] pdfBytes = obtenerPdfFirmado(id);

                    if (pdfBytes == null || pdfBytes.length == 0) {
                        log.warn("⚠️  PDF vacío o no encontrado para ID: {}", id);
                        pdfsError++;
                        continue;
                    }

                    // Crear entrada en ZIP
                    String nombreArchivo = String.format("formulario_%d_firmado.pdf", id);
                    ZipEntry zipEntry = new ZipEntry(nombreArchivo);
                    zipEntry.setSize(pdfBytes.length);

                    zos.putNextEntry(zipEntry);
                    zos.write(pdfBytes);
                    zos.closeEntry();

                    pdfsProcesados++;
                    log.debug("✅ PDF agregado al ZIP: {} ({} bytes)", nombreArchivo, pdfBytes.length);

                } catch (EntityNotFoundException e) {
                    log.warn("⚠️  Formulario no encontrado: {}", id);
                    pdfsError++;
                } catch (Exception e) {
                    log.error("❌ Error procesando PDF ID {}: {}", id, e.getMessage());
                    pdfsError++;
                }
            }

            // Finalizar ZIP
            zos.finish();
            byte[] zipBytes = baos.toByteArray();

            log.info("🎉 ZIP generado: {} PDFs incluidos, {} errores, {} bytes totales",
                     pdfsProcesados, pdfsError, zipBytes.length);

            if (pdfsProcesados == 0) {
                throw new RuntimeException("No se pudo incluir ningún PDF en el ZIP");
            }

            return zipBytes;

        } catch (IOException e) {
            log.error("❌ Error fatal al crear ZIP: {}", e.getMessage(), e);
            throw new RuntimeException("Error al generar archivo ZIP: " + e.getMessage(), e);
        }
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Valida un certificado X.509
     */
    private FirmaDigitalResponse.CertificadoInfo validarCertificado(String certificadoBase64) {
        try {
            byte[] certBytes = Base64.getDecoder().decode(certificadoBase64);
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            X509Certificate cert = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(certBytes));

            // Verificar validez temporal
            boolean esValido = true;
            try {
                cert.checkValidity();
            } catch (Exception e) {
                esValido = false;
            }

            // Extraer información del certificado
            String titular = cert.getSubjectX500Principal().getName();
            String emisor = cert.getIssuerX500Principal().getName();

            return FirmaDigitalResponse.CertificadoInfo.builder()
                    .titular(extraerCN(titular))
                    .emisor(extraerCN(emisor))
                    .validoDesde(LocalDateTime.ofInstant(cert.getNotBefore().toInstant(), ZoneId.systemDefault()))
                    .validoHasta(LocalDateTime.ofInstant(cert.getNotAfter().toInstant(), ZoneId.systemDefault()))
                    .esValido(esValido)
                    .tipoDispositivo("Certificado Digital")
                    .build();

        } catch (Exception e) {
            log.error("Error al validar certificado: {}", e.getMessage());
            return FirmaDigitalResponse.CertificadoInfo.builder()
                    .esValido(false)
                    .build();
        }
    }

    /**
     * Calcula el hash SHA-256 de un array de bytes
     */
    private String calcularHash(byte[] data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data);
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * Extrae el CN (Common Name) de un Distinguished Name
     */
    private String extraerCN(String dn) {
        String[] parts = dn.split(",");
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.startsWith("CN=")) {
                return trimmed.substring(3);
            }
        }
        return dn;
    }

    /**
     * Extrae el número de serie del certificado
     */
    private String extraerNumeroSerie(String certificadoBase64) {
        try {
            byte[] certBytes = Base64.getDecoder().decode(certificadoBase64);
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            X509Certificate cert = (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(certBytes));
            return cert.getSerialNumber().toString(16).toUpperCase();
        } catch (Exception e) {
            log.error("Error al extraer número de serie: {}", e.getMessage());
            return "N/A";
        }
    }

    /**
     * Genera un nombre único para el PDF firmado
     */
    private String generarNombrePdf(FormDiagFormulario formulario) {
        String ipressCode = formulario.getIpress().getCodIpress();
        String timestamp = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
                .format(LocalDateTime.now());
        return String.format("DIAG_%s_%s_FIRMADO.pdf", ipressCode, timestamp);
    }
}
