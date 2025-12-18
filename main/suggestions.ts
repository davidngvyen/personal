import { addMinutes, differenceInMinutes, parseISO } from 'date-fns';
import { Task, Suggestion } from './models';

const totalMinutesForDay = (tasks: Task[], day: Date) => {
  return tasks
    .filter((t) => {
      const due = parseISO(t.due_date_time);
      return due.getFullYear() === day.getFullYear() && due.getMonth() === day.getMonth() && due.getDate() === day.getDate();
    })
    .reduce((sum, t) => sum + t.duration_minutes, 0);
};

const generateSuggestions = (tasks: Task[]): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const today = new Date();
  const todayMinutes = totalMinutesForDay(tasks, today);
  if (todayMinutes > 8 * 60) {
    suggestions.push({
      title: 'Day is overbooked',
      details: `You have ${Math.round(todayMinutes / 60)} hours planned today. Consider moving low-priority tasks.`,
      severity: 'warning',
    });
  }

  const highPriorityToday = tasks.filter((t) => parseISO(t.due_date_time) <= addMinutes(today, 720) && t.priority >= 4);
  if (highPriorityToday.length > 3) {
    suggestions.push({
      title: 'Too many high priority tasks',
      details: 'Space out high priority tasks to avoid burnout.',
      severity: 'warning',
    });
  }

  const snoozeHints = tasks.filter((t) => t.status !== 'completed' && /snoozed/i.test(t.description || ''));
  if (snoozeHints.length) {
    suggestions.push({
      title: 'Repeated snoozing detected',
      details: 'Consider rescheduling frequently snoozed tasks or splitting them into smaller pieces.',
      severity: 'info',
    });
  }

  return suggestions;
};

export { generateSuggestions };
