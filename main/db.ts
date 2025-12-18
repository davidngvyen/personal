import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Proof, Settings, Task } from './models';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'assistant.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  priority INTEGER NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  recurrence_rule TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proofs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  image_path TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY(task_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  notification_interval INTEGER DEFAULT 5,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',
  startup_enabled INTEGER DEFAULT 1,
  strictness_level INTEGER DEFAULT 3
);
INSERT OR IGNORE INTO settings (id) VALUES (1);
`);

const listTasks = (): Task[] => db.prepare('SELECT * FROM tasks').all() as Task[];

const upsertTask = (task: Task): Task => {
  if (task.id) {
    db.prepare(
      `UPDATE tasks SET title=@title, description=@description, due_date_time=@due_date_time, duration_minutes=@duration_minutes, priority=@priority, category=@category, status=@status, recurrence_rule=@recurrence_rule, updated_at=CURRENT_TIMESTAMP WHERE id=@id`
    ).run(task);
    return task;
  }
  const result = db
    .prepare(
      `INSERT INTO tasks (title, description, due_date_time, duration_minutes, priority, category, status, recurrence_rule) VALUES (@title, @description, @due_date_time, @duration_minutes, @priority, @category, @status, @recurrence_rule)`
    )
    .run(task);
  return { ...task, id: result.lastInsertRowid as number };
};

const deleteTask = (id: number) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
};

const getSettings = (): Settings => db.prepare('SELECT * FROM settings WHERE id = 1').get() as Settings;

const updateSettings = (settings: Partial<Settings>) => {
  const current = getSettings();
  const merged: Settings = { ...current, ...settings } as Settings;
  db.prepare(
    `UPDATE settings SET notification_interval=@notification_interval, quiet_hours_start=@quiet_hours_start, quiet_hours_end=@quiet_hours_end, startup_enabled=@startup_enabled, strictness_level=@strictness_level WHERE id = 1`
  ).run(merged);
  return merged;
};

const addProof = (proof: Proof): Proof => {
  const result = db
    .prepare('INSERT INTO proofs (task_id, image_path, notes) VALUES (@task_id, @image_path, @notes)')
    .run(proof);
  return { ...proof, id: result.lastInsertRowid as number };
};

const getProofsForTask = (taskId: number): Proof[] =>
  db.prepare('SELECT * FROM proofs WHERE task_id = ? ORDER BY created_at DESC').all(taskId) as Proof[];

const markTaskCompleted = (id: number) => {
  const proofCount = db.prepare('SELECT COUNT(*) as count FROM proofs WHERE task_id = ?').get(id) as { count: number };
  if (proofCount.count === 0) {
    throw new Error('Proof required before completion');
  }
  db.prepare("UPDATE tasks SET status='completed', updated_at=CURRENT_TIMESTAMP WHERE id = ?").run(id);
};

export {
  db,
  listTasks,
  upsertTask,
  deleteTask,
  getSettings,
  updateSettings,
  addProof,
  getProofsForTask,
  markTaskCompleted,
};
