// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

const STORAGE_KEY = 'vs-pipeline-v1';

// strip transient selection flags so nothing is selected after reload/import
export const stripSelection = (items) => items.map(({ selected, ...rest }) => rest);

// restore a previous persisted pipeline (localStorage/nodes/edges/nodeIDs)
const loadPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null;
    return {
      nodes: stripSelection(parsed.nodes),
      edges: stripSelection(parsed.edges),
      nodeIDs: parsed.nodeIDs && typeof parsed.nodeIDs === 'object' ? parsed.nodeIDs : {},
    };
  } catch {
    return null;
  }
};

const persisted = loadPersisted();

export const useStore = create((set, get) => ({
    nodes: persisted?.nodes ?? [],
    edges: persisted?.edges ?? [],
    nodeIDs: persisted?.nodeIDs ?? {},
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }

          return node;
        }),
      });
    },
    deleteSelected: () => {
      const { nodes, edges } = get();
      const selectedNodeIds = new Set(
        nodes.filter((node) => node.selected).map((node) => node.id)
      );

      set({
        nodes: nodes.filter((node) => !node.selected),
        edges: edges.filter(
          (edge) =>
            !edge.selected &&
            !selectedNodeIds.has(edge.source) &&
            !selectedNodeIds.has(edge.target)
        ),
      });
    },
    removeNode: (nodeId) => {
      const { nodes, edges } = get();
      set({
        nodes: nodes.filter((node) => node.id !== nodeId),
        edges: edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      });
    },
    resetCanvas: () => {
      set({ nodes: [], edges: [] });
    },
    // wholesale replace (not a merge) — validation happens before this is called
    importPipeline: ({ nodes, edges, nodeIDs }) => {
      set({ nodes, edges, nodeIDs });
    },
  }));

// persist on every change (nodes, edges, id counters)
useStore.subscribe((state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs,
      })
    );
  } catch {
    // storage unavailable (private mode etc.) — auto-save just won't happen
  }
});
