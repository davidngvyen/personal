import React, { useEffect, useState } from 'react';
import { Suggestion, Task } from '../types';

interface Props {
  tasks: Task[];
}

const SuggestionList: React.FC<Props> = ({ tasks }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    setSuggestions(window.assistant.suggestions());
  }, [tasks]);

  return (
    <div className="panel">
      <h3>Planning Suggestions</h3>
      {suggestions.length === 0 && <p>No nudges right now.</p>}
      <ul>
        {suggestions.map((s, idx) => (
          <li key={idx} className={s.severity}>
            <strong>{s.title}</strong>
            <p>{s.details}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionList;
