import React, { useRef, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { InputProps } from '../types';

const NumberInput: React.FC<InputProps> = ({ value, onChange, placeholder, label, isActive }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimals
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <div 
      className={`
        relative flex flex-col items-center w-full p-6 rounded-2xl transition-all duration-300 border
        ${isActive 
          ? 'bg-gray-800 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]' 
          : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
        }
      `}
    >
      <label className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-4">
        {label}
      </label>
      
      <div className="relative w-full group">
        <input
          ref={inputRef}
          type="text" // Use text to handle decimals gracefully during typing
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-center text-4xl sm:text-5xl font-mono font-medium text-white outline-none placeholder-gray-700 transition-colors"
        />
        
        {/* Hidden Copy Button that appears on hover or when value exists */}
        <button
          onClick={handleCopy}
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white rounded-full hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100
            ${value ? 'cursor-pointer' : 'pointer-events-none'}
          `}
          title="Copy value"
        >
          <Copy size={18} />
        </button>
      </div>
      
      <div className="mt-2 h-1 w-12 rounded-full bg-gray-800 overflow-hidden">
        <div className={`h-full bg-indigo-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0'}`} />
      </div>
    </div>
  );
};

export default NumberInput;