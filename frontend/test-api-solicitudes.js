/**
 * 🔍 TEST SCRIPT - Diagnóstico de API de Solicitudes
 * Verifica la estructura exacta de datos retornados por el backend
 */

const http = require('http');

// Token JWT (usar el mismo del navegador)
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0NDkxNDcwNiIsImlhdCI6MTczNDkzMzE5MCwiZXhwIjoxNzM1MDE5NTkwfQ.VnLXU_LlJXG6-RQfgnnZLYXWfKe3EcmO3MrZ72z8JqE';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: `/api${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    console.log(`\n🚀 GET ${options.hostname}:${options.port}${options.path}`);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 DIAGNÓSTICO DE API - SOLICITUDES DE BOLSA v1.6.0');
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    // Test 1: Obtener todas las solicitudes
    console.log('\n\n📋 TEST 1: Obtener todas las solicitudes');
    console.log('─────────────────────────────────────────────────────────────');
    const solicitudesRes = await makeRequest('/bolsas/solicitudes');

    if (solicitudesRes.status !== 200) {
      console.error(`❌ Error: Status ${solicitudesRes.status}`);
      console.error(solicitudesRes.data);
      return;
    }

    const solicitudes = solicitudesRes.data;
    console.log(`✅ Status: ${solicitudesRes.status}`);
    console.log(`✅ Total solicitudes retornadas: ${solicitudes.length}`);

    if (solicitudes.length === 0) {
      console.warn('⚠️ ADVERTENCIA: No hay solicitudes!');
      return;
    }

    // Mostrar estructura de la primera solicitud
    const primera = solicitudes[0];
    console.log('\n📊 ESTRUCTURA - Primera solicitud completa:');
    console.log(JSON.stringify(primera, null, 2));

    // Análisis de campos
    console.log('\n🔍 ANÁLISIS DE CAMPOS:');
    const campos = Object.keys(primera);
    console.log(`Total campos: ${campos.length}`);
    console.log('Campos disponibles:');
    campos.forEach((campo, idx) => {
      const valor = primera[campo];
      const tipo = typeof valor;
      console.log(`  ${idx + 1}. ${campo} (${tipo}): ${JSON.stringify(valor).substring(0, 60)}`);
    });

    // Test 2: Verificar campos críticos esperados en v1.6.0
    console.log('\n\n📋 TEST 2: Verificar campos críticos v1.6.0');
    console.log('─────────────────────────────────────────────────────────────');

    const camposCriticos = [
      'id_solicitud',
      'paciente_dni',
      'paciente_nombre',
      'paciente_telefono',
      'estado_gestion_citas_id',
      'cod_estado_cita',
      'desc_estado_cita',
      'especialidad',
      'id_bolsa',
      'numero_solicitud',
      'fecha_solicitud',
      'fecha_asignacion',
      'responsable_gestora_nombre'
    ];

    const camposEncontrados = [];
    const camposFaltantes = [];

    camposCriticos.forEach(campo => {
      if (primera.hasOwnProperty(campo)) {
        camposEncontrados.push(campo);
        console.log(`  ✅ ${campo}: ${JSON.stringify(primera[campo])}`);
      } else {
        camposFaltantes.push(campo);
        console.log(`  ❌ ${campo}: FALTA`);
      }
    });

    console.log(`\n📊 Resumen: ${camposEncontrados.length}/${camposCriticos.length} campos encontrados`);
    if (camposFaltantes.length > 0) {
      console.warn(`⚠️ Campos faltantes: ${camposFaltantes.join(', ')}`);
    }

    // Test 3: Verificar mapeo de estados
    console.log('\n\n📋 TEST 3: Mapeo de Estados v1.6.0');
    console.log('─────────────────────────────────────────────────────────────');

    // Contar estados únicos
    const estadosUnicos = new Set();
    const estadosEnBD = {};

    solicitudes.forEach(sol => {
      const codEstado = sol.cod_estado_cita;
      const idEstado = sol.estado_gestion_citas_id;

      if (codEstado) estadosUnicos.add(codEstado);
      if (!estadosEnBD[codEstado]) {
        estadosEnBD[codEstado] = { id: idEstado, count: 0 };
      }
      estadosEnBD[codEstado].count++;
    });

    console.log(`Estados únicos encontrados: ${estadosUnicos.size}`);
    console.log('\nDistribución de estados:');
    Object.entries(estadosEnBD).forEach(([estado, data]) => {
      console.log(`  ${estado} (ID: ${data.id}): ${data.count} solicitudes`);
    });

    // Test 4: Simular el procesamiento que hace el componente React
    console.log('\n\n📋 TEST 4: Simular procesamiento del componente React');
    console.log('─────────────────────────────────────────────────────────────');

    const mapearEstadoAPI = (estado) => {
      const mapping = {
        'PENDIENTE_CITA': 'pendiente',
        'CITADO': 'citado',
        'NO_CONTESTA': 'observado',
        'NO_DESEA': 'observado',
        'ATENDIDO_IPRESS': 'atendido',
        'HC_BLOQUEADA': 'observado',
        'NUM_NO_EXISTE': 'observado',
        'TEL_SIN_SERVICIO': 'observado',
        'REPROG_FALLIDA': 'observado',
        'SIN_VIGENCIA': 'observado',
        'APAGADO': 'observado',
      };

      if (typeof estado === 'string') {
        return mapping[estado] || 'pendiente';
      }
      return 'pendiente';
    };

    const primeraProcesada = {
      id: primera.id_solicitud,
      dni: primera.paciente_dni || '',
      paciente: primera.paciente_nombre || '',
      telefono: primera.paciente_telefono || '',
      estado: mapearEstadoAPI(primera.cod_estado_cita || primera.estado_gestion_citas_id),
      estadoCodigo: primera.cod_estado_cita,
      especialidad: primera.especialidad || 'N/A',
      red: primera.responsable_gestora_nombre || 'Sin asignar',
      ipress: primera.id_bolsa ? `Bolsa ${primera.id_bolsa}` : 'N/A',
      bolsa: primera.numero_solicitud || 'Sin clasificar',
    };

    console.log('Primera solicitud después del mapeo:');
    console.log(JSON.stringify(primeraProcesada, null, 2));

    // Test 5: Verificar filtros
    console.log('\n\n📋 TEST 5: Verificar Filtros (test primeras 5 solicitudes)');
    console.log('─────────────────────────────────────────────────────────────');

    const procesadas = solicitudes.slice(0, 5).map(sol => ({
      id: sol.id_solicitud,
      dni: sol.paciente_dni || '',
      paciente: sol.paciente_nombre || '',
      bolsa: sol.numero_solicitud || 'Sin clasificar',
      red: sol.responsable_gestora_nombre || 'Sin asignar',
      estado: mapearEstadoAPI(sol.cod_estado_cita),
    }));

    // Simular filtro por defecto
    const filtrosPorDefecto = {
      filtroBolsa: 'todas',
      filtroRed: 'todas',
      filtroEspecialidad: 'todas',
      filtroEstado: 'todos',
      searchTerm: ''
    };

    const filtradas = procesadas.filter(sol => {
      const matchBusqueda = sol.paciente.toLowerCase().includes(filtrosPorDefecto.searchTerm.toLowerCase()) ||
                           sol.dni.includes(filtrosPorDefecto.searchTerm);
      const matchBolsa = filtrosPorDefecto.filtroBolsa === 'todas' || sol.bolsa === filtrosPorDefecto.filtroBolsa;
      const matchRed = filtrosPorDefecto.filtroRed === 'todas' || sol.red === filtrosPorDefecto.filtroRed;
      const matchEstado = filtrosPorDefecto.filtroEstado === 'todos' || sol.estado === filtrosPorDefecto.filtroEstado;

      return matchBusqueda && matchBolsa && matchRed && matchEstado;
    });

    console.log(`Procesadas: 5, Después de filtros: ${filtradas.length}`);
    console.log('Resultado:');
    console.log(JSON.stringify(filtradas, null, 2));

    // Resumen final
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('📋 RESUMEN Y RECOMENDACIONES');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ Total solicitudes en BD: ${solicitudes.length}`);
    console.log(`✅ Campos críticos encontrados: ${camposEncontrados.length}/${camposCriticos.length}`);
    console.log(`✅ Estados únicos: ${estadosUnicos.size}`);
    console.log(`✅ Filtro por defecto debería dejar: ${filtradas.length}/5 (test)`);

    if (camposFaltantes.length > 0) {
      console.log(`\n❌ PROBLEMA: Faltan campos en el API response:`);
      console.log(`   ${camposFaltantes.join(', ')}`);
      console.log(`\n   SOLUCIÓN: Verificar que el backend está retornando estos campos`);
    }

    if (filtradas.length === 0) {
      console.log(`\n❌ PROBLEMA: Los filtros por defecto están eliminando todas las solicitudes`);
      console.log(`\n   SOLUCIÓN: Revisar lógica de filtros en Solicitudes.jsx`);
    } else {
      console.log(`\n✅ Los datos se deberían mostrar correctamente en la tabla`);
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
  }
}

// Ejecutar tests
runTests();
