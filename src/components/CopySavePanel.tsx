
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
      const textToCopy = selectedItems
        .filter(item => item.type === 'item')
        .map(item => {
          const rowNum = currentTab.items.filter(i => i.type === 'item').indexOf(item) + 1;
          const columnsText = item.columns.join(' | ');
          return `${rowNum}. ${columnsText}`;
        })
        .join('\n');

      await navigator.clipboard.writeText(textToCopy);
      
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
    try {
      let content = '';
      
      if (currentTab.id === '3') {
        // For notes tab, export notes content
        content = currentTab.notes || '';
      } else {
        // For other tabs, export items as text
        content = currentTab.items
          .map(item => {
            if (item.type === 'separator') {
              return `\n--- ${item.separatorText} ---\n`;
            } else {
              const rowNum = currentTab.items.filter(i => i.type === 'item').indexOf(item) + 1;
              const columnsText = item.columns.join(' | ');
              return `${rowNum}. ${columnsText}`;
            }
          })
          .join('\n');
      }

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTab.title}-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Сохранено",
        description: `Вкладка "${currentTab.title}" сохранена как текстовый файл`
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
      >
        <Copy size={16} className="mr-1" />
        Копировать
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleSaveAs}
      >
        <Save size={16} className="mr-1" />
        Сохранить как
      </Button>
    </div>
  );
};

export default CopySavePanel;
