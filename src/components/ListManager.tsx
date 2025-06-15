
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ToolbarPanel from './ToolbarPanel';
import { DataManager } from '../utils/dataManager';
import { CryptoManager } from '../utils/cryptoManager';

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
  separatorLevel?: number;
  separatorText?: string;
}

interface TabData {
  id: string;
  title: string;
  items: ListItem[];
  notes?: string;
}

const ListManager: React.FC = () => {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [toolbarOpen, setToolbarOpen] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dataManager] = useState(() => new DataManager());
  const [cryptoManager] = useState(() => new CryptoManager());

  useEffect(() => {
    initializeTabs();
  }, []);

  const initializeTabs = async () => {
    try {
      const savedTabs = await dataManager.getTabs();
      if (savedTabs.length === 0) {
        const defaultTabs: TabData[] = [
          { id: '1', title: 'Основной список', items: [], notes: '' },
          { id: '2', title: 'Выданные', items: [], notes: '' },
          { id: '3', title: 'Заметки', items: [], notes: '' }
        ];
        setTabs(defaultTabs);
        setActiveTab('1');
        await dataManager.saveTabs(defaultTabs);
      } else {
        setTabs(savedTabs);
        setActiveTab(savedTabs[0].id);
      }
    } catch (error) {
      console.error('Error initializing tabs:', error);
    }
  };

  const saveTabs = async () => {
    try {
      await dataManager.saveTabs(tabs);
    } catch (error) {
      console.error('Error saving tabs:', error);
    }
  };

  const addNewTab = () => {
    const newTab: TabData = {
      id: Date.now().toString(),
      title: `Вкладка ${tabs.length + 1}`,
      items: [],
      notes: ''
    };
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setActiveTab(newTab.id);
    saveTabs();
  };

  const duplicateTab = (tabId: string) => {
    const tabToDuplicate = tabs.find(tab => tab.id === tabId);
    if (tabToDuplicate) {
      const newTab: TabData = {
        ...tabToDuplicate,
        id: Date.now().toString(),
        title: `${tabToDuplicate.title} (копия)`,
        items: tabToDuplicate.items.map(item => ({ ...item, id: Date.now().toString() + Math.random() }))
      };
      const updatedTabs = [...tabs, newTab];
      setTabs(updatedTabs);
      saveTabs();
    }
  };

  const renameTab = (tabId: string, newTitle: string) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, title: newTitle } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const deleteTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(updatedTabs);
    if (activeTab === tabId) {
      setActiveTab(updatedTabs[0].id);
    }
    saveTabs();
  };

  const addListItem = (tabId: string, text: string = '') => {
    const newItem: ListItem = {
      id: Date.now().toString(),
      text,
      columns: ['', '', '', '', ''],
      checked: false,
      issued: false,
      type: 'item'
    };
    
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, items: [...tab.items, newItem] } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const addSeparator = (tabId: string, level: number) => {
    const newSeparator: ListItem = {
      id: Date.now().toString(),
      text: '',
      columns: [],
      checked: false,
      issued: false,
      type: 'separator',
      separatorLevel: level,
      separatorText: `Разделитель ${level} уровня`
    };
    
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, items: [...tab.items, newSeparator] } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const updateItem = (tabId: string, itemId: string, updates: Partial<ListItem>) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? {
        ...tab,
        items: tab.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const issueItems = (tabId: string, issuedTo: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const checkedItems = tab.items.filter(item => item.checked && item.type === 'item');
    const currentDate = new Date().toLocaleDateString('ru-RU');

    // Update items in current tab
    const updatedCurrentTab = {
      ...tab,
      items: tab.items.map(item =>
        item.checked && item.type === 'item'
          ? { ...item, issued: true, issuedTo, issuedDate: currentDate, checked: false }
          : item
      )
    };

    // Add items to "Выданные" tab
    const issuedTab = tabs.find(t => t.title === 'Выданные');
    let updatedTabs = tabs.map(t => t.id === tabId ? updatedCurrentTab : t);

    if (issuedTab) {
      const issuedItems = checkedItems.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random(),
        issued: true,
        issuedTo,
        issuedDate: currentDate,
        checked: false
      }));

      updatedTabs = updatedTabs.map(t =>
        t.id === issuedTab.id ? { ...t, items: [...t.items, ...issuedItems] } : t
      );
    }

    setTabs(updatedTabs);
    saveTabs();
  };

  const returnItems = (fromTabId: string, toTabId: string) => {
    const fromTab = tabs.find(t => t.id === fromTabId);
    const toTab = tabs.find(t => t.id === toTabId);
    if (!fromTab || !toTab) return;

    const checkedItems = fromTab.items.filter(item => item.checked);
    const currentDate = new Date().toLocaleDateString('ru-RU');

    // Remove from current tab
    const updatedFromTab = {
      ...fromTab,
      items: fromTab.items.filter(item => !item.checked)
    };

    // Update items in original tab
    const returnedItems = checkedItems.map(item => ({
      ...item,
      issued: false,
      returnedDate: currentDate,
      checked: false
    }));

    const updatedToTab = {
      ...toTab,
      items: toTab.items.map(originalItem => {
        const returnedItem = returnedItems.find(ri => 
          ri.text === originalItem.text && originalItem.issued
        );
        return returnedItem ? { ...originalItem, ...returnedItem } : originalItem;
      })
    };

    const updatedTabs = tabs.map(t => {
      if (t.id === fromTabId) return updatedFromTab;
      if (t.id === toTabId) return updatedToTab;
      return t;
    });

    setTabs(updatedTabs);
    saveTabs();
  };

  const exportData = async () => {
    try {
      const encrypted = await cryptoManager.encrypt(JSON.stringify(tabs));
      const dataStr = JSON.stringify({ data: encrypted, timestamp: Date.now() });
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `s-lists-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      const decrypted = await cryptoManager.decrypt(imported.data);
      const importedTabs = JSON.parse(decrypted);
      
      setTabs(importedTabs);
      setActiveTab(importedTabs[0]?.id || '');
      await saveTabs();
      alert('Данные успешно импортированы');
    } catch (error) {
      console.error('Import error:', error);
      alert('Ошибка при импорте данных');
    }
  };

  const getCurrentTab = () => tabs.find(tab => tab.id === activeTab);

  const filteredItems = (items: ListItem[]) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.columns?.some(col => col.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.separatorText && item.separatorText.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative group"
                onContextMenu={(e) => {
                  e.preventDefault();
                  // Show context menu for tab operations
                }}
              >
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              {/* Toolbar Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setToolbarOpen(prev => ({ ...prev, [tab.id]: !prev[tab.id] }))}
                >
                  ✓ {toolbarOpen[tab.id] ? 'Скрыть панель' : 'Показать панель'}
                </Button>
                
                {tab.title !== 'Заметки' && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        const checkedItems = tab.items.filter(item => item.checked);
                        if (checkedItems.length > 0) {
                          const issuedTo = prompt('Кому выдано?');
                          if (issuedTo) {
                            issueItems(tab.id, issuedTo);
                          }
                        }
                      }}
                      disabled={!tab.items.some(item => item.checked)}
                    >
                      Выдать
                    </Button>
                    <Button variant="outline">Копировать</Button>
                    <Button variant="outline">Сохранить как</Button>
                  </div>
                )}
              </div>

              {/* Toolbar Panel */}
              {toolbarOpen[tab.id] && (
                <ToolbarPanel
                  tabId={tab.id}
                  onAddItem={addListItem}
                  onAddSeparator={addSeparator}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              )}

              {/* Content */}
              {tab.title === 'Заметки' ? (
                <Card>
                  <CardContent className="p-4">
                    <textarea
                      className="w-full h-96 p-4 border rounded-lg resize-none"
                      placeholder="Введите ваши заметки здесь..."
                      value={tab.notes || ''}
                      onChange={(e) => {
                        const updatedTabs = tabs.map(t =>
                          t.id === tab.id ? { ...t, notes: e.target.value } : t
                        );
                        setTabs(updatedTabs);
                        saveTabs();
                      }}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {filteredItems(tab.items).map((item, index) => (
                        <div key={item.id}>
                          {item.type === 'separator' ? (
                            <div className={`flex items-center space-x-2 py-2 px-3 rounded-lg bg-gray-${100 + (item.separatorLevel || 1) * 50} border-l-4 border-blue-${300 + (item.separatorLevel || 1) * 100}`}>
                              <Badge variant="secondary">
                                Уровень {item.separatorLevel}
                              </Badge>
                              <input
                                type="text"
                                value={item.separatorText || ''}
                                onChange={(e) => updateItem(tab.id, item.id, { separatorText: e.target.value })}
                                className="flex-1 bg-transparent border-none outline-none font-medium"
                                placeholder="Название разделителя"
                              />
                            </div>
                          ) : (
                            <div className={`flex items-center space-x-2 p-2 rounded-lg border ${item.issued ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}>
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={(checked) => 
                                  updateItem(tab.id, item.id, { checked: Boolean(checked) })
                                }
                              />
                              <span className="w-8 text-sm text-gray-500">
                                {tab.items.filter(i => i.type === 'item').indexOf(item) + 1}
                              </span>
                              <div className="flex-1 grid grid-cols-5 gap-2">
                                {item.columns.map((col, colIndex) => (
                                  <input
                                    key={colIndex}
                                    type="text"
                                    value={col}
                                    onChange={(e) => {
                                      const newColumns = [...item.columns];
                                      newColumns[colIndex] = e.target.value;
                                      updateItem(tab.id, item.id, { columns: newColumns });
                                    }}
                                    className="p-1 border rounded text-sm"
                                    placeholder={`Колонка ${colIndex + 1}`}
                                  />
                                ))}
                              </div>
                              {item.issuedTo && (
                                <div className="text-xs text-gray-500">
                                  <div>Выдано: {item.issuedTo}</div>
                                  <div>{item.issuedDate}</div>
                                  {item.returnedDate && <div>Возвращено: {item.returnedDate}</div>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Return Button for Issued Items Tab */}
              {tab.title === 'Выданные' && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      const originalTab = tabs.find(t => t.title === 'Основной список');
                      if (originalTab) {
                        returnItems(tab.id, originalTab.id);
                      }
                    }}
                    disabled={!tab.items.some(item => item.checked)}
                  >
                    Сдать
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Add Tab Button */}
        <Button
          onClick={addNewTab}
          className="fixed bottom-4 right-4 rounded-full w-12 h-12"
          size="sm"
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default ListManager;
