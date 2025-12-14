import React, { useState } from 'react';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, Edit2, Trash2, Plus, Repeat } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { cn } from '../utils/cn';

export default function Transactions() {
  const { transactions, deleteTransaction, recurringTransactions, deleteRecurringTransaction, formatCurrency } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'recurring'

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      deleteTransaction(id);
    }
  };

  const handleDeleteRecurring = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción recurrente? Dejará de generarse automáticamente.')) {
      deleteRecurringTransaction(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecurring = recurringTransactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transacciones</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona y revisa todos tus movimientos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[var(--color-persian)] text-white rounded-lg hover:bg-[#028a90] font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">Nueva Transacción</span>
          <span className="md:hidden">Nueva</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === 'all' 
              ? "bg-white dark:bg-[#222] text-gray-900 dark:text-white shadow-sm" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          Historial
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
            activeTab === 'recurring'
              ? "bg-white dark:bg-[#222] text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          <Repeat className="w-4 h-4" />
          Recurrentes
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar transacción..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-[var(--color-persian)] focus:ring-1 focus:ring-[var(--color-persian)] dark:text-white"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 flex-1 justify-center">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 flex-1 justify-center">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Mobile Card View (History) */}
          <div className="md:hidden space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{transaction.description}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`block font-bold text-lg ${
                      transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <span className="text-xs text-gray-400">{transaction.date}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.status === 'Completado' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                  }`}>
                    {transaction.status}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(transaction)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(transaction.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (History) */}
          <div className="hidden md:block bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transacción</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'income' 
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                              : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          }`}>
                            {transaction.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{transaction.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {transaction.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'Completado' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${
                        transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(transaction)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(transaction.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {filteredTransactions.length} transacciones
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50">Anterior</button>
                <button className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Siguiente</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Recurring Transactions View */
        <div className="space-y-4">
          {filteredRecurring.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/5">
              <Repeat className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay transacciones recurrentes</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Crea una nueva transacción y marca la opción "Recurrente".</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecurring.map((transaction) => (
                <div key={transaction.id} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteRecurring(transaction.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar recurrencia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      <Repeat className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{transaction.description}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Monto:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Frecuencia:</span>
                      <span className="capitalize text-gray-900 dark:text-white">
                        {transaction.frequency === 'daily' ? 'Diaria' :
                         transaction.frequency === 'weekly' ? 'Semanal' :
                         transaction.frequency === 'monthly' ? 'Mensual' : 'Anual'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Próxima fecha:</span>
                      <span className="text-gray-900 dark:text-white">{transaction.nextDueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? "Editar Transacción" : "Nueva Transacción"}
      >
        <TransactionForm 
          onClose={handleCloseModal} 
          initialData={editingTransaction}
        />
      </Modal>
    </div>
  );
}
