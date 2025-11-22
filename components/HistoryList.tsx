import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryListProps {
  history: HistoryRecord[];
  onClear: () => void;
  onSelect: (record: HistoryRecord) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onClear, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-600">
        <p className="text-sm">Start typing to calculate</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mt-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Recent History</span>
        </div>
        <button 
          onClick={onClear}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2">
        {history.map((record) => (
          <div 
            key={record.id}
            onClick={() => onSelect(record)}
            className="
              group flex items-center justify-between p-4 rounded-xl bg-gray-900/30 border border-gray-800/50 
              hover:bg-gray-800 hover:border-gray-700 cursor-pointer transition-all duration-200
            "
          >
            <div className="flex items-center gap-6 font-mono text-sm sm:text-base text-gray-300">
              <span className={record.inputSide === 'left' ? 'text-indigo-400 font-bold' : 'text-gray-500'}>
                {record.inputSide === 'left' ? record.inputValue : Math.round(record.inputValue * 1.6)}
              </span>
              
              <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              
              <span className={record.inputSide === 'right' ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                {record.inputSide === 'right' ? record.inputValue : Math.round(record.inputValue / 1.6)}
              </span>
            </div>
            
            <span className="text-xs text-gray-600 font-mono">
               1.6
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;