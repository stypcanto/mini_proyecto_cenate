/**
 * BolsaXMedico.jsx
 * Vista "Bolsa x Médico" — Resumen de citación de pacientes por médico
 * v1.0 – Página en construcción
 */

import React from 'react';
import { Stethoscope, Construction } from 'lucide-react';

export default function BolsaXMedico() {
  return (
    <div style={{
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '16px',
      color: '#64748b',
    }}>
      <div style={{
        padding: '20px',
        background: '#f0f7ff',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
      }}>
        <Stethoscope size={48} color="#0D5BA9" />
      </div>

      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
        Bolsa x Médico
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Construction size={16} color="#f59e0b" />
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#f59e0b' }}>
          En construcción
        </span>
      </div>

      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', textAlign: 'center', maxWidth: '360px' }}>
        Esta sección mostrará el resumen de citación de pacientes agrupado por médico.
      </p>
    </div>
  );
}
