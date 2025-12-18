import { BrowserWindow, app, dialog, ipcMain, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { ReminderPayload } from './models';
import { addProof, markTaskCompleted } from './db';

let mainWindow: BrowserWindow | null = null;
let reminderWindow: BrowserWindow | null = null;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  const url = app.isPackaged
    ? `file://${path.join(__dirname, 'renderer', 'index.html')}`
    : 'http://localhost:5173';

  mainWindow.loadURL(url);
};

const ensureReminderWindow = () => {
  if (reminderWindow) return reminderWindow;
  reminderWindow = new BrowserWindow({
    width: 420,
    height: 240,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    minimizable: true,
    closable: false,
    frame: true,
    title: 'Daily AI Assistant Reminder',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  reminderWindow.setMenu(null);
  reminderWindow.on('close', (e) => {
    e.preventDefault();
    reminderWindow?.minimize();
  });
  return reminderWindow;
};

const showReminderPopup = (payload: ReminderPayload, intervalMinutes: number) => {
  const win = ensureReminderWindow();
  const url = app.isPackaged
    ? `file://${path.join(__dirname, 'renderer', 'index.html')}#/reminder`
    : 'http://localhost:5173/#/reminder';
  win.loadURL(url);
  win.show();
  win.focus();
  win.webContents.send('reminder-show', payload, intervalMinutes);
};

const handleProofAttachment = async (taskId: number) => {
  const file = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
  });
  if (!file?.length) return null;
  const destDir = path.join(process.cwd(), 'data', 'proofs', String(taskId));
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, `${Date.now()}${path.extname(file[0])}`);
  fs.copyFileSync(file[0], dest);
  return addProof({ task_id: taskId, image_path: dest });
};

const registerWindowHandlers = () => {
  ipcMain.handle('open-proof-dialog', async (_event, taskId: number) => handleProofAttachment(taskId));
  ipcMain.on('mark-task-complete', (_event, taskId: number) => {
    markTaskCompleted(taskId);
  });
};

export { createMainWindow, showReminderPopup, registerWindowHandlers };
