import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Calendar, CreditCard, Settings, PieChart, Sun, Moon, X, UserCircle, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { signOut } from '../services/auth';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Wallet, label: 'Transacciones', path: '/transactions' },
  { icon: Calendar, label: 'Calendario', path: '/calendar' },
  { icon: CreditCard, label: 'Deudas y Pagos', path: '/debts' },
  { icon: PieChart, label: 'Reportes', path: '/reports' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();
  const { userSettings } = useFinance();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "bg-[var(--color-carbon)] dark:bg-[#1a1a1a] text-white h-screen flex flex-col fixed left-0 top-0 z-30 transition-transform duration-300 border-r border-white/5 dark:border-white/10 w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-persian)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--color-persian)]/20">
              <span className="font-bold text-white">FP</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Finanzas</h1>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-2 mb-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
            <UserCircle className="w-8 h-8 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userSettings?.userName || 'Usuario'}</p>
              <p className="text-xs text-gray-400 truncate">{userSettings?.currency || 'MXN'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-[var(--color-persian)] text-white shadow-lg shadow-[var(--color-persian)]/20" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>

          <NavLink 
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-[var(--color-persian)] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )
            }
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configuración</span>
          </NavLink>

          <button 
            onClick={async () => { await signOut(); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
