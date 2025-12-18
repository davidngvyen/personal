import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { createMainWindow, registerWindowHandlers } from './windows';
import { createTray } from './tray';
import { registerScheduler } from './scheduler';
import { enableAutostart, disableAutostart, isAutostartEnabled } from './autostart';
import { parseCsv } from './csv';
import { getSettings, listTasks, updateSettings, upsertTask } from './db';
import { generateSuggestions } from './suggestions';

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.on('ready', () => {
  createMainWindow();
  createTray();
  registerWindowHandlers();
  registerScheduler();
});

ipcMain.handle('csv-preview', (_event, filePath: string) => parseCsv(filePath));
ipcMain.handle('settings-get', () => getSettings());
ipcMain.handle('settings-update', (_event, payload: any) => {
  const updated = updateSettings(payload);
  if (payload.startup_enabled !== undefined) {
    if (payload.startup_enabled) enableAutostart();
    else disableAutostart();
  }
  return updated;
});
ipcMain.handle('tasks-save', (_event, task: any) => upsertTask(task));
ipcMain.handle('tasks-list', () => listTasks());
ipcMain.handle('suggestions', () => generateSuggestions(listTasks()));
ipcMain.handle('autostart-status', () => isAutostartEnabled());

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.setLoginItemSettings({
  openAtLogin: true,
});
