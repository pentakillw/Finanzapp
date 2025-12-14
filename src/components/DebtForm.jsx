import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function DebtForm({ onClose, initialData = null }) {
  const { addDebt, updateDebt } = useFinance();
  const [formData, setFormData] = useState({
    name: '',
    lender: '',
    totalAmount: '',
    paidAmount: '',
    nextPayment: '',
    monthlyPayment: '',
    status: 'active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Aseguramos que los valores numéricos sean strings para los inputs
        totalAmount: initialData.totalAmount.toString(),
        paidAmount: initialData.paidAmount.toString(),
        monthlyPayment: initialData.monthlyPayment.toString()
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      totalAmount: parseFloat(formData.totalAmount),
      paidAmount: parseFloat(formData.paidAmount || 0),
      monthlyPayment: parseFloat(formData.monthlyPayment)
    };

    if (initialData) {
      updateDebt(initialData.id, dataToSave);
    } else {
      addDebt(dataToSave);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          placeholder="Ej. Préstamo Auto"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prestamista/Banco</label>
        <input
          type="text"
          required
          value={formData.lender}
          onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
          className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          placeholder="Ej. Banco Santander"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto Total</label>
          <input
            type="number"
            required
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto Pagado</label>
          <input
            type="number"
            value={formData.paidAmount}
            onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
            placeholder="0"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Próximo Pago</label>
          <input
            type="date"
            required
            value={formData.nextPayment}
            onChange={(e) => setFormData({ ...formData, nextPayment: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuota Mensual</label>
          <input
            type="number"
            required
            value={formData.monthlyPayment}
            onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-2.5 bg-[var(--color-persian)] text-white font-medium rounded-lg hover:bg-[#028a90] transition-colors mt-6"
      >
        {initialData ? 'Actualizar Deuda' : 'Guardar Deuda'}
      </button>
    </form>
  );
}
