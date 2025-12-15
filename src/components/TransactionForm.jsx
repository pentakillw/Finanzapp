import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Repeat } from 'lucide-react';

export default function TransactionForm({ onClose, initialData = null, defaultDate = null }) {
  const { addTransaction, updateTransaction, addRecurringTransaction, categories } = useFinance();
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        date: initialData.date.split('T')[0] // Asegurar formato fecha
      };
    }
    return {
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: defaultDate || new Date().toISOString().split('T')[0],
      status: 'Completado',
      isRecurring: false,
      frequency: 'monthly'
    };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      status: formData.status,
      // Estos solo si es instancia recurrente (los rellena el contexto cuando corresponde)
      is_recurring_instance: undefined,
      recurrence_id: undefined
    };

    if (initialData) {
      // Si estamos editando, solo actualizamos la transacción individual
      // (Editar una recurrencia completa requeriría una UI diferente)
      updateTransaction(initialData.id, dataToSave);
    } else {
      // Nueva transacción
      if (formData.isRecurring) {
        addRecurringTransaction({
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category,
          date: formData.date,
          frequency: formData.frequency
        });
        // También creamos la primera instancia si el usuario lo desea
        // Por simplicidad, asumimos que si crea una recurrente con fecha de hoy,
        // el contexto la generará automáticamente o podemos forzarla aquí.
        // Pero nuestro contexto ya maneja la generación si la fecha es <= hoy.
        // Así que solo guardamos la recurrencia.
        
        // Sin embargo, para mejor UX, quizás el usuario espera verla YA en la lista.
        // El useEffect del contexto correrá y la creará.
      } else {
        addTransaction(dataToSave);
      }
    }
    onClose();
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              formData.type === 'income'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 border dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'
            }`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              formData.type === 'expense'
                ? 'bg-red-100 text-red-700 border-red-200 border dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'
            }`}
          >
            Gasto
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full pl-7 pr-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          placeholder="Ej. Compra semanal"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          >
            <option value="">Seleccionar</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          />
        </div>
      </div>

      {!initialData && (
        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-4 h-4 text-[var(--color-persian)] rounded focus:ring-[var(--color-persian)] border-gray-300"
            />
            <label htmlFor="isRecurring" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <Repeat className="w-4 h-4" />
              Transacción Recurrente
            </label>
          </div>

          {formData.isRecurring && (
            <div className="pl-6 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2.5 bg-[var(--color-persian)] text-white font-medium rounded-lg hover:bg-[#028a90] transition-colors mt-6"
      >
        {initialData ? 'Actualizar Transacción' : (formData.isRecurring ? 'Guardar Recurrencia' : 'Guardar Transacción')}
      </button>
    </form>
  );
}
