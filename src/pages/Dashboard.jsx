import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, PiggyBank } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';

// Datos dinámicos por mes usando transacciones del año actual
function buildMonthlyData(transactions) {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === monthIndex && d.getFullYear() === new Date().getFullYear();
    });
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const name = new Date(0, monthIndex).toLocaleString('es-ES', { month: 'short' });
    return { name, ingresos: income, gastos: expense };
  });
}

const StatCard = ({ title, value, trend, trendValue, icon: Icon, colorClass, iconColorClass }) => (
  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 ${colorClass}`}>
      <Icon className="w-24 h-24" />
    </div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
          trend === 'up' 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {trendValue}
        </div>
        <span className="text-gray-400 dark:text-gray-500 text-xs">vs mes anterior</span>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { stats, transactions, formatCurrency } = useFinance();
  const { theme } = useTheme();

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Resumen de tus finanzas personales</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors">
            Descargar Reporte
          </button>
          <button className="px-4 py-2 bg-[var(--color-carbon)] dark:bg-[var(--color-persian)] text-white rounded-lg hover:bg-gray-800 dark:hover:bg-[#028a90] font-medium transition-colors">
            Nueva Transacción
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Balance Total" 
          value={formatCurrency(stats.balance)} 
          trend={stats.balance >= 0 ? 'up' : 'down'} 
          trendValue="+12%" 
          icon={Wallet}
          colorClass="text-blue-500"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <StatCard 
          title="Ingresos" 
          value={formatCurrency(stats.income)} 
          trend="up" 
          trendValue="+8%" 
          icon={ArrowDownLeft}
          colorClass="text-emerald-500"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard 
          title="Gastos" 
          value={formatCurrency(stats.expenses)} 
          trend="down" 
          trendValue="-5%" 
          icon={ArrowUpRight}
          colorClass="text-red-500"
          iconColorClass="text-red-600 dark:text-red-400"
        />
        <StatCard 
          title="Ahorro Estimado" 
          value={formatCurrency(stats.income - stats.expenses)} 
          trend="up" 
          trendValue="+15%" 
          icon={PiggyBank}
          colorClass="text-purple-500"
          iconColorClass="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5" style={{ minWidth: 0 }}>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Flujo de Caja</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={buildMonthlyData(transactions)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-persian)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-persian)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#333' : '#f0f0f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#222' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="var(--color-persian)" 
                  fillOpacity={1} 
                  fill="url(#colorIngresos)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="gastos" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorGastos)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Mini List */}
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Recientes</h3>
          <div className="space-y-4">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.type === 'expense' 
                      ? 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400' 
                      : 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400'
                  }`}>
                    {t.type === 'expense' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{t.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.date}</p>
                  </div>
                </div>
                <span className={`font-bold ${
                  t.type === 'expense' ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'
                }`}>
                  {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[var(--color-persian)] dark:hover:text-[var(--color-persian)] transition-colors">
            Ver todas las transacciones
          </button>
        </div>
      </div>
    </div>
  );
}
