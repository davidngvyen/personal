import React, { useEffect, useState } from 'react';
import { Task } from '../types';

interface Props {
  task: Task | null;
  onSaved: () => void;
}

const defaultTask: Task = {
  title: '',
  description: '',
  due_date_time: new Date().toISOString(),
  duration_minutes: 30,
  priority: 3,
  category: 'general',
  status: 'pending',
  recurrence_rule: '',
};

const TaskForm: React.FC<Props> = ({ task, onSaved }) => {
  const [model, setModel] = useState<Task>(task || defaultTask);

  useEffect(() => {
    setModel(task || defaultTask);
  }, [task]);

  const save = () => {
    window.assistant.upsertTask(model);
    onSaved();
  };

  return (
    <div className="panel">
      <h3>{model.id ? 'Edit Task' : 'New Task'}</h3>
      <label>
        Title
        <input value={model.title} onChange={(e) => setModel({ ...model, title: e.target.value })} />
      </label>
      <label>
        Description
        <textarea value={model.description} onChange={(e) => setModel({ ...model, description: e.target.value })} />
      </label>
      <label>
        Due
        <input
          type="datetime-local"
          value={model.due_date_time.slice(0, 16)}
          onChange={(e) => setModel({ ...model, due_date_time: new Date(e.target.value).toISOString() })}
        />
      </label>
      <div className="row">
        <label>
          Duration (min)
          <input
            type="number"
            value={model.duration_minutes}
            onChange={(e) => setModel({ ...model, duration_minutes: parseInt(e.target.value, 10) })}
          />
        </label>
        <label>
          Priority (1-5)
          <input
            type="number"
            min={1}
            max={5}
            value={model.priority}
            onChange={(e) => setModel({ ...model, priority: parseInt(e.target.value, 10) })}
          />
        </label>
      </div>
      <label>
        Category
        <input value={model.category} onChange={(e) => setModel({ ...model, category: e.target.value })} />
      </label>
      <label>
        Recurrence
        <input
          placeholder="e.g., weekly"
          value={model.recurrence_rule || ''}
          onChange={(e) => setModel({ ...model, recurrence_rule: e.target.value })}
        />
      </label>
      <button onClick={save}>Save Task</button>
    </div>
  );
};

export default TaskForm;
