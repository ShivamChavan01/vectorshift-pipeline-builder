// textNode.js
// Custom body + dynamic-handle logic for the Text node (Part 3).
// - Auto-grows width/height with the text content
// - Parses {{ validJSIdentifier }} occurrences -> one left-side Handle per unique variable

import { useRef, useEffect } from 'react';

const VARIABLE_REGEX = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

export const parseTextVariables = (text) => {
  const variables = [];
  const seen = new Set();
  const source = text || '';

  let match;
  VARIABLE_REGEX.lastIndex = 0;
  while ((match = VARIABLE_REGEX.exec(source)) !== null) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      variables.push(match[1]);
    }
  }
  return variables;
};

const MIN_WIDTH = 200;

export const TextNodeBody = ({ values, handleFieldChange }) => {
  const textareaRef = useRef(null);
  const value = values.text ?? '';

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;

    el.style.width = 'auto';
    el.style.width = `${Math.max(el.scrollWidth, MIN_WIDTH)}px`;
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Text</span>
        <textarea
          ref={textareaRef}
          wrap="off"
          rows={1}
          value={value}
          onChange={(e) => handleFieldChange('text', e.target.value)}
          className="node-field-input nodrag text-node-input"
          placeholder="Type here… use {{variable}} to add handles"
        />
      </label>
      {parseTextVariables(value).length > 0 && (
        <div className="text-node-hint">
          {parseTextVariables(value).join(' · ')}
        </div>
      )}
    </div>
  );
};
