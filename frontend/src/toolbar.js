// toolbar.js

import { DraggableNode } from './draggableNode';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { RotateCcw } from 'lucide-react';

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
    const { nodeCount, edgeCount, resetCanvas } = useStore(
        (state) => ({
            nodeCount: state.nodes.length,
            edgeCount: state.edges.length,
            resetCanvas: state.resetCanvas,
        }),
        shallow
    );

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
                    onClick={resetCanvas}
                    disabled={nodeCount === 0 && edgeCount === 0}
                    title="Clear the canvas"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                </Button>
            </div>
        </div>
    );
};
