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

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ position, selectedTool, setSelectedTool }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Determine the alignment classes based on the requested position
    const positionClasses = position === 'left' ? 'left-6' : 'right-6';
    const menuOriginClass = position === 'left' ? 'origin-bottom-left' : 'origin-bottom-right';

    const handleToolSelect = (tool: Tool) => {
        setSelectedTool(tool);
        setIsOpen(false); // Optionally close the menu after selecting, or leave it open
    };

    return (
        <div className={`absolute bottom-6 ${positionClasses} z-50 flex flex-col items-center select-none`}>
            
            {/* Expanded Tool Menu */}
            <div 
                className={`mb-3 flex flex-col gap-2 bg-white/95 backdrop-blur shadow-xl border border-gray-200 rounded-full p-2 transition-all duration-300 ${menuOriginClass}
                ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-50 translate-y-10 invisible'}`}
            >
                {quickTools.slice().reverse().map(tool => (
                    <button
                        key={tool.name}
                        onClick={() => handleToolSelect(tool.name)}
                        title={tool.label}
                        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all 
                        ${selectedTool === tool.name ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Icon name={tool.icon} className="w-6 h-6" />
                    </button>
                ))}
            </div>

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 border-4 border-white
                ${isOpen ? 'bg-gray-800 text-white rotate-45' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'}
                `}
                title={isOpen ? "Close Quick Tools" : "Open Quick Tools"}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                ) : (
                    <Icon name={selectedTool === 'select' || selectedTool === 'hand' || selectedTool === 'pen' || selectedTool === 'highlighter' || selectedTool === 'eraser' ? quickTools.find(t => t.name === selectedTool)?.icon || 'pen' : 'pen'} className="w-6 h-6" />
                )}
            </button>
        </div>
    );
};
