package com.styp.cenate.api.horario;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.styp.cenate.dto.horario.HorarioDiaResult;
import com.styp.cenate.dto.horario.RegistrarHorarioDiaRequest;
import com.styp.cenate.service.horario.HorarioService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
@Slf4j
public class HorarioController {

  private final HorarioService service;


  @PostMapping("/dia")
  public ResponseEntity<HorarioDiaResult> registrarDia(@RequestBody RegistrarHorarioDiaRequest req) {

    if (req.getIdPers() == null || req.getFecha() == null || req.getCodHorarioVisual() == null || req.getUsuario() == null) {
      return ResponseEntity.badRequest().build();
    }

    HorarioDiaResult result = service.registrarDia(
        req.getIdPers(),
        req.getFecha(),
        req.getCodHorarioVisual(),
        req.getUsuario()
    );

    return ResponseEntity.ok(result);
  }
}
