import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import TransactionForm from '../components/TransactionForm';

export default function CalendarPage() {
  const { transactions, formatCurrency, updateTransaction, deleteTransaction } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getDayEvents = (day) => {
    return transactions.filter(t => isSameDay(parseISO(t.date), day));
  };

  const openDay = (day) => {
    setSelectedDay(day);
    setIsDayModalOpen(true);
  };

  const handleEdit = (t) => {
    setEditingTransaction(t);
    setDefaultDate(null);
    setIsModalOpen(true);
  };

  const handleAddForDay = (day) => {
    setEditingTransaction(null);
    setDefaultDate(format(day, 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  const toggleStatus = (t) => {
    updateTransaction(t.id, { status: t.status === 'Completado' ? 'Pendiente' : 'Completado' });
  };

  const handleDelete = (t) => {
    if (window.confirm('¿Eliminar esta transacción?')) deleteTransaction(t.id);
  };

  // Agrupar eventos por día para la vista de lista móvil
  const eventsByDay = days.reduce((acc, day) => {
    const dayEvents = getDayEvents(day);
    if (dayEvents.length > 0) {
      acc.push({ day, events: dayEvents });
    }
    return acc;
  }, []);

  const mobileDaysPager = usePagination(eventsByDay, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendario</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Planifica tus pagos y cobros</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-white/10 p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="px-4 font-semibold text-gray-700 dark:text-gray-200 min-w-[140px] text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[var(--color-persian)] text-white rounded-lg hover:bg-[#028a90] font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Evento</span>
          </button>
        </div>
      </div>

      {/* Mobile Agenda View */}
      <div className="md:hidden space-y-4">
        {eventsByDay.length > 0 ? (
          <>
            {mobileDaysPager.data.map(({ day, events }) => (
              <div key={day.toString()} className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="bg-gray-50 dark:bg-white/5 px-4 py-2 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                  <button onClick={() => openDay(day)} className="font-semibold text-gray-900 dark:text-white capitalize text-left">
                    {format(day, 'EEEE d', { locale: es })}
                  </button>
                  {isSameDay(day, new Date()) && (
                    <span className="text-xs bg-[var(--color-persian)] text-white px-2 py-0.5 rounded-full">Hoy</span>
                  )}
                </div>
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {events.map((event, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          event.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <button onClick={() => openDay(day)} className="font-medium text-gray-900 dark:text-white text-left">
                            {event.description}
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{event.category}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        event.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Pagination page={mobileDaysPager.page} totalPages={mobileDaysPager.totalPages} onPrev={mobileDaysPager.prev} onNext={mobileDaysPager.next} />
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/5">
            No hay eventos para mostrar en este período
          </div>
        )}
      </div>

      {/* Desktop Calendar View */}
      <div className="hidden md:block bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {days.map((day, dayIdx) => {
            const dayEvents = getDayEvents(day);
            return (
              <div 
                key={day.toString()} 
                className={`
                  p-2 border-b border-r border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5
                  ${!isSameMonth(day, monthStart) ? 'bg-gray-50/50 dark:bg-black/20 text-gray-400 dark:text-gray-600' : 'bg-white dark:bg-[#1a1a1a]'}
                  ${dayIdx % 7 === 6 ? 'border-r-0' : ''} 
                `}
              >
                <div className="flex justify-between items-start">
                  <button onClick={() => openDay(day)} className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                    ${isSameDay(day, new Date()) ? 'bg-[var(--color-persian)] text-white' : 'text-gray-700 dark:text-gray-300'}
                  `}>
                    {format(day, dateFormat)}
                  </button>
                </div>
                <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                  {dayEvents.map((event, idx) => (
                    <div 
                      key={idx} 
                      className={`
                        text-xs px-2 py-1 rounded truncate border-l-2
                        ${event.type === 'income' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400' 
                          : 'bg-red-50 text-red-700 border-red-500 dark:bg-red-500/10 dark:text-red-400'}
                      `}
                    >
                      <button onClick={() => openDay(day)} className="w-full text-left">
                        <span className="font-semibold mr-1">
                          {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                        </span>
                        {event.description}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        title={selectedDay ? format(selectedDay, 'EEEE d MMMM', { locale: es }) : ''}
      >
        {selectedDay && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {(() => {
                  const events = getDayEvents(selectedDay);
                  const income = events.filter(e => e.type==='income').reduce((a,c)=>a+c.amount,0);
                  const expense = events.filter(e => e.type==='expense').reduce((a,c)=>a+c.amount,0);
                  return `${formatCurrency(income)} ingresos • ${formatCurrency(expense)} gastos`;
                })()}
              </div>
              <button onClick={() => handleAddForDay(selectedDay)} className="px-3 py-1.5 bg-[var(--color-persian)] text-white rounded-lg text-sm">Añadir</button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {getDayEvents(selectedDay).map((t) => (
                <div key={t.id} className="p-3 bg-white dark:bg-[#222] rounded-xl border border-gray-100 dark:border-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.category}</p>
                    </div>
                    <span className={`${t.type==='income' ? 'text-emerald-500' : 'text-red-500'} font-bold`}>{t.type==='income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 justify-end">
                    <button onClick={() => toggleStatus(t)} className="px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-white/10">{t.status}</button>
                    <button onClick={() => handleEdit(t)} className="px-2 py-1 text-xs rounded-md border border-blue-200 text-blue-600 dark:border-blue-500/30">Editar</button>
                    <button onClick={() => handleDelete(t)} className="px-2 py-1 text-xs rounded-md border border-red-200 text-red-600 dark:border-red-500/30">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); setDefaultDate(null); }}
        title={editingTransaction ? 'Editar Evento' : 'Nuevo Evento'}
      >
        <TransactionForm onClose={() => { setIsModalOpen(false); setEditingTransaction(null); setDefaultDate(null); }} initialData={editingTransaction} defaultDate={defaultDate} />
      </Modal>
    </div>
  );
}
