// lib/exportImport.js
// Client-side pipeline export/import helpers (no backend, no extra deps).
// Build + validate come first so the store only ever receives a clean, valid graph.

/**
 * Validate a parsed import payload before anything touches the canvas.
 * Returns { ok: true, nodes, edges, nodeIDs } or { ok: false, error }.
 * Strips transient `selected` flags (same convention as store loadPersisted).
 */
export const validatePipeline = (parsed) => {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Invalid file: expected a JSON object.' };
  }

  // "nodes" and "edges" keys are required; "nodeIDs" is optional
  if (!('nodes' in parsed)) {
    return { ok: false, error: 'Invalid file: missing "nodes".' };
  }
  if (!('edges' in parsed)) {
    return { ok: false, error: 'Invalid file: missing "edges".' };
  }

  const nodes = parsed.nodes;
  const edges = parsed.edges;
  const nodeIDs = parsed.nodeIDs !== undefined ? parsed.nodeIDs : {};

  if (!Array.isArray(nodes)) {
    return { ok: false, error: 'Invalid file: "nodes" must be an array.' };
  }
  if (!Array.isArray(edges)) {
    return { ok: false, error: 'Invalid file: "edges" must be an array.' };
  }
  if (!nodeIDs || typeof nodeIDs !== 'object' || Array.isArray(nodeIDs)) {
    return { ok: false, error: 'Invalid file: "nodeIDs" must be an object.' };
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node || typeof node !== 'object') {
      return { ok: false, error: `Invalid node at index ${i}: expected an object.` };
    }
    if (typeof node.id !== 'string' || node.id === '') {
      return { ok: false, error: `Invalid node at index ${i}: missing a non-empty "id".` };
    }
    if (typeof node.type !== 'string' || node.type === '') {
      return { ok: false, error: `Invalid node at index ${i}: missing a non-empty "type".` };
    }
    if (
      !node.position ||
      typeof node.position !== 'object' ||
      typeof node.position.x !== 'number' ||
      typeof node.position.y !== 'number'
    ) {
      return {
        ok: false,
        error: `Invalid node at index ${i}: "position" must be { x, y }.`,
      };
    }
    if (node.data === undefined || node.data === null || typeof node.data !== 'object') {
      return { ok: false, error: `Invalid node at index ${i}: missing an object "data".` };
    }
  }

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (!edge || typeof edge !== 'object') {
      return { ok: false, error: `Invalid edge at index ${i}: expected an object.` };
    }
    if (typeof edge.id !== 'string' || edge.id === '') {
      return { ok: false, error: `Invalid edge at index ${i}: missing a non-empty "id".` };
    }
    if (typeof edge.source !== 'string' || typeof edge.target !== 'string') {
      return {
        ok: false,
        error: `Invalid edge at index ${i}: "source" and "target" must be strings.`,
      };
    }
  }

  // strip transient selection flags so nothing is selected after import
  const strip = (items) => items.map(({ selected, ...rest }) => rest);

  return { ok: true, nodes: strip(nodes), edges: strip(edges), nodeIDs: { ...nodeIDs } };
};

/**
 * Build a pretty-printed JSON string for download.
 */
export const serializePipeline = ({ nodes, edges, nodeIDs }) =>
  JSON.stringify({ nodes, edges, nodeIDs }, null, 2);

/**
 * Trigger a client-side download via a Blob + temporary <a> element.
 */
export const downloadPipeline = (json, filename) => {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};