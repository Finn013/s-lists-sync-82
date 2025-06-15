
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColumnStyle {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  textColor?: string;
}

interface EditableColumnProps {
  value: string;
  onChange: (value: string, style?: ColumnStyle) => void;
  style?: ColumnStyle;
  disabled?: boolean;
  width?: number;
  onWidthChange?: (width: number) => void;
  showFormatButton?: boolean;
  onFocus?: () => void;
  columnIndex?: number;
}

const EditableColumn: React.FC<EditableColumnProps> = ({
  value,
  onChange,
  style = {},
  disabled = false,
  width = 200,
  onWidthChange,
  showFormatButton = false,
  onFocus,
  columnIndex
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getInputStyle = (): React.CSSProperties => {
    return {
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.strikethrough ? 'line-through' : 'none',
      fontSize: style.fontSize ? `${style.fontSize}px` : '14px',
      color: style.textColor || '#000000',
      width: `${width}px`
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onWidthChange) {
      setIsResizing(true);
      const startX = e.pageX;
      const startWidth = width;

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = Math.max(50, startWidth + (e.pageX - startX));
        onWidthChange(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative flex items-center">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value, style)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`p-1 border rounded text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        disabled={disabled}
        style={getInputStyle()}
        data-column-index={columnIndex}
      />
      
      {onWidthChange && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 opacity-50"
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};

export default EditableColumn;
