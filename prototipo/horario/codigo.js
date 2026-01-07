// Horarios disponibles según la tabla dim_horario
const horarios = [
    { id_horario: null, cod_horario_visual: '', desc_horario: 'Sin turno', horas: 0, id_reg_lab: null },
    { id_horario: 1, cod_horario_visual: '200A', desc_horario: 'Dos turnos regulares (mañana+tarde)', horas: 12, id_reg_lab: 1 },
    { id_horario: 2, cod_horario_visual: '158', desc_horario: 'Turno mañana (08:00–14:00)', horas: 6, id_reg_lab: 1 },
    { id_horario: 3, cod_horario_visual: '131', desc_horario: 'Turno tarde (14:00–20:00)', horas: 6, id_reg_lab: 1 },
    { id_horario: 4, cod_horario_visual: '004', desc_horario: 'Libre', horas: 0, id_reg_lab: 1 },
    { id_horario: 5, cod_horario_visual: '002', desc_horario: 'Vacaciones', horas: 0, id_reg_lab: 1 },
    { id_horario: 6, cod_horario_visual: 'L', desc_horario: 'Licencia otros', horas: 0, id_reg_lab: 1 },
    { id_horario: 7, cod_horario_visual: 'O', desc_horario: 'Onomástico', horas: 0, id_reg_lab: 1 },
    { id_horario: 8, cod_horario_visual: 'DM', desc_horario: 'Descanso médico', horas: 0, id_reg_lab: 1 },
    { id_horario: 20, cod_horario_visual: '200A', desc_horario: 'Dos turnos regulares (mañana+tarde)', horas: 12, id_reg_lab: 2 },
    { id_horario: 21, cod_horario_visual: '158', desc_horario: 'Turno mañana (08:00–14:00)', horas: 6, id_reg_lab: 2 },
    { id_horario: 22, cod_horario_visual: '131', desc_horario: 'Turno tarde (14:00–20:00)', horas: 6, id_reg_lab: 2 },
    { id_horario: 23, cod_horario_visual: '004', desc_horario: 'Libre', horas: 0, id_reg_lab: 2 },
    { id_horario: 24, cod_horario_visual: '002', desc_horario: 'Vacaciones', horas: 0, id_reg_lab: 2 },
    { id_horario: 25, cod_horario_visual: 'L', desc_horario: 'Licencia otros', horas: 0, id_reg_lab: 2 },
    { id_horario: 26, cod_horario_visual: 'O', desc_horario: 'Onomástico', horas: 0, id_reg_lab: 2 },
    { id_horario: 27, cod_horario_visual: 'DM', desc_horario: 'Descanso médico', horas: 0, id_reg_lab: 2 },
    { id_horario: 12, cod_horario_visual: 'MT', desc_horario: 'Dos turnos regulares (mañana+tarde)', horas: 12, id_reg_lab: 3 },
    { id_horario: 13, cod_horario_visual: 'M', desc_horario: 'Turno mañana (08:00–14:00)', horas: 6, id_reg_lab: 3 },
    { id_horario: 14, cod_horario_visual: 'T', desc_horario: 'Turno tarde (14:00–20:00)', horas: 6, id_reg_lab: 3 },
    { id_horario: 15, cod_horario_visual: '004', desc_horario: 'Libre', horas: 0, id_reg_lab: 3 }
];

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
let disponibilidadData = {};

// Generar leyenda al cargar la página
window.addEventListener('DOMContentLoaded', generarLeyenda);

function generarLeyenda() {
    const legendGrid = document.getElementById('legendGrid');
    legendGrid.innerHTML = '';
    
    // Agrupar horarios únicos por código
    const horariosUnicos = {};
    horarios.forEach(h => {
        if (h.cod_horario_visual !== '' && !horariosUnicos[h.cod_horario_visual]) {
            horariosUnicos[h.cod_horario_visual] = h;
        }
    });
    
    Object.values(horariosUnicos).forEach(h => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="legend-code">${h.cod_horario_visual}</span>
            <span class="legend-desc">${h.desc_horario}</span>
            <span class="legend-hours">${h.horas}h</span>
        `;
        legendGrid.appendChild(item);
    });
}

// Event listeners
document.getElementById('mes').addEventListener('change', generarCalendario);
document.getElementById('anio').addEventListener('change', generarCalendario);
document.getElementById('id_reg_lab').addEventListener('change', function() {
    actualizarRegimenLabel();
    generarCalendario();
});

function actualizarRegimenLabel() {
    const regimen = document.getElementById('id_reg_lab');
    const label = document.getElementById('regimenLabel');
    if (regimen.value) {
        const regimenTexto = regimen.options[regimen.selectedIndex].text;
        label.textContent = `Régimen: ${regimenTexto}`;
    }
}

function generarCalendario() {
    const mes = parseInt(document.getElementById('mes').value);
    const anio = parseInt(document.getElementById('anio').value);
    const id_reg_lab = parseInt(document.getElementById('id_reg_lab').value);
    
    if (!mes || !anio || !id_reg_lab) return;

    const calendarSection = document.getElementById('calendarSection');
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarTitle = document.getElementById('calendarTitle');
    
    calendarSection.style.display = 'block';
    calendarGrid.innerHTML = '';
    disponibilidadData = {};

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    calendarTitle.textContent = `Calendario de ${meses[mes - 1]} ${anio}`;

    // Filtrar horarios según el régimen laboral seleccionado
    const horariosRegimen = horarios.filter(h => h.id_reg_lab === id_reg_lab || h.id_reg_lab === null);

    // Headers de días
    diasSemana.forEach(dia => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = dia;
        calendarGrid.appendChild(header);
    });

    // Calcular primer día del mes y total de días
    const primerDia = new Date(anio, mes - 1, 1).getDay();
    const diasEnMes = new Date(anio, mes, 0).getDate();

    // Celdas vacías antes del primer día
    for (let i = 0; i < primerDia; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell disabled';
        calendarGrid.appendChild(emptyCell);
    }

    // Generar días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = dia;
        
        const select = document.createElement('select');
        select.className = 'schedule-select';
        select.id = `dia_${dia}`;
        
        horariosRegimen.forEach(h => {
            const option = document.createElement('option');
            option.value = h.cod_horario_visual;
            option.textContent = h.cod_horario_visual || '---';
            if (h.id_horario) {
                option.setAttribute('data-id-horario', h.id_horario);
                option.setAttribute('data-horas', h.horas);
                option.setAttribute('data-desc', h.desc_horario);
            }
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            disponibilidadData[dia] = {
                cod_horario_visual: e.target.value,
                id_horario: selectedOption.getAttribute('data-id-horario'),
                desc_horario: selectedOption.getAttribute('data-desc'),
                horas: parseInt(selectedOption.getAttribute('data-horas')) || 0
            };
            actualizarResumen();
        });
        
        dayCell.appendChild(dayNumber);
        dayCell.appendChild(select);
        calendarGrid.appendChild(dayCell);
    }
}

function actualizarResumen() {
    const summary = document.getElementById('summary');
    const summaryContent = document.getElementById('summaryContent');
    
    const diasConTurno = Object.values(disponibilidadData).filter(v => v.cod_horario_visual !== '').length;
    const totalHoras = Object.values(disponibilidadData).reduce((sum, data) => {
        return sum + (data.horas || 0);
    }, 0);
    
    if (diasConTurno > 0) {
        summary.style.display = 'block';
        summaryContent.innerHTML = `
            <strong>Total de días con turno asignado:</strong> ${diasConTurno}<br>
            <strong>Días sin turno:</strong> ${Object.keys(disponibilidadData).length - diasConTurno}<br>
            <strong>Total de horas programadas:</strong> ${totalHoras} horas
        `;
    } else {
        summary.style.display = 'none';
    }
}

function guardarDisponibilidad() {
    const medico = document.getElementById('medico').value;
    const id_reg_lab = document.getElementById('id_reg_lab').value;
    const mes = document.getElementById('mes').value;
    const anio = document.getElementById('anio').value;

    if (!medico || !id_reg_lab || !mes || !anio) {
        alert('⚠️ Por favor complete todos los campos obligatorios');
        return;
    }

    // Recopilar todos los días y sus horarios
    const disponibilidadCompleta = {};
    const diasEnMes = new Date(anio, mes, 0).getDate();
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const select = document.getElementById(`dia_${dia}`);
        if (select) {
            const selectedOption = select.options[select.selectedIndex];
            disponibilidadCompleta[dia] = {
                cod_horario_visual: select.value,
                id_horario: selectedOption.getAttribute('data-id-horario') ? 
                           parseInt(selectedOption.getAttribute('data-id-horario')) : null,
                desc_horario: selectedOption.getAttribute('data-desc') || 'Sin turno',
                horas: parseInt(selectedOption.getAttribute('data-horas')) || 0
            };
        }
    }

    const datos = {
        medico: medico,
        id_reg_lab: parseInt(id_reg_lab),
        mes: parseInt(mes),
        anio: parseInt(anio),
        disponibilidad: disponibilidadCompleta
    };

    console.log('Datos a guardar:', JSON.stringify(datos, null, 2));
    
    const diasTrabajados = Object.values(disponibilidadCompleta).filter(
        v => v.cod_horario_visual !== '' && 
             v.cod_horario_visual !== '004' && 
             v.cod_horario_visual !== '002' && 
             v.cod_horario_visual !== 'L' && 
             v.cod_horario_visual !== 'O' && 
             v.cod_horario_visual !== 'DM'
    ).length;
    
    const totalHoras = Object.values(disponibilidadCompleta).reduce((sum, data) => sum + data.horas, 0);
    
    alert(`✅ Disponibilidad guardada exitosamente!\n\nMédico: ${medico}\nRégimen: ${document.getElementById('id_reg_lab').options[document.getElementById('id_reg_lab').selectedIndex].text}\nMes: ${document.getElementById('mes').options[document.getElementById('mes').selectedIndex].text} ${anio}\nDías con turno: ${diasTrabajados}\nHoras totales: ${totalHoras}`);
    
    // Aquí puedes agregar la llamada AJAX para enviar los datos al servidor
    // enviarDatosAlServidor(datos);
}

// Función para enviar datos al servidor (ejemplo)
function enviarDatosAlServidor(datos) {
    /*
    fetch('/api/disponibilidad', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Éxito:', data);
        alert('✅ Disponibilidad guardada correctamente en la base de datos');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('❌ Error al guardar la disponibilidad');
    });
    */
}