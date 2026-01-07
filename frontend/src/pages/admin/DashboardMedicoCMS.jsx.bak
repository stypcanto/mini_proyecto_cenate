// ========================================================================
// 🎴 DashboardMedicoCMS.jsx – CMS para Dashboard Médico (CENATE 2025)
// ------------------------------------------------------------------------
// Página de administración para gestionar las cards del Dashboard Médico.
// Permite crear, editar, eliminar, ordenar y activar/desactivar cards.
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Layout,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Loader2,
} from "lucide-react";
import { dashboardMedicoService } from "../../services/dashboardMedicoService";
import CardMedicoModal from "./components/CardMedicoModal";

// Componente auxiliar para manejar imágenes con error
const ImageWithError = ({ src, alt, className, containerClassName, containerStyle, errorColor }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  return (
    <div className={containerClassName} style={containerStyle}>
      {imageError ? (
        <span className="text-xs" style={{ color: errorColor }}>
          ?
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      )}
    </div>
  );
};

export default function DashboardMedicoCMS() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardMedicoService.obtenerTodas();
      setCards(data || []);
    } catch (err) {
      console.error("Error al cargar cards:", err);
      setError("No se pudieron cargar las cards. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCard(null);
    setShowModal(true);
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setShowModal(true);
  };

  const handleSave = async (cardData) => {
    try {
      if (editingCard) {
        await dashboardMedicoService.actualizar(editingCard.id, cardData);
      } else {
        await dashboardMedicoService.crear(cardData);
      }
      await loadCards();
      setShowModal(false);
      setEditingCard(null);
    } catch (err) {
      console.error("Error al guardar card:", err);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar esta card?")) {
      return;
    }

    try {
      setProcessingId(id);
      await dashboardMedicoService.eliminar(id);
      await loadCards();
    } catch (err) {
      console.error("Error al eliminar card:", err);
      alert("Error al eliminar la card: " + (err.message || "Error desconocido"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      setProcessingId(id);
      await dashboardMedicoService.toggleActivo(id);
      await loadCards();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("Error al cambiar el estado: " + (err.message || "Error desconocido"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    
    const newCards = [...cards];
    [newCards[index - 1], newCards[index]] = [newCards[index], newCards[index - 1]];
    
    // Actualizar ordenes
    const ids = newCards.map(c => c.id);
    
    try {
      await dashboardMedicoService.actualizarOrden(ids);
      await loadCards();
    } catch (err) {
      console.error("Error al actualizar orden:", err);
      alert("Error al actualizar el orden");
    }
  };

  const handleMoveDown = async (index) => {
    if (index === cards.length - 1) return;
    
    const newCards = [...cards];
    [newCards[index], newCards[index + 1]] = [newCards[index + 1], newCards[index]];
    
    const ids = newCards.map(c => c.id);
    
    try {
      await dashboardMedicoService.actualizarOrden(ids);
      await loadCards();
    } catch (err) {
      console.error("Error al actualizar orden:", err);
      alert("Error al actualizar el orden");
    }
  };

  const filteredCards = cards.filter(
    (card) =>
      card.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.link?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCards = cards.filter((c) => c.activo).length;
  const inactiveCards = cards.filter((c) => !c.activo).length;

  return (
    <div className="min-h-screen p-6 md:p-8 bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 text-[var(--text-primary)]">
              <Layout className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              CMS Dashboard Médico
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base">
              Gestiona las cards del Panel Médico
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Card
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Cards</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{cards.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">Activas</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{activeCards}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">Inactivas</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{inactiveCards}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar cards por título, descripción o link..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button
            onClick={loadCards}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Cards Table */}
      {!loading && !error && (
        <>
          {filteredCards.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
              {searchTerm
                ? "No se encontraron cards que coincidan con la búsqueda."
                : "No hay cards creadas aún. Crea tu primera card haciendo clic en 'Nueva Card'."}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Orden
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Link
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Imagen / Color
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredCards.map((card, index) => (
                      <tr
                        key={card.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0 || processingId === card.id}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mover arriba"
                            >
                              <ArrowUp className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </button>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {card.orden || index + 1}
                            </span>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === filteredCards.length - 1 || processingId === card.id}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mover abajo"
                            >
                              <ArrowDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {card.titulo}
                            </p>
                            {card.descripcion && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {card.descripcion}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">
                            {card.link}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <ImageWithError
                              src={`/images/iconos/${card.icono}`}
                              alt={card.icono}
                              className="w-6 h-6 object-contain"
                              containerClassName="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                              containerStyle={{ backgroundColor: `${card.color}25` }}
                              errorColor={card.color}
                            />
                            <div>
                              <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                                {card.icono}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {card.color}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {card.activo ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                              Activa
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-full text-xs font-medium">
                              Inactiva
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(card)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleToggleActivo(card.id)}
                              disabled={processingId === card.id}
                              className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors disabled:opacity-50"
                              title={card.activo ? "Desactivar" : "Activar"}
                            >
                              {card.activo ? (
                                <PowerOff className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <Power className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(card.id)}
                              disabled={processingId === card.id}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <CardMedicoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCard(null);
        }}
        onSave={handleSave}
        card={editingCard}
      />
    </div>
  );
}

