
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Save } from 'lucide-react';

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
  columnStyles?: any[];
  columnWidths?: number[];
  originalRowNumber?: number;
  collapsed?: boolean;
}

interface TabData {
  id: string;
  title: string;
  items: ListItem[];
  notes?: string;
  archive?: any[];
  globalColumnWidths?: number[];
}

interface CopySavePanelProps {
  currentTab: TabData;
  selectedItems: ListItem[];
}

const CopySavePanel: React.FC<CopySavePanelProps> = ({ currentTab, selectedItems }) => {
  const { toast } = useToast();

  const getItemsWithSeparators = () => {
    const result: { item?: ListItem; separator?: ListItem }[] = [];
    let currentSeparator: ListItem | undefined;

    // Find separator for each selected item
    for (const item of currentTab.items) {
      if (item.type === 'separator') {
        currentSeparator = item;
      } else if (item.checked && item.type === 'item') {
        result.push({ item, separator: currentSeparator });
      }
    }

    return result;
  };

  const handleCopy = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Нет выбранных элементов",
        description: "Выберите элементы для копирования",
        variant: "destructive"
      });
      return;
    }

    try {
      const itemsWithSeparators = getItemsWithSeparators();
      let textToCopy = '';
      let lastSeparator: string | undefined;

      itemsWithSeparators.forEach(({ item, separator }) => {
        if (separator && separator.separatorText !== lastSeparator) {
          textToCopy += `\n--- ${separator.separatorText} ---\n`;
          lastSeparator = separator.separatorText;
        }
        
        if (item) {
          const rowNum = currentTab.items.filter(i => i.type === 'item').indexOf(item) + 1;
          const columnsText = item.columns.join(' | ');
          textToCopy += `${rowNum}. ${columnsText}\n`;
        }
      });

      await navigator.clipboard.writeText(textToCopy.trim());
      
      toast({
        title: "Скопировано",
        description: `${selectedItems.length} элементов скопировано в буфер обмена`
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "Ошибка копирования",
        description: "Не удалось скопировать в буфер обмена",
        variant: "destructive"
      });
    }
  };

  const handleSaveAs = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Нет выбранных элементов",
        description: "Выберите элементы для сохранения",
        variant: "destructive"
      });
      return;
    }

    try {
      const itemsWithSeparators = getItemsWithSeparators();
      let content = '';
      let lastSeparator: string | undefined;

      itemsWithSeparators.forEach(({ item, separator }) => {
        if (separator && separator.separatorText !== lastSeparator) {
          content += `\n--- ${separator.separatorText} ---\n`;
          lastSeparator = separator.separatorText;
        }
        
        if (item) {
          const rowNum = currentTab.items.filter(i => i.type === 'item').indexOf(item) + 1;
          const columnsText = item.columns.join(' | ');
          content += `${rowNum}. ${columnsText}\n`;
        }
      });

      const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTab.title}-выбранные-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Сохранено",
        description: `${selectedItems.length} выбранных элементов сохранено`
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить файл",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleCopy}
        disabled={selectedItems.length === 0}
        className="text-xs px-2"
      >
        <Copy size={14} className="mr-1" />
        Копировать
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleSaveAs}
        disabled={selectedItems.length === 0}
        className="text-xs px-2"
      >
        <Save size={14} className="mr-1" />
        Сохранить как
      </Button>
    </div>
  );
};

export default CopySavePanel;
