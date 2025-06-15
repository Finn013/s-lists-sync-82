
import React, { useState, useRef } from 'react';
import FormattingToolbar from './FormattingToolbar';
import ResizeHandle from './ResizeHandle';

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

  console.log('EditableColumn render - style:', style);
  console.log('EditableColumn render - showFormatButton:', showFormatButton);
  console.log('EditableColumn render - isFocused:', isFocused);

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
    console.log('Input focused');
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    console.log('Input blurred');
    // Проверяем, не переходит ли фокус на кнопки форматирования
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('.formatting-toolbar')) {
      setIsFocused(false);
      setColorPickerOpen(false);
    }
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
    
    console.log('New style being sent:', newStyle);
    onChange(value, newStyle);
    
    // Восстановить фокус и позицию курсора
    setTimeout(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
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
      
      {isFocused && (
        <div className="formatting-toolbar">
          <FormattingToolbar
            style={style}
            onFormatChange={applyFormatting}
            colorPickerOpen={colorPickerOpen}
            onColorPickerOpenChange={setColorPickerOpen}
          />
        </div>
      )}
      
      {onWidthChange && (
        <ResizeHandle onResize={handleMouseDown} />
      )}
    </div>
  );
};

export default EditableColumn;
