
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Table, Palette, Type, Plus, Minus } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string, tags: string[]) => void;
  backgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  backgroundColor = '#ffffff',
  onBackgroundColorChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const currentContentRef = useRef<string>('');
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);

  // Дебаунсинг для обновления состояния
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentContentRef.current !== value) {
        const tags = extractTags(currentContentRef.current);
        onChange(currentContentRef.current, tags);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentContentRef.current]);

  // Установка содержимого при смене заметки
  useEffect(() => {
    if (editorRef.current && value !== currentContentRef.current) {
      editorRef.current.innerHTML = processTagsForDisplay(value);
      currentContentRef.current = value;
    }
  }, [value]);

  const processTagsForDisplay = (text: string) => {
    // Скрываем ### теги, но оставляем текст на месте
    return text.replace(/###([^.]*\.)/g, '<span class="hidden-tag" style="display: none;">###</span>$1');
  };

  const extractTags = (text: string): string[] => {
    const tags: string[] = [];
    const tagMatches = text.match(/###([^.]*\.)/g);
    if (tagMatches) {
      tagMatches.forEach(match => {
        const tag = match.replace('###', '').trim();
        if (tag) tags.push(tag);
      });
    }
    return tags;
  };

  const saveCaretPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      return {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      };
    }
    return null;
  };

  const restoreCaretPosition = (caretPos: any) => {
    if (caretPos && editorRef.current) {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(caretPos.startContainer, caretPos.startOffset);
        range.setEnd(caretPos.endContainer, caretPos.endOffset);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (e) {
        console.log('Could not restore caret position:', e);
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const caretPos = saveCaretPosition();
      currentContentRef.current = editorRef.current.innerHTML;
      
      // Обработка тегов в реальном времени
      const processedContent = processTagsForDisplay(currentContentRef.current);
      if (editorRef.current.innerHTML !== processedContent) {
        editorRef.current.innerHTML = processedContent;
        restoreCaretPosition(caretPos);
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    const caretPos = saveCaretPosition();
    document.execCommand(command, false, value);
    setTimeout(() => restoreCaretPosition(caretPos), 0);
    handleInput();
  };

  const handleFontSize = (size: number) => {
    setFontSize(size);
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${size}px`;
    }
  };

  const handleTextColor = (color: string) => {
    setTextColor(color);
    execCommand('foreColor', color);
  };

  const createTable = () => {
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    
    for (let i = 0; i < tableRows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < tableCols; j++) {
        tableHTML += `<td style="padding: 8px; border: 1px solid #ccc; min-width: 100px;" contenteditable="true">
          ${i === 0 ? `Заголовок ${j + 1}` : `Ячейка ${j + 1}`}
          <button onclick="addRowAbove(this)" style="display: none;" class="table-btn">+▲</button>
          <button onclick="addRowBelow(this)" style="display: none;" class="table-btn">+▼</button>
          <button onclick="addColLeft(this)" style="display: none;" class="table-btn">+◄</button>
          <button onclick="addColRight(this)" style="display: none;" class="table-btn">+►</button>
          <button onclick="deleteRow(this)" style="display: none;" class="table-btn">-▲</button>
          <button onclick="deleteCol(this)" style="display: none;" class="table-btn">-◄</button>
        </td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';
    
    execCommand('insertHTML', tableHTML);
    setShowTableDialog(false);
  };

  const insertSeparator = () => {
    const separatorHTML = `
      <div class="separator-block" style="
        margin: 20px 0; 
        padding: 10px; 
        background: linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%); 
        border-radius: 8px; 
        text-align: center;
        font-weight: bold;
        color: #374151;
      " contenteditable="true">
        Новый разделитель
      </div>
    `;
    execCommand('insertHTML', separatorHTML);
  };

  return (
    <div className="border rounded-lg" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      {/* Панель инструментов */}
      <div className="flex flex-wrap gap-1 p-2 border-b" style={{ backgroundColor: 'var(--theme-primary)', opacity: 0.1 }}>
        <Toggle
          pressed={document.queryCommandState('bold')}
          onPressedChange={() => execCommand('bold')}
          size="sm"
        >
          <Bold size={16} />
        </Toggle>
        
        <Toggle
          pressed={document.queryCommandState('italic')}
          onPressedChange={() => execCommand('italic')}
          size="sm"
        >
          <Italic size={16} />
        </Toggle>
        
        <Toggle
          pressed={document.queryCommandState('underline')}
          onPressedChange={() => execCommand('underline')}
          size="sm"
        >
          <Underline size={16} />
        </Toggle>
        
        <Toggle
          pressed={document.queryCommandState('strikeThrough')}
          onPressedChange={() => execCommand('strikeThrough')}
          size="sm"
        >
          <Strikethrough size={16} />
        </Toggle>

        <Separator orientation="vertical" className="h-8" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
        >
          <List size={16} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => execCommand('insertOrderedList')}
        >
          <ListOrdered size={16} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTableDialog(true)}
        >
          <Table size={16} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={insertSeparator}
          title="Добавить разделитель"
        >
          <Separator className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-2">
          <Type size={16} />
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => handleFontSize(Number(e.target.value))}
            className="w-16 h-8"
            min="8"
            max="72"
          />
        </div>

        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Palette size={16} />
              <div 
                className="w-4 h-4 border ml-1" 
                style={{ backgroundColor: textColor }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <div className="space-y-2">
              <Label>Цвет текста</Label>
              <Input
                type="color"
                value={textColor}
                onChange={(e) => handleTextColor(e.target.value)}
              />
            </div>
          </PopoverContent>
        </Popover>

        {onBackgroundColorChange && (
          <Popover open={showBgColorPicker} onOpenChange={setShowBgColorPicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Фон
                <div 
                  className="w-4 h-4 border ml-1" 
                  style={{ backgroundColor }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <div className="space-y-2">
                <Label>Цвет фона</Label>
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => onBackgroundColorChange(e.target.value)}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Текстовый редактор */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] p-4 focus:outline-none"
        style={{ 
          backgroundColor,
          fontSize: `${fontSize}px`,
          color: textColor
        }}
        suppressContentEditableWarning={true}
      />

      {/* Диалог создания таблицы */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать таблицу</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rows">Количество строк:</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="cols">Количество столбцов:</Label>
              <Input
                id="cols"
                type="number"
                min="1"
                max="10"
                value={tableCols}
                onChange={(e) => setTableCols(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              Отмена
            </Button>
            <Button onClick={createTable}>
              Создать таблицу
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .hidden-tag {
          display: none !important;
        }
        
        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
        }
        
        [contenteditable] table td {
          border: 1px solid #ccc;
          padding: 8px;
          min-width: 100px;
          position: relative;
        }
        
        [contenteditable] table td:hover .table-btn {
          display: inline-block !important;
          position: absolute;
          background: #007bff;
          color: white;
          border: none;
          padding: 2px 4px;
          font-size: 10px;
          cursor: pointer;
          z-index: 1000;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 10px 0;
          padding-left: 30px;
        }
        
        .separator-block {
          margin: 20px 0;
          padding: 10px;
          background: linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%);
          border-radius: 8px;
          text-align: center;
          font-weight: bold;
          color: #374151;
          cursor: pointer;
        }
        
        .separator-block:hover {
          background: linear-gradient(90deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%);
        }
      `}</style>

      <script>{`
        window.addRowAbove = function(btn) {
          const td = btn.parentElement;
          const tr = td.parentElement;
          const newRow = tr.cloneNode(true);
          newRow.querySelectorAll('td').forEach(cell => cell.innerHTML = 'Новая ячейка');
          tr.parentElement.insertBefore(newRow, tr);
        };
        
        window.addRowBelow = function(btn) {
          const td = btn.parentElement;
          const tr = td.parentElement;
          const newRow = tr.cloneNode(true);
          newRow.querySelectorAll('td').forEach(cell => cell.innerHTML = 'Новая ячейка');
          tr.parentElement.insertBefore(newRow, tr.nextSibling);
        };
        
        window.addColLeft = function(btn) {
          const td = btn.parentElement;
          const table = td.closest('table');
          const colIndex = Array.from(td.parentElement.children).indexOf(td);
          table.querySelectorAll('tr').forEach(row => {
            const newCell = document.createElement('td');
            newCell.innerHTML = 'Новая ячейка';
            newCell.style.cssText = 'padding: 8px; border: 1px solid #ccc; min-width: 100px;';
            row.insertBefore(newCell, row.children[colIndex]);
          });
        };
        
        window.addColRight = function(btn) {
          const td = btn.parentElement;
          const table = td.closest('table');
          const colIndex = Array.from(td.parentElement.children).indexOf(td);
          table.querySelectorAll('tr').forEach(row => {
            const newCell = document.createElement('td');
            newCell.innerHTML = 'Новая ячейка';
            newCell.style.cssText = 'padding: 8px; border: 1px solid #ccc; min-width: 100px;';
            row.insertBefore(newCell, row.children[colIndex + 1]);
          });
        };
        
        window.deleteRow = function(btn) {
          const tr = btn.parentElement.parentElement;
          if (tr.parentElement.children.length > 1) {
            tr.remove();
          }
        };
        
        window.deleteCol = function(btn) {
          const td = btn.parentElement;
          const table = td.closest('table');
          const colIndex = Array.from(td.parentElement.children).indexOf(td);
          if (table.querySelector('tr').children.length > 1) {
            table.querySelectorAll('tr').forEach(row => {
              if (row.children[colIndex]) {
                row.children[colIndex].remove();
              }
            });
          }
        };
      `}</script>
    </div>
  );
};

export default RichTextEditor;
