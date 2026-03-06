import React, { useState, useRef, useEffect } from 'react';
import { TagItem } from '../types';
import { Icon } from './Icon';

interface TagPanelProps {
  tags: TagItem[];
  onNavigate: (tag: TagItem) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onClose: () => void;
}

export const TagPanel: React.FC<TagPanelProps> = ({ tags, onNavigate, onUpdateTitle, onClose }) => {
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTagId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTagId]);

  const handleStartEdit = (tag: TagItem) => {
    setEditingTagId(tag.id);
    setEditText(tag.title);
  };

  const handleCommitEdit = () => {
    if (editingTagId && editText.trim()) {
      onUpdateTitle(editingTagId, editText.trim());
    }
    setEditingTagId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommitEdit();
    } else if (e.key === 'Escape') {
      setEditingTagId(null);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 bg-white/60 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 z-30 w-40 max-h-[70vh] flex flex-col animate-fade-in-left">
      <div className="flex justify-between items-center p-2 border-b">
        <h3 className="font-semibold text-gray-800">Tags</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
          <Icon name="exit" className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="overflow-y-auto">
        {tags.length > 0 ? (
          <ul>
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between group hover:bg-blue-50">
                <button
                  onClick={() => onNavigate(tag)}
                  className="flex-grow text-left px-4 py-2 flex items-center space-x-3"
                >
                  <Icon name="tag" className="w-4 h-4 text-gray-500" />
                  {editingTagId === tag.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={handleCommitEdit}
                      onKeyDown={handleKeyDown}
                      maxLength={5}
                      className="bg-white border border-blue-400 rounded px-1 py-0.5 w-full text-sm"
                    />
                  ) : (
                    <span 
                      onDoubleClick={() => handleStartEdit(tag)}
                      className="text-sm text-gray-800 truncate"
                      title="Double-click to rename"
                    >
                      {tag.title}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 p-4 text-center">No tags placed yet.</p>
        )}
      </div>
       <style>{`
        @keyframes fade-in-left {
            from {
                opacity: 0;
                transform: translateX(-10px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .animate-fade-in-left {
            animation: fade-in-left 0.2s ease-out;
        }
       `}</style>
    </div>
  );
};
