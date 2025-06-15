import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText } from 'lucide-react';
import { CryptoManager } from '../utils/cryptoManager';
import { DataManager } from '../utils/dataManager';

interface TabData {
  id: string;
  title: string;
  items: any[];
  notes?: string;
  archive?: any[];
  globalColumnWidths?: number[];
}

interface ExportImportPanelProps {
  tabs: TabData[];
  onImport: (tabs: TabData[]) => void;
}

const ExportImportPanel: React.FC<ExportImportPanelProps> = ({ tabs, onImport }) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();

  const cryptoManager = new CryptoManager();

  const handleExport = async () => {
    if (!password.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите пароль для шифрования",
        variant: "destructive"
      });
      return;
    }

    try {
      await cryptoManager.setPassword(password);
      const dataToExport = {
        tabs,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      const jsonData = JSON.stringify(dataToExport);
      const encryptedData = await cryptoManager.encrypt(jsonData);
      
      const blob = new Blob([encryptedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `s-list-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportDialogOpen(false);
      setPassword('');
      
      toast({
        title: "Экспорт завершен",
        description: "Данные успешно экспортированы в зашифрованный файл"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    if (!password.trim() || !importFile) {
      toast({
        title: "Ошибка",
        description: "Введите пароль и выберите файл",
        variant: "destructive"
      });
      return;
    }

    try {
      await cryptoManager.setPassword(password);
      const fileContent = await importFile.text();
      const decryptedData = await cryptoManager.decrypt(fileContent);
      const parsedData = JSON.parse(decryptedData);
      
      if (parsedData.tabs && Array.isArray(parsedData.tabs)) {
        onImport(parsedData.tabs);
        
        setImportDialogOpen(false);
        setPassword('');
        setImportFile(null);
        
        toast({
          title: "Импорт завершен",
          description: "Данные успешно импортированы"
        });
      } else {
        throw new Error('Invalid file format');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось импортировать данные. Проверьте пароль и файл.",
        variant: "destructive"
      });
    }
  };

  const handleExportTxt = () => {
    try {
      let content = '';
      
      tabs.forEach(tab => {
        content += `=== ${tab.id} ===\n\n`; // Заменили проверку по title на проверку по ID
        
        if (tab.id === '3') {
          content += tab.notes || '';
        } else if (tab.id === '4' && tab.archive) {
          tab.archive.forEach(entry => {
            content += `${entry.items} - Выдано: ${entry.issuedTo} (${entry.issuedDate})`;
            if (entry.returnedDate) {
              content += ` - Возвращено: ${entry.returnedDate}`;
            }
            content += '\n';
          });
        } else {
          tab.items.forEach(item => {
            if (item.type === 'separator') {
              content += `\n--- ${item.separatorText} ---\n`;
            } else {
              const rowNum = tab.items.filter(i => i.type === 'item').indexOf(item) + 1;
              const columnsText = item.columns.join(' | ');
              content += `${rowNum}. ${columnsText}\n`;
            }
          });
        }
        
        content += '\n\n';
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `все-данные-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Экспорт TXT завершен",
        description: "Все данные сохранены в текстовый файл"
      });
    } catch (error) {
      console.error('TXT Export error:', error);
      toast({
        title: "Ошибка экспорта TXT",
        description: "Не удалось сохранить текстовый файл",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="flex gap-1 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setExportDialogOpen(true)}
          className="bg-green-50 border-green-200 hover:bg-green-100 text-xs px-2"
        >
          <Download size={14} className="mr-1" />
          <span className="hidden sm:inline">Экспорт</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setImportDialogOpen(true)}
          className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-xs px-2"
        >
          <Upload size={14} className="mr-1" />
          <span className="hidden sm:inline">Импорт</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportTxt}
          className="bg-orange-50 border-orange-200 hover:bg-orange-100 text-xs px-2"
        >
          <FileText size={14} className="mr-1" />
          <span className="hidden sm:inline">TXT</span>
        </Button>
      </div>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Экспорт данных</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Введите пароль для шифрования экспортируемых данных:
            </p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль для шифрования"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleExport}>
              Экспортировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Импорт данных</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Выберите зашифрованный файл и введите пароль:
            </p>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль для расшифровки"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleImport}>
              Импортировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportImportPanel;
