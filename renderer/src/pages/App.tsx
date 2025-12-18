import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatISO } from 'date-fns';
import TaskForm from '../sections/TaskForm';
import CsvImport from '../sections/CsvImport';
import SettingsPanel from '../sections/SettingsPanel';
import SuggestionList from '../sections/SuggestionList';
import ProofList from '../sections/ProofList';
import { Task } from '../types';

const localizer = momentLocalizer(moment);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<keyof typeof Views>('week');

  const refresh = () => setTasks(window.assistant.listTasks());

  useEffect(() => {
    refresh();
  }, []);

  const events = useMemo(
    () =>
      tasks.map((t) => ({
        id: t.id,
        title: `${t.title} (${t.priority})`,
        start: new Date(t.due_date_time),
        end: new Date(new Date(t.due_date_time).getTime() + t.duration_minutes * 60000),
        resource: t,
      })),
    [tasks]
  );

  const onSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedTask({
      title: 'New Task',
      description: '',
      due_date_time: formatISO(slotInfo.start as Date),
      duration_minutes: 30,
      priority: 3,
      category: 'general',
      status: 'pending',
      recurrence_rule: '',
    });
  };

  const onEventDrop = ({ event, start }: any) => {
    window.assistant.upsertTask({ ...event.resource, due_date_time: formatISO(start) });
    refresh();
  };

  return (
    <div className="app">
      <header>
        <h1>Daily AI Assistant</h1>
        <button onClick={refresh}>Refresh</button>
      </header>
      <div className="layout">
        <div className="main">
          <Calendar
            localizer={localizer}
            events={events}
            defaultView={Views.WEEK}
            view={view}
            onView={(next) => setView(next)}
            selectable
            onSelectSlot={onSelectSlot}
            onSelectEvent={(e) => setSelectedTask(e.resource as Task)}
            resizable
            draggableAccessor={() => true}
            onEventDrop={onEventDrop}
            style={{ height: 600 }}
          />
          <SuggestionList tasks={tasks} />
        </div>
        <aside>
          <TaskForm task={selectedTask} onSaved={() => refresh()} />
          <ProofList task={selectedTask} />
          <CsvImport onImported={refresh} />
          <SettingsPanel />
        </aside>
      </div>
    </div>
  );
};

export default App;
