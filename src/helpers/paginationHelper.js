/**
 * Genera el rango de números de página a mostrar con un límite máximo (por defecto 5 páginas visibles).
 * Si hay más páginas que maxButtons, calcula una ventana centrada en la página actual.
 *
 * @param {number} currentPage - Página actual (0-indexada)
 * @param {number} totalPages - Total de páginas disponibles
 * @param {number} maxVisible - Máximo número de páginas numéricas visibles (ej: 5)
 * @returns {number[]} Array con los índices 0-indexados de las páginas a mostrar
 */
export const getVisiblePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  if (!totalPages || totalPages <= 0) return [];
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(0, currentPage - half);
  let end = start + maxVisible - 1;

  if (end >= totalPages) {
    end = totalPages - 1;
    start = Math.max(0, end - maxVisible + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
};
