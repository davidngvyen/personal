import React, { useEffect, useState } from 'react';
import { Task } from '../types';

interface Props {
  task: Task | null;
}

const ProofList: React.FC<Props> = ({ task }) => {
  const [proofs, setProofs] = useState<any[]>([]);

  useEffect(() => {
    if (task?.id) setProofs(window.assistant.getProofsForTask(task.id));
  }, [task]);

  const addProof = async () => {
    if (!task?.id) return;
    await window.assistant.addProof(task.id);
    setProofs(window.assistant.getProofsForTask(task.id));
  };

  const markComplete = () => {
    if (!task?.id || proofs.length === 0) return;
    try {
      window.assistant.markTaskCompleted(task.id);
    } catch (err) {
      alert('Attach proof before completing.');
    }
  };

  return (
    <div className="panel">
      <h3>Proof</h3>
      {task ? <p>Task: {task.title}</p> : <p>Select a task</p>}
      <button disabled={!task} onClick={addProof}>
        Attach Proof (file)
      </button>
      <button disabled={!task || proofs.length === 0} onClick={markComplete}>
        Mark Complete
      </button>
      <ul>
        {proofs.map((p) => (
          <li key={p.id}>{p.image_path}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProofList;
