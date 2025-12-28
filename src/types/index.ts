export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  role: 'user' | 'admin';
}

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  priority: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  status: 'done' | 'skip' | 'empty';
  created_at: string;
  updated_at: string;
}

export interface DailyNote {
  id: string;
  user_id: string;
  date: string;
  content: string | null;
  college_status: 'C' | 'F' | 'H' | '';
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Shortcut {
  id: string;
  user_id: string;
  title: string;
  url: string;
  category: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  duration: number;
  session_type: 'stopwatch' | 'pomodoro';
  date: string;
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  sleep_time: string | null;
  wake_time: string | null;
  duration: number | null;
  quality: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completed: boolean;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface WaterReminder {
  id: string;
  user_id: string;
  date: string;
  count: number;
  created_at: string;
  updated_at: string;
}
