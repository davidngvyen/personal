import { contextBridge, ipcRenderer } from 'electron';
import { parseCsv } from './csv';
import { addProof, deleteTask, getProofsForTask, getSettings, listTasks, markTaskCompleted, updateSettings, upsertTask } from './db';
import { generateSuggestions } from './suggestions';
import { Task } from './models';

contextBridge.exposeInMainWorld('assistant', {
  listTasks: () => listTasks(),
  upsertTask: (task: Task) => {
    const saved = upsertTask(task);
    ipcRenderer.send('tasks-updated');
    return saved;
  },
  deleteTask: (id: number) => deleteTask(id),
  getSettings: () => getSettings(),
  updateSettings: (settings: any) => updateSettings(settings),
  importCsvPreview: (filePath: string) => parseCsv(filePath),
  addProof: (taskId: number, filePath: string) => ipcRenderer.invoke('open-proof-dialog', taskId),
  getProofsForTask: (taskId: number) => getProofsForTask(taskId),
  markTaskCompleted: (taskId: number) => {
    markTaskCompleted(taskId);
    ipcRenderer.send('tasks-updated');
  },
  suggestions: () => generateSuggestions(listTasks()),
  onReminder: (callback: (payload: any, interval: number) => void) => ipcRenderer.on('reminder-show', (_event, payload, interval) => callback(payload, interval)),
  snoozeReminder: (minutes: number) => {
    setTimeout(() => ipcRenderer.send('tasks-updated'), minutes * 60 * 1000);
  },
});
