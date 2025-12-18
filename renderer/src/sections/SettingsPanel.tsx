import React, { useEffect, useState } from 'react';
import { Settings } from '../types';

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setSettings(window.assistant.getSettings());
  }, []);

  const save = () => {
    if (!settings) return;
    window.assistant.updateSettings(settings);
    setStatus('Settings saved');
  };

  if (!settings) return null;

  return (
    <div className="panel">
      <h3>Settings</h3>
      <label>
        Notification interval (minutes)
        <input
          type="number"
          value={settings.notification_interval}
          onChange={(e) => setSettings({ ...settings, notification_interval: parseInt(e.target.value, 10) })}
        />
      </label>
      <label>
        Quiet hours start
        <input
          type="time"
          value={settings.quiet_hours_start}
          onChange={(e) => setSettings({ ...settings, quiet_hours_start: e.target.value })}
        />
      </label>
      <label>
        Quiet hours end
        <input
          type="time"
          value={settings.quiet_hours_end}
          onChange={(e) => setSettings({ ...settings, quiet_hours_end: e.target.value })}
        />
      </label>
      <label>
        Startup enabled
        <input
          type="checkbox"
          checked={settings.startup_enabled}
          onChange={(e) => setSettings({ ...settings, startup_enabled: e.target.checked })}
        />
      </label>
      <label>
        Strictness (1-5)
        <input
          type="number"
          min={1}
          max={5}
          value={settings.strictness_level}
          onChange={(e) => setSettings({ ...settings, strictness_level: parseInt(e.target.value, 10) })}
        />
      </label>
      <button onClick={save}>Save Settings</button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default SettingsPanel;
