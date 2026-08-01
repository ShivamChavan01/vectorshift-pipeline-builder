# AGENTS.md — VectorShift Assessment Agent Instructions

This file defines how agents work on this project. Read it fully before doing anything. Read `CONTEXT.md` before starting a task and append to it when you finish.

## 1. Project Overview

Visual **pipeline builder** (VectorShift frontend technical assessment): users drag node types from a toolbar onto a ReactFlow canvas, connect them with edges, then submit the pipeline to a FastAPI backend which reports `num_nodes`, `num_edges`, and whether the graph is a DAG. An alert shows the result.

### Stack
- **Frontend:** React 18 + Create React App 5, ReactFlow 11 (`reactflow@^11.8.3`), Zustand store. Plain JavaScript — no TypeScript.
- **Backend:** Python + FastAPI, single file `backend/main.py`.

### Run commands
- Frontend: `cd frontend && npm i && npm start` → http://localhost:3000
- Backend: `cd backend && uvicorn main:app --reload` → http://localhost:8000
- No lint/typecheck scripts exist. Verify work by running the app and checking the browser/console, or `npm run build`.

## 2. Graph Engineering Approach

Treat the entire product as a graph: **nodes + edges**, persisted in the Zustand store (`frontend/src/store.js`). Every feature decision maps to a graph concept.

### The 2-touchpoint rule (adding a node type)
A new node type touches exactly two places:
1. **Abstraction registry** — declare the node config (label, color, handles, fields) in `frontend/src/nodes/registry.js` (`nodeConfigs`).
2. **`toolbar.js`** — add a `<DraggableNode type='...' label='...' />` to `TOOLBAR_NODES`.

`ui.js` derives its `nodeTypes` map automatically from `nodeConfigs` via the `createNode(type)` factory — no manual registration needed. Custom bodies/dynamic handles plug in via config `renderBody` / `dynamicHandles` (see the `text` config).

### Hard rules
- **Node ids:** always via `getNodeID(type)` → format `type-N` (e.g. `text-1`). Never hand-roll ids.
- **Handle ids:** `${nodeId}-<name>` (e.g. `${id}-value`). Must be unique per node.
- **State flow:** node data mutations go through `store.js` `updateNodeField(nodeId, field, value)`. Do not scatter ad-hoc state mutation across components.
- **Edges:** created via store `onConnect` (smoothstep, animated, arrow markers). Keep that convention.
- **Drag data:** `application/reactflow` MIME type with JSON `{nodeType}` — unchanged contract between `draggableNode.js` and `ui.js` `onDrop`.
- **Backend contract:** `/pipelines/parse` responds `{num_nodes: int, num_edges: int, is_dag: bool}` plus `topological_order` (array, only when DAG) and `node_type_counts` (map). Malformed payloads → 400 with `detail`.
- **CORS:** frontend (:3000) and backend (:8000) are different origins — the backend must allow CORS for the submit flow to work.
- **Connection guards:** `isValidConnection` in `ui.js` blocks self-loops and duplicate parallel edges, showing a transient `.canvas-notice` toast.
- **Persistence:** store auto-saves `{nodes, edges, nodeIDs}` to localStorage (`vs-pipeline-v1`); restored nodes have `selected` stripped. `resetCanvas()` clears.

## 3. File Map

```
frontend/
  package.json                  deps: react 18, reactflow 11, zustand, react-scripts, tailwindcss 3, radix, lucide-react
  tailwind.config.js            shadcn color tokens (hsl vars) mapped to Tailwind palette
  postcss.config.js             tailwindcss + autoprefixer
  src/
    index.js / index.css        CRA entry; index.css = tailwind directives + shadcn HSL tokens + ReactFlow overrides
    App.js                      renders PipelineToolbar + PipelineUI + SubmitButton + ResultModal (.app flex column layout)
    toolbar.js                  PipelineToolbar — DraggableNodes for each node type (TOOLBAR_NODES list)
    draggableNode.js            DraggableNode — sets 'application/reactflow' drag data, Tailwind chip
    ui.js                       PipelineUI — ReactFlow canvas, onDrop node creation, nodeTypes derived from registry, Background/Controls/MiniMap, SelectionBar overlay
    store.js                    Zustand store — nodes, edges, nodeIDs, getNodeID, addNode, onNodesChange, onEdgesChange, onConnect, updateNodeField, deleteSelected, removeNode
    submit.js                   SubmitButton — POSTs nodes+edges to /pipelines/parse, opens ResultModal (Part 4)
    resultStore.js              Zustand store for modal state (isOpen/result/error/showResult/showError/close)
    ResultModal.jsx             shadcn Dialog showing num_nodes/num_edges/is_dag (or backend error) — replaces alert()
    SelectionBar.jsx            floating over-canvas bar: selection count + Delete button + ⌫ hint
    lib/utils.js                cn() helper (clsx + tailwind-merge)
    components/ui/              shadcn-style primitives: button.jsx, badge.jsx, dialog.jsx
    nodes/                      node abstraction (Part 1 lives here)
      BaseNode.js               shared node shell: header, fields, handles, config-driven; per-node × delete button
      registry.js               nodeConfigs — single source of truth for all node types (9 configs) + createNode(type) factory
      textNode.js               Text node custom body (auto-grow) + parseTextVariables() for {{var}} handles (Part 3)
backend/
  main.py                       FastAPI — GET / ping; POST /pipelines/parse (Form `pipeline` JSON, Kahn's DAG check, CORS)
```

### Delete UX (two paths)
- **Selection bar** (`SelectionBar.jsx`): appears over the canvas when anything is selected — shows `N selected`, red Delete button, ⌫/Del hint. Uses store `deleteSelected()`.
- **Per-node ×** (`BaseNode.js` `.node-delete`): appears on hover/selection of a node; calls store `removeNode(id)` (removes node + all attached edges).
- Keyboard Backspace/Delete still works (`deleteKeyCode={['Backspace', 'Delete']}`).

## 4. Work Rules

1. **Read `CONTEXT.md` first** — it holds decisions, progress, learnings, and in-flight work from all agents.
2. **Never delete or edit past `CONTEXT.md` entries** — append only.
3. When you finish a task (or make a decision/learning), **append to `CONTEXT.md`** before reporting back.
4. Keep the abstraction pattern: new nodes are *declared*, not copy-pasted.
5. If something conflicts with `CONTEXT.md`, stop and surface it to the user instead of silently overriding.

## 5. Assessment Parts (scope of work)

1. **Node abstraction** — dedupe the four node files into a shared abstraction (base node shell + config registry); create 5 new nodes demonstrating it. Flexibility of the abstraction is what's evaluated, not node behavior.
2. **Styling** — unified, appealing design across toolbar, canvas, nodes, button. Any libraries allowed.
3. **Text node logic** — (a) auto-grow width/height with text; (b) parse `{{ validJSIdentifier }}` occurrences and create one left-side Handle per unique variable (add/remove dynamically as text changes).
4. **Backend integration** — `submit.js` sends nodes+edges to `/pipelines/parse` (backend currently uses `Form(...)`; form-encoded `pipeline` JSON is the expected shape); `main.py` computes counts + DAG; frontend alerts the result. Add CORS.

## 6. Definition of Done

- `npm start` runs clean; all 4 parts implemented.
- User can: drag nodes → connect edges → click Submit → see an alert with `num_nodes`, `num_edges`, `is_dag`.
- `CONTEXT.md` updated with what was done and any learnings.
