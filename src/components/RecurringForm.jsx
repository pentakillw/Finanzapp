import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function RecurringForm({ onClose, initialData }) {
  const { updateRecurringTransaction, categories } = useFinance();
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        description: initialData.description || '',
        amount: initialData.amount?.toString() || '',
        type: initialData.type || 'expense',
        category: initialData.category || '',
        nextDueDate: initialData.nextDueDate || new Date().toISOString().split('T')[0],
        frequency: initialData.frequency || 'monthly',
        active: initialData.active !== false
      };
    }
    return {
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      nextDueDate: new Date().toISOString().split('T')[0],
      frequency: 'monthly',
      active: true
    };
  });

  const filteredCategories = categories.filter(c => c.type === formData.type);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRecurringTransaction(initialData.id, {
      ...initialData,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      nextDueDate: formData.nextDueDate,
      frequency: formData.frequency,
      active: formData.active
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`py-2 rounded-lg text-sm font-medium ${formData.type === 'income' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-gray-400'}`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`py-2 rounded-lg text-sm font-medium ${formData.type === 'expense' ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400' : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-gray-400'}`}
            >
              Gasto
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Próxima Fecha</label>
          <input
            type="date"
            required
            value={formData.nextDueDate}
            onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          >
            <option value="daily">Diaria</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 text-[var(--color-persian)] rounded border-gray-300"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Activa</label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-[var(--color-persian)] text-white font-medium rounded-lg hover:bg-[#028a90] transition-colors mt-6"
      >
        Guardar Cambios
      </button>
    </form>
  );
}
