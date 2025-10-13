package styp.com.cenate.model;
import styp.com.cenate.model.id.PersonalFirmaId;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

/**
 * 🖋️ Entidad que representa las firmas registradas del personal.
 */
@Entity
@Table(name = "dim_personal_firma")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalFirma implements Serializable {

    @EmbeddedId
    private PersonalFirmaId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPersonal")
    @JoinColumn(name = "id_personal", referencedColumnName = "id_personal")
    private PersonalCnt personal;

    @Column(name = "desc_firma", length = 255)
    private String descFirma; // ✅ descripción o nombre de la firma

    @Column(name = "ruta_firma", length = 500)
    private String rutaFirma; // ✅ ruta o URL del archivo de firma

    @Column(name = "estado", length = 1)
    private String estado; // A/I

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    // 🔹 Método auxiliar (para mostrar firma descriptiva)
    public String getDescFirma() {
        return descFirma != null ? descFirma : rutaFirma;
    }
}