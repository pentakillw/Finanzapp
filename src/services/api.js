import { supabase } from '../lib/supabase'

async function getUserId() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function listCategories() {
  return supabase.from('categories').select('*').order('created_at', { ascending: false })
}

export async function createCategory({ name, type }) {
  const user_id = await getUserId(); if (!user_id) throw new Error('No auth')
  return supabase.from('categories').insert([{ user_id, name, type, created_at: new Date().toISOString() }])
}

export async function updateCategory(id, patch) {
  return supabase.from('categories').update(patch).eq('id', id)
}

export async function deleteCategory(id) {
  return supabase.from('categories').delete().eq('id', id)
}

export async function getMyProfile() {
  const user_id = await getUserId(); if (!user_id) return { data: null, error: null }
  return supabase.from('profiles').select('*').eq('id', user_id).single()
}

export async function updateMyProfile(patch) {
  const user_id = await getUserId(); if (!user_id) throw new Error('No auth')
  return supabase.from('profiles').update(patch).eq('id', user_id)
}

export async function listDebts() {
  return supabase.from('debts').select('*').order('created_at', { ascending: false })
}

export async function createDebt(input) {
  const user_id = await getUserId(); if (!user_id) throw new Error('No auth')
  return supabase.from('debts').insert([{ user_id, ...input, created_at: new Date().toISOString() }])
}

export async function updateDebt(id, patch) {
  return supabase.from('debts').update(patch).eq('id', id)
}

export async function deleteDebt(id) {
  return supabase.from('debts').delete().eq('id', id)
}

export async function listTransactions() {
  return supabase.from('transactions').select('*').order('date', { ascending: false })
}

function sanitizeTransactionInput(input) {
  return {
    description: input.description,
    amount: input.amount,
    type: input.type,
    category: input.category,
    date: input.date,
    status: input.status,
    is_recurring_instance: input.is_recurring_instance,
    recurrence_id: input.recurrence_id
  }
}

export async function createTransaction(input) {
  const user_id = await getUserId(); if (!user_id) throw new Error('No auth')
  const payload = sanitizeTransactionInput(input)
  return supabase.from('transactions').insert([{ user_id, ...payload, created_at: new Date().toISOString() }])
}

export async function updateTransaction(id, patch) {
  return supabase.from('transactions').update(sanitizeTransactionInput(patch)).eq('id', id)
}

export async function deleteTransaction(id) {
  return supabase.from('transactions').delete().eq('id', id)
}

export async function listRecurring() {
  return supabase.from('recurring_transactions').select('*').order('next_due_date', { ascending: true })
}

export async function createRecurring(input) {
  const user_id = await getUserId(); if (!user_id) throw new Error('No auth')
  return supabase.from('recurring_transactions').insert([{ user_id, ...input, created_at: new Date().toISOString(), active: input.active ?? true }])
}

export async function updateRecurring(id, patch) {
  return supabase.from('recurring_transactions').update(patch).eq('id', id)
}

export async function deleteRecurring(id) {
  return supabase.from('recurring_transactions').delete().eq('id', id)
}
