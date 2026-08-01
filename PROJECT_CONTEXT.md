# PROJECT_CONTEXT.md — Full Project Briefing (VectorShift Frontend Assessment)

> Everything an agent (or human) needs to know about this project: what it is, what's there, what's implemented, what's left to do, and the goal.

---

## 1. What is this assessment about?

This is the **VectorShift Frontend Technical Assessment**. You are given a starter codebase — a visual **pipeline builder** (like a no-code flow editor): users drag node types from a toolbar onto a ReactFlow canvas, connect them with edges, then submit the pipeline to a backend. The backend analyzes the graph and reports node/edge counts and whether it's a DAG. The task is to complete **4 parts** (detailed in section 5).

**The final goal (Definition of Done):** a user can drag nodes → connect edges → click **Submit** → see an **alert** displaying `num_nodes`, `num_edges`, and `is_dag`.

You may modify anything — adding files, deleting files, installing packages — as long as you use **JavaScript/React** for the frontend and **Python/FastAPI** for the backend.

---

## 2. Stack & Versions

| Layer | Tech |
|---|---|
| Frontend | React 18 + Create React App 5 (`react-scripts`), **ReactFlow 11** (`reactflow@^11.8.3`), **Zustand** for state, plain JS (no TypeScript) |
| Backend | Python + FastAPI (single file `backend/main.py`) |
| Testing/lint | No lint or typecheck scripts. CRA default test runner exists but unused. Verify by running the app / `npm run build` |

### Run commands
- Frontend: `cd frontend && npm i && npm start` → **http://localhost:3000**
- Backend: `cd backend && uvicorn main:app --reload` → **http://localhost:8000**

---

## 3. File Map — every file and what it does

```
VectorShift/
├── AGENTS.md            Agent instructions: graph engineering approach, conventions, work rules
├── CONTEXT.md           Append-only shared journal (decisions, progress, learnings, todos)
├── PROJECT_CONTEXT.md   THIS FILE — full briefing
├── backend/
│   └── main.py          FastAPI: GET / ping; POST /pipelines/parse (Form `pipeline` JSON → num_nodes/num_edges/is_dag via Kahn's algorithm; CORS enabled) — Part 4 ✅
└── frontend/
    ├── package.json     deps: react 18, reactflow 11, zustand, react-scripts 5
    └── src/
        ├── index.js     CRA entry — renders <App />
        ├── index.css    Full dark theme (CSS variables, toolbar/chips, node cards, ReactFlow overrides) — Part 2 ✅
        ├── App.js       .app flex-column layout: PipelineToolbar + PipelineUI + SubmitButton
        ├── toolbar.js   PipelineToolbar — title + DraggableNode per type (TOOLBAR_NODES, 9 entries)
        ├── draggableNode.js  DraggableNode — sets 'application/reactflow' MIME data, .draggable-node chip
        ├── ui.js        PipelineUI — ReactFlow canvas, onDrop creates nodes, nodeTypes DERIVED from registry, Background/Controls/MiniMap
        ├── store.js     Zustand store — nodes, edges, nodeIDs, getNodeID, addNode, onNodesChange/onEdgesChange, onConnect, updateNodeField
        ├── submit.js    SubmitButton — POSTs form-encoded `pipeline` JSON to /pipelines/parse, alert() with num_nodes/num_edges/is_dag — Part 4 ✅
        └── nodes/       node abstraction (Part 1 ✅)
            ├── BaseNode.js   shared config-driven shell: header, fields, static + dynamic handles, custom renderBody support
            ├── registry.js   nodeConfigs — single source of truth (9 configs) + createNode(type) factory
            └── textNode.js   Text node custom body (auto-grow textarea) + parseTextVariables() — Part 3 ✅
```

---

## 4. What is ALREADY implemented (current state)

**ALL 4 PARTS ARE IMPLEMENTED.** Status:

- **Part 1 ✅ Node abstraction** — `BaseNode.js` config-driven shell + `registry.js` with 9 declarative node configs (`customInput`, `llm`, `customOutput`, `text`, `api`, `condition`, `transform`, `note`, `timer`). New node = registry entry + toolbar line; `ui.js` derives `nodeTypes` automatically. Old 4 node files deleted. `store.js` `nodeIDs: {}` bug fixed.
- **Part 2 ✅ Styling** — dark VectorShift-inspired theme in `index.css` with CSS variables; per-node accent colors (config `color`); styled toolbar chips, node cards, handles, controls/minimap/edges, gradient submit button. No new dependencies.
- **Part 3 ✅ Text node logic** — auto-grow textarea (scrollWidth/scrollHeight, `wrap="off"`, `nodrag`) + `parseTextVariables()` regex `/\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g` → unique left-side target Handles per variable, live add/dedupe/remove via config `dynamicHandles`.
- **Part 4 ✅ Backend integration** — `submit.js` POSTs form-encoded `pipeline` JSON; `main.py` returns `{num_nodes, num_edges, is_dag}` (Kahn's algorithm, parallel-edge safe); CORS for `http://localhost:3000`; `alert()` on response with error handling.

### Verification results
- `CI=true npm run build` passes (no warnings/errors).
- Backend curl suite: chain → `3/2/true`; cycle → `2/2/false`; self-loop → `1/1/false`; empty → `0/0/true`; duplicate parallel edges → `4/3/true`; CORS preflight → `access-control-allow-origin: http://localhost:3000`.
- Variable parser unit-tested: dedupe, ordering, invalid identifiers (`{{1bad}}`, `{{a-b}}`) ignored, `$`/`_` prefixes accepted.

### Known notes
- Self-loop branch is live in backend (ReactFlow v11 has no `isValidConnection` guard, so self-connections are possible in the UI).
- Form-encoding via `URLSearchParams` is fine at assessment scale; a very large pipeline could hit query-style body limits — swap to JSON body + backend change if it ever matters.

---

## 5. What NEEDS to be implemented (the 4 assessment parts)

> **Status: ALL 4 PARTS DONE as of 2026-08-01.** Sections below remain as the spec/reference for what was built.

### Part 1 — Node Abstraction
**Problem:** the 4 node files in `nodes/` share tons of duplicated code (card shell, borders, label+input rows, handle layout). Copy-pasting to add new nodes doesn't scale.

**Task:** create an abstraction (e.g. a base `NodeShell`/`BaseNode` component + a node config registry) so new nodes are *declared* (label, handles, fields) rather than copied. Then **create 5 new nodes of your choosing** to demonstrate the abstraction. The *flexibility of the abstraction* is what's graded — not what the nodes do.

### Part 2 — Styling
**Task:** style everything into a unified, appealing design — toolbar, canvas, node cards, handles, submit button. VectorShift's own style is fine as inspiration, or design your own. Any React packages/libraries allowed (CSS, styled-components, Tailwind, etc.).

### Part 3 — Text Node Logic (`textNode.js`)
Two behaviors:
1. **Auto-grow:** the node's width and height grow as the user types more text (improve visibility).
2. **Dynamic variables:** when the user types a valid JS identifier inside double curly braces (e.g. `{{input}}`), create **one new Handle on the left side per unique variable**. Handles must be added/removed dynamically as the text changes (dedupe repeated variables, remove handles for deleted variables).

### Part 4 — Backend Integration
1. **Frontend (`submit.js`):** on click, send the current nodes + edges to `/pipelines/parse`. The backend expects `Form(...)`-encoded data — the conventional shape is a form field `pipeline` containing JSON-stringified `{nodes, edges}`.
2. **Backend (`main.py`):** parse the pipeline, compute `num_nodes` and `num_edges`, and determine whether the graph is a **directed acyclic graph (DAG)**. Respond with exactly:
   ```json
   { "num_nodes": int, "num_edges": int, "is_dag": bool }
   ```
3. **Alert:** frontend shows a user-friendly `alert()` with the three values when the response arrives.
4. **CORS:** must be enabled on the backend (frontend runs on :3000, backend on :8000 — different origins).

---

## 6. Key Conventions & Gotchas (from AGENTS.md)

- **Node ids:** always `getNodeID(type)` → `type-N`. Never hand-roll.
- **Handle ids:** `${nodeId}-<name>` (e.g. `${id}-value`), unique per node.
- **State:** node data mutations go through `store.js` `updateNodeField(nodeId, field, value)` — no scattered local mutation.
- **Edges:** created via store `onConnect` (smoothstep, animated, arrow markers) — keep that convention.
- **Drag contract:** `application/reactflow` MIME type, JSON `{nodeType}` — don't break it.
- **3-touchpoint rule for new node types:** (1) declare in the abstraction registry, (2) register in `ui.js` `nodeTypes` map, (3) add a `<DraggableNode />` in `toolbar.js`.
- **Backend contract:** response must be `{num_nodes, num_edges, is_dag}`.
- **Work rules:** read `CONTEXT.md` fully before starting; append (never edit/delete) to it when done; surface conflicts instead of silently overriding.

---

## 7. Suggested Implementation Order

1. **Part 1** — node abstraction + 5 new nodes (foundation for everything else)
2. **Part 2** — styling pass (the abstraction makes restyling one place)
3. **Part 3** — text node auto-grow + variable handles (independent of 1–2)
4. **Part 4** — backend DAG computation + submit wiring + alert + CORS (independent of 1–3)

Parts 3 and 4 are largely independent and could be done in parallel.

---

## 8. Definition of Done

- `npm start` runs clean; all 4 parts implemented.
- User can: drag nodes → connect edges → click Submit → see an alert with `num_nodes`, `num_edges`, `is_dag`.
- `CONTEXT.md` updated with what was done and any learnings.
