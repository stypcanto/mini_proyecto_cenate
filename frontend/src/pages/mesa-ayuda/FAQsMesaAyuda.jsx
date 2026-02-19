import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Página de FAQs del Módulo Mesa de Ayuda
 * Proporciona preguntas frecuentes y respuestas sobre el módulo
 *
 * @version v1.64.0 (2026-02-18)
 */
function FAQsMesaAyuda() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      pregunta: '¿Cómo creo un ticket de ayuda?',
      respuesta: 'Para crear un ticket, dirígete a la sección "Mis Pacientes" en tu rol de médico. Encontrarás un icono de ayuda junto a cada paciente. Al hacer clic, se abrirá un modal donde podrás escribir el título, descripción y seleccionar la prioridad del ticket.',
    },
    {
      id: 2,
      pregunta: '¿Cuáles son los niveles de prioridad?',
      respuesta: 'Hay tres niveles de prioridad: Alta (problema crítico que afecta la operación), Media (problema importante pero no crítico) y Baja (mejora o consulta informativa). El personal de Mesa de Ayuda atiende primero los tickets de mayor prioridad.',
    },
    {
      id: 3,
      pregunta: '¿Cuánto tiempo tarda en responder el equipo?',
      respuesta: 'El tiempo de respuesta depende de la prioridad: Tickets ALTA generalmente se responden en 1-2 horas, MEDIA en 4-8 horas, y BAJA en 24 horas. Los tiempos pueden variar según la carga de trabajo.',
    },
    {
      id: 4,
      pregunta: '¿Puedo modificar un ticket después de crearlo?',
      respuesta: 'Una vez creado, el ticket no puede ser modificado por el médico. Sin embargo, puedes crear un nuevo ticket con información adicional o aclaraciones. El equipo de Mesa de Ayuda puede actualizar la descripción interna si es necesario.',
    },
    {
      id: 5,
      pregunta: '¿Cómo sé que mi ticket ha sido respondido?',
      respuesta: 'Recibirás una notificación en el sistema cuando tu ticket sea respondido. También puedes ver el estado del ticket desde la sección de historial de tickets en tu perfil de médico. Un ticket en estado "RESUELTO" indica que ya tiene respuesta.',
    },
    {
      id: 6,
      pregunta: '¿Qué información debo incluir en la descripción?',
      respuesta: 'Incluye: 1) Una descripción clara del problema o solicitud, 2) Pasos para reproducir el error (si aplica), 3) Información del paciente afectado, 4) Capturas de pantalla si es relevante, 5) Cualquier mensaje de error que veas.',
    },
    {
      id: 7,
      pregunta: '¿Quién tiene acceso a ver mis tickets?',
      respuesta: 'Solo el equipo de Mesa de Ayuda y el médico que creó el ticket pueden verlo. La información es confidencial y se maneja según las políticas de privacidad de CENATE.',
    },
    {
      id: 8,
      pregunta: '¿Hay un historial de tickets cerrados?',
      respuesta: 'Sí, puedes ver todos tus tickets (abiertos, en proceso, resueltos y cerrados) desde el historial. Los tickets cerrados permanecen registrados para referencia futura.',
    },
    {
      id: 9,
      pregunta: '¿Cómo reporto un error crítico que afecta a múltiples pacientes?',
      respuesta: 'Para problemas críticos que afectan a múltiples pacientes: 1) Crea un ticket con prioridad ALTA, 2) Describe claramente cuáles y cuántos pacientes afecta, 3) Incluye información sobre el impacto, 4) Contacta directamente al administrador si es urgente.',
    },
    {
      id: 10,
      pregunta: '¿Puedo responder a una respuesta del equipo de Mesa de Ayuda?',
      respuesta: 'Los tickets tienen un flujo unidireccional: el médico crea el ticket, Mesa de Ayuda responde. Si necesitas hacer seguimiento, crea un nuevo ticket haciendo referencia al anterior.',
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <HelpCircle size={32} className="text-blue-600" />
          Preguntas Frecuentes
        </h1>
        <p className="text-gray-600 mt-2">
          Encuentra respuestas rápidas sobre cómo usar el módulo de Mesa de Ayuda
        </p>
      </div>

      {/* Contenedor de FAQs */}
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-left text-gray-900 font-semibold text-lg">
                {faq.pregunta}
              </h3>
              {expandedFAQ === faq.id ? (
                <ChevronUp size={24} className="text-blue-600 flex-shrink-0" />
              ) : (
                <ChevronDown size={24} className="text-gray-400 flex-shrink-0" />
              )}
            </button>

            {expandedFAQ === faq.id && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 leading-relaxed">
                  {faq.respuesta}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sección de contacto adicional */}
      <div className="mt-12 max-w-3xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          ¿No encontraste la respuesta?
        </h2>
        <p className="text-blue-800 mb-4">
          Si tu pregunta no está en esta lista, crea un ticket de "Consulta General" desde
          tu rol de médico o contacta directamente al equipo de Mesa de Ayuda.
        </p>
        <button
          onClick={() => {
            // Navegar a crear ticket o contacto
            console.log('Crear nuevo ticket');
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Crear Ticket de Consulta
        </button>
      </div>
    </div>
  );
}

export default FAQsMesaAyuda;
