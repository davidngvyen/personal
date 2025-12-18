export type TaskStatus = 'pending' | 'active' | 'completed';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  due_date_time: string;
  duration_minutes: number;
  priority: number;
  category?: string;
  status: TaskStatus;
  recurrence_rule?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Settings {
  notification_interval: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
  startup_enabled: boolean;
  strictness_level: number;
}

export interface Suggestion {
  title: string;
  details: string;
  severity: 'info' | 'warning';
}
