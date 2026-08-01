// registry.js
// Single source of truth for node types. A new node = one config entry here
// (+ one <DraggableNode /> in toolbar.js — ui.js derives its nodeTypes map from this).
// Config schema:
//   label            display name in the node header
//   color            accent color (CSS var --node-accent)
//   description      optional dimmed line under the header
//   fluid            optional; node width grows with content (used by Text node)
//   fields           form fields: { name, label, type: text|select|textarea|number, options?, default? }
//   handles          static handles: { target: [{id, top?}], source: [{id, top?}] }
//   renderBody       optional custom body renderer ({ id, values, handleFieldChange }) => JSX
//   dynamicHandles   optional (id, values) => [handleName, ...] rendered as left-side targets

import { BaseNode } from './BaseNode';
import { TextNodeBody, parseTextVariables } from './textNode';

export const nodeConfigs = {
  customInput: {
    label: 'Input',
    color: '#7c5cff',
    fields: [
      {
        name: 'inputName',
        label: 'Name',
        type: 'text',
        default: (id) => id.replace('customInput-', 'input_'),
      },
      { name: 'inputType', label: 'Type', type: 'select', options: ['Text', 'File'], default: 'Text' },
    ],
    handles: { source: [{ id: 'value' }] },
  },

  llm: {
    label: 'LLM',
    color: '#ff9f43',
    description: 'Large language model',
    handles: {
      target: [{ id: 'system' }, { id: 'prompt' }],
      source: [{ id: 'response' }],
    },
  },

  customOutput: {
    label: 'Output',
    color: '#2ecc71',
    fields: [
      {
        name: 'outputName',
        label: 'Name',
        type: 'text',
        default: (id) => id.replace('customOutput-', 'output_'),
      },
      { name: 'outputType', label: 'Type', type: 'select', options: ['Text', 'Image'], default: 'Text' },
    ],
    handles: { target: [{ id: 'value' }] },
  },

  text: {
    label: 'Text',
    color: '#00d4ff',
    fluid: true,
    fields: [{ name: 'text', label: 'Text', type: 'textarea', default: '{{input}}' }],
    renderBody: TextNodeBody,
    dynamicHandles: (id, values) => parseTextVariables(values.text || ''),
    handles: { source: [{ id: 'output' }] },
  },

  api: {
    label: 'API Call',
    color: '#a55eea',
    fields: [
      { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
      { name: 'url', label: 'URL', type: 'text', default: 'https://api.example.com' },
    ],
    handles: {
      target: [{ id: 'input' }],
      source: [{ id: 'response' }],
    },
  },

  condition: {
    label: 'Condition',
    color: '#ff6b6b',
    fields: [
      { name: 'operator', label: 'Operator', type: 'select', options: ['==', '!=', '>', '<', '>=', '<='], default: '==' },
      { name: 'threshold', label: 'Threshold', type: 'number', default: 0 },
    ],
    handles: {
      target: [{ id: 'input' }],
      source: [{ id: 'true' }, { id: 'false' }],
    },
  },

  transform: {
    label: 'Transform',
    color: '#fd79a8',
    fields: [{ name: 'script', label: 'Script', type: 'textarea', default: '// transform code' }],
    handles: {
      target: [{ id: 'input' }],
      source: [{ id: 'output' }],
    },
  },

  note: {
    label: 'Note',
    color: '#fdcb6e',
    fields: [{ name: 'content', label: 'Content', type: 'textarea', default: 'Write a note…' }],
    handles: {},
  },

  timer: {
    label: 'Timer',
    color: '#55efc4',
    fields: [{ name: 'interval', label: 'Interval (ms)', type: 'number', default: 1000 }],
    handles: { source: [{ id: 'tick' }] },
  },
};

export const createNode = (type) => {
  const config = nodeConfigs[type];
  return (props) => <BaseNode {...props} config={config} />;
};
