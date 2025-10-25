package com.styp.cenate.service.view.impl;

import com.styp.cenate.model.view.PersonalTotalView;
import com.styp.cenate.repository.view.PersonalTotalViewRepository;
import com.styp.cenate.service.view.PersonalTotalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PersonalTotalServiceImpl implements PersonalTotalService {

    private final PersonalTotalViewRepository personalTotalViewRepository;

    @Override
    public List<PersonalTotalView> listarTodo() {
        return personalTotalViewRepository.findAll();
    }
}
