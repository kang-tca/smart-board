import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { saveData, loadData } from '../lib/db';

const RAFFLE_SETTINGS_KEY = 'presenter-raffle-settings';

interface RaffleSettings {
  min: number;
  max: number;
}

interface PresenterRaffleProps {
  onClose: () => void;
}

export const PresenterRaffle: React.FC<PresenterRaffleProps> = ({ onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedNumber, setDisplayedNumber] = useState<number | string>('...');
  const spinIntervalRef = useRef<number | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(20);
  const [tempMin, setTempMin] = useState('1');
  const [tempMax, setTempMax] = useState('20');

  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const raffleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData<RaffleSettings>(RAFFLE_SETTINGS_KEY).then(settings => {
      if (settings && typeof settings.min === 'number' && typeof settings.max === 'number') {
        setMinRange(settings.min);
        setMaxRange(settings.max);
        setTempMin(String(settings.min));
        setTempMax(String(settings.max));
      }
    });
  }, []);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (raffleRef.current) {
      setIsDragging(true);
      const rect = raffleRef.current.getBoundingClientRect();
      dragStartPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const startRaffle = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const min = Math.ceil(minRange);
    const max = Math.floor(maxRange);
    if (min > max) {
        setDisplayedNumber('Error');
        setIsSpinning(false);
        return;
    }

    spinIntervalRef.current = window.setInterval(() => {
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      setDisplayedNumber(randomNumber);
    }, 50);

    setTimeout(() => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
      const finalNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      setDisplayedNumber(finalNumber);
      setIsSpinning(false);
    }, 3000);
  };

  const handleSaveSettings = () => {
    const newMin = parseInt(tempMin, 10);
    const newMax = parseInt(tempMax, 10);

    if (!isNaN(newMin) && !isNaN(newMax) && newMin <= newMax) {
      setMinRange(newMin);
      setMaxRange(newMax);
      saveData(RAFFLE_SETTINGS_KEY, { min: newMin, max: newMax });
      setIsSettingsOpen(false);
    } else {
      alert('Please enter a valid number range.');
    }
  };

  return (
    <div
      ref={raffleRef}
      className="fixed bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl w-72 z-40 border border-gray-300 select-none"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
        <div 
          className="bg-gray-200/70 px-3 py-1 flex justify-between items-center rounded-t-lg cursor-move"
          onMouseDown={handleMouseDown}
        >
            <h4 className="font-semibold text-gray-700 text-sm">Presenter Raffle</h4>
            <div className="flex items-center space-x-1">
                <button 
                    onClick={() => setIsSettingsOpen(prev => !prev)} 
                    className={`p-1 rounded-full text-gray-500 hover:bg-gray-300 hover:text-gray-800 ${isSettingsOpen ? 'bg-gray-300' : ''}`}
                    title="Settings"
                >
                    <Icon name="settings" className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-300 hover:text-gray-800" title="Close">
                    <Icon name="exit" className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="p-4">
            {isSettingsOpen ? (
                <div className="flex flex-col space-y-3">
                    <p className="text-sm font-medium text-center text-gray-700">Set Number Range</p>
                    <div className="flex items-center justify-center space-x-2">
                        <input
                            type="number"
                            value={tempMin}
                            onChange={(e) => setTempMin(e.target.value)}
                            className="w-20 p-2 text-center border border-gray-300 rounded-md"
                        />
                        <span className="text-gray-600">-</span>
                        <input
                            type="number"
                            value={tempMax}
                            onChange={(e) => setTempMax(e.target.value)}
                            className="w-20 p-2 text-center border border-gray-300 rounded-md"
                        />
                    </div>
                    <button 
                        onClick={handleSaveSettings}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-gray-800 text-white rounded-lg p-4 w-full h-28 flex items-center justify-center">
                        <span 
                            className={`font-mono text-6xl transition-transform duration-100 ${isSpinning ? 'animate-number-spin' : ''}`}
                            style={{ animationIterationCount: isSpinning ? 'infinite' : 1 }}
                        >
                            {displayedNumber}
                        </span>
                    </div>
                    <button 
                        onClick={startRaffle}
                        disabled={isSpinning}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                        {isSpinning ? '추첨 중...' : '추첨 시작'}
                    </button>
                </div>
            )}
        </div>
        <style>{`
          @keyframes number-spin {
              0% { transform: translateY(-10px); opacity: 0; }
              25% { transform: translateY(0); opacity: 1; }
              75% { transform: translateY(0); opacity: 1; }
              100% { transform: translateY(10px); opacity: 0; }
          }
          .animate-number-spin {
              animation: number-spin 0.1s linear;
          }
        `}</style>
    </div>
  );
};
