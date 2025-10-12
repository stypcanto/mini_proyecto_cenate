import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
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
}
