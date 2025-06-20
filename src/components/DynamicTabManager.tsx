
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Plus, X, Settings, Palette } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import TagSearch from './TagSearch';
import ThemeSelector from './ThemeSelector';

interface TabData {
  id: string;
  title: string;
  content: string;
  tags: string[];
  backgroundColor: string;
}

interface DynamicTabManagerProps {
  onThemeChange?: (theme: string) => void;
}

const DynamicTabManager: React.FC<DynamicTabManagerProps> = ({ onThemeChange }) => {
  const [tabs, setTabs] = useState<TabData[]>([
    { id: '1', title: 'Новая вкладка', content: '', tags: [], backgroundColor: '#ffffff' }
  ]);
  const [activeTab, setActiveTab] = useState('1');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingTabId, setRenamingTabId] = useState('');
  const [newTabTitle, setNewTabTitle] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedTabs = localStorage.getItem('dynamicTabs');
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        setTabs(parsed);
        if (parsed.length > 0) {
          setActiveTab(parsed[0].id);
        }
      } catch (error) {
        console.error('Ошибка загрузки вкладок:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dynamicTabs', JSON.stringify(tabs));
  }, [tabs]);

  const addTab = () => {
    const newId = Date.now().toString();
    const newTab: TabData = {
      id: newId,
      title: `Вкладка ${tabs.length + 1}`,
      content: '',
      tags: [],
      backgroundColor: '#ffffff'
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newId);
  };

  const removeTab = (tabId: string) => {
    if (tabs.length <= 1) return; // Не удаляем последнюю вкладку
    
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (activeTab === tabId && filtered.length > 0) {
        setActiveTab(filtered[0].id);
      }
      return filtered;
    });
  };

  const updateTabContent = (tabId: string, content: string, tags: string[]) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, content, tags } : tab
    ));
  };

  const updateTabBackgroundColor = (tabId: string, backgroundColor: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, backgroundColor } : tab
    ));
  };

  const renameTab = (tabId: string, newTitle: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, title: newTitle } : tab
    ));
  };

  const handleRename = () => {
    if (newTabTitle.trim()) {
      renameTab(renamingTabId, newTabTitle.trim());
    }
    setRenameDialogOpen(false);
    setRenamingTabId('');
    setNewTabTitle('');
  };

  const openRenameDialog = (tabId: string, currentTitle: string) => {
    setRenamingTabId(tabId);
    setNewTabTitle(currentTitle);
    setRenameDialogOpen(true);
  };

  const getCurrentTab = () => tabs.find(tab => tab.id === activeTab);

  const getFilteredTags = () => {
    const currentTab = getCurrentTab();
    if (!currentTab || !searchTerm) return [];
    
    return currentTab.tags.filter(tag =>
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Текстовый редактор</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={16} className="mr-2" />
            Настройки
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center gap-2 mb-4">
            <TabsList className="flex-1">
              {tabs.map(tab => (
                <ContextMenu key={tab.id}>
                  <ContextMenuTrigger asChild>
                    <div className="relative group">
                      <TabsTrigger value={tab.id} className="pr-8">
                        {tab.title}
                      </TabsTrigger>
                      {tabs.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 p-0 h-4 w-4 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTab(tab.id);
                          }}
                        >
                          <X size={12} />
                        </Button>
                      )}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => openRenameDialog(tab.id, tab.title)}>
                      Переименовать
                    </ContextMenuItem>
                    {tabs.length > 1 && (
                      <ContextMenuItem onClick={() => removeTab(tab.id)}>
                        Удалить
                      </ContextMenuItem>
                    )}
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TabsList>
            <Button onClick={addTab} size="sm">
              <Plus size={16} />
            </Button>
          </div>

          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="space-y-4">
                <TagSearch
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  items={[]} // Передаём пустой массив, так как теги теперь в табах
                  tags={getFilteredTags()}
                />
                
                <Card>
                  <CardContent className="p-0">
                    <RichTextEditor
                      value={tab.content}
                      onChange={(content, tags) => updateTabContent(tab.id, content, tags)}
                      backgroundColor={tab.backgroundColor}
                      onBackgroundColorChange={(color) => updateTabBackgroundColor(tab.id, color)}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Диалог переименования */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Переименовать вкладку</DialogTitle>
            </DialogHeader>
            <Input
              value={newTabTitle}
              onChange={(e) => setNewTabTitle(e.target.value)}
              placeholder="Введите новое название"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleRename}>
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Диалог настроек */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Настройки приложения</DialogTitle>
            </DialogHeader>
            <ThemeSelector onThemeChange={onThemeChange} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DynamicTabManager;
