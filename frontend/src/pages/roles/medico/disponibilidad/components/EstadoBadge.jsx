import React from 'react';

const getBadgeClass = (estado) => {
  switch (estado) {
    case 'BORRADOR':
      return 'bg-yellow-100 text-yellow-800';
    case 'ENVIADO':
      return 'bg-blue-100 text-blue-800';
    case 'OBSERVADO':
      return 'bg-orange-100 text-orange-800';
    case 'APROBADO':
      return 'bg-green-100 text-green-800';
    case 'RECHAZADO':
      return 'bg-red-100 text-red-800';
    case 'ANULADO':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getEstadoText = (estado) => {
  const estados = {
    'BORRADOR': 'Borrador',
    'ENVIADO': 'Enviado',
    'OBSERVADO': 'Observado',
    'APROBADO': 'Aprobado',
    'RECHAZADO': 'Rechazado',
    'ANULADO': 'Anulado'
  };
  return estados[estado] || estado;
};

const EstadoBadge = ({ estado }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(estado)}`}>
      {getEstadoText(estado)}
    </span>
  );
};

export default EstadoBadge;
