package com.styp.cenate.repository.view;

import com.styp.cenate.model.view.PersonalTotalView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonalTotalViewRepository extends JpaRepository<PersonalTotalView, Long> {
}
