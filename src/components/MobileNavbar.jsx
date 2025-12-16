import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, CreditCard, PieChart, Menu } from 'lucide-react';
import { cn } from '../utils/cn';

export default function MobileNavbar({ onOpenSidebar }) {
  const items = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/' },
    { icon: Wallet, label: 'Trans.', path: '/transactions' },
    { icon: CreditCard, label: 'Deudas', path: '/debts' },
    { icon: PieChart, label: 'Reportes', path: '/reports' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-white/10 px-2 py-2 z-40 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-none">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px]",
              isActive 
                ? "text-[var(--color-persian)] bg-[var(--color-persian)]/10" 
                : "text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-white/5"
            )
          }
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
      
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-white/5 min-w-[60px] transition-all duration-200"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] font-medium">Menú</span>
      </button>
    </nav>
  );
}
