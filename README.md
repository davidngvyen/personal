# Daily AI Assistant

Local-first Windows desktop app (Electron + React + TypeScript + SQLite) that enforces accountable task completion with proof before closing reminders.

## Why Electron + React + SQLite
- **Windows tray + startup integration** are well-supported by Electron APIs.
- **React + TypeScript** speeds up building the calendar UI and popups.
- **SQLite (better-sqlite3)** keeps data local-only without running a server.

## Architecture
- **main/**: Electron process. Handles database (SQLite), CSV parsing, scheduler/reminder logic, tray/autostart, and IPC bridges.
- **renderer/**: React UI (calendar, settings, CSV import, proof/completion flow, reminder view).
- **data/**: SQLite database, proofs, and example CSV. Proofs saved in `data/proofs/<taskId>/<timestamp>.png`.

### Modules
- `main/db.ts` – schema + CRUD for tasks, proofs, settings, completion gating (requires proof).
- `main/scheduler.ts` – periodic due/overdue checks, quiet hours, resume-from-sleep handling.
- `main/windows.ts` – main and reminder windows, proof dialog, completion enforcement.
- `main/csv.ts` – CSV preview/import normalization with defaults.
- `main/suggestions.ts` – rule-based “better choices” nudges.
- `main/tray.ts` – system tray menu.
- `main/autostart.ts` – Startup folder toggle (local-only).
- `renderer/pages/App.tsx` – calendar (day/week/month), task details, CSV import, settings, proofs, suggestions.
- `renderer/pages/Reminder.tsx` – always-on-top reminder UI (snooze, proof, gated completion).

## Setup
```bash
npm install
npm run dev       # launches Electron main (ts-node) + Vite dev server
npm run build     # outputs Electron main bundle + renderer build
npm start         # run packaged dist build
```

## Key Behaviors
- Data stored only under `./data`.
- Reminder popup cannot be closed; only minimized; completion requires proof.
- CSV import shows preview and applies defaults (9:00 AM for date-only, 30m duration when missing).
- Scheduler re-evaluates on app ready, every minute, and after sleep/resume.
- Quiet hours honored unless strictness is max; overdue tasks always break through.

## Example CSV
`data/example.csv` contains sample tasks for import testing.

## Packaging
Use your preferred Electron packager (e.g., `electron-builder`). Ensure `main/main.ts` builds to `dist/main.js` and renderer builds to `dist/renderer`.

## Future Improvements
- Rich recurring rules and skip/merge duplicate import UX.
- Mobile companion + secure LAN sync.
- Optional local AI embedding store for smarter scheduling.
- Gamification (streaks, rewards) and burnout detection.
- Clipboard image capture for proof and inline annotations.
- Better queueing for multiple simultaneous overdue reminders.
