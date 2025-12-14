import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';

// Mapa de rutas a nombres legibles
const routeNames = {
  '': 'Dashboard',
  'transactions': 'Transacciones',
  'calendar': 'Calendario',
  'debts': 'Deudas y Pagos',
  'reports': 'Reportes',
  'settings': 'Configuración'
};

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-1">
      <Link to="/" className="hover:text-[var(--color-persian)] transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.length > 0 && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = routeNames[value] || value;

        return (
          <React.Fragment key={to}>
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-white">
                {name}
              </span>
            ) : (
              <>
                <Link to={to} className="hover:text-[var(--color-persian)] transition-colors">
                  {name}
                </Link>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </>
            )}
          </React.Fragment>
        );
      })}
      
      {pathnames.length === 0 && (
        <span className="font-medium text-gray-900 dark:text-white">
          Dashboard
        </span>
      )}
    </nav>
  );
}

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] dark:bg-[#121212] transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/10 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Finanzas</span>
          </div>
          <div className="w-8 h-8 bg-[var(--color-persian)] rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-xs">FP</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
