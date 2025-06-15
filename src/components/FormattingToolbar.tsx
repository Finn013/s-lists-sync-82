
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import ColorPicker from './ColorPicker';

interface ColumnStyle {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  textColor?: string;
}

interface FormattingToolbarProps {
  style: ColumnStyle;
  onFormatChange: (format: keyof ColumnStyle, colorValue?: string) => void;
  colorPickerOpen: boolean;
  onColorPickerOpenChange: (open: boolean) => void;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  style,
  onFormatChange,
  colorPickerOpen,
  onColorPickerOpenChange
}) => {
  return (
    <div className="absolute top-full left-0 z-10 bg-white border rounded shadow-md p-1 flex gap-1 mt-1">
      <Toggle
        size="sm"
        pressed={!!style.bold}
        onPressedChange={() => {
          console.log('Bold button clicked, current bold state:', style.bold);
          onFormatChange('bold');
        }}
        className="text-xs px-2 py-1 h-6 data-[state=on]:bg-blue-600 data-[state=on]:text-white"
      >
        <span className="font-bold">Ж</span>
      </Toggle>
      <Toggle
        size="sm"
        pressed={!!style.italic}
        onPressedChange={() => {
          console.log('Italic button clicked, current italic state:', style.italic);
          onFormatChange('italic');
        }}
        className="text-xs px-2 py-1 h-6 data-[state=on]:bg-blue-600 data-[state=on]:text-white"
      >
        <span className="italic">К</span>
      </Toggle>
      <Toggle
        size="sm"
        pressed={!!style.strikethrough}
        onPressedChange={() => {
          console.log('Strikethrough button clicked, current strikethrough state:', style.strikethrough);
          onFormatChange('strikethrough');
        }}
        className="text-xs px-2 py-1 h-6 data-[state=on]:bg-blue-600 data-[state=on]:text-white"
      >
        <span className="line-through">З</span>
      </Toggle>
      <ColorPicker
        open={colorPickerOpen}
        onOpenChange={onColorPickerOpenChange}
        onColorSelect={(color) => onFormatChange('textColor', color)}
      />
    </div>
  );
};

export default FormattingToolbar;
