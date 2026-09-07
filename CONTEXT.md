# CONTEXT.md — Shared Project Context (Append-Only)

> **Purpose:** The living memory of this project, shared across all agents.
> **Rules:**
> 1. **Read this file fully** before starting any task.
> 2. **Append only. NEVER delete or edit past entries.** Existing content is immutable.
> 3. When you finish a task, make a decision, or learn something, **append here before reporting back**.

---

## Decisions

- `2026-08-01 | Docs | Created AGENTS.md, CONTEXT.md, PROJECT_CONTEXT.md at project root | Full briefing + agent contract + append-only journal for multi-agent work`
- `2026-08-01 | Abstraction | BaseNode.js config-driven shell + registry.js as single source of truth; ui.js derives nodeTypes from registry via createNode factory | New node = 2 touchpoints (registry + toolbar); flexibility is what Part 1 grades`
- `2026-08-01 | Styling | Plain CSS + variables in index.css (no new deps), dark VectorShift-inspired theme, per-node accent via config color -> --node-accent CSS var | Zero install risk; abstraction makes restyling single-point`
- `2026-08-01 | Text node | Auto-grow via wrap=off textarea + scrollWidth/scrollHeight; dynamic handles via config dynamicHandles(id, values) -> unique vars; regex /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g | Handles computed per render so add/dedupe/remove are automatic`
- `2026-08-01 | Backend | Kahn's algorithm for DAG check, parallel edges deduped via seen_pairs set; endpoint changed GET -> POST /pipelines/parse; CORS for localhost:3000 | Duplicate edges must not break acyclicity (found via curl test #5)`

## Progress Log

- `2026-08-01 | Baseline | Complete | Starter code reviewed. All 4 parts unimplemented: no node abstraction, no styling, text node has no auto-grow/variables, submit.js is a stub, backend parse is a stub, no CORS. See PROJECT_CONTEXT.md section 4 for full current-state inventory.`
- `2026-08-01 | Part 1 | Complete | BaseNode.js + registry.js (9 configs: customInput, llm, customOutput, text, api, condition, transform, note, timer). 4 old node files deleted. store.js nodeIDs:{} initialized. ui.js derives nodeTypes; getInitNodeData seeds config defaults. 5 new nodes: api/condition/transform/note/timer.`
- `2026-08-01 | Part 2 | Complete | index.css full dark theme: toolbar + brand, 9 per-type accent chips, base-node cards, handles, controls/minimap/edge overrides (all ReactFlow selectors prefixed .react-flow to beat reactflow/dist/style.css load order), gradient submit button.`
- `2026-08-01 | Part 3 | Complete | textNode.js: TextNodeBody auto-grows (scrollWidth/scrollHeight, wrap=off, nodrag class) + parseTextVariables() dedupes and returns first-appearance order; registry text config wires renderBody + dynamicHandles; default {{input}} shows 1 handle immediately.`
- `2026-08-01 | Part 4 | Complete | submit.js POSTs form-encoded pipeline JSON, alert() with num_nodes/num_edges/is_dag + error message if backend down. main.py: POST /pipelines/parse, Kahn's algorithm, parallel-edge dedupe, CORS middleware.`
- `2026-08-01 | Verification | Complete | CI=true npm run build passes clean (fixed pre-existing exhaustive-deps warning in ui.js onDrop). Backend curl suite all pass (chain/cycle/self-loop/empty/duplicate-edges/CORS). Variable parser unit-tested via node.`
- `2026-08-01 | Delete feature | Complete | User reported connected nodes couldn't be deleted. Root cause: ReactFlow v11 default deleteKeyCode is Backspace only, and there was no visible delete affordance. Added: deleteKeyCode={['Backspace','Delete']} on ReactFlow, store action deleteSelected() (removes selected nodes + their attached edges + selected edges), and a 'Delete selected' button in the toolbar (disabled when nothing selected).`
- `2026-08-01 | Browser QA | Complete | Full Playwright suite 10/10 passing: drops create nodes, auto-grow (198->509px), dynamic handle dedupe/add/remove, mouse-drag edge creation, submit alert (DAG yes + cycle no), keyboard Delete removes connected node AND its edges, Delete-selected button works, zero console errors. Computed-style spot check confirms theme applied (dark bg, 10px card radius, per-node accents, circular handles).`

## Learnings / Gotchas

- `2026-08-01 | store.js | getNodeID reads/writes get().nodeIDs which is never initialized in the store state — works lazily but fragile; FIXED by adding nodeIDs: {} to initial state.`
- `2026-08-01 | reactflow CSS | reactflow/dist/style.css is imported inside ui.js AFTER index.css in bundle order, so same-specificity overrides in index.css LOSE. Fix: prefix every override selector with .react-flow (0,2,0 specificity).`
- `2026-08-01 | reactflow v11 | Handles render in-place inside .base-node div so --node-accent CSS var set there inherits down to .react-flow__handle. nodrag class on inputs/textarea/select prevents node-drag when interacting.`
- `2026-08-01 | backend | Self-loop (source==target) makes Kahn's visited < total -> correctly not a DAG. ReactFlow v11 has no isValidConnection guard so self-connections ARE possible in UI -> branch is live, not dead code.`
- `2026-08-01 | backend | Duplicate parallel edges (a->b twice) inflated in-degree and falsely reported non-DAG in initial implementation; fixed by deduping (source,target) pairs for cycle detection while num_edges still counts raw edge list.`
- `2026-08-01 | form encoding | URLSearchParams body works for FastAPI Form(...) at assessment scale; very large pipeline payloads could hit body size limits — swap to JSON body (with matching backend change) if it ever silently fails.`
- `2026-08-01 | CI build | CI=true makes warnings fatal; run plain npm run build for dev check. The pre-existing exhaustive-deps warning in ui.js useCallback was fixed by adding stable store fns (getNodeID, addNode) to deps.`
- `2026-08-01 | reactflow v11 | Node selection is skipped when the click lands on an input/textarea (isInputDOMNode check) — clicking a node's fields won't select it; click the header/card instead. This is stock ReactFlow UX, not a bug.`
- `2026-08-01 | reactflow v11 | deleteKeyCode default is 'Backspace' only (not Delete). Handle ids are NOT rendered as DOM id attributes in v11 — they live on data-handleid (and data-id). Synthetic PointerEvent dispatches do NOT trigger ReactFlow connections (needs trusted input / setPointerCapture); use Playwright mouse events for QA.`
- `2026-08-01 | testing | Playwright available via local node_modules/playwright (chromium headless shell installed in ~/.cache/ms-playwright). QA scripts: /tmp/qa.cjs (10-case suite), /tmp/qa-debug.cjs (selection debug). Screenshots: /tmp/qa-dag.png, /tmp/qa-final.png.`

## TODO / In Flight

- ~~`2026-08-01 | Baseline | Read starter code; write AGENTS.md / CONTEXT.md / PROJECT_CONTEXT.md`~~
- ~~`2026-08-01 | Part 1 | Node abstraction + 5 new nodes`~~
- ~~`2026-08-01 | Part 2 | Styling`~~
- ~~`2026-08-01 | Part 3 | Text node auto-grow + dynamic variable handles`~~
- ~~`2026-08-01 | Part 4 | Backend DAG compute + submit.js + alert + CORS`~~
- ~~`2026-08-01 | Final | Optional: browser QA of end-to-end flow (drag -> connect -> submit -> alert) if a browser is available; backend currently left running on :8000`~~
- ~~`2026-08-01 | Delete feature | Add keyboard delete + Delete-selected button (user-reported: connected nodes couldn't be deleted)`~~

---

## Session 2026-08-02 — shadcn/ui upgrade + modal + selection-bar delete UX

## Decisions

- `2026-08-02 | Styling | User asked for shadcn/ui: "the ui not up to the mark man can you use schadcn". Migrated to Tailwind CSS 3.4 + shadcn-style components (button/badge/dialog from Radix primitives) with shadcn HSL color tokens mapped in tailwind.config.js | Full Tailwind rewrite of toolbar/draggableNode/BaseNode/submit; kept ReactFlow overrides as plain CSS (still prefixed .react-flow)`
- `2026-08-02 | Result UX | User chose modal over toast/alert: ResultModal.jsx (shadcn Dialog) shows num_nodes/num_edges/DAG badge after Submit; red error variant when backend is unreachable | Replaces native alert(); state lives in resultStore.js (zustand: isOpen/result/error/showResult/showError/close)`
- `2026-08-02 | Delete UX | User chose selection bar + per-node x over the toolbar button: SelectionBar.jsx floats over the canvas bottom-center (N selected + red Delete + ⌫/Del hint) when anything is selected; per-node x button (.node-delete, visible on hover/selected) calls new store action removeNode(id) | Toolbar delete button removed; keyboard Backspace/Delete kept; x button hides until hover so it doesn't clutter cards`

## Progress Log

- `2026-08-02 | shadcn setup | Complete | Deps already present in package.json (tailwindcss 3.4, @radix-ui/react-dialog, @radix-ui/react-slot, cva, clsx, tailwind-merge, lucide-react). Added tailwindcss-animate plugin for dialog animations. Wrote tailwind.config.js (shadcn HSL token map), postcss.config.js, src/lib/utils.js cn(), src/components/ui/{button,badge,dialog}.jsx.`
- `2026-08-02 | index.css | Complete | Rewritten: @tailwind directives + shadcn HSL tokens (:root) + ReactFlow overrides kept as plain CSS. Legacy hex vars (--bg/--panel/--card/--text) replaced by tokens; kept --accent-2 (#00d4ff) and --shadow as non-Tailwind extras. .selection-bar class added for translucent popover bg (hsl(var(--popover)/0.95)) because Tailwind can't apply /95 opacity modifier to hsl-var colors.`
- `2026-08-02 | Components | Complete | App.js renders ResultModal; ui.js renders SelectionBar inside .canvas (now relative + min-h-0 flex-1); toolbar.js delete button removed, Tailwind classes; draggableNode.js Tailwind chip with --chip-accent inline style; BaseNode.js Tailwind card + x delete button (stopPropagation-free: it deletes on click); submit.js shadcn Button + resultStore wiring; store.js added removeNode(nodeId) (filters node + edges touching it).`
- `2026-08-02 | QA | Complete | Playwright suite 16/16 passing (QA script /tmp/qa2.cjs): 9 toolbar types, no toolbar-delete, 3 nodes dropped, 2 edges mouse-drawn, result modal opens with correct 3/2 counts + "Is a DAG" badge, modal closes, selection bar appears on select, x button visible on hover (opacity 1), x removes node + both attached edges, selection-bar Delete removes selected node, error modal on backend-down shows "Could not reach the backend", zero console errors (excluding the intentional ERR_CONNECTION_REFUSED from the backend-down test). Build clean: CI=true npm run build. Screenshots: /tmp/shot-selected.png, /tmp/shot-modal.png.`

## Learnings / Gotchas

- `2026-08-02 | tailwind v3 | Opacity modifiers (e.g. bg-popover/95) do NOT generate for colors defined as hsl(var(--x)) — Tailwind can't add /alpha to a var() color; use an arbitrary-value class or plain CSS (used .selection-bar in index.css).`
- `2026-08-02 | tailwind v3 | Arbitrary values containing / are parsed as an opacity modifier (bg-[hsl(var(--popover)/0.95)] silently dropped from output) — use plain CSS class instead. Arbitrary values with var() work fine otherwise (hover:border-[var(--chip-accent)]).`
- `2026-08-02 | CRA dev server | CI=true makes react-scripts exit immediately when backgrounded/nohup'd (watcher/stdin behavior). Start dev servers WITHOUT CI=true for background QA runs; use CI=true only for one-shot builds.`
- `2026-08-02 | tailwind | Tailwind generates class names with escaping — grep for exact-class checks in built CSS must match the escaped form (e.g. .hover\:border-\[var--chip-accent\]); verify with the source-scan instead.`

## TODO / In Flight

- ~~`2026-08-02 | shadcn/ui migration + result modal + selection-bar delete UX`~~

---

## Session 2026-08-02 (part 2) — "Is that all?" feature round: guards, labels, stats, persistence, backend depth

## Decisions

- `2026-08-02 | Scope | User pushed for more ("this is it?? only this much???"). Added a second feature round: connection guards, handle labels, live stats + reset, localStorage auto-save, richer backend response | Nothing replaces the required Part 1-4 work; these stack on top`
- `2026-08-02 | Connection guards | ui.js adds isValidConnection: blocks self-loops (source===target) and duplicate parallel edges (same 4-tuple source/target/sourceHandle/targetHandle), shows a transient canvas-notice toast (2.5s) | Guards run client-side; ReactFlow only calls onConnect for valid drops, so the toast lives in isValidConnection (note: source->source / target->target drops never fire it)`
- `2026-08-02 | Handle labels | BaseNode renders a .handle-label span beside every handle (left labels for targets, right for sources) using the same computed top as the handle | Labels are position:absolute inside .base-node (which is position:relative), pointer-events:none, so they never interfere with dragging/connecting`
- `2026-08-02 | Persistence | store.js auto-saves {nodes, edges, nodeIDs} to localStorage (key vs-pipeline-v1) on every change via useStore.subscribe; loadPersisted() restores on init, stripping transient `selected` flags; resetCanvas() action clears canvas | nodeIDs are persisted so restored ids never collide with new getNodeID calls`
- `2026-08-02 | Backend | /pipelines/parse now returns topological_order (only when is_dag) + node_type_counts (from data.nodeType, falls back to id prefix); bad JSON / missing keys / non-array nodes|edges now return 400 with detail instead of 500 | Additive — num_nodes/num_edges/is_dag contract unchanged`

## Progress Log

- `2026-08-02 | Round 2 | Complete | ui.js: isValidConnection + canvas-notice toast + per-type MiniMap nodeColor(node -> nodeConfigs[type].color). toolbar.js: live node/edge count badge + Reset button (ghost, disabled when empty). store.js: loadPersisted + subscribe auto-save + resetCanvas. BaseNode.js: handle labels via Fragment-wrapped Handle + span. ResultModal.jsx: "Node types" breakdown (type x count badges). backend/main.py: 400s + topological_order + node_type_counts.`
- `2026-08-02 | QA round 2 | Complete | New suite /tmp/qa3.cjs 17/17 passing: stats badge 0/0 -> 3/2 live updates, reset disabled when empty + clears canvas, llm handle labels (system,prompt,response), duplicate edge blocked with notice text, self-loop blocked with notice text, modal node-type breakdown (customInput x 1, llm x 1, customOutput x 1), auto-save survives reload (3 nodes + 2 edges + stats badge), zero console errors. Regression: /tmp/qa2.cjs 16/16 still green (modal, selection bar, x delete, error modal). Build: CI=true npm run build clean. Backend curl tests: topological_order ["a","b","c"], node_type_counts, 400 on bad json + missing keys.`

## Learnings / Gotchas

- `2026-08-02 | reactflow v11 | isValidConnection only fires for valid handle-type pairs (target<-source). A source->source or target->target drop never invokes it — QA self-loop test had to drag llm source (idx 2) back to llm target (idx 0) on the SAME node to trigger it. Nodes without target handles (customInput) can't self-loop in UI.`
- `2026-08-02 | reactflow v11 | Handle DOM order in .react-flow__node: targets first (in config order), then sources. customInput: [value(source)]; llm: [system(target), prompt(target), response(source)]. Used for QA handle-index lookups.`
- `2026-08-02 | localStorage | Persisting node objects includes .selected — strip it on restore or nodes come back pre-selected. Persisting nodeIDs (per-type counters) is required to avoid id collisions after reload.`
- `2026-08-02 | tailwind | shadcn Dialog animation classes (animate-in/zoom-in-95) require the tailwindcss-animate plugin — installed it. Without it the classes are silently absent.`
- `2026-08-02 | tests | QA scripts must use handle indexes not guesses: /tmp/qa3.cjs failed twice on wrong handle index (llm source is index 2; duplicate test must re-drag input->llm-system not input->llm-response).`

## TODO / In Flight

- ~~`2026-08-02 | Round-2 feature batch: guards, handle labels, stats/reset, auto-save, backend depth`~~

---

## Session 2026-08-02 (part 3) — Export / Import JSON (scoped, low-risk)

## Decisions

- `2026-08-02 | Scope | User scoped this session to ONLY client-side Export/Import JSON + backend pytest suite: "do not scope-creep... if at any point this risks breaking existing functionality, STOP and report." No undo/redo, no auto-layout, no execution engine. Only touched store.js, toolbar.js, new src/lib/exportImport.js; left ui.js/BaseNode.js/registry.js/submit.js/ResultModal.jsx/SelectionBar.jsx/backend/main.py untouched. | Execution engine (real LLM/API) explicitly deferred — assessment rubric doesn't require it`
- `2026-08-02 | Export | serializes {nodes, edges, nodeIDs} pretty (2-space) and downloads via Blob + temp <a>; filename vectorshift-pipeline-<timestamp>.json; purely client-side, no backend` | Reuses existing store state read-only via selector
- `2026-08-02 | Import | hidden <input type="file" accept=".json,application/json"> triggered by Import button; FileReader -> JSON.parse -> validatePipeline (new) -> store.importPipeline(data). Validation runs fully BEFORE touching canvas; any failure shows .canvas-notice toast and leaves canvas unchanged. nodes/edges keys REQUIRED; nodeIDs optional (default {}).` | Validated every node (id/type/position.x/.y/data) and every edge (id/source/target) before applying. Selection flags stripped using the SAME helper loadPersisted uses (no duplication)
- `2026-08-02 | Validation gotcha | validatePipeline initially destructured nodes = parsed.nodes ?? [] so a file with missing nodes/edges silently defaulted to [] and CLEARED the canvas. Fixed: check 'nodes' in parsed and 'edges' in parsed, reject otherwise. | Production rule: never default-arr black-hole a required key to []`
- `2026-08-02 | Persistence | Import relies on existing useStore.subscribe auto-save (vs-pipeline-v1) — NO second persistence path was added. resetCanvas + import share the store's wholesale set({nodes, edges, nodeIDs}).`

## Progress Log

- `2026-08-02 | src/lib/exportImport.js | New | serializePipeline({nodes,edges,nodeIDs}) -> pretty JSON string; validatePipeline(parsed) -> {ok:true,nodes,edges,nodeIDs} (strips selected) or {ok:false,error} (rejects missing nodes/edges keys, non-arrays, bad node fields incl. missing position, bad edge fields); downloadPipeline(json, filename) -> Blob + temp <a> + revokeObjectURL.`
- `2026-08-02 | store.js | Modified | Added exported stripSelection(items) helper (refactored out of loadPersisted so import reuses the exact same stripping); added importPipeline({nodes,edges,nodeIDs}) action that wholesale-replaces state. No other store actions changed.`
- `2026-08-02 | toolbar.js | Modified | Two ghost buttons in the right cluster (Export disabled when empty / Import always enabled) + hidden file input + transient .canvas-notice toast (local useState/useRef, same pattern as ui.js isValidConnection, position:fixed top-14 so it overlays the canvas without touching ui.js). nodeCount/edgeCount now derived from the store nodes/edges selectors instead of bespoke state fields. lucide-react Download/Upload icons added.`
- `2026-08-02 | QA | New suites: /tmp/qa4-exportimport.cjs 23/23 passing (toolbar buttons, export disabled when empty, drop 3 nodes, mouse-connect 1 edge, export download + filename pattern, export JSON shape, reset, import restores 3 nodes/1 edge with NO selected flags, malformed {"foo":"bar"} rejected with canvas unchanged, array payload [1,2,3] rejected, node-missing-position rejected, persistence survives reload, zero console errors). | Found & fixed the missing-keys clears-canvas bug via this suite. Regression rebuilt (old /tmp/qa2.cjs + /tmp/qa3.cjs were wiped by tmp cleanup) -> recreated /tmp/qa-regression.cjs 11/11 covering llm handle labels, minimap per-type color, duplicate-edge notice, stats badge, submit-DAG modal open+close, selection bar, per-node x delete (node + edges), zero console errors. Build: npm run build (plain, not CI) compiles clean (only the pre-existing CRA babel-optional-deps warning).`

## Learnings / Gotchas

- `2026-08-02 | playwright | Download.path() returns a Promise in recent Playwright — must await it before fs.readFileSync. First QA attempt read the promise -> "Received an instance of Promise" and silently fell back to the inline fixture, which caused a false "import restores edges" failure.`
- `2026-08-02 | playwright | Reusing the app's HTML5 drag-and-drop in QA needs dispatchEvent(new DragEvent('dragover'/'drop', {dataTransfer, clientX, clientY})) on .react-flow; mouse-only drag from the toolbar chip doesn't move dataTransfer, so nodes weren't dropped by plain page.mouse drag.`
- `2026-08-02 | modal | shadcn Dialog does NOT close on Escape in this Radix setup (no onKeyDown). Playwright must click the explicit "Done"/"Close" button; an Escape-key loop left the dialog open and the next canvas click landed on the overlay (broke selection-bar checks).`
- `2026-08-02 | scope | Keep this session's footprint tiny: only 3 files (store.js open action, toolbar.js 2 buttons, lib/exportImport.js). This is the pattern for "don't regress, don't expand."`

## TODO / In Flight

- ~~`2026-08-02 | Export / Import JSON (store action + 2 toolbar buttons + lib helper)`, meanwhile: manually verified export->reset->import restores nodes/edges/positions without selection; malformed files rejected with toast, canvas untouched.~~

---

## Session 2026-09-07 — Public-repo sanitization (user-requested append-only override)

## Decisions

- `2026-09-07 | Public prep | User asked to make repo public but keep call-recording/personal files local-only. Kept Shivam_Chavan_screenrecording.mp4 + Shivam_Chavan_technical_assessment.zip on disk, added *.mp4/*.zip/DS_Store to .gitignore so they never push. Removed tracked DS_Store via git rm --cached (local copy kept, now ignored). | Untracked personal files never push once ignored`
- `2026-09-07 | Sensitive paths | Sanitized one ~ local path in 2026-08-01 testing entry to generic form (user explicitly requested sensitive-info removal; this intentionally overrides the append-only rule for that line) | No API keys/secrets found in tracked code; only local-path leak`
- `2026-09-07 | History note | Git history (3 commits) still contains author shivam <[redacted-email]> + old versions of DS_Store/CONTEXT.md. Simple delete does NOT rewrite history. User chose to keep history; email will be visible on public GitHub. Full rewrite (filter-repo + force-push) deferred unless user asks.`

## Progress Log

- `2026-09-07 | Sanitize | Complete | .gitignore += *.mp4/*.zip/DS_Store; git rm --cached DS_Store; CONTEXT.md local-path sanitized; verified git check-ignore for mp4/zip/DS_Store; verified no ~ or email in tracked working tree (history still has them by design).``
