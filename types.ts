export interface HistoryRecord {
  id: string;
  inputSide: 'left' | 'right';
  inputValue: number;
  resultValue: number;
  timestamp: number;
}

export interface InputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label: string;
  isActive?: boolean;
}