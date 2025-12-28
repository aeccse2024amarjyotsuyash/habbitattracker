import { supabase } from './supabase';
import type { Habit, HabitLog, DailyNote, Todo, Shortcut, FocusSession, SleepLog, Goal, WaterReminder, Profile } from '@/types';

// Profile APIs
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Habit APIs
export const getHabits = async (userId: string, month: number, year: number) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createHabit = async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteHabit = async (habitId: string) => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId);
  
  if (error) throw error;
};

// Habit Log APIs
export const getHabitLogs = async (habitIds: string[]) => {
  if (habitIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .in('habit_id', habitIds);
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const upsertHabitLog = async (log: Omit<HabitLog, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(log, { onConflict: 'habit_id,date' })
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Daily Note APIs
export const getDailyNote = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('daily_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const upsertDailyNote = async (note: Omit<DailyNote, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('daily_notes')
    .upsert(note, { onConflict: 'user_id,date' })
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Todo APIs
export const getTodos = async (userId: string) => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createTodo = async (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('todos')
    .insert(todo)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateTodo = async (todoId: string, updates: Partial<Todo>) => {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', todoId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteTodo = async (todoId: string) => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', todoId);
  
  if (error) throw error;
};

// Shortcut APIs
export const getShortcuts = async (userId: string) => {
  const { data, error } = await supabase
    .from('shortcuts')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createShortcut = async (shortcut: Omit<Shortcut, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('shortcuts')
    .insert(shortcut)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateShortcut = async (shortcutId: string, updates: Partial<Shortcut>) => {
  const { data, error } = await supabase
    .from('shortcuts')
    .update(updates)
    .eq('id', shortcutId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteShortcut = async (shortcutId: string) => {
  const { error } = await supabase
    .from('shortcuts')
    .delete()
    .eq('id', shortcutId);
  
  if (error) throw error;
};

// Focus Session APIs
export const getFocusSessions = async (userId: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createFocusSession = async (session: Omit<FocusSession, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert(session)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Sleep Log APIs
export const getSleepLogs = async (userId: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const upsertSleepLog = async (log: Omit<SleepLog, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('sleep_logs')
    .upsert(log, { onConflict: 'user_id,date' })
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Goal APIs
export const getGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('goals')
    .insert(goal)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteGoal = async (goalId: string) => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);
  
  if (error) throw error;
};

// Water Reminder APIs
export const getWaterReminder = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('water_reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const upsertWaterReminder = async (reminder: Omit<WaterReminder, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('water_reminders')
    .upsert(reminder, { onConflict: 'user_id,date' })
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};
