import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, addWeeks, addMonths, addYears, isAfter, isSameDay, parseISO } from 'date-fns';

const FinanceContext = createContext();

const initialTransactions = [
  { id: 1, description: 'Salario Mensual', category: 'Ingresos', date: '2025-12-14', amount: 2500.00, type: 'income', status: 'Completado' },
  { id: 2, description: 'Supermercado', category: 'Alimentación', date: '2025-12-13', amount: 150.50, type: 'expense', status: 'Completado' },
  { id: 3, description: 'Netflix', category: 'Entretenimiento', date: '2025-12-12', amount: 15.00, type: 'expense', status: 'Pendiente' },
  { id: 4, description: 'Gasolina', category: 'Transporte', date: '2025-12-11', amount: 45.00, type: 'expense', status: 'Completado' },
];

const initialDebts = [
  { id: 1, name: 'Préstamo Auto', lender: 'Banco Santander', totalAmount: 15000, paidAmount: 8500, nextPayment: '2025-01-05', monthlyPayment: 350, status: 'active' },
  { id: 2, name: 'Tarjeta Visa', lender: 'BBVA', totalAmount: 2500, paidAmount: 500, nextPayment: '2025-01-01', monthlyPayment: 200, status: 'warning' },
];

const initialCategories = [
  { id: 1, name: 'Ingresos', type: 'income' },
  { id: 2, name: 'Alimentación', type: 'expense' },
  { id: 3, name: 'Transporte', type: 'expense' },
  { id: 4, name: 'Vivienda', type: 'expense' },
  { id: 5, name: 'Servicios', type: 'expense' },
  { id: 6, name: 'Entretenimiento', type: 'expense' },
  { id: 7, name: 'Salud', type: 'expense' },
  { id: 8, name: 'Educación', type: 'expense' },
  { id: 9, name: 'Otros', type: 'expense' },
];

const initialRecurring = [];

const initialSettings = {
  currency: 'MXN', // MXN, USD, EUR, etc.
  userName: 'Usuario',
  userEmail: 'usuario@ejemplo.com'
};

export function FinanceProvider({ children }) {
  // Cargar estado inicial desde localStorage o usar defaults
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('fp_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('fp_debts');
    return saved ? JSON.parse(saved) : initialDebts;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('fp_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [recurringTransactions, setRecurringTransactions] = useState(() => {
    const saved = localStorage.getItem('fp_recurring');
    return saved ? JSON.parse(saved) : initialRecurring;
  });

  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem('fp_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Persistencia
  useEffect(() => {
    localStorage.setItem('fp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fp_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('fp_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fp_recurring', JSON.stringify(recurringTransactions));
  }, [recurringTransactions]);

  useEffect(() => {
    localStorage.setItem('fp_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Lógica de generación de recurrentes
  useEffect(() => {
    const processRecurring = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let newTransactions = [];
      let updatedRecurring = [...recurringTransactions];
      let hasChanges = false;

      updatedRecurring = updatedRecurring.map(rec => {
        let nextDate = parseISO(rec.nextDueDate);
        let modifiedRec = { ...rec };
        let createdAny = false;

        // Mientras la fecha próxima sea hoy o anterior
        while (!isAfter(nextDate, today)) {
          // Crear transacción
          const newTrans = {
            id: Date.now() + Math.random(), // ID único
            description: rec.description,
            amount: rec.amount,
            type: rec.type,
            category: rec.category,
            date: rec.nextDueDate, // Usar la fecha que correspondía
            status: 'Pendiente', // Por defecto pendiente
            isRecurringInstance: true,
            recurrenceId: rec.id
          };
          
          newTransactions.push(newTrans);
          createdAny = true;

          // Calcular siguiente fecha
          switch (rec.frequency) {
            case 'daily': nextDate = addDays(nextDate, 1); break;
            case 'weekly': nextDate = addWeeks(nextDate, 1); break;
            case 'monthly': nextDate = addMonths(nextDate, 1); break;
            case 'yearly': nextDate = addYears(nextDate, 1); break;
            default: nextDate = addMonths(nextDate, 1);
          }
          
          // Actualizar la fecha próxima en la recurrencia
          modifiedRec.nextDueDate = nextDate.toISOString().split('T')[0];
        }

        if (createdAny) hasChanges = true;
        return modifiedRec;
      });

      if (hasChanges) {
        setTransactions(prev => [...newTransactions, ...prev]);
        setRecurringTransactions(updatedRecurring);
      }
    };

    if (recurringTransactions.length > 0) {
      processRecurring();
    }
  }, [recurringTransactions]);

  // Acciones Transacciones
  const addTransaction = (transaction) => {
    setTransactions(prev => [{ ...transaction, id: Date.now() }, ...prev]);
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Acciones Recurrentes
  const addRecurringTransaction = (transaction) => {
    const newRecurring = {
      ...transaction,
      id: Date.now(),
      nextDueDate: transaction.date // La primera fecha es la seleccionada
    };
    setRecurringTransactions(prev => [...prev, newRecurring]);
  };

  const deleteRecurringTransaction = (id) => {
    setRecurringTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Acciones Deudas
  const addDebt = (debt) => {
    setDebts(prev => [{ ...debt, id: Date.now() }, ...prev]);
  };

  const updateDebt = (id, updatedData) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updatedData } : d));
  };

  const deleteDebt = (id) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  // Acciones Categorías
  const addCategory = (category) => {
    setCategories(prev => [...prev, { ...category, id: Date.now() }]);
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Acciones Configuración
  const updateUserSettings = (newSettings) => {
    setUserSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Helper para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: userSettings.currency || 'MXN'
    }).format(amount);
  };

  // Cálculos derivados
  const totalBalance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <FinanceContext.Provider value={{
      transactions,
      debts,
      categories,
      recurringTransactions,
      userSettings,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addRecurringTransaction,
      deleteRecurringTransaction,
      addDebt,
      updateDebt,
      deleteDebt,
      addCategory,
      deleteCategory,
      updateUserSettings,
      formatCurrency,
      stats: {
        balance: totalBalance,
        income: totalIncome,
        expenses: totalExpenses
      }
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
