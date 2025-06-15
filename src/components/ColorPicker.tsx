
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onColorSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  open,
  onOpenChange,
  onColorSelect
}) => {
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080'
  ];

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
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
                onColorSelect(color);
                onOpenChange(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
