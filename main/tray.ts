import { BrowserWindow, Menu, Tray, app, dialog } from 'electron';
import path from 'path';
import { createMainWindow } from './windows';

let tray: Tray | null = null;

const createTray = () => {
  const iconPath = path.join(__dirname, 'icon.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Calendar', click: () => createMainWindow() },
    { label: 'Add Task Quick', click: () => createMainWindow() },
    { label: 'Import CSV', click: () => createMainWindow() },
    { label: 'Settings', click: () => createMainWindow() },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        const res = dialog.showMessageBoxSync({
          message: 'Quit Daily AI Assistant?',
          buttons: ['Cancel', 'Quit'],
        });
        if (res === 1) {
          app.quit();
        }
      },
    },
  ]);
  tray.setToolTip('Daily AI Assistant');
  tray.setContextMenu(contextMenu);
};

export { createTray };
