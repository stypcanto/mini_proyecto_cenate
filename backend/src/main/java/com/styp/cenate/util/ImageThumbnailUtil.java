package com.styp.cenate.util;

import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import javax.imageio.ImageIO;
import lombok.extern.slf4j.Slf4j;

/**
 * Utilidad para generar thumbnails de imágenes ECG
 * Comprime imágenes manteniendo calidad visual
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-02-06
 */
@Slf4j
public class ImageThumbnailUtil {

    private static final int THUMBNAIL_WIDTH = 200;
    private static final int THUMBNAIL_HEIGHT = 150;
    private static final float JPEG_QUALITY = 0.7f;

    /**
     * Generar thumbnail desde Base64 de imagen ECG
     *
     * @param base64Image Base64 de imagen original
     * @param mimeType Tipo MIME (image/jpeg, image/png)
     * @return Base64 del thumbnail comprimido
     */
    public static String generarThumbnail(String base64Image, String mimeType) {
        try {
            if (base64Image == null || base64Image.isEmpty()) {
                return null;
            }

            // Decodificar Base64 a bytes
            byte[] imagenBytes = Base64.getDecoder().decode(base64Image);

            // Convertir bytes a BufferedImage
            ByteArrayInputStream bis = new ByteArrayInputStream(imagenBytes);
            BufferedImage imagenOriginal = ImageIO.read(bis);

            if (imagenOriginal == null) {
                log.warn("⚠️ No se pudo leer imagen para thumbnail");
                return null;
            }

            // Crear thumbnail redimensionado
            BufferedImage thumbnail = new BufferedImage(
                THUMBNAIL_WIDTH,
                THUMBNAIL_HEIGHT,
                BufferedImage.TYPE_INT_RGB
            );

            // Dibujar imagen original redimensionada
            Image imagenRedimensionada = imagenOriginal.getScaledInstance(
                THUMBNAIL_WIDTH,
                THUMBNAIL_HEIGHT,
                Image.SCALE_SMOOTH
            );
            thumbnail.getGraphics().drawImage(imagenRedimensionada, 0, 0, null);

            // Comprimir a JPEG
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(thumbnail, "jpeg", baos);
            byte[] thumbnailBytes = baos.toByteArray();

            // Convertir a Base64
            String thumbnailBase64 = Base64.getEncoder().encodeToString(thumbnailBytes);

            log.info("✅ Thumbnail generado - Tamaño original: {}KB, Thumbnail: {}KB",
                imagenBytes.length / 1024,
                thumbnailBytes.length / 1024
            );

            return thumbnailBase64;

        } catch (Exception e) {
            log.error("❌ Error generando thumbnail:", e);
            return null;
        }
    }

    /**
     * Calcular ratio de compresión
     */
    public static double calcularRatioCompresion(String original, String thumbnail) {
        if (original == null || thumbnail == null) {
            return 0.0;
        }
        double tamanioOriginal = original.length();
        double tamanioThumbnail = thumbnail.length();
        return (tamanioOriginal - tamanioThumbnail) / tamanioOriginal * 100;
    }
}
