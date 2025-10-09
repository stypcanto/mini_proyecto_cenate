package styp.com.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.PersonalCnt;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalCntRepository extends JpaRepository<PersonalCnt, Long> {
    List<PersonalCnt> findByStatPers(String status);
    Optional<PersonalCnt> findByNumDocPers(String numDoc);
    List<PersonalCnt> findByAreaIdArea(Long idArea);
    List<PersonalCnt> findByRegimenLaboralIdRegLab(Long idRegLab);
}
