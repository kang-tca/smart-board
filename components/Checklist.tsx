import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { saveData, loadData, deleteData } from '../lib/db';

const CHECKLIST_ITEMS_KEY = 'pdf-canvas-checklist-items';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistProps {
  onClose: () => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const Checklist: React.FC<ChecklistProps> = ({ onClose }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Load items from IndexedDB on initial render
    loadData<ChecklistItem[]>(CHECKLIST_ITEMS_KEY).then(savedItems => {
      if (savedItems && Array.isArray(savedItems)) {
        setItems(savedItems);
      }
      // Use a timeout to ensure this runs after the first render cycle is complete
      setTimeout(() => {
        isInitialMount.current = false;
      }, 0);
    });
  }, []); // Empty dependency array means this runs only once on mount

  useEffect(() => {
    // Do not save on the initial render when data is being loaded
    if (isInitialMount.current) {
      return;
    }
    
    // Save items to IndexedDB whenever they change
    if (items.length > 0) {
      saveData(CHECKLIST_ITEMS_KEY, items);
    } else {
      // If all items are deleted, remove the key from the DB to prevent stale data
      deleteData(CHECKLIST_ITEMS_KEY);
    }
  }, [items]);

  const handleAddItem = () => {
    if (newItemText.trim() === '') return;
    const newItem: ChecklistItem = {
      id: generateId(),
      text: newItemText.trim(),
      completed: false,
    };
    setItems(prevItems => [...prevItems, newItem]);
    setNewItemText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const toggleComplete = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 z-30 w-72 max-h-[80vh] flex flex-col animate-fade-in-left">
      <div className="flex justify-between items-center p-2 border-b">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Icon name="checklist" className="w-5 h-5" />
          Checklist
        </h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
          <Icon name="exit" className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="overflow-y-auto flex-grow p-2">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center group bg-gray-50/50 p-2 rounded-md">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleComplete(item.id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`mx-3 flex-grow text-gray-800 ${item.completed ? 'line-through text-gray-400' : ''}`}>
                  {item.text}
                </span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete item"
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">No tasks yet. Add one below.</p>
        )}
      </div>
      <div className="p-2 border-t flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
          className="flex-grow bg-transparent border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <button onClick={handleAddItem} className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold">
          Add
        </button>
      </div>
       <style>{`
        @keyframes fade-in-left {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-left { animation: fade-in-left 0.2s ease-out; }
       `}</style>
    </div>
  );
};