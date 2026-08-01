// draggableNode.js

export const DraggableNode = ({ type, label }) => {
    const onDragStart = (event, nodeType) => {
      const appData = { nodeType }
      event.target.style.cursor = 'grabbing';
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };

    return (
      <div
        className="draggable-node flex cursor-grab select-none items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-[var(--chip-accent)] hover:shadow-node active:cursor-grabbing"
        data-type={type}
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => (event.target.style.cursor = 'grab')}
        draggable
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: 'var(--chip-accent)',
            boxShadow: '0 0 8px var(--chip-accent)',
          }}
        />
        <span className="whitespace-nowrap text-[13px] font-medium text-foreground">{label}</span>
      </div>
    );
  };
