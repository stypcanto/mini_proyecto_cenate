// TEMPORAL - Fragmento de tbody mejorado para reemplazar

{/* Columna de selección */}
<td className="px-3 py-3">
  {estaPendiente && isEnviado ? (
    <Tooltip text="Seleccionar para acción masiva" position="right">
      <input
        type="checkbox"
        checked={estaSeleccionada}
        onChange={(e) => {
          const nuevasSeleccionadas = new Set(seleccionadas);
          if (e.target.checked) {
            nuevasSeleccionadas.add(d.idDetalle);
          } else {
            nuevasSeleccionadas.delete(d.idDetalle);
          }
          setSeleccionadas(nuevasSeleccionadas);
        }}
        className="w-5 h-5 rounded border-2 border-gray-300 text-cenate-600 focus:ring-2 focus:ring-cenate-300 cursor-pointer"
        aria-label={`Seleccionar ${d.nombreServicio ?? d.nombreEspecialidad}`}
      />
    </Tooltip>
  ) : null}
</td>

{/* # */}
<td className="px-3 py-3 text-center text-sm font-semibold text-gray-700">{idx + 1}</td>

{/* ESPECIALIDAD */}
<td className="px-4 py-3">
  <div className="font-semibold text-gray-900 text-sm">{d.nombreServicio ?? d.nombreEspecialidad}</div>
  <div className="text-xs text-gray-500 mt-0.5 font-medium">Código: {d.codigoServicio ?? d.codServicio}</div>
</td>

{/* ESTADO */}
<td className="px-3 py-3 text-center">
  <Tooltip
    text={
      d.estado === 'ASIGNADO' ? 'Especialidad revisada y aprobada' :
      d.estado === 'NO PROCEDE' ? 'Especialidad rechazada por el revisor' :
      'Pendiente de revisión'
    }
    position="top"
  >
    <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold cursor-help ${getEstadoBadge(d.estado ?? 'PENDIENTE')}`}>
      {d.estado ?? 'PENDIENTE'}
    </span>
  </Tooltip>
</td>

{/* TURNOS MAÑANA */}
<td className="px-3 py-3 text-center">
  <Tooltip text={`${d.turnoManana ?? 0} turno(s) solicitados en horario mañana (08:00 - 13:00)`} position="top">
    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-bold border border-amber-200 cursor-help">
      {d.turnoManana ?? 0}
    </span>
  </Tooltip>
</td>

{/* TURNOS TARDE */}
<td className="px-3 py-3 text-center">
  <Tooltip text={`${d.turnoTarde ?? 0} turno(s) solicitados en horario tarde (13:00 - 18:00)`} position="top">
    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-sm font-bold border border-sky-200 cursor-help">
      {d.turnoTarde ?? 0}
    </span>
  </Tooltip>
</td>

{/* CONSULTA REMOTA (Teleconsulta) */}
<td className="px-3 py-3 text-center">
  <Tooltip text={d.tc ? "Sí incluye atención remota (sin presencia física)" : "No incluye atención remota"} position="top">
    <div className="cursor-help">
      {yesNoPill(!!d.tc)}
    </div>
  </Tooltip>
</td>

{/* CONSULTA PRESENCIAL (Teleconsultorio) */}
<td className="px-3 py-3 text-center">
  <Tooltip text={d.tl ? "Sí incluye atención presencial en teleconsultorio" : "No incluye atención presencial"} position="top">
    <div className="cursor-help">
      {yesNoPill(!!d.tl)}
    </div>
  </Tooltip>
</td>

{/* FECHAS PROGRAMADAS */}
<td className="px-3 py-3 text-center">
  {d.fechasDetalle && d.fechasDetalle.length > 0 ? (
    <Tooltip text={`Ver ${d.fechasDetalle.length} fecha(s) programada(s)`} position="top">
      <button
        onClick={() => setModalFechas({ show: true, detalle: d })}
        className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cenate-50 text-cenate-700 hover:bg-cenate-100 transition-colors font-bold text-sm border border-cenate-200"
        aria-label={`Ver ${d.fechasDetalle.length} fechas programadas de ${d.nombreServicio ?? d.nombreEspecialidad}`}
      >
        <Calendar className="w-4 h-4" />
        {d.fechasDetalle.length}
      </button>
    </Tooltip>
  ) : (
    <Tooltip text="Sin fechas programadas" position="top">
      <span className="text-gray-400 text-sm font-semibold cursor-help">—</span>
    </Tooltip>
  )}
</td>

{/* OBSERVACIONES CLÍNICAS */}
<td className="px-4 py-3 text-center sticky bg-white z-10 border-l border-gray-100" style={{ right: isEnviado ? '120px' : '0px' }}>
  {estaPendiente ? (
    <Tooltip text={observacionesDetalle[d.idDetalle]?.trim() ? "Editar observación clínica" : "Agregar observación clínica"} position="top">
      <button
        onClick={() => abrirModalObservacion(d, false)}
        disabled={!isEnviado}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all text-xs ${
          observacionesDetalle[d.idDetalle]?.trim()
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
        aria-label={observacionesDetalle[d.idDetalle]?.trim() ? `Editar observación de ${d.nombreServicio ?? d.nombreEspecialidad}` : `Agregar observación a ${d.nombreServicio ?? d.nombreEspecialidad}`}
      >
        <Edit className="w-3.5 h-3.5" />
        {observacionesDetalle[d.idDetalle]?.trim() ? 'Editar' : 'Agregar'}
      </button>
    </Tooltip>
  ) : observacionesDetalle[d.idDetalle]?.trim() ? (
    <Tooltip text="Consultar observación clínica" position="top">
      <button
        onClick={() => abrirModalObservacion(d, true)}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cenate-600 text-white hover:bg-cenate-700 transition-all font-semibold text-xs"
        aria-label={`Ver observación de ${d.nombreServicio ?? d.nombreEspecialidad}`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Ver
      </button>
    </Tooltip>
  ) : (
    <Tooltip text="Sin observaciones registradas" position="top">
      <span className="text-gray-300 font-semibold cursor-help">—</span>
    </Tooltip>
  )}
</td>

{/* ACCIONES */}
{isEnviado && (
  <td className="px-4 py-3 text-center sticky bg-white z-10 border-l border-gray-100" style={{ right: '0px' }}>
    {estaPendiente ? (
      <div className="inline-flex items-center justify-center gap-2">
        <Tooltip text="Asignar esta especialidad" position="top">
          <button
            onClick={() => abrirModalAprobarDetalle(d)}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-bold text-xs"
            aria-label={`Asignar especialidad ${d.nombreServicio ?? d.nombreEspecialidad}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Asignar
          </button>
        </Tooltip>
        <Tooltip text="Rechazar esta especialidad" position="top">
          <button
            onClick={() => abrirModalRechazarDetalle(d)}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all font-bold text-xs"
            aria-label={`Rechazar especialidad ${d.nombreServicio ?? d.nombreEspecialidad}`}
          >
            <XCircle className="w-4 h-4" />
            Rechazar
          </button>
        </Tooltip>
      </div>
    ) : (
      <Tooltip text={`Especialidad ya procesada: ${d.estado}`} position="top">
        <span className="text-gray-300 font-semibold cursor-help">—</span>
      </Tooltip>
    )}
  </td>
)}
