
import React, { useState } from 'react';
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
}

const EditableColumn: React.FC<EditableColumnProps> = ({
  value,
  onChange,
  style = {},
  disabled = false,
  width = 200,
  onWidthChange
}) => {
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080'
  ];

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

  const updateStyle = (newStyle: Partial<ColumnStyle>) => {
    const updatedStyle = { ...style, ...newStyle };
    onChange(value, updatedStyle);
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

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value, style)}
        className={`p-1 border rounded text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        disabled={disabled}
        style={getInputStyle()}
      />
      
      {onWidthChange && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 opacity-50"
          onMouseDown={handleMouseDown}
        />
      )}

      {!disabled && (
        <Popover open={isFormatOpen} onOpenChange={setIsFormatOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-1 h-6 w-6 p-0">
              🎨
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="space-y-2">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={style.bold ? "default" : "outline"}
                  onClick={() => updateStyle({ bold: !style.bold })}
                >
                  <span className="font-bold">Ж</span>
                </Button>
                <Button
                  size="sm"
                  variant={style.italic ? "default" : "outline"}
                  onClick={() => updateStyle({ italic: !style.italic })}
                >
                  <span className="italic">К</span>
                </Button>
                <Button
                  size="sm"
                  variant={style.strikethrough ? "default" : "outline"}
                  onClick={() => updateStyle({ strikethrough: !style.strikethrough })}
                >
                  <span className="line-through">З</span>
                </Button>
              </div>
              
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStyle({ fontSize: (style.fontSize || 14) + 2 })}
                >
                  А+
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStyle({ fontSize: Math.max(8, (style.fontSize || 14) - 2) })}
                >
                  А-
                </Button>
              </div>

              <div className="grid grid-cols-5 gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => updateStyle({ textColor: color })}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default EditableColumn;
