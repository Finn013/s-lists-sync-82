
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TagSearch from './TagSearch';
import ExportImportPanel from './ExportImportPanel';

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

interface TabData {
  id: string;
  title: string;
  items: ListItem[];
  notes?: string;
  archive?: any[];
  globalColumnWidths?: number[];
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
  focusedColumnIndex?: number;
  onUpdateColumnStyle?: (columnIndex: number, style: any) => void;
  tabs?: TabData[];
  onImportTabs?: (tabs: TabData[]) => void;
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
  items,
  focusedColumnIndex,
  onUpdateColumnStyle,
  tabs,
  onImportTabs
}) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const applyFormatting = (format: keyof ListItem, value?: any) => {
    if (focusedColumnIndex !== undefined && onUpdateColumnStyle) {
      // Apply formatting to focused column
      const updates: any = {};
      
      if (format === 'bold') {
        updates.bold = true;
      } else if (format === 'italic') {
        updates.italic = true;
      } else if (format === 'strikethrough') {
        updates.strikethrough = true;
      } else if (format === 'fontSize') {
        updates.fontSize = value === 'increase' ? 16 : 12;
      } else if (format === 'textColor') {
        updates.textColor = value;
      }
      
      onUpdateColumnStyle(focusedColumnIndex, updates);
    } else {
      // Apply to selected items (existing logic)
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
    }
  };

  const applyNotesFormatting = (format: string, value?: any) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) return;
    
    const selectedText = textarea.value.substring(start, end);
    let formattedText = selectedText;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        break;
      case 'fontSize':
        if (value === 'increase') {
          formattedText = `## ${selectedText}`;
        } else {
          formattedText = `### ${selectedText}`;
        }
        break;
    }
    
    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.value = newValue;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Set cursor position after the formatted text
    const newPosition = start + formattedText.length;
    textarea.setSelectionRange(newPosition, newPosition);
    textarea.focus();
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080'
  ];

  const isNotesTab = tabId === '3';
  const hasFormatTarget = focusedColumnIndex !== undefined || selectedItems.length > 0;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-2 sm:p-4">
        <div className="space-y-2 sm:space-y-4">
          {/* Export/Import Panel */}
          {tabs && onImportTabs && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Управление данными:</span>
                <ExportImportPanel tabs={tabs} onImport={onImportTabs} />
              </div>
              <Separator />
            </>
          )}

          {!isNotesTab && (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Button
                size="sm"
                onClick={() => onAddItem(tabId)}
                className="bg-green-600 hover:bg-green-700 text-xs px-2 sm:px-3"
              >
                Добавить строку
              </Button>
              <Button
                size="sm"
                onClick={() => onAddSeparator(tabId)}
                className="bg-blue-600 hover:bg-blue-700 text-xs px-2 sm:px-3"
              >
                Создать разделитель
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onDeleteSelected(tabId)}
                className="text-xs px-2 sm:px-3"
              >
                Удалить выбранные
              </Button>
            </div>
          )}

          {!isNotesTab && <Separator />}

          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => isNotesTab ? applyNotesFormatting('bold') : applyFormatting('bold')}
              disabled={!isNotesTab && !hasFormatTarget}
              className="text-xs px-2 sm:px-3"
            >
              <span className="text-lg font-bold">Ж</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => isNotesTab ? applyNotesFormatting('italic') : applyFormatting('italic')}
              disabled={!isNotesTab && !hasFormatTarget}
              className="text-xs px-2 sm:px-3"
            >
              <span className="italic">К</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => isNotesTab ? applyNotesFormatting('strikethrough') : applyFormatting('strikethrough')}
              disabled={!isNotesTab && !hasFormatTarget}
              className="text-xs px-2 sm:px-3"
            >
              <span className="line-through">З</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => isNotesTab ? applyNotesFormatting('fontSize', 'increase') : applyFormatting('fontSize', 'increase')}
              disabled={!isNotesTab && !hasFormatTarget}
              className="text-xs px-2 sm:px-3"
            >
              А+
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => isNotesTab ? applyNotesFormatting('fontSize', 'decrease') : applyFormatting('fontSize', 'decrease')}
              disabled={!isNotesTab && !hasFormatTarget}
              className="text-xs px-2 sm:px-3"
            >
              А-
            </Button>
            
            {!isNotesTab && (
              <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={!hasFormatTarget}
                    className="text-xs px-2 sm:px-3"
                  >
                    🎨
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="grid grid-cols-5 gap-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded border-2 border-gray-300 hover:border-gray-500"
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
            )}
          </div>

          <Separator />

          {!isNotesTab && (
            <>
              <TagSearch 
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                items={items}
              />
              <Separator />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolbarPanel;
