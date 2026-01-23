/**
 * 🧪 TEST - Verificar que los campos cod_estado_cita y desc_estado_cita se retornan
 * Ejecutar en la consola del navegador en http://localhost:3000/bolsas/solicitudes
 */

(async () => {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST DESPUÈS DE FIX - Validar nuevos campos');
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    const token = localStorage.getItem('auth.token');
    console.log('🔑 Token:', token ? '✅' : '❌ No hay token');

    if (!token) return;

    // Petición al API
    const response = await fetch('http://localhost:8080/api/bolsas/solicitudes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Error:', response.status);
      return;
    }

    const solicitudes = await response.json();
    const primera = solicitudes[0];

    console.log('\n✅ Total solicitudes:', solicitudes.length);
    console.log('\n📊 VALIDANDO NUEVOS CAMPOS:');
    console.log('────────────────────────────────────────');

    const camposNuevos = ['cod_estado_cita', 'desc_estado_cita', 'estado_gestion_citas_id'];
    camposNuevos.forEach(campo => {
      const existe = primera.hasOwnProperty(campo);
      const valor = primera[campo];
      const icono = existe ? '✅' : '❌';
      console.log(`${icono} ${campo}: ${existe ? JSON.stringify(valor) : 'NO EXISTE'}`);
    });

    console.log('\n📋 Primera solicitud completa:');
    console.table(primera);

    console.log('\n✅ Si ves "✅" en los tres campos, el FIX funcionó correctamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
