import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useTranslation } from 'react-i18next';

interface TimerProps {
  onClose: () => void;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const Timer: React.FC<TimerProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [initialTime, setInitialTime] = useState(300); // 5 minutes default
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(formatTime(initialTime));
  const [isFullscreen, setIsFullscreen] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const playSound = (freq: number, duration: number, volume: number) => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
        return;
      }
    }
    const context = audioCtxRef.current;
    if (context.state === 'suspended') {
      context.resume();
    }
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, context.currentTime);
    gainNode.gain.setValueAtTime(volume, context.currentTime);

    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  const playTickSound = () => playSound(880, 0.1, 0.1);
  const playEndSound = () => playSound(523, 0.5, 0.2);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && time > 0) {
      interval = window.setInterval(() => {
        setTime((t) => t - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      setIsActive(false);
      playEndSound();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  useEffect(() => {
    if (isActive && time > 0 && time <= 5) {
      playTickSound();
    }
  }, [time, isActive]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartPause = () => {
    if (time === 0 && !isActive) {
      setTime(initialTime);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(initialTime);
  };

  const handleDisplayClick = () => {
    if (!isActive) {
      setEditText(formatTime(initialTime));
      setIsEditing(true);
    }
  };

  const handleEditBlur = () => {
    const parts = editText.split(':').map(part => parseInt(part, 10));
    const minutes = parts[0] || 0;
    const seconds = parts[1] || 0;
    if (!isNaN(minutes) && !isNaN(seconds)) {
      const newTotalSeconds = minutes * 60 + seconds;
      setInitialTime(newTotalSeconds);
      setTime(newTotalSeconds);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };


  return (
    <div
      ref={timerRef}
      className={
        isFullscreen
          ? "fixed inset-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 select-none"
          : "fixed top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl z-40 border border-gray-300 select-none flex flex-col items-center p-4 w-80 animate-fade-in-down"
      }
    >
      <div className={
        isFullscreen
          ? "absolute top-4 right-4"
          : "w-full flex justify-between items-center mb-4"
      }>
        {!isFullscreen && <span className="font-semibold text-gray-700 text-lg">{t('timer.title')}</span>}
        <button
          onClick={onClose}
          className={`p-1 rounded-full ${isFullscreen ? 'text-gray-300 hover:bg-white/20 hover:text-white' : 'text-gray-500 hover:bg-gray-300 hover:text-gray-800'}`}
          title={t('timer.close')}>
          <Icon name="exit" className={isFullscreen ? "w-8 h-8" : "w-5 h-5"} />
        </button>
      </div>

      <div
        className={
          isFullscreen
            ? "flex-grow flex items-center justify-center w-full"
            : "bg-gray-800 text-white rounded-lg p-4 w-full h-28 flex items-center justify-center cursor-pointer"
        }
        onClick={handleDisplayClick}
        title={t('timer.clickToEdit')}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditBlur}
            onKeyDown={handleEditKeyDown}
            className={`bg-transparent text-center w-full font-mono outline-none border-b-2 border-gray-500 focus:border-blue-400 ${isFullscreen ? 'text-white text-[20vw] lg:text-[25rem] leading-none' : 'text-6xl'
              }`}
          />
        ) : (
          <span className={`font-mono tracking-wider ${isFullscreen
              ? 'text-white text-[20vw] lg:text-[25rem] leading-none'
              : 'text-6xl'
            } ${time === 0 && !isActive ? 'animate-pulse' : ''}`}
          >
            {formatTime(time)}
          </span>
        )}
      </div>

      <div className={`grid grid-cols-3 gap-3 mt-4 w-full ${isFullscreen ? 'max-w-md' : ''}`}>
        <button
          onClick={handleStartPause}
          className={`py-3 rounded-md text-white font-bold text-lg transition-colors ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isActive ? t('timer.pause') : (time === 0 ? t('timer.start') : t('timer.start'))}
        </button>
        <button
          onClick={handleReset}
          className="py-3 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-bold text-lg transition-colors"
        >
          {t('timer.reset')}
        </button>
        <button
          onClick={toggleFullscreen}
          className="py-3 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg transition-colors flex items-center justify-center gap-2"
        >
          <Icon name={isFullscreen ? "exit-fullscreen" : "fullscreen"} className="w-5 h-5" />
          <span>{isFullscreen ? t('timer.exit') : t('timer.full')}</span>
        </button>
      </div>
      <style>{`
          @keyframes fade-in-down {
              from { opacity: 0; transform: translate(-50%, -20px); }
              to { opacity: 1; transform: translate(-50%, 0); }
          }
          .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};
