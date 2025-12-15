import React from 'react';

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5"
      >
        Anterior
      </button>
      <span className="text-sm text-gray-500 dark:text-gray-400">Página {page} de {totalPages}</span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5"
      >
        Siguiente
      </button>
    </div>
  );
}

