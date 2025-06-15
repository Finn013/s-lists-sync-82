
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
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
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

  const applyFormatting = (format: keyof ColumnStyle, colorValue?: string) => {
    const input = inputRef.current;
    const cursorPosition = input?.selectionStart || 0;
    
    console.log(`Applying ${format} formatting. Current style:`, style);
    
    const newStyle = { ...style };
    
    if (format === 'bold') {
      const newBoldValue = !style.bold;
      newStyle.bold = newBoldValue;
      console.log(`Bold toggled from ${style.bold} to ${newBoldValue}`);
    } else if (format === 'italic') {
      const newItalicValue = !style.italic;
      newStyle.italic = newItalicValue;
      console.log(`Italic toggled from ${style.italic} to ${newItalicValue}`);
    } else if (format === 'strikethrough') {
      const newStrikethroughValue = !style.strikethrough;
      newStyle.strikethrough = newStrikethroughValue;
      console.log(`Strikethrough toggled from ${style.strikethrough} to ${newStrikethroughValue}`);
    } else if (format === 'textColor') {
      newStyle.textColor = colorValue;
      console.log(`Text color changed to ${colorValue}`);
    }
    
    console.log('New style:', newStyle);
    onChange(value, newStyle);
    
    // Восстановить фокус и позицию курсора
    setTimeout(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080'
  ];

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
      
      {showFormatButton && isFocused && (
        <div className="absolute top-full left-0 z-10 bg-white border rounded shadow-md p-1 flex gap-1 mt-1">
          <Button
            size="sm"
            variant={style.bold ? "default" : "outline"}
            onClick={() => applyFormatting('bold')}
            className="text-xs px-2 py-1 h-6"
          >
            <span className="font-bold">Ж</span>
          </Button>
          <Button
            size="sm"
            variant={style.italic ? "default" : "outline"}
            onClick={() => applyFormatting('italic')}
            className="text-xs px-2 py-1 h-6"
          >
            <span className="italic">К</span>
          </Button>
          <Button
            size="sm"
            variant={style.strikethrough ? "default" : "outline"}
            onClick={() => applyFormatting('strikethrough')}
            className="text-xs px-2 py-1 h-6"
          >
            <span className="line-through">З</span>
          </Button>
          <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-2 py-1 h-6"
              >
                🎨
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-5 gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      applyFormatting('textColor', color);
                      setColorPickerOpen(false);
                    }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      
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
