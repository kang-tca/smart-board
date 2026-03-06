
import React, { useState } from 'react';
import { Tool, ToolOptions, ShapeType, StickerType } from '../types';
import { Icon } from './Icon';

interface PresentationToolbarProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  toolOptions: ToolOptions;
  setToolOptions: React.Dispatch<React.SetStateAction<ToolOptions>>;
  onExit: () => void;
  onToggleZoom: () => void;
  zoomMode: 'fitHeight' | 'fitWidth' | null;
}

const colors = ['#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#22C55E', '#FBBF24', '#A855F7'];
const fontSizes = [16, 24, 36, 48];

type SubToolbarType = 'pen' | 'highlighter' | 'shape' | 'text' | 'sticker' | null;

const ToolButton: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-3 rounded-md transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
  >
    <Icon name={icon} />
  </button>
);

const DrawingOptions: React.FC<{ 
    toolOptions: ToolOptions;
    setToolOptions: React.Dispatch<React.SetStateAction<ToolOptions>>; 
}> = ({ toolOptions, setToolOptions }) => (
    <>
      <div className="flex items-center space-x-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setToolOptions(prev => ({ ...prev, strokeColor: color, fillColor: color + '33' }))}
            className={`w-6 h-6 rounded-full border border-gray-200 transition-transform transform hover:scale-110 ${toolOptions.strokeColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            style={{ backgroundColor: color }}
            title={`Color: ${color}`}
          />
        ))}
      </div>
      <div className="w-px h-8 bg-gray-200 mx-2"></div>
      <div className="flex items-center space-x-2">
        <label htmlFor="stroke-width-present" className="text-sm font-medium text-gray-600">Size:</label>
        <input
          id="stroke-width-present"
          type="range"
          min="2"
          max={toolOptions.strokeColor === '#FBBF24' ? '40' : '20'}
          value={toolOptions.strokeWidth}
          onChange={(e) => setToolOptions(prev => ({ ...prev, strokeWidth: parseInt(e.target.value, 10) }))}
          className="w-24 cursor-pointer"
        />
      </div>
    </>
);

const TextOptions: React.FC<{
    toolOptions: ToolOptions;
    setToolOptions: React.Dispatch<React.SetStateAction<ToolOptions>>;
}> = ({ toolOptions, setToolOptions }) => (
    <>
       <div className="flex items-center space-x-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setToolOptions(prev => ({ ...prev, strokeColor: color }))}
            className={`w-6 h-6 rounded-full border border-gray-200 transition-transform transform hover:scale-110 ${toolOptions.strokeColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            style={{ backgroundColor: color }}
            title={`Color: ${color}`}
          />
        ))}
      </div>
      <div className="w-px h-8 bg-gray-200 mx-2"></div>
       <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
         {fontSizes.map(size => (
            <button key={size} onClick={() => setToolOptions(prev => ({ ...prev, fontSize: size }))} className={`px-2 py-1 text-sm rounded ${toolOptions.fontSize === size ? 'bg-white text-blue-600 shadow-sm' : 'hover:bg-gray-200'}`}>
                {size}
            </button>
         ))}
       </div>
       <div className="w-px h-8 bg-gray-200 mx-2"></div>
       <div className="flex items-center space-x-1">
          <button onClick={() => setToolOptions(prev => ({ ...prev, isBold: !prev.isBold }))} className={`p-2 rounded-md ${toolOptions.isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`} title="Bold">
            <Icon name="bold" className="w-5 h-5"/>
          </button>
          <button onClick={() => setToolOptions(prev => ({ ...prev, isItalic: !prev.isItalic }))} className={`p-2 rounded-md ${toolOptions.isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`} title="Italic">
            <Icon name="italic" className="w-5 h-5"/>
          </button>
       </div>
    </>
);

const stickers: { name: StickerType; icon: string; label: string }[] = [
    { name: 'like', icon: 'sticker-like', label: 'Like' },
    { name: 'star', icon: 'sticker-star', label: 'Star' },
    { name: 'smile', icon: 'sticker-smile', label: 'Smile' },
    { name: 'question', icon: 'sticker-question', label: 'Question' },
    { name: 'homework', icon: 'sticker-homework', label: 'Homework' },
    { name: 'love', icon: 'sticker-love', label: 'Love' },
];

const StickerOptions: React.FC<{
  toolOptions: ToolOptions;
  setToolOptions: React.Dispatch<React.SetStateAction<ToolOptions>>;
}> = ({ toolOptions, setToolOptions }) => (
  <>
    <div className="flex items-center space-x-1">
      {stickers.map(sticker => (
        <button
          key={sticker.name}
          onClick={() => setToolOptions(prev => ({ ...prev, stickerType: sticker.name }))}
          className={`p-1 rounded-md transition-colors ${toolOptions.stickerType === sticker.name ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          title={sticker.label}
        >
          <Icon name={sticker.icon} className="w-8 h-8"/>
        </button>
      ))}
    </div>
    <div className="w-px h-8 bg-gray-200 mx-2"></div>
    <div className="flex items-center space-x-2">
      <label htmlFor="sticker-size" className="text-sm font-medium text-gray-600">Size:</label>
      <input
        id="sticker-size"
        type="range"
        min="32"
        max="256"
        value={toolOptions.stickerSize}
        onChange={(e) => setToolOptions(prev => ({ ...prev, stickerSize: parseInt(e.target.value, 10) }))}
        className="w-24 cursor-pointer"
      />
    </div>
  </>
);


export const PresentationToolbar: React.FC<PresentationToolbarProps> = ({
  selectedTool,
  setSelectedTool,
  toolOptions,
  setToolOptions,
  onExit,
  onToggleZoom,
  zoomMode,
}) => {
  const [activeSubToolbar, setActiveSubToolbar] = useState<SubToolbarType>(null);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rectangle');

  const handleMainToolClick = (tool: Tool, type: 'simple' | 'drawing' | 'shape' | 'text' | 'sticker') => {
    if (type === 'simple') {
      setSelectedTool(tool);
      setActiveSubToolbar(null);
      return;
    }
    
    const subToolbarKey: SubToolbarType = type === 'shape' ? 'shape' : (type === 'sticker' ? 'sticker' : tool as SubToolbarType);

    if (activeSubToolbar === subToolbarKey) {
      setActiveSubToolbar(null);
    } else {
      setActiveSubToolbar(subToolbarKey);
      if (type === 'shape') {
        setSelectedTool(selectedShape);
      } else {
        setSelectedTool(tool);
      }
    }
  };

  const handleShapeSelect = (shape: ShapeType) => {
    setSelectedShape(shape);
    setSelectedTool(shape);
  };
  
  const shapeTools: {name: ShapeType, icon: string, label: string}[] = [
    { name: 'rectangle', icon: 'rectangle', label: 'Rectangle (R)' },
    { name: 'circle', icon: 'circle', label: 'Circle (C)' },
    { name: 'triangle', icon: 'triangle', label: 'Triangle' },
    { name: 'pentagon', icon: 'pentagon', label: 'Pentagon' },
  ];
  
  const ExitButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        title="Exit Presentation (Esc)"
        className="p-3 rounded-md transition-colors hover:bg-red-100 text-red-600 flex items-center space-x-2"
    >
        <Icon name="exit" />
        <span className="text-sm font-medium">Exit</span>
    </button>
  );

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center w-full max-w-[95vw] md:max-w-none px-2 md:px-0">
      {/* Sub-Toolbar Area */}
      {activeSubToolbar && (
        <div className="mb-2 bg-white rounded-lg shadow-xl p-2 flex items-center space-x-2 border border-gray-200 animate-fade-in-up">
            {activeSubToolbar === 'shape' && (
                <>
                    {shapeTools.map(shape => (
                        <ToolButton
                            key={shape.name}
                            icon={shape.icon}
                            label={shape.label}
                            isActive={selectedTool === shape.name}
                            onClick={() => handleShapeSelect(shape.name)}
                        />
                    ))}
                    <div className="w-px h-8 bg-gray-200 mx-2"></div>
                    <DrawingOptions toolOptions={toolOptions} setToolOptions={setToolOptions} />
                </>
            )}
            {(activeSubToolbar === 'pen' || activeSubToolbar === 'highlighter') && (
                <DrawingOptions toolOptions={toolOptions} setToolOptions={setToolOptions} />
            )}
            {activeSubToolbar === 'text' && (
                <TextOptions toolOptions={toolOptions} setToolOptions={setToolOptions} />
            )}
             {activeSubToolbar === 'sticker' && (
                <StickerOptions toolOptions={toolOptions} setToolOptions={setToolOptions} />
            )}
        </div>
      )}

      {/* Main Toolbar */}
      <div className="bg-white rounded-lg shadow-xl p-2 flex justify-center items-center space-x-2 border border-gray-200 w-full md:w-auto">
        <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap pb-1 -mb-1">
            <ToolButton
                icon="select"
                label="Select & Move (S)"
                isActive={selectedTool === 'select'}
                onClick={() => handleMainToolClick('select', 'simple')}
            />
            <ToolButton
                icon="hand"
                label="Pan (H / Space)"
                isActive={selectedTool === 'hand'}
                onClick={() => handleMainToolClick('hand', 'simple')}
            />
            <div className="w-px h-8 bg-gray-200"></div>
            <ToolButton
                icon="pen"
                label="Pen (P)"
                isActive={selectedTool === 'pen'}
                onClick={() => handleMainToolClick('pen', 'drawing')}
            />
            <ToolButton
                icon="highlighter"
                label="Highlighter (L)"
                isActive={selectedTool === 'highlighter'}
                onClick={() => handleMainToolClick('highlighter', 'drawing')}
            />
            <ToolButton
              icon="text"
              label="Text"
              isActive={selectedTool === 'text'}
              onClick={() => handleMainToolClick('text', 'text')}
            />
            <ToolButton
                icon="circle"
                label="Shapes"
                isActive={['rectangle', 'circle', 'triangle', 'pentagon'].includes(selectedTool)}
                onClick={() => handleMainToolClick(selectedShape, 'shape')}
            />
            <ToolButton
              icon="sticker"
              label="Sticker (Q)"
              isActive={selectedTool === 'sticker'}
              onClick={() => handleMainToolClick('sticker', 'sticker')}
            />
            <ToolButton
              icon="tag"
              label="Tag (T)"
              isActive={selectedTool === 'tag'}
              onClick={() => handleMainToolClick('tag', 'simple')}
            />
            <ToolButton
                icon="eraser"
                label="Eraser (E)"
                isActive={selectedTool === 'eraser'}
                onClick={() => handleMainToolClick('eraser', 'simple')}
            />

            <div className="w-px h-8 bg-gray-200"></div>

            {zoomMode && (
                <>
                    {zoomMode === 'fitHeight' ? (
                        <ToolButton
                            icon="arrows-right-left"
                            label="Fit to Width"
                            isActive={false}
                            onClick={onToggleZoom}
                        />
                    ) : (
                        <ToolButton
                            icon="arrows-up-down"
                            label="Fit to Height"
                            isActive={false}
                            onClick={onToggleZoom}
                        />
                    )}
                    <div className="w-px h-8 bg-gray-200"></div>
                </>
            )}
            <ExitButton onClick={onExit} />
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.2s ease-out;
        }
        .overflow-x-auto::-webkit-scrollbar { height: 4px; }
        .overflow-x-auto::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .overflow-x-auto::-webkit-scrollbar-track { background-color: transparent; }
       `}</style>
    </div>
  );
};
