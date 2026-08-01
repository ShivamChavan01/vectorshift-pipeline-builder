// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeConfigs, createNode } from './nodes/registry';
import { SelectionBar } from './SelectionBar';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = Object.fromEntries(
  Object.keys(nodeConfigs).map((type) => [type, createNode(type)])
);

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const getInitNodeData = (nodeID, type) => {
  const config = nodeConfigs[type];
  const data = { id: nodeID, nodeType: type };

  (config?.fields || []).forEach((field) => {
    const defaultValue =
      typeof field.default === 'function' ? field.default(nodeID) : field.default;
    if (defaultValue !== undefined) {
      data[field.name] = defaultValue;
    }
  });

  return data;
};

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [notice, setNotice] = useState(null);
    const noticeTimer = useRef(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect
    } = useStore(selector, shallow);

    const showNotice = useCallback((message) => {
      setNotice(message);
      clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setNotice(null), 2500);
    }, []);

    const isValidConnection = useCallback(
      (connection) => {
        const isSelfLoop = connection.source === connection.target;
        const isDuplicate = edges.some(
          (edge) =>
            edge.source === connection.source &&
            edge.target === connection.target &&
            edge.sourceHandle === connection.sourceHandle &&
            edge.targetHandle === connection.targetHandle
        );

        if (isSelfLoop) {
          showNotice('Self-loops are not allowed');
          return false;
        }
        if (isDuplicate) {
          showNotice('That connection already exists');
          return false;
        }
        return true;
      },
      [edges, showNotice]
    );

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
    
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type || !nodeConfigs[type]) {
              return;
            }
    
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
    
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <div ref={reactFlowWrapper} className="canvas relative min-h-0 flex-1">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Background color="#232838" gap={gridSize} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => nodeConfigs[node.type]?.color || '#7c5cff'}
                    nodeStrokeColor="#191c28"
                    maskColor="rgba(11, 13, 19, 0.75)"
                />
            </ReactFlow>
            <SelectionBar />
            {notice && (
                <div className="canvas-notice absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-md border border-destructive/40 bg-popover px-4 py-2 text-xs font-medium text-destructive shadow-lg">
                    {notice}
                </div>
            )}
        </div>
    )
}
