// =====================
// CONFIG
// =====================
const API_SAVE_DIA = 'http://localhost:8080/api/horarios/dia';
const API_GET_MES  = 'http://localhost:8080/api/horarios/mes';
const USUARIO_FIJO = '70073164';

const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

let disponibilidadData = {}; // dia -> {cod, horas}
let mapaMes = {};            // fecha YYYY-MM-DD -> { cod, desc?, horas? }
let mapCodInfo = {};         // cod -> { desc, horas }

// =====================
// HORARIOS (catálogo dim_horario)
// =====================
const horarios = [
  { id_horario: null, cod_horario_visual: '', desc_horario: 'Sin turno', horas: 0, id_reg_lab: null },

  // CAS
  { id_horario: 1, cod_horario_visual: '200A', desc_horario: 'Dos turnos regulares (mañana+tarde)', horas: 12, id_reg_lab: 1 },
  { id_horario: 2, cod_horario_visual: '158',  desc_horario: 'Turno mañana (08:00–14:00)', horas: 6,  id_reg_lab: 1 },
  { id_horario: 3, cod_horario_visual: '131',  desc_horario: 'Turno tarde (14:00–20:00)',  horas: 6,  id_reg_lab: 1 },
  { id_horario: 4, cod_horario_visual: '004',  desc_horario: 'Libre',                         horas: 0,  id_reg_lab: 1 },
  { id_horario: 5, cod_horario_visual: '002',  desc_horario: 'Vacaciones',                    horas: 0,  id_reg_lab: 1 },
  { id_horario: 6, cod_horario_visual: 'L',    desc_horario: 'Licencia otros',                horas: 0,  id_reg_lab: 1 },
  { id_horario: 7, cod_horario_visual: 'O',    desc_horario: 'Onomástico',                    horas: 0,  id_reg_lab: 1 },
  { id_horario: 8, cod_horario_visual: 'DM',   desc_horario: 'Descanso médico',               horas: 0,  id_reg_lab: 1 },

  // 728
  { id_horario: 20, cod_horario_visual: '200A', desc_horario: 'Dos turnos regulares (mañana+tarde)', horas: 12, id_reg_lab: 2 },
  { id_horario: 21, cod_horario_visual: '158',  desc_horario: 'Turno mañana (08:00–14:00)',          horas: 6,  id_reg_lab: 2 },
  { id_horario: 22, cod_horario_visual: '131',  desc_horario: 'Turno tarde (14:00–20:00)',           horas: 6,  id_reg_lab: 2 },
  { id_horario: 23, cod_horario_visual: '004',  desc_horario: 'Libre',                                horas: 0,  id_reg_lab: 2 },
  { id_horario: 24, cod_horario_visual: '002',  desc_horario: 'Vacaciones',                           horas: 0,  id_reg_lab: 2 },
  { id_horario: 25, cod_horario_visual: 'L',    desc_horario: 'Licencia otros',                       horas: 0,  id_reg_lab: 2 },
  { id_horario: 26, cod_horario_visual: 'O',    desc_horario: 'Onomástico',                           horas: 0,  id_reg_lab: 2 },
  { id_horario: 27, cod_horario_visual: 'DM',   desc_horario: 'Descanso médico',                      horas: 0,  id_reg_lab: 2 },

  // Locador
  { id_horario: 12, cod_horario_visual: 'MT',  desc_horario: 'Dos turnos regulares (mañana+tarde)', hours: 12, id_reg_lab: 3 },
  { id_horario: 13, cod_horario_visual: 'M',   desc_horario: 'Turno mañana (08:00–14:00)',          horas: 6,  id_reg_lab: 3 },
  { id_horario: 14, cod_horario_visual: 'T',   desc_horario: 'Turno tarde (14:00–20:00)',           horas: 6,  id_reg_lab: 3 },
  { id_horario: 15, cod_horario_visual: '004', desc_horario: 'Libre',                                horas: 0,  id_reg_lab: 3 }
];

// =====================
// INIT
// =====================
window.addEventListener('DOMContentLoaded', () => {
  construirMapaCodInfo();
  generarLeyenda();

  document.getElementById('id_personal').addEventListener('change', onParametrosCambio);
  document.getElementById('mes').addEventListener('change', onParametrosCambio);
  document.getElementById('anio').addEventListener('change', onParametrosCambio);

  document.getElementById('id_reg_lab').addEventListener('change', () => {
    actualizarRegimenLabel();
    generarCalendario();
  });
});

function construirMapaCodInfo() {
  mapCodInfo = {};
  horarios.forEach(h => {
    const cod = h.cod_horario_visual ?? '';
    mapCodInfo[cod] = { desc: h.desc_horario ?? 'Sin turno', horas: Number(h.horas ?? 0) };
  });
}

// =====================
// LEYENDA
// =====================
function generarLeyenda() {
  const cas = document.getElementById('legendTableCAS');
  const t728 = document.getElementById('legendTable728');
  const loc = document.getElementById('legendTableLocador');

  cas.innerHTML = '';
  t728.innerHTML = '';
  loc.innerHTML = '';

  const horariosCAS = horarios.filter(h => h.id_reg_lab === 1).sort((a,b)=> (a.id_horario||0)-(b.id_horario||0));
  const horarios728 = horarios.filter(h => h.id_reg_lab === 2).sort((a,b)=> (a.id_horario||0)-(b.id_horario||0));
  const horariosLoc = horarios.filter(h => h.id_reg_lab === 3).sort((a,b)=> (a.id_horario||0)-(b.id_horario||0));

  horariosCAS.forEach(h => cas.appendChild(rowLeyenda(h)));
  horarios728.forEach(h => t728.appendChild(rowLeyenda(h)));
  horariosLoc.forEach(h => loc.appendChild(rowLeyenda(h)));
}

function rowLeyenda(h) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${escapeHtml(h.cod_horario_visual)}</td>
    <td>${escapeHtml(h.desc_horario)}</td>
    <td>${escapeHtml(String(h.horas))}h</td>
  `;
  return tr;
}

// =====================
// EVENT: GET MES
// =====================
async function onParametrosCambio() {
  const idPers = parseInt(document.getElementById('id_personal').value, 10);
  const mes = parseInt(document.getElementById('mes').value, 10);
  const anio = parseInt(document.getElementById('anio').value, 10);

  if (!idPers || !mes || !anio) return;

  const periodo = `${anio}${String(mes).padStart(2, '0')}`;

  try {
    const data = await consultarMes(idPers, periodo);

    mapaMes = {};
    disponibilidadData = {};

    if (data?.idRegLab) {
      document.getElementById('id_reg_lab').value = String(data.idRegLab);
    }
    actualizarRegimenLabel();

    // Esperado: data.detalle = [{fechaDia:'YYYY-MM-DD', codHorario:'158', descHorario:'...', horas:6}, ...]
    if (Array.isArray(data?.detalle)) {
      data.detalle.forEach(d => {
        if (!d?.fechaDia) return;
        mapaMes[d.fechaDia] = {
          cod: d.codHorario || '',
          desc: d.descHorario ?? null,
          horas: (d.horas !== undefined && d.horas !== null) ? Number(d.horas) : null
        };
      });
    }

    generarCalendario();
  } catch (err) {
    console.error(err);
    alert(`❌ Error consultando mes.\n${err.message || err}`);
  }
}

function actualizarRegimenLabel() {
  const regimen = document.getElementById('id_reg_lab');
  const label = document.getElementById('regimenLabel');

  if (regimen.value) {
    label.textContent = `Régimen: ${regimen.options[regimen.selectedIndex].text}`;
  } else {
    label.textContent = '';
  }
}

// =====================
// CALENDARIO
// =====================
function generarCalendario() {
  const mes = parseInt(document.getElementById('mes').value, 10);
  const anio = parseInt(document.getElementById('anio').value, 10);
  const idRegLab = parseInt(document.getElementById('id_reg_lab').value, 10);

  if (!mes || !anio || !idRegLab) return;

  const calendarSection = document.getElementById('calendarSection');
  const calendarGrid = document.getElementById('calendarGrid');
  const calendarTitle = document.getElementById('calendarTitle');

  calendarSection.style.display = 'block';
  calendarGrid.innerHTML = '';

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  calendarTitle.textContent = `Calendario de ${meses[mes - 1]} ${anio}`;

  // opciones por régimen + "Sin turno"
  const horariosRegimen = horarios.filter(h => h.id_reg_lab === idRegLab || h.id_reg_lab === null);

  // headers
  diasSemana.forEach(d => {
    const el = document.createElement('div');
    el.className = 'day-header';
    el.textContent = d;
    calendarGrid.appendChild(el);
  });

  const primerDia = new Date(anio, mes - 1, 1).getDay();
  const diasEnMes = new Date(anio, mes, 0).getDate();

  // vacíos
  for (let i = 0; i < primerDia; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell disabled';
    calendarGrid.appendChild(empty);
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';

    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.id = `chip_${dia}`;

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = dia;

    const select = document.createElement('select');
    select.className = 'schedule-select';
    select.id = `dia_${dia}`;

    // opciones: visible=DESCRIPCIÓN, value=CÓDIGO
    horariosRegimen.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.cod_horario_visual;
      opt.textContent = h.desc_horario || 'Sin turno';
      select.appendChild(opt);
    });

    const fecha = `${anio}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;

    // ✅ preselección de DB
    const infoDb = mapaMes[fecha] || null;
    const codDb = infoDb?.cod ?? '';
    const existe = Array.from(select.options).some(o => o.value === codDb);
    select.value = existe ? codDb : '';

    // ✅ meta SIEMPRE (render DIRECTO al elemento creado)
    const meta = document.createElement('div');
    meta.className = 'day-meta';
    meta.id = `meta_${dia}`;

    renderMetaElement(meta, select, infoDb);

    // resumen inicial
    const base = obtenerInfoCompletaDesdeSelectYDb(select, infoDb);
    disponibilidadData[dia] = { cod: base.cod, horas: base.horas };

    select.addEventListener('change', async (e) => {
      const idPers = parseInt(document.getElementById('id_personal').value, 10);
      const cod = e.target.value;

      // render meta al cambiar
      renderMetaElement(meta, select, null);

      // resumen
      const infoNow = obtenerInfoCompletaDesdeSelectYDb(select, null);
      disponibilidadData[dia] = { cod: infoNow.cod, horas: infoNow.horas };
      actualizarResumen();

      if (!cod) { setChip(dia, ''); return; }
      if (!idPers) { setChip(dia, 'err', 'Falta ID'); return; }

      const payload = { idPers, fecha, codHorarioVisual: cod, usuario: USUARIO_FIJO };

      setChip(dia, 'saving', 'Guardando...');
      try {
        await guardarDia(payload);
        mapaMes[fecha] = { cod: infoNow.cod, desc: infoNow.desc, horas: infoNow.horas };
        setChip(dia, 'ok', 'OK');
      } catch (err) {
        console.error(err);
        setChip(dia, 'err', 'Error');
        alert(`❌ Error guardando ${fecha} (${cod})\n${err.message || err}`);
      }
    });

    dayCell.appendChild(chip);
    dayCell.appendChild(dayNumber);
    dayCell.appendChild(select);
    dayCell.appendChild(meta);

    calendarGrid.appendChild(dayCell);
  }

  actualizarResumen();
}

// =====================
// META RENDER (DIRECTO AL ELEMENTO)
// =====================
function renderMetaElement(metaEl, select, infoDb) {
  if (!metaEl) return;

  const info = obtenerInfoCompletaDesdeSelectYDb(select, infoDb);

  metaEl.classList.toggle('is-empty', !info.cod);

  metaEl.innerHTML = `
    <div class="meta-row">
      <div><span class="label">Código:</span> <span>${escapeHtml(info.cod || '—')}</span></div>
      <div class="value"><span class="label">Horas:</span> <span class="hours">${escapeHtml(String(info.horas))}h</span></div>
    </div>
    <div style="margin-top:6px;">
      <span class="label">Descripción:</span> <span>${escapeHtml(info.desc || 'Sin turno')}</span>
    </div>
  `;
}

// Prioridad:
// 1) infoDb (si existe) para desc/horas
// 2) catálogo por cod (mapCodInfo)
// 3) option actual (catálogo implícito)
function obtenerInfoCompletaDesdeSelectYDb(select, infoDb) {
  const cod = select.value ?? '';

  const fromDbDesc  = infoDb?.desc ?? null;
  const fromDbHoras = (infoDb?.horas !== null && infoDb?.horas !== undefined) ? Number(infoDb.horas) : null;

  const fromCat = mapCodInfo[cod] || null;

  // fallback de descripción: buscar en el catálogo por cod, si no, usar el texto del option
  const selectedText = select.options?.[select.selectedIndex]?.textContent ?? 'Sin turno';

  const desc  = fromDbDesc ?? fromCat?.desc ?? selectedText;
  const horas = fromDbHoras ?? fromCat?.horas ?? 0;

  return { cod, desc, horas };
}

// =====================
// RESUMEN
// =====================
function actualizarResumen() {
  const summary = document.getElementById('summary');
  const summaryContent = document.getElementById('summaryContent');

  const values = Object.values(disponibilidadData);
  const diasAsignados = values.filter(v => v && v.cod).length;
  const totalHoras = values.reduce((sum, v) => sum + (v?.horas || 0), 0);

  if (diasAsignados > 0) {
    summary.style.display = 'block';
    summaryContent.innerHTML = `
      <strong>Días con turno:</strong> ${diasAsignados}<br>
      <strong>Horas totales:</strong> ${totalHoras}
    `;
  } else {
    summary.style.display = 'none';
    summaryContent.innerHTML = '';
  }
}

// =====================
// CHIP
// =====================
function setChip(dia, estado, texto) {
  const chip = document.getElementById(`chip_${dia}`);
  if (!chip) return;

  chip.className = 'chip';
  chip.textContent = texto || '';
  chip.style.display = 'none';

  if (estado === 'saving') { chip.classList.add('saving'); chip.style.display = 'inline-block'; }
  if (estado === 'ok')     { chip.classList.add('ok');     chip.style.display = 'inline-block'; }
  if (estado === 'err')    { chip.classList.add('err');    chip.style.display = 'inline-block'; }
}

// =====================
// API CALLS
// =====================
async function consultarMes(idPers, periodo) {
  const url = `${API_GET_MES}?idPers=${encodeURIComponent(idPers)}&periodo=${encodeURIComponent(periodo)}`;
  const resp = await fetch(url);

  let data = null;
  try { data = await resp.json(); } catch (_) {}

  if (!resp.ok) {
    const msg = data?.message || data?.error || `Error HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

async function guardarDia(payload) {
  const resp = await fetch(API_SAVE_DIA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let data = null;
  try { data = await resp.json(); } catch (_) {}

  if (!resp.ok) {
    const msg = data?.message || data?.error || `Error HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

// =====================
// Helpers
// =====================
function escapeHtml(text) {
  return String(text || '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}
