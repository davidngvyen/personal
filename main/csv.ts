import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { addMinutes, formatISO, parseISO } from 'date-fns';
import { Task } from './models';

export interface CsvRow {
  title: string;
  description?: string;
  start_datetime?: string;
  due_datetime?: string;
  duration_minutes?: string;
  priority?: string;
  category?: string;
  recurrence?: string;
}

const normalizeRow = (row: CsvRow): Task => {
  const dueStr = row.due_datetime || row.start_datetime || '';
  const dueDate = dueStr ? parseISO(dueStr) : new Date();
  if (dueStr && dueStr.length <= 10) {
    dueDate.setHours(9, 0, 0, 0);
  }
  const duration = row.duration_minutes ? parseInt(row.duration_minutes, 10) : 30;
  const task: Task = {
    title: row.title,
    description: row.description,
    due_date_time: formatISO(dueDate),
    duration_minutes: duration,
    priority: row.priority ? parseInt(row.priority, 10) : 3,
    category: row.category,
    status: 'pending',
    recurrence_rule: row.recurrence,
  };
  return task;
};

const parseCsv = (filePath: string): Task[] => {
  const content = fs.readFileSync(filePath, 'utf8');
  const records = parse(content, {
    columns: true,
    skipEmptyLines: true,
    relaxColumnCount: true,
  }) as CsvRow[];
  return records.map(normalizeRow);
};

export { parseCsv, normalizeRow };
