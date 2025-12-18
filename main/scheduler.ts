import { app, BrowserWindow, ipcMain, powerMonitor } from 'electron';
import { differenceInMinutes, isAfter, isBefore, parseISO } from 'date-fns';
import { getSettings, listTasks } from './db';
import { ReminderPayload, Task } from './models';
import { showReminderPopup } from './windows';

const scheduled: NodeJS.Timeout[] = [];

const withinQuietHours = (date: Date, strictness: number, quietStart: string, quietEnd: string) => {
  if (strictness >= 5) return false;
  const [startHour, startMinute] = quietStart.split(':').map(Number);
  const [endHour, endMinute] = quietEnd.split(':').map(Number);
  const start = new Date(date);
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date(date);
  end.setHours(endHour, endMinute, 0, 0);
  if (isBefore(end, start)) {
    return date >= start || date <= end;
  }
  return date >= start && date <= end;
};

const evaluateReminders = () => {
  const settings = getSettings();
  const tasks = listTasks().filter((t) => t.status !== 'completed');
  const now = new Date();
  tasks.forEach((task) => {
    const due = parseISO(task.due_date_time);
    const minutesUntilDue = differenceInMinutes(due, now);
    const overdueMinutes = -minutesUntilDue;
    const shouldNotify = minutesUntilDue <= settings.notification_interval;
    const quiet = withinQuietHours(now, settings.strictness_level, settings.quiet_hours_start, settings.quiet_hours_end);
    if ((shouldNotify || overdueMinutes > 0) && (!quiet || overdueMinutes > 0)) {
      const payload: ReminderPayload = { task, overdueMinutes: Math.max(0, overdueMinutes) };
      showReminderPopup(payload, settings.notification_interval);
    }
  });
};

const clearSchedules = () => {
  scheduled.forEach((timeout) => clearTimeout(timeout));
  scheduled.length = 0;
};

const scheduleLoop = () => {
  clearSchedules();
  evaluateReminders();
  scheduled.push(setInterval(evaluateReminders, 60 * 1000) as unknown as NodeJS.Timeout);
};

const registerScheduler = () => {
  app.on('ready', () => scheduleLoop());
  powerMonitor.on('resume', () => scheduleLoop());
  ipcMain.on('tasks-updated', () => scheduleLoop());
};

export { registerScheduler };
