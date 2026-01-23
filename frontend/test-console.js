/**
 * 🔍 TEST CONSOLE - Ejecutar en la consola del navegador
 * Copia este código y ejecutalo en la consola (F12) en http://localhost:3000/bolsas/solicitudes
 */

(async () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 DIAGNÓSTICO DE API - EJECUTANDO EN NAVEGADOR');
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    // Obtener token del navegador
    const token = localStorage.getItem('auth.token');
    console.log('🔑 Token obtenido:', token ? '✅ Presente' : '❌ No encontrado');

    if (!token) {
      console.error('❌ No hay token. Debes iniciar sesión primero.');
      return;
    }

    // Hacer petición al API
    console.log('\n📋 TEST 1: Petición GET a /api/bolsas/solicitudes');
    console.log('─────────────────────────────────────────────────────────────');

    const response = await fetch('http://localhost:8080/api/bolsas/solicitudes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📥 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error:', errorData);
      return;
    }

    const solicitudes = await response.json();
    console.log(`✅ Total solicitudes: ${solicitudes.length}`);

    if (solicitudes.length === 0) {
      console.warn('⚠️ No hay solicitudes en la BD');
      return;
    }

    // Analizar estructura
    console.log('\n📊 TEST 2: Estructura de Primera Solicitud');
    console.log('─────────────────────────────────────────────────────────────');

    const primera = solicitudes[0];
    console.log('%cPrimera solicitud completa:', 'color: blue; font-weight: bold');
    console.table(primera);

    console.log('%cCampos disponibles:', 'color: green; font-weight: bold');
    const campos = Object.keys(primera);
    campos.forEach((campo, idx) => {
      console.log(`  ${idx + 1}. ${campo}: ${typeof primera[campo]}`);
    });

    // Verificar campos críticos
    console.log('\n🔍 TEST 3: Campos Críticos v1.6.0');
    console.log('─────────────────────────────────────────────────────────────');

    const camposCriticos = {
      'id_solicitud': 'Identificador',
      'paciente_dni': 'DNI del paciente',
      'paciente_nombre': 'Nombre del paciente',
      'paciente_telefono': 'Teléfono del paciente',
      'estado_gestion_citas_id': 'FK Estado (ID)',
      'cod_estado_cita': 'Código del estado',
      'desc_estado_cita': 'Descripción del estado',
      'especialidad': 'Especialidad',
      'id_bolsa': 'ID de la bolsa',
      'numero_solicitud': 'Número de solicitud',
      'fecha_solicitud': 'Fecha de solicitud',
      'responsable_gestora_nombre': 'Gestora responsable'
    };

    let encontrados = 0;
    Object.entries(camposCriticos).forEach(([campo, descripcion]) => {
      const existe = primera.hasOwnProperty(campo);
      const valor = primera[campo];
      const icono = existe ? '✅' : '❌';
      const valorStr = existe ? JSON.stringify(valor).substring(0, 50) : 'NO EXISTE';
      console.log(`${icono} ${campo}: ${valorStr}`);
      if (existe) encontrados++;
    });

    console.log(`\n📊 Total: ${encontrados}/${Object.keys(camposCriticos).length}`);

    // Test estados únicos
    console.log('\n📊 TEST 4: Estados Únicos');
    console.log('─────────────────────────────────────────────────────────────');

    const estadosUnicos = {};
    solicitudes.forEach(sol => {
      const estado = sol.cod_estado_cita;
      if (!estadosUnicos[estado]) {
        estadosUnicos[estado] = 0;
      }
      estadosUnicos[estado]++;
    });

    console.log('%cDistribución de estados:', 'color: purple; font-weight: bold');
    Object.entries(estadosUnicos).forEach(([estado, count]) => {
      console.log(`  ${estado}: ${count} solicitudes`);
    });

    // Simular mapeo del componente
    console.log('\n⚙️ TEST 5: Simular Mapeo del Componente React');
    console.log('─────────────────────────────────────────────────────────────');

    const mapearEstadoAPI = (estado) => {
      const mapping = {
        'PENDIENTE_CITA': 'pendiente',
        'CITADO': 'citado',
        'NO_CONTESTA': 'observado',
        'NO_DESEA': 'observado',
        'ATENDIDO_IPRESS': 'atendido',
      };
      return mapping[estado] || 'pendiente';
    };

    const procesada = {
      id: primera.id_solicitud,
      dni: primera.paciente_dni || '',
      paciente: primera.paciente_nombre || '',
      telefono: primera.paciente_telefono || '',
      estado: mapearEstadoAPI(primera.cod_estado_cita),
      estadoCodigo: primera.cod_estado_cita,
      especialidad: primera.especialidad || 'N/A',
      red: primera.responsable_gestora_nombre || 'Sin asignar',
      ipress: primera.id_bolsa ? `Bolsa ${primera.id_bolsa}` : 'N/A',
      bolsa: primera.numero_solicitud || 'Sin clasificar',
    };

    console.log('%cPrimera solicitud procesada:', 'color: orange; font-weight: bold');
    console.table(procesada);

    // Resumen
    console.log('\n✅ RESUMEN');
    console.log('═════════════════════════════════════════════════════════════════');
    console.log(`Total solicitudes: ${solicitudes.length}`);
    console.log(`Campos críticos encontrados: ${encontrados}/${Object.keys(camposCriticos).length}`);
    console.log(`Estados únicos: ${Object.keys(estadosUnicos).length}`);
    console.log('\n📋 Si ves esta información, el problema NO es con el API.');
    console.log('   El problema está en cómo el componente React procesa los datos.');
    console.log('\n💡 Haz reload de la página (F5) y fíjate en los debug logs.');
    console.log('   Busca:');
    console.log('   - 📊 DEBUG - Primera solicitud del API');
    console.log('   - ✅ DEBUG ENRIQUECIDA - Primera solicitud después del mapeo');
    console.log('   - ⚠️ DEBUG FILTROS');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
