import React, { useState } from 'react';
import { CreditCard, Clock, Plus, Edit2, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import DebtForm from '../components/DebtForm';

export default function Debts() {
  const { debts, deleteDebt, formatCurrency } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);

  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta deuda?')) {
      deleteDebt(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDebt(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Control de Deudas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitorea tus obligaciones financieras</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[var(--color-carbon)] dark:bg-[var(--color-persian)] text-white rounded-lg hover:bg-gray-800 dark:hover:bg-[#028a90] font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Registrar Deuda</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {debts.map((debt) => {
          const progress = (debt.paidAmount / debt.totalAmount) * 100;
          return (
            <div key={debt.id} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden transition-all hover:shadow-md group">
              {debt.status === 'paid' && (
                <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-bl-xl text-xs font-bold uppercase">
                  Pagado
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(debt)}
                  className="p-1.5 bg-gray-100 dark:bg-white/10 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(debt.id)}
                  className="p-1.5 bg-gray-100 dark:bg-white/10 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{debt.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{debt.lender}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monto Total</p>
                  <p className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency(debt.totalAmount)}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Progreso de pago</span>
                  <span className="font-bold text-gray-900 dark:text-white">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      debt.status === 'paid' ? 'bg-emerald-500' : 'bg-[var(--color-persian)]'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Pagado: {formatCurrency(debt.paidAmount)}</span>
                  <span>Restante: {formatCurrency(debt.totalAmount - debt.paidAmount)}</span>
                </div>
              </div>

              {debt.status !== 'paid' && (
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-[#222] rounded-lg shadow-sm">
                      <Clock className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Próximo Pago</p>
                      <p className="font-bold text-gray-900 dark:text-white">{debt.nextPayment}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Cuota Mensual</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(debt.monthlyPayment)}</p>
                  </div>
                </div>
              )}
              
              {debt.status !== 'paid' && (
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 py-2 bg-[var(--color-persian)] text-white rounded-lg font-medium hover:bg-[#028a90] transition-colors">
                    Registrar Pago
                  </button>
                  <button className="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    Detalles
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDebt ? "Editar Deuda" : "Nueva Deuda"}
      >
        <DebtForm 
          onClose={handleCloseModal} 
          initialData={editingDebt}
        />
      </Modal>
    </div>
  );
}
