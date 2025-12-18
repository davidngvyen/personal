import path from 'path';
import fs from 'fs';
import os from 'os';
import { app } from 'electron';

const startupFolder = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');

const enableAutostart = () => {
  const shortcutPath = path.join(startupFolder, 'DailyAIAssistant.lnk');
  try {
    const exePath = process.execPath;
    fs.writeFileSync(shortcutPath, `"${exePath}"`);
    return true;
  } catch (err) {
    return false;
  }
};

const disableAutostart = () => {
  const shortcutPath = path.join(startupFolder, 'DailyAIAssistant.lnk');
  if (fs.existsSync(shortcutPath)) fs.unlinkSync(shortcutPath);
};

const isAutostartEnabled = () => fs.existsSync(path.join(startupFolder, 'DailyAIAssistant.lnk'));

export { enableAutostart, disableAutostart, isAutostartEnabled };
