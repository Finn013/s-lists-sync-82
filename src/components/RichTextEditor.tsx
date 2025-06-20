
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Table, Palette, Type } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = processTagsForDisplay(value);
    }
  }, [value]);

  const processTagsForDisplay = (text: string) => {
    // Скрываем ### теги, но сохраняем их для поиска
    return text.replace(/###([^.]*\.)/, '<span class="hidden-tag" data-tag="$1">$1</span>');
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

  const handleInput = () => {
    if (editorRef.current) {
      let content = editorRef.current.innerHTML;
      
      // Преобразуем ### теги в невидимые
      content = content.replace(/###([^.]*\.)/g, '<span class="hidden-tag" data-tag="$1" style="display: none;">$1</span>');
      
      const plainText = editorRef.current.innerText || '';
      const tags = extractTags(plainText);
      
      onChange(content, tags);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
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

  const insertTable = () => {
    const table = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px;">Ячейка 1</td>
          <td style="padding: 8px;">Ячейка 2</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Ячейка 3</td>
          <td style="padding: 8px;">Ячейка 4</td>
        </tr>
      </table>
    `;
    execCommand('insertHTML', table);
  };

  return (
    <div className="border rounded-lg">
      {/* Панель инструментов */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
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
          onClick={insertTable}
        >
          <Table size={16} />
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

      <style jsx>{`
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
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 10px 0;
          padding-left: 30px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
