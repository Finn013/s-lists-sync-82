
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TagSearch from './TagSearch';

interface ListItem {
  id: string;
  text: string;
  columns: string[];
  checked: boolean;
  issued: boolean;
  issuedTo?: string;
  issuedDate?: string;
  returnedDate?: string;
  type: 'item' | 'separator';
  separatorText?: string;
  separatorColor?: string;
  separatorAlign?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  textColor?: string;
}

interface ToolbarPanelProps {
  tabId: string;
  onAddItem: (tabId: string, text?: string) => void;
  onAddSeparator: (tabId: string) => void;
  onDeleteSelected: (tabId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedItems: ListItem[];
  onUpdateItem: (tabId: string, itemId: string, updates: Partial<ListItem>) => void;
  items: ListItem[];
}

const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  tabId,
  onAddItem,
  onAddSeparator,
  onDeleteSelected,
  searchTerm,
  onSearchChange,
  selectedItems,
  onUpdateItem,
  items
}) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const applyFormatting = (format: keyof ListItem, value?: any) => {
    selectedItems.forEach(item => {
      if (item.type === 'item') {
        const updates: Partial<ListItem> = {};
        
        if (format === 'bold') {
          updates.bold = !item.bold;
        } else if (format === 'italic') {
          updates.italic = !item.italic;
        } else if (format === 'strikethrough') {
          updates.strikethrough = !item.strikethrough;
        } else if (format === 'fontSize') {
          const currentSize = item.fontSize || 14;
          updates.fontSize = value === 'increase' ? currentSize + 2 : currentSize - 2;
        } else if (format === 'textColor') {
          updates.textColor = value;
        }
        
        onUpdateItem(tabId, item.id, updates);
      }
    });
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080'
  ];

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* First Row - Basic Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onAddItem(tabId)}
              className="bg-green-600 hover:bg-green-700"
            >
              Добавить строку
            </Button>
            <Button
              size="sm"
              onClick={() => onAddSeparator(tabId)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Создать разделитель
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onDeleteSelected(tabId)}
            >
              Удалить выбранные
            </Button>
          </div>

          <Separator />

          {/* Text Formatting */}
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => applyFormatting('bold')}
              disabled={selectedItems.length === 0}
            >
              <span className="text-lg font-bold">Ж</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => applyFormatting('italic')}
              disabled={selectedItems.length === 0}
            >
              <span className="italic">К</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => applyFormatting('strikethrough')}
              disabled={selectedItems.length === 0}
            >
              <span className="line-through">З</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => applyFormatting('fontSize', 'increase')}
              disabled={selectedItems.length === 0}
            >
              А+
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => applyFormatting('fontSize', 'decrease')}
              disabled={selectedItems.length === 0}
            >
              А-
            </Button>
            <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={selectedItems.length === 0}
                >
                  🎨
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-5 gap-1">
                  {colors.map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
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

          <Separator />

          {/* Search with Tags */}
          <TagSearch 
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            items={items}
          />

          <Separator />

          {/* Alignment */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              ⬅️
            </Button>
            <Button size="sm" variant="outline">
              ↔️
            </Button>
            <Button size="sm" variant="outline">
              ➡️
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolbarPanel;
