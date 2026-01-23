const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Los 14 DNIs no sincronizados detectados
const dnisNuevos = [
  '3865732', '3857375', '3857012', '3872236', '3857841', '3831427',
  '233041', '3859800', '3895093', '3857641', '3857011', '3871256',
  '41305244', '45492311'
];

// Crear datos con TODOS los campos requeridos
const datosCompletos = dnisNuevos.map((dni, idx) => {
  const nombres = [
    'Juan Pérez García', 'María López Rodríguez', 'Carlos Sánchez Martínez',
    'Ana Torres González', 'Roberto Díaz Flores', 'Patricia Morales Ruiz',
    'Luis Hernández López', 'Francisca Silva García', 'Miguel Romero Torres',
    'Isabel Ortiz Sánchez', 'Antonio Vargas López', 'Rosa Mendoza García',
    'Fernando Córdoba Martínez', 'Sandra Reyes Flores'
  ];

  const ano = 1980 + (idx % 10);
  const mes = String(1 + (idx % 12)).padStart(2, '0');
  const dia = String(15 + (idx % 14)).padStart(2, '0');

  return {
    'DNI': dni,
    'Código Adscripción': '349',
    'Nombres y Apellidos': nombres[idx % nombres.length] + ` (${idx + 1})`,
    'Fecha Nacimiento (YYYY-MM-DD)': `${ano}-${mes}-${dia}`,
    'Género (M/F)': idx % 2 === 0 ? 'M' : 'F',
    'Teléfono Fijo': `964${String(100000 + idx * 111).slice(-6)}`,
    'Teléfono Celular': `987${String(100000 + idx * 111).slice(-6)}`,
    'Correo Electrónico': `paciente_${dni}@test.com`
  };
});

console.log('📊 Datos a importar:');
datosCompletos.forEach(d => {
  console.log(`   DNI: ${d.DNI}, Nombre: ${d['Nombres y Apellidos']}`);
});

// Crear Excel
const ws = XLSX.utils.json_to_sheet(datosCompletos);
ws['!cols'] = [
  { wch: 15 },   // DNI
  { wch: 20 },   // Código Adscripción
  { wch: 35 },   // Nombres y Apellidos
  { wch: 22 },   // Fecha Nacimiento
  { wch: 12 },   // Género
  { wch: 15 },   // Teléfono Fijo
  { wch: 15 },   // Teléfono Celular
  { wch: 30 }    // Correo Electrónico
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Pacientes14');
const filePath = '/tmp/IMPORT_14_PACIENTES.xlsx';
XLSX.writeFile(wb, filePath);

console.log(`\n✅ Excel creado: ${filePath}`);
console.log(`   Tamaño: ${fs.statSync(filePath).size} bytes`);
console.log(`   Registros: ${datosCompletos.length}`);
