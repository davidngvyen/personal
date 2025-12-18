import React, { useEffect, useState } from 'react';
import { Task } from '../types';

const Reminder: React.FC = () => {
  const [task, setTask] = useState<Task | null>(null);
  const [interval, setIntervalMinutes] = useState<number>(5);

  useEffect(() => {
    window.assistant.onReminder((payload: any, intervalMinutes: number) => {
      setTask(payload.task);
      setIntervalMinutes(intervalMinutes);
    });
  }, []);

  const snooze = (minutes: number) => {
    window.assistant.snoozeReminder(minutes);
  };

  const addProof = async () => {
    if (!task) return;
    await window.assistant.addProof(task.id);
  };

  const complete = () => {
    if (!task) return;
    window.assistant.markTaskCompleted(task.id);
  };

  if (!task) return <div className="reminder">Waiting for task...</div>;

  return (
    <div className="reminder">
      <h2>{task.title}</h2>
      <p>Due: {new Date(task.due_date_time).toLocaleString()}</p>
      <div className="buttons">
        <button onClick={() => snooze(5)}>Snooze 5</button>
        <button onClick={() => snooze(10)}>Snooze 10</button>
        <button onClick={() => snooze(15)}>Snooze 15</button>
        <button onClick={addProof}>Attach proof</button>
        <button onClick={complete}>Mark complete</button>
      </div>
    </div>
  );
};

export default Reminder;
