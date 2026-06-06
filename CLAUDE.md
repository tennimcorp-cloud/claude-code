# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

No build step or server required. Open any HTML file directly in a browser:

- `index.html` — Kanban board app
- `tictactoe.html` — Tic Tac Toe game

## Architecture

### Kanban board (`index.html` + `script.js` + `styles.css`)

Single-page app with no framework or dependencies. The three files are tightly coupled:

- **`index.html`** defines the static shell: three `<article class="column">` elements (each with `data-status="todo|inprogress|completed"`), and a single reusable modal (`#taskModal`) for both adding and editing tasks.
- **`script.js`** owns all state. Tasks live in a plain `tasks` array and are persisted to `localStorage` under the key `kanban-tasks`. On load, it reads from localStorage or falls back to `defaultTasks`. Every mutation (add, edit, delete, drag-drop) calls `saveTasks()` then `renderTasks()` — there is no partial update; the entire board re-renders each time.
- **Drag-and-drop** is handled with native HTML5 drag events. `draggedTaskId` is the only cross-handler shared state; `handleDrop` reads the column's `data-status` attribute to determine the new task status.
- **Modal dual-mode**: `editingTaskId` being non-null means the form is in edit mode. `closeModalDialog()` always resets it to null.
- All user-supplied strings are passed through `escapeHtml()` before being set as innerHTML — do not bypass this.

### Tic Tac Toe (`tictactoe.html`)

Self-contained single file (HTML + CSS + JS inline). Key points:

- Board state is a flat 9-element array. `WINS` is the hardcoded list of winning index triples.
- The AI uses unoptimized minimax (no alpha-beta pruning) — adequate for a 3×3 board.
- `vsComputer` toggles human-vs-human vs. human-vs-AI. Toggling resets scores.
- Computer moves are delayed with `setTimeout(..., 450ms)` to feel natural.

## Git workflow

All changes should be committed with clean messages and pushed to `origin/master` on GitHub (`https://github.com/tennimcorp-cloud/claude-code`). There is no CI; Git and GitHub are the only version control mechanism.
