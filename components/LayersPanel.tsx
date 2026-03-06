import React, { useState } from 'react';
import { CanvasItem } from '../types';
import { Icon } from './Icon';

interface LayersPanelProps {
  items: CanvasItem[];
  selectedItemIds: string[];
  onClose: () => void;
  onVisibilityToggle: (id: string) => void;
  onReorder: (draggedId: string, dropTargetId: string) => void;
  onSelectItem: (id: string, isShiftKey: boolean) => void;
}

const getItemDescription = (item: CanvasItem): string => {
  switch (item.type) {
    case 'image':
      return item.isPdfPage ? 'PDF Page' : 'Image';
    case 'text':
      const truncated = item.text.substring(0, 15);
      return `Text: "${truncated}${item.text.length > 15 ? '...' : ''}"`;
    case 'shape':
      return item.shape.charAt(0).toUpperCase() + item.shape.slice(1);
    case 'path':
      return item.isHighlighter ? 'Highlight' : 'Pen Stroke';
    case 'sticker':
        return `Sticker: ${item.stickerType.charAt(0).toUpperCase() + item.stickerType.slice(1)}`;
    case 'tag':
        return `Tag: '${item.title}'`;
    default:
      return 'Canvas Item';
  }
};

const getItemIcon = (item: CanvasItem): string => {
    switch (item.type) {
        case 'image': return 'photo';
        case 'text': return 'text';
        case 'shape': return 'shapes';
        case 'path': return 'pen';
        case 'sticker': return 'sticker';
        case 'tag': return 'tag';
        default: return 'select';
    }
}


export const LayersPanel: React.FC<LayersPanelProps> = ({
  items,
  selectedItemIds,
  onClose,
  onVisibilityToggle,
  onReorder,
  onSelectItem,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sortedItems = [...items].sort((a, b) => b.zIndex - a.zIndex);
  
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault();
    if (id !== draggedId && id !== dragOverId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropTargetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== dropTargetId) {
      onReorder(draggedId, dropTargetId);
    }
    setDraggedId(null);
    setDragOverId(null);
  };
  
  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 z-30 w-64 max-h-[80vh] flex flex-col animate-fade-in-right">
      <div className="flex justify-between items-center p-2 border-b">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Icon name="layers" className="w-5 h-5" />
            Layers
        </h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
          <Icon name="exit" className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="overflow-y-auto">
        {sortedItems.length > 0 ? (
          <ul onMouseLeave={() => setDragOverId(null)}>
            {sortedItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              const isDragged = draggedId === item.id;
              const isDragOver = dragOverId === item.id;
              
              return (
                <li
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onDragLeave={() => setDragOverId(null)}
                  className={`
                    flex items-center justify-between group cursor-grab transition-all duration-150
                    ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}
                    ${isDragged ? 'opacity-40' : ''}
                    ${isDragOver ? 'border-t-2 border-blue-500' : 'border-t border-transparent'}
                  `}
                >
                  <div
                    onClick={(e) => onSelectItem(item.id, e.shiftKey)}
                    className="flex-grow text-left px-3 py-2 flex items-center space-x-3 cursor-pointer"
                  >
                    <Icon name={getItemIcon(item)} className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-sm text-gray-800 truncate" title={getItemDescription(item)}>
                      {getItemDescription(item)}
                    </span>
                  </div>
                  <button
                    onClick={() => onVisibilityToggle(item.id)}
                    className="p-2 mr-1 rounded-full hover:bg-gray-200"
                    title={item.visible ? 'Hide' : 'Show'}
                  >
                    <Icon 
                      name={item.visible ? 'eye' : 'eye-slash'} 
                      className={`w-4 h-4 transition-colors ${item.visible ? 'text-gray-600' : 'text-gray-400'}`} 
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 p-4 text-center">Canvas is empty.</p>
        )}
      </div>
       <style>{`
        @keyframes fade-in-right {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right { animation: fade-in-right 0.2s ease-out; }
       `}</style>
    </div>
  );
};