import React, { useState } from 'react';
import { Tool } from '../types';
import { Icon } from './Icon';

interface FloatingToolbarProps {
    position: 'left' | 'right';
    selectedTool: Tool;
    setSelectedTool: (tool: Tool) => void;
}

const quickTools: { name: Tool, icon: string, label: string }[] = [
    { name: 'select', icon: 'cursor', label: 'Select (V)' },
    { name: 'hand', icon: 'hand', label: 'Hand (H)' },
    { name: 'pen', icon: 'pen', label: 'Pen (P)' },
    { name: 'highlighter', icon: 'highlighter', label: 'Highlighter (H)' },
    { name: 'eraser', icon: 'eraser', label: 'Eraser (E)' }
];

const getCurrentToolIcon = (tool: Tool): string => {
    const found = quickTools.find(t => t.name === tool);
    return found ? found.icon : 'pen';
};

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ position, selectedTool, setSelectedTool }) => {
    const [isOpen, setIsOpen] = useState(false);

    const positionClasses = position === 'left' ? 'left-4' : 'right-4';

    const handleToolSelect = (tool: Tool) => {
        setSelectedTool(tool);
        setIsOpen(false);
    };

    return (
        <div className={`absolute bottom-4 ${positionClasses} z-20 flex flex-col items-center select-none`}>
            
            {/* Expanded Tool Menu */}
            {isOpen && (
                <div className="mb-2 flex flex-col gap-1.5 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/80 rounded-2xl p-1.5 animate-fade-in-up">
                    {quickTools.slice().reverse().map(tool => (
                        <button
                            key={tool.name}
                            onClick={() => handleToolSelect(tool.name)}
                            title={tool.label}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all 
                            ${selectedTool === tool.name 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                        >
                            <Icon name={tool.icon} className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Toggle Button - white/transparent with current tool icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200
                    bg-white/80 backdrop-blur-sm border border-gray-200/80 shadow-md
                    ${isOpen ? 'text-blue-600 bg-blue-50/80' : 'text-gray-600 hover:bg-white hover:shadow-lg'}
                `}
                title={isOpen ? "Close Quick Tools" : "Open Quick Tools"}
            >
                {isOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <Icon name={getCurrentToolIcon(selectedTool)} className="w-5 h-5" />
                )}
            </button>
        </div>
    );
};
