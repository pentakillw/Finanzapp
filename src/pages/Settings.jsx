import React, { useState } from 'react';
import { Plus, Trash2, Tag, User, DollarSign, Save } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';

export default function Settings() {
  const { categories, addCategory, deleteCategory, transactions, userSettings, updateUserSettings } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
  const [profileForm, setProfileForm] = useState(userSettings);
  const [saveStatus, setSaveStatus] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    addCategory(newCategory);
    setIsModalOpen(false);
    setNewCategory({ name: '', type: 'expense' });
  };

  const handleDeleteCategory = (id, name) => {
    // Verificar si la categoría está en uso
    const inUse = transactions.some(t => t.category === name);
    if (inUse) {
      alert('No puedes eliminar esta categoría porque tiene transacciones asociadas.');
      return;
    }
    
    if (window.confirm('¿Eliminar esta categoría?')) {
      deleteCategory(id);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserSettings(profileForm);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Administra tu perfil, moneda y categorías</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Perfil y Moneda */}
        <div className="space-y-8 lg:col-span-1">
          {/* Tarjeta de Perfil */}
          <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--color-persian)]" />
              Perfil de Usuario
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={profileForm.userName}
                  onChange={(e) => setProfileForm({ ...profileForm, userName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.userEmail}
                  onChange={(e) => setProfileForm({ ...profileForm, userEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[var(--color-persian)]" />
                  Moneda
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Divisa Principal</label>
                  <select
                    value={profileForm.currency}
                    onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
                  >
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="USD">Dólar Estadounidense (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="ARS">Peso Argentino (ARS)</option>
                    <option value="CLP">Peso Chileno (CLP)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--color-persian)] text-white font-medium rounded-lg hover:bg-[#028a90] transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
              
              {saveStatus === 'success' && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center animate-in fade-in">
                  ¡Cambios guardados correctamente!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Columna Derecha: Categorías */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Categorías</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[var(--color-persian)] text-white rounded-lg hover:bg-[#028a90] font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Categoría</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categorías de Ingresos */}
            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 h-fit">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Ingresos
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.filter(c => c.type === 'income').map(category => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl group hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorías de Gastos */}
            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 h-fit">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Gastos
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.filter(c => c.type === 'expense').map(category => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl group hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Categoría"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input
              type="text"
              required
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white"
              placeholder="Ej. Viajes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  newCategory.type === 'income'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 border dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'
                }`}
              >
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  newCategory.type === 'expense'
                    ? 'bg-red-100 text-red-700 border-red-200 border dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'
                }`}
              >
                Gasto
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[var(--color-persian)] text-white font-medium rounded-lg hover:bg-[#028a90] transition-colors mt-6"
          >
            Guardar Categoría
          </button>
        </form>
      </Modal>
    </div>
  );
}
