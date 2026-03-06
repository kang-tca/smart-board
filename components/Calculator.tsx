import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface CalculatorProps {
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onClose }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (calculatorRef.current) {
      setIsDragging(true);
      const rect = calculatorRef.current.getBoundingClientRect();
      dragStartPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      e.preventDefault(); // Prevent text selection while dragging
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
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

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const clearAll = () => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return first / second;
      default: return second;
    }
  };
  
  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (operator && !waitingForSecondOperand) {
        if (firstOperand === null) {
            setFirstOperand(inputValue);
        } else {
            const result = calculate(firstOperand, inputValue, operator);
            setDisplayValue(String(Number(result.toPrecision(15))));
            setFirstOperand(result);
        }
    } else {
        setFirstOperand(inputValue);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
     if (operator && firstOperand !== null) {
        const inputValue = parseFloat(displayValue);
        const result = calculate(firstOperand, inputValue, operator);
        setDisplayValue(String(Number(result.toPrecision(15))));
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(true);
     }
  };

  return (
    <div
      ref={calculatorRef}
      className="fixed bg-white/80 backdrop-blur-sm rounded-lg shadow-2xl w-64 z-40 border border-gray-300 select-none"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
        <div 
          className="bg-gray-200/70 px-3 py-1 flex justify-between items-center rounded-t-lg cursor-move"
          onMouseDown={handleMouseDown}
        >
            <h4 className="font-semibold text-gray-700 text-sm">Calculator</h4>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-300 hover:text-gray-800">
                <Icon name="exit" className="w-4 h-4" />
            </button>
        </div>
        <div className="p-2">
            <div className="bg-gray-800 text-white text-4xl text-right rounded p-3 mb-2 font-mono break-all flex items-center justify-end h-16">
                <span className="truncate">{displayValue}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
                <button onClick={clearAll} className="bg-gray-300 hover:bg-gray-400 p-3 rounded-md text-lg">AC</button>
                <button onClick={() => setDisplayValue(String(parseFloat(displayValue) * -1))} className="bg-gray-300 hover:bg-gray-400 p-3 rounded-md text-lg">+/-</button>
                <button onClick={() => setDisplayValue(String(parseFloat(displayValue) / 100))} className="bg-gray-300 hover:bg-gray-400 p-3 rounded-md text-lg">%</button>
                <button onClick={() => performOperation('/')} className={`p-3 rounded-md text-xl text-white ${operator === '/' && waitingForSecondOperand ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'}`}>÷</button>

                <button onClick={() => inputDigit('7')} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">7</button>
                <button onClick={() => inputDigit('8')} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">8</button>
                <button onClick={() => inputDigit('9')} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">9</button>
                <button onClick={() => performOperation('*')} className={`p-3 rounded-md text-xl text-white ${operator === '*' && waitingForSecondOperand ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'}`}>×</button>

                <button onClick={() => inputDigit('4')} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">4</button>
                <button onClick={() => inputDigit('5')} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">5</button>
                <button onClick={() => inputDigit('6')} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">6</button>
                <button onClick={() => performOperation('-')} className={`p-3 rounded-md text-xl text-white ${operator === '-' && waitingForSecondOperand ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'}`}>-</button>
                
                <button onClick={() => inputDigit('1')} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">1</button>
                <button onClick={() => inputDigit('2')} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">2</button>
                <button onClick={() => inputDigit('3')} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">3</button>
                <button onClick={() => performOperation('+')} className={`p-3 rounded-md text-xl text-white ${operator === '+' && waitingForSecondOperand ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'}`}>+</button>

                <button onClick={() => inputDigit('0')} className="col-span-2 bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">0</button>
                <button onClick={inputDecimal} className="bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-xl">.</button>
                <button onClick={handleEquals} className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-md text-xl">=</button>
            </div>
        </div>
    </div>
  );
};
