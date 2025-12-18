import React, { useState } from 'react';
import { Task } from '../types';

interface Props {
  onImported: () => void;
}

const CsvImport: React.FC<Props> = ({ onImported }) => {
  const [preview, setPreview] = useState<Task[]>([]);
  const [filePath, setFilePath] = useState<string>('');
  const [message, setMessage] = useState('');

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFilePath(file.path);
    const rows = await window.assistant.importCsvPreview(file.path);
    setPreview(rows);
  };

  const importNow = () => {
    preview.forEach((row) => window.assistant.upsertTask({ ...row, status: row.status || 'pending' }));
    onImported();
    setMessage(`Imported ${preview.length} tasks`);
    setPreview([]);
  };

  return (
    <div className="panel">
      <h3>Import CSV</h3>
      <input type="file" accept=".csv" onChange={handleFile} />
      {preview.length > 0 && (
        <>
          <p>Preview first {Math.min(5, preview.length)} rows</p>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Due</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 5).map((row, idx) => (
                <tr key={idx}>
                  <td>{row.title}</td>
                  <td>{new Date(row.due_date_time).toLocaleString()}</td>
                  <td>{row.duration_minutes}m</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={importNow}>Import All</button>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default CsvImport;
