import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente de paginación similar a DataTables
 * Muestra: "Showing X to Y of Z entries" y controles de paginación
 */
const PaginationControls = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  loading = false,
  className = ''
}) => {
  // Calcular rangos
  const startEntry = currentPage * pageSize + 1;
  const endEntry = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7; // Máximo de números de página visibles

    if (totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si son pocas
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage < 3) {
        // Primeras páginas
        for (let i = 0; i < 5; i++) {
          pages.push(i);
        }
        pages.push(null); // Elipsis
        pages.push(totalPages - 1); // Última página
      } else if (currentPage > totalPages - 4) {
        // Últimas páginas
        pages.push(0); // Primera página
        pages.push(null); // Elipsis
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Páginas intermedias
        pages.push(0); // Primera página
        pages.push(null); // Elipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(null); // Elipsis
        pages.push(totalPages - 1); // Última página
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      onPageChange(newPage);
    }
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${className}`}>
      {/* Información de entradas */}
      <div className="text-sm text-[var(--text-secondary)]">
        Mostrando <span className="font-semibold text-[var(--text-primary)]">{startEntry}</span> a{' '}
        <span className="font-semibold text-[var(--text-primary)]">{endEntry}</span> de{' '}
        <span className="font-semibold text-[var(--text-primary)]">{totalElements}</span> entradas
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón Previous */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || loading}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${currentPage === 0 || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === null) {
              // Elipsis
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-2 text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={`
                  min-w-[36px] px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                    : isActive
                    ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                  }
                `}
              >
                {page + 1}
              </button>
            );
          })}
        </div>

        {/* Botón Next */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || loading}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${currentPage >= totalPages - 1 || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
            }
          `}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;

