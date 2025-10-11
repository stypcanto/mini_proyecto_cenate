package styp.com.cenate.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "dim_tipo_documento")
public class TipoDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tip_doc")
    private Long idTipDoc;

    @Column(name = "desc_tip_doc", nullable = false, length = 50)
    private String descTipDoc;

    @Column(name = "stat_tip_doc", nullable = false, length = 1)
    private String statTipDoc;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;

    // ------------------ Constructores ------------------

    public TipoDocumento() {}

    public TipoDocumento(Long idTipDoc, String descTipDoc, String statTipDoc,
                         LocalDateTime createAt, LocalDateTime updateAt) {
        this.idTipDoc = idTipDoc;
        this.descTipDoc = descTipDoc;
        this.statTipDoc = statTipDoc;
        this.createAt = createAt;
        this.updateAt = updateAt;
    }

    // ------------------ Getters ------------------
    public Long getIdTipDoc() {
        return this.idTipDoc;
    }

    public String getDescTipDoc() {
        return this.descTipDoc;
    }

    public String getStatTipDoc() {
        return this.statTipDoc;
    }

    public LocalDateTime getCreateAt() {
        return this.createAt;
    }

    public LocalDateTime getUpdateAt() {
        return this.updateAt;
    }

    public Long getIdTipDoc() {
        return idTipDoc;
    }

    public String getDescTipDoc() {
        return descTipDoc;
    }

    public String getStatTipDoc() {
        return statTipDoc;
    }

    public LocalDateTime getCreateAt() {
        return createAt;
    }

    public LocalDateTime getUpdateAt() {
        return updateAt;
    }

    // ------------------ Setters ------------------

    public void setIdTipDoc(Long idTipDoc) {
        this.idTipDoc = idTipDoc;
    }

    public void setDescTipDoc(String descTipDoc) {
        this.descTipDoc = descTipDoc;
    }

    public void setStatTipDoc(String statTipDoc) {
        this.statTipDoc = statTipDoc;
    }

    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }

    public void setUpdateAt(LocalDateTime updateAt) {
        this.updateAt = updateAt;
    }

    // ------------------ toString ------------------

    @Override
    public String toString() {
        return "TipoDocumento{" +
                "idTipDoc=" + idTipDoc +
                ", descTipDoc='" + descTipDoc + '\'' +
                ", statTipDoc='" + statTipDoc + '\'' +
                ", createAt=" + createAt +
                ", updateAt=" + updateAt +
                '}';
    }
}
