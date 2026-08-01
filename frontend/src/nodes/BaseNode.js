// BaseNode.js
// Shared node shell. Every node type is *declared* via a config (see registry.js):
// label, accent color, fields, handles. Custom behavior (e.g. the Text node) plugs
// in via renderBody + dynamicHandles.

import { useState, Fragment } from 'react';
import { Handle, Position } from 'reactflow';
import { X } from 'lucide-react';
import { useStore } from '../store';

const resolveDefault = (field, id) =>
  typeof field.default === 'function' ? field.default(id) : field.default;

export const BaseNode = ({ id, data, config }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const removeNode = useStore((state) => state.removeNode);

  const [values, setValues] = useState(() => {
    const initial = {};
    (config.fields || []).forEach((field) => {
      initial[field.name] = data?.[field.name] ?? resolveDefault(field, id) ?? '';
    });
    return initial;
  });

  const handleFieldChange = (fieldName, fieldValue) => {
    setValues((prev) => ({ ...prev, [fieldName]: fieldValue }));
    updateNodeField(id, fieldName, fieldValue);
  };

  const renderField = (field) => {
    const value = values[field.name] ?? '';
    const common = {
      value,
      onChange: (e) => handleFieldChange(field.name, e.target.value),
      className: 'node-field-input nodrag',
    };

    if (field.type === 'select') {
      return (
        <select {...common}>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return <textarea {...common} rows={field.rows || 2} />;
    }

    return <input type={field.type === 'number' ? 'number' : 'text'} {...common} />;
  };

  const buildHandles = (side) => {
    const staticHandles = (config.handles?.[side] || []).map((h) => ({
      name: h.id,
      top: h.top || null,
    }));

    let dynamic = [];
    if (side === 'target' && config.dynamicHandles) {
      dynamic = (config.dynamicHandles(id, values) || []).map((name) => ({
        name,
        top: null,
      }));
    }

    const all = [...staticHandles, ...dynamic];
    return all.map((h, index) => ({
      ...h,
      top: h.top || `${((index + 1) / (all.length + 1)) * 100}%`,
    }));
  };

  const targetHandles = buildHandles('target');
  const sourceHandles = buildHandles('source');

  return (
    <div
      className={`base-node group relative rounded-lg border border-border bg-card px-3.5 py-3 text-xs text-card-foreground shadow-node transition-shadow${
        config.fluid ? ' w-max min-w-[220px]' : ' w-60'
      }`}
      style={{ '--node-accent': config.color || '#7c5cff' }}
    >
      {targetHandles.map((h) => (
        <Fragment key={`target-${h.name}`}>
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-${h.name}`}
            style={{ top: h.top }}
          />
          <span className="handle-label handle-label--left" style={{ top: h.top }}>
            {h.name}
          </span>
        </Fragment>
      ))}

      <div className="mb-2 flex items-center gap-2">
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{
            background: 'var(--node-accent)',
            boxShadow: '0 0 8px var(--node-accent)',
          }}
        />
        <span className="text-[13px] font-semibold tracking-wide">{config.label}</span>
        <button
          type="button"
          onClick={() => removeNode(id)}
          title="Delete node"
          className="node-delete nodrag ml-auto flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {config.description && (
        <div className="mb-2 -mt-0.5 text-muted-foreground">{config.description}</div>
      )}

      <div className="flex flex-col gap-2">
        {config.renderBody
          ? config.renderBody({ id, values, handleFieldChange })
          : (config.fields || []).map((field) => (
              <label key={field.name} className="flex flex-col gap-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {field.label}
                </span>
                {renderField(field)}
              </label>
            ))}
      </div>

      {sourceHandles.map((h) => (
        <Fragment key={`source-${h.name}`}>
          <Handle
            type="source"
            position={Position.Right}
            id={`${id}-${h.name}`}
            style={{ top: h.top }}
          />
          <span className="handle-label handle-label--right" style={{ top: h.top }}>
            {h.name}
          </span>
        </Fragment>
      ))}
    </div>
  );
};
