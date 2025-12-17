package com.styp.cenate.dto.excel;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ImportResultadosDTO {

	private int total;
	private int insertados;
	private int rechazados;
	private List<String> errores = new ArrayList<>();

}
