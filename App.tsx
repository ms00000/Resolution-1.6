import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import NumberInput from './components/NumberInput';
import HistoryList from './components/HistoryList';
import { HistoryRecord } from './types';

const RATIO = 1.6;
const HISTORY_LIMIT = 10;

export default function App() {
  const [leftValue, setLeftValue] = useState<string>('');
  const [rightValue, setRightValue] = useState<string>('');
  const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('reso-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history
  const saveHistory = (newHistory: HistoryRecord[]) => {
    setHistory(newHistory);
    localStorage.setItem('reso-history', JSON.stringify(newHistory));
  };

  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  // Logic to process input and add to history (debounced wrapper)
  // We use a timeout ref to handle the debounce logic manually for granular control
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const processCalculation = useCallback((side: 'left' | 'right', valStr: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const val = parseFloat(valStr);
    if (isNaN(val) || val === 0) return;

    // Determine result value for clipboard and history
    let result = 0;
    let resultStr = '';

    if (side === 'left') {
      result = Math.round(val / RATIO);
      resultStr = result.toString();
    } else {
      result = Math.round(val * RATIO);
      resultStr = result.toString();
    }

    debounceRef.current = setTimeout(async () => {
      // 1. Copy to clipboard
      try {
        await navigator.clipboard.writeText(resultStr);
        showToast(`Copied ${resultStr} to clipboard`);
      } catch (err) {
        console.error("Clipboard failed", err);
        // If clipboard fails (e.g. background tab), we just skip notification or show error
      }

      // 2. Add to history
      setHistory(prev => {
        // Prevent duplicate top entry
        if (prev.length > 0) {
            const top = prev[0];
            if (top.inputSide === side && top.inputValue === val) {
                return prev;
            }
        }

        const newRecord: HistoryRecord = {
          id: Date.now().toString(),
          inputSide: side,
          inputValue: val,
          resultValue: result,
          timestamp: Date.now(),
        };
        const updated = [newRecord, ...prev].slice(0, HISTORY_LIMIT);
        localStorage.setItem('reso-history', JSON.stringify(updated));
        return updated;
      });

    }, 800); // 800ms debounce
  }, []);

  const handleLeftChange = (val: string) => {
    setLeftValue(val);
    setActiveSide('left');
    
    if (val === '') {
      setRightValue('');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    const num = parseFloat(val);
    if (!isNaN(num)) {
      const calc = Math.round(num / RATIO);
      setRightValue(calc.toString());
      processCalculation('left', val);
    }
  };

  const handleRightChange = (val: string) => {
    setRightValue(val);
    setActiveSide('right');

    if (val === '') {
      setLeftValue('');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    const num = parseFloat(val);
    if (!isNaN(num)) {
      const calc = Math.round(num * RATIO);
      setLeftValue(calc.toString());
      processCalculation('right', val);
    }
  };

  const handleHistorySelect = (record: HistoryRecord) => {
    // Restore a historical state
    if (record.inputSide === 'left') {
        setLeftValue(record.inputValue.toString());
        setRightValue(Math.round(record.inputValue / RATIO).toString());
        setActiveSide('left');
    } else {
        setRightValue(record.inputValue.toString());
        setLeftValue(Math.round(record.inputValue * RATIO).toString());
        setActiveSide('right');
    }
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1117] text-gray-200 flex flex-col items-center py-12 px-4 sm:px-6 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="mb-12 text-center space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 tracking-tight">
          Resolution <span className="font-mono text-indigo-400">1.6</span>
        </h1>
        <p className="text-gray-500 text-sm">Golden ratio scalar for UI design</p>
      </header>

      {/* Main Calculator */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
        
        {/* Left Input (Base / Width) */}
        <div className="w-full md:w-1/3">
            <NumberInput 
                label="Base Value (Left)"
                value={leftValue}
                onChange={handleLeftChange}
                placeholder="1920"
                isActive={activeSide === 'left'}
            />
        </div>

        {/* Divider / Operator */}
        <div className="flex flex-col items-center justify-center text-gray-600 gap-2">
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent hidden md:block"></div>
            <div className="bg-gray-800/80 p-3 rounded-full border border-gray-700 shadow-xl backdrop-blur-sm">
                <X size={20} className="text-indigo-400" />
            </div>
             <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent hidden md:block"></div>
        </div>

        {/* Right Input (Result / Height) */}
        <div className="w-full md:w-1/3">
             <NumberInput 
                label="Scaled Value (Right)"
                value={rightValue}
                onChange={handleRightChange}
                placeholder="1200"
                isActive={activeSide === 'right'}
            />
        </div>

      </div>

      {/* History Section */}
      <HistoryList 
        history={history} 
        onClear={clearHistory}
        onSelect={handleHistorySelect}
      />

      {/* Toast Notification */}
      <div className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-800 border border-gray-700 text-white text-sm font-medium rounded-full shadow-2xl transition-all duration-300 flex items-center gap-3
        ${toast.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
      `}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        {toast.message}
      </div>

    </div>
  );
}