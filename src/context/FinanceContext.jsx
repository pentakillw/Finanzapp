import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, addWeeks, addMonths, addYears, isAfter, parseISO } from 'date-fns';
import { getMyProfile, updateMyProfile, listCategories, createCategory, deleteCategory as apiDeleteCategory, listDebts, createDebt, updateDebt as apiUpdateDebt, deleteDebt as apiDeleteDebt, listTransactions, createTransaction, updateTransaction as apiUpdateTransaction, deleteTransaction as apiDeleteTransaction, listRecurring, createRecurring, updateRecurring as apiUpdateRecurring, deleteRecurring as apiDeleteRecurring } from '../services/api';
import { getSession, onAuthChange } from '../services/auth';

const FinanceContext = createContext();

const initialSettings = { currency: 'MXN', userName: '', userEmail: '' };

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [userSettings, setUserSettings] = useState(initialSettings);
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function mapTransactions(rows) {
      return (rows || []).map(r => ({ id: r.id, description: r.description, category: r.category, date: r.date, amount: Number(r.amount), type: r.type, status: r.status, isRecurringInstance: r.is_recurring_instance, recurrenceId: r.recurrence_id }))
    }
    function mapDebts(rows) {
      return (rows || []).map(r => ({ id: r.id, name: r.name, lender: r.lender, totalAmount: Number(r.total_amount), paidAmount: Number(r.paid_amount || 0), monthlyPayment: Number(r.monthly_payment || 0), nextPayment: r.next_payment, status: r.status }))
    }
    function mapCategories(rows) {
      return (rows || []).map(r => ({ id: r.id, name: r.name, type: r.type }))
    }
    function mapRecurring(rows) {
      return (rows || []).map(r => ({ id: r.id, description: r.description, amount: Number(r.amount), type: r.type, category: r.category, nextDueDate: r.next_due_date, frequency: r.frequency, active: r.active }))
    }

    getSession().then(async s => {
      if (s?.user) {
        setIsAuthenticated(true)
        const prof = await getMyProfile()
        if (prof.data) setUserSettings({ currency: prof.data.currency || 'MXN', userName: prof.data.user_name || '', userEmail: s.user.email || '' })
        const cats = await listCategories(); setCategories(mapCategories(cats.data))
        const trs = await listTransactions(); setTransactions(mapTransactions(trs.data))
        const dbs = await listDebts(); setDebts(mapDebts(dbs.data))
        const recs = await listRecurring(); setRecurringTransactions(mapRecurring(recs.data))
      }
      setReady(true)
    })
    const { data: sub } = onAuthChange(async session => {
      if (session?.user) {
        setIsAuthenticated(true)
        const prof = await getMyProfile()
        if (prof.data) setUserSettings({ currency: prof.data.currency || 'MXN', userName: prof.data.user_name || '', userEmail: session.user.email || '' })
        const cats = await listCategories(); setCategories(mapCategories(cats.data))
        const trs = await listTransactions(); setTransactions(mapTransactions(trs.data))
        const dbs = await listDebts(); setDebts(mapDebts(dbs.data))
        const recs = await listRecurring(); setRecurringTransactions(mapRecurring(recs.data))
      } else {
        setIsAuthenticated(false)
        setTransactions([]); setDebts([]); setCategories([]); setRecurringTransactions([]); setUserSettings(initialSettings)
      }
    })
    return () => { sub?.subscription?.unsubscribe?.() }
  }, [])

  // Lógica de generación de recurrentes
  useEffect(() => {
    const processRecurring = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let newTransactions = [];
      let updatedRecurring = [...recurringTransactions];
      let hasChanges = false;

      updatedRecurring = updatedRecurring.map(rec => {
        if (rec.active === false) return rec;
        let nextDate = parseISO(rec.nextDueDate);
        let modifiedRec = { ...rec };
        let createdAny = false;

        // Mientras la fecha próxima sea hoy o anterior
        while (!isAfter(nextDate, today)) {
          // Crear transacción
          const newTrans = { description: rec.description, amount: rec.amount, type: rec.type, category: rec.category, date: rec.nextDueDate, status: 'Pendiente', is_recurring_instance: true, recurrence_id: rec.id };
          
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
          
          modifiedRec.nextDueDate = nextDate.toISOString().split('T')[0];
        }

        if (createdAny) hasChanges = true;
        return modifiedRec;
      });

      if (hasChanges) {
        Promise.all(newTransactions.map(nt => createTransaction(nt))).then(async () => {
          const trs = await listTransactions(); setTransactions(trs.data.map(r => ({ id: r.id, description: r.description, category: r.category, date: r.date, amount: Number(r.amount), type: r.type, status: r.status, isRecurringInstance: r.is_recurring_instance, recurrenceId: r.recurrence_id })) || [])
        })
        const promises = updatedRecurring.map(r => apiUpdateRecurring(r.id, { next_due_date: r.nextDueDate }))
        Promise.all(promises).then(async () => {
          const recs = await listRecurring(); setRecurringTransactions(recs.data.map(r => ({ id: r.id, description: r.description, amount: Number(r.amount), type: r.type, category: r.category, nextDueDate: r.next_due_date, frequency: r.frequency, active: r.active })) || [])
        })
      }
    };

    if (ready && recurringTransactions.length > 0) {
      processRecurring();
    }
  }, [recurringTransactions, ready]);

  // Acciones Transacciones
  const addTransaction = async (transaction) => {
    await createTransaction(transaction)
    const trs = await listTransactions(); setTransactions((trs.data || []).map(r => ({ id: r.id, description: r.description, category: r.category, date: r.date, amount: Number(r.amount), type: r.type, status: r.status, isRecurringInstance: r.is_recurring_instance, recurrenceId: r.recurrence_id })))
  };

  const updateTransaction = async (id, updatedData) => {
    await apiUpdateTransaction(id, updatedData)
    const trs = await listTransactions(); setTransactions((trs.data || []).map(r => ({ id: r.id, description: r.description, category: r.category, date: r.date, amount: Number(r.amount), type: r.type, status: r.status, isRecurringInstance: r.is_recurring_instance, recurrenceId: r.recurrence_id })))
  };

  const deleteTransaction = async (id) => {
    await apiDeleteTransaction(id)
    const trs = await listTransactions(); setTransactions((trs.data || []).map(r => ({ id: r.id, description: r.description, category: r.category, date: r.date, amount: Number(r.amount), type: r.type, status: r.status, isRecurringInstance: r.is_recurring_instance, recurrenceId: r.recurrence_id })))
  };

  // Acciones Recurrentes
  const addRecurringTransaction = async (transaction) => {
    await createRecurring({ description: transaction.description, amount: transaction.amount, type: transaction.type, category: transaction.category, frequency: transaction.frequency, next_due_date: transaction.date, active: true })
    const recs = await listRecurring(); setRecurringTransactions((recs.data || []).map(r => ({ id: r.id, description: r.description, amount: Number(r.amount), type: r.type, category: r.category, nextDueDate: r.next_due_date, frequency: r.frequency, active: r.active })))
  };

  const deleteRecurringTransaction = async (id) => {
    await apiDeleteRecurring(id)
    const recs = await listRecurring(); setRecurringTransactions((recs.data || []).map(r => ({ id: r.id, description: r.description, amount: Number(r.amount), type: r.type, category: r.category, nextDueDate: r.next_due_date, frequency: r.frequency, active: r.active })))
  };

  const updateRecurringTransaction = async (id, updatedData) => {
    await apiUpdateRecurring(id, { description: updatedData.description, amount: updatedData.amount, type: updatedData.type, category: updatedData.category, next_due_date: updatedData.nextDueDate, frequency: updatedData.frequency, active: updatedData.active })
    const recs = await listRecurring(); setRecurringTransactions((recs.data || []).map(r => ({ id: r.id, description: r.description, amount: Number(r.amount), type: r.type, category: r.category, nextDueDate: r.next_due_date, frequency: r.frequency, active: r.active })))
  };

  const toggleRecurringActive = async (id) => {
    const target = recurringTransactions.find(r => r.id === id)
    if (!target) return
    await apiUpdateRecurring(id, { active: target.active === false ? true : false })
    const recs = await listRecurring(); setRecurringTransactions((recs.data || []).map(r => ({ id: r.id, description: r.description, amount: Number(r.amount), type: r.type, category: r.category, nextDueDate: r.next_due_date, frequency: r.frequency, active: r.active })))
  };

  const generateRecurringInstance = async (id) => {
    const target = recurringTransactions.find(r => r.id === id);
    if (!target || target.active === false) return;
    const createdDate = target.nextDueDate;
    await createTransaction({ description: target.description, amount: target.amount, type: target.type, category: target.category, date: createdDate, status: 'Pendiente', is_recurring_instance: true, recurrence_id: target.id })
    const trs = await listTransactions(); setTransactions((trs.data || []).map(r => ({ id: r.id, description: r.description, category: r.category, date: r.date, amount: Number(r.amount), type: r.type, status: r.status, isRecurringInstance: r.is_recurring_instance, recurrenceId: r.recurrence_id })))
    let nextDate = parseISO(target.nextDueDate);
    switch (target.frequency) {
      case 'daily': nextDate = addDays(nextDate, 1); break;
      case 'weekly': nextDate = addWeeks(nextDate, 1); break;
      case 'monthly': nextDate = addMonths(nextDate, 1); break;
      case 'yearly': nextDate = addYears(nextDate, 1); break;
      default: nextDate = addMonths(nextDate, 1);
    }
    const nextStr = nextDate.toISOString().split('T')[0];
    await apiUpdateRecurring(id, { next_due_date: nextStr })
    const recs = await listRecurring(); setRecurringTransactions((recs.data || []).map(r => ({ id: r.id, description: r.description, amount: Number(r.amount), type: r.type, category: r.category, nextDueDate: r.next_due_date, frequency: r.frequency, active: r.active })))
  };

  const skipNextRecurring = async (id) => {
    const target = recurringTransactions.find(r => r.id === id);
    if (!target) return;
    let nextDate = parseISO(target.nextDueDate);
    switch (target.frequency) {
      case 'daily': nextDate = addDays(nextDate, 1); break;
      case 'weekly': nextDate = addWeeks(nextDate, 1); break;
      case 'monthly': nextDate = addMonths(nextDate, 1); break;
      case 'yearly': nextDate = addYears(nextDate, 1); break;
      default: nextDate = addMonths(nextDate, 1);
    }
    const nextStr = nextDate.toISOString().split('T')[0];
    await apiUpdateRecurring(id, { next_due_date: nextStr })
    const recs = await listRecurring(); setRecurringTransactions((recs.data || []).map(r => ({ id: r.id, description: r.description, amount: Number(r.amount), type: r.type, category: r.category, nextDueDate: r.next_due_date, frequency: r.frequency, active: r.active })))
  };

  // Acciones Deudas
  const addDebt = async (debt) => {
    await createDebt({ name: debt.name, lender: debt.lender, total_amount: debt.totalAmount, paid_amount: debt.paidAmount, monthly_payment: debt.monthlyPayment, next_payment: debt.nextPayment, status: debt.status })
    const dbs = await listDebts(); setDebts((dbs.data || []).map(r => ({ id: r.id, name: r.name, lender: r.lender, totalAmount: Number(r.total_amount), paidAmount: Number(r.paid_amount || 0), monthlyPayment: Number(r.monthly_payment || 0), nextPayment: r.next_payment, status: r.status })))
  };

  const updateDebt = async (id, updatedData) => {
    await apiUpdateDebt(id, { name: updatedData.name, lender: updatedData.lender, total_amount: updatedData.totalAmount, paid_amount: updatedData.paidAmount, monthly_payment: updatedData.monthlyPayment, next_payment: updatedData.nextPayment, status: updatedData.status })
    const dbs = await listDebts(); setDebts((dbs.data || []).map(r => ({ id: r.id, name: r.name, lender: r.lender, totalAmount: Number(r.total_amount), paidAmount: Number(r.paid_amount || 0), monthlyPayment: Number(r.monthly_payment || 0), nextPayment: r.next_payment, status: r.status })))
  };

  const deleteDebt = async (id) => {
    await apiDeleteDebt(id)
    const dbs = await listDebts(); setDebts((dbs.data || []).map(r => ({ id: r.id, name: r.name, lender: r.lender, totalAmount: Number(r.total_amount), paidAmount: Number(r.paid_amount || 0), monthlyPayment: Number(r.monthly_payment || 0), nextPayment: r.next_payment, status: r.status })))
  };

  // Acciones Categorías
  const addCategory = async (category) => {
    await createCategory({ name: category.name, type: category.type })
    const cats = await listCategories(); setCategories((cats.data || []).map(r => ({ id: r.id, name: r.name, type: r.type })))
  };

  const deleteCategory = async (id) => {
    await apiDeleteCategory(id)
    const cats = await listCategories(); setCategories((cats.data || []).map(r => ({ id: r.id, name: r.name, type: r.type })))
  };

  // Acciones Configuración
  const updateUserSettings = async (newSettings) => {
    await updateMyProfile({ user_name: newSettings.userName, currency: newSettings.currency })
    const prof = await getMyProfile();
    if (prof.data) setUserSettings({ currency: prof.data.currency || 'MXN', userName: prof.data.user_name || '', userEmail: userSettings.userEmail })
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
      ready,
      isAuthenticated,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addRecurringTransaction,
      deleteRecurringTransaction,
      updateRecurringTransaction,
      toggleRecurringActive,
      generateRecurringInstance,
      skipNextRecurring,
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
