// toolbar.js

import { useRef, useState } from 'react';
import { DraggableNode } from './draggableNode';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { RotateCcw, Download, Upload } from 'lucide-react';
import {
  serializePipeline,
  validatePipeline,
  downloadPipeline,
} from './lib/exportImport';

const TOOLBAR_NODES = [
  { type: 'customInput', label: 'Input' },
  { type: 'llm', label: 'LLM' },
  { type: 'customOutput', label: 'Output' },
  { type: 'text', label: 'Text' },
  { type: 'api', label: 'API' },
  { type: 'condition', label: 'Condition' },
  { type: 'transform', label: 'Transform' },
  { type: 'note', label: 'Note' },
  { type: 'timer', label: 'Timer' },
];

export const PipelineToolbar = () => {
    const { nodes, edges, nodeIDs, resetCanvas, importPipeline } = useStore(
        (state) => ({
            nodes: state.nodes,
            edges: state.edges,
            nodeIDs: state.nodeIDs,
            resetCanvas: state.resetCanvas,
            importPipeline: state.importPipeline,
        }),
        shallow
    );

    const nodeCount = nodes.length;
    const edgeCount = edges.length;

    const fileInputRef = useRef(null);
    const [notice, setNotice] = useState(null);
    const noticeTimer = useRef(null);

    const isEmpty = nodes.length === 0 && edges.length === 0;

    const showNotice = (message) => {
        clearTimeout(noticeTimer.current);
        setNotice(message);
        noticeTimer.current = setTimeout(() => setNotice(null), 2500);
    };

    const handleExport = () => {
        const json = serializePipeline({ nodes, edges, nodeIDs });
        const filename = `vectorshift-pipeline-${Date.now()}.json`;
        downloadPipeline(json, filename);
    };

    const handleImportFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            let parsed;
            try {
                parsed = JSON.parse(reader.result);
            } catch (error) {
                showNotice(`Import failed: not valid JSON (${error.message})`);
                fileInputRef.current.value = '';
                return;
            }

            const result = validatePipeline(parsed);
            if (!result.ok) {
                showNotice(`Import failed: ${result.error}`);
                fileInputRef.current.value = '';
                return;
            }

            importPipeline(result);
            showNotice(`Imported ${result.nodes.length} node${result.nodes.length === 1 ? '' : 's'}, ${result.edges.length} edge${result.edges.length === 1 ? '' : 's'}`);
            fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="toolbar flex flex-shrink-0 items-center gap-6 border-b border-border bg-secondary px-5 py-3">
            <div className="toolbar-brand flex items-center gap-2.5 border-r border-border pr-6">
                <span className="toolbar-logo" />
                <span className="toolbar-title">Pipeline Studio</span>
            </div>
            <div className="toolbar-nodes flex flex-wrap gap-2.5">
                {TOOLBAR_NODES.map((node) => (
                    <DraggableNode key={node.type} type={node.type} label={node.label} />
                ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                    {nodeCount} node{nodeCount === 1 ? '' : 's'} · {edgeCount} edge{edgeCount === 1 ? '' : 's'}
                </Badge>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExport}
                    disabled={isEmpty}
                    title="Download the pipeline as JSON"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    title="Load a pipeline from a JSON file"
                >
                    <Upload className="h-3.5 w-3.5" />
                    Import
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetCanvas}
                    disabled={isEmpty}
                    title="Clear the canvas"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleImportFile}
                />
            </div>
            {notice && (
                <div className="canvas-notice fixed left-1/2 top-14 z-20 -translate-x-1/2 rounded-md border border-destructive/40 bg-popover px-4 py-2 text-xs font-medium text-destructive shadow-lg">
                    {notice}
                </div>
            )}
        </div>
    );
};
