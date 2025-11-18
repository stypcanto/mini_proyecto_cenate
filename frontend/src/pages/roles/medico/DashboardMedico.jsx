// ========================================================================
// 🏥 DashboardMedico.jsx – Dashboard Médico Dinámico (CENATE 2025)
// ------------------------------------------------------------------------
// Dashboard médico que carga cards dinámicamente desde el CMS.
// Las cards son gestionadas desde el módulo de Administración.
// ========================================================================

import React, { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";
import { dashboardMedicoService } from "../../../services/dashboardMedicoService";
import MedicoDashboardCard from "./components/MedicoDashboardCard";

export default function DashboardMedico() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await dashboardMedicoService.obtenerActivas();
            setCards(data || []);
        } catch (err) {
            console.error("Error al cargar cards:", err);
            setError("No se pudieron cargar las cards del dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-5 md:p-6 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-lg md:text-xl font-bold mb-1 flex items-center gap-2 text-gray-900 dark:text-white">
                    <HeartPulse className="w-5 h-5 text-blue-600" />
                    Panel del Médico
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                    Acceso rápido a herramientas y recursos médicos
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Cards Grid */}
            {!loading && !error && (
                <>
                    {cards.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                            No hay cards disponibles en este momento.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {cards.map((card) => (
                                <MedicoDashboardCard
                                    key={card.id}
                                    titulo={card.titulo}
                                    descripcion={card.descripcion}
                                    link={card.link}
                                    icono={card.icono}
                                    color={card.color || "#0A5BA9"}
                                    targetBlank={card.targetBlank || false}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
