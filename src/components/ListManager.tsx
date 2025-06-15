import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import ToolbarPanel from './ToolbarPanel';
import SeparatorDropdown from './SeparatorDropdown';
import ArchiveRecord from './ArchiveRecord';
import EditableColumn from './EditableColumn';
import { DataManager } from '../utils/dataManager';
import { CryptoManager } from '../utils/cryptoManager';

interface ColumnStyle {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  textColor?: string;
}

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
  columnStyles?: ColumnStyle[];
  columnWidths?: number[];
}

interface ArchiveEntry {
  id: string;
  items: string;
  issuedTo: string;
  issuedDate: string;
  returnedDate?: string;
}

interface TabData {
  id: string;
  title: string;
  items: ListItem[];
  notes?: string;
  archive?: ArchiveEntry[];
}

const ListManager: React.FC = () => {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [toolbarOpen, setToolbarOpen] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dataManager] = useState(() => new DataManager());
  const [cryptoManager] = useState(() => new CryptoManager());
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingTabId, setRenamingTabId] = useState<string>('');
  const [newTabTitle, setNewTabTitle] = useState('');
  const [clearArchiveDialogOpen, setClearArchiveDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issuedTo, setIssuedTo] = useState('');

  useEffect(() => {
    initializeTabs();
  }, []);

  const initializeTabs = async () => {
    try {
      const savedTabs = await dataManager.getTabs();
      if (savedTabs.length === 0) {
        const defaultTabs: TabData[] = [
          { id: '1', title: 'Основной список', items: [], notes: '', archive: [] },
          { id: '2', title: 'Выданные', items: [], notes: '', archive: [] },
          { id: '3', title: 'Заметки', items: [], notes: '', archive: [] },
          { id: '4', title: 'Архив', items: [], notes: '', archive: [] }
        ];
        setTabs(defaultTabs);
        setActiveTab('1');
        await dataManager.saveTabs(defaultTabs);
      } else {
        // Ensure correct tab order and titles
        const orderedTabs = [
          { ...savedTabs.find(t => t.id === '1') || { id: '1', items: [], notes: '', archive: [] }, title: 'Основной список' },
          { ...savedTabs.find(t => t.id === '2') || { id: '2', items: [], notes: '', archive: [] }, title: 'Выданные' },
          { ...savedTabs.find(t => t.id === '3') || { id: '3', items: [], notes: '', archive: [] }, title: 'Заметки' },
          { ...savedTabs.find(t => t.id === '4') || { id: '4', items: [], notes: '', archive: [] }, title: 'Архив' }
        ];
        setTabs(orderedTabs);
        setActiveTab('1');
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

  const addListItem = (tabId: string, text: string = '') => {
    const newItem: ListItem = {
      id: Date.now().toString(),
      text,
      columns: ['', '', '', '', ''],
      checked: false,
      issued: false,
      type: 'item',
      bold: false,
      italic: false,
      strikethrough: false,
      fontSize: 14,
      textColor: '#000000'
    };
    
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, items: [...tab.items, newItem] } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const addSeparator = (tabId: string) => {
    const newSeparator: ListItem = {
      id: Date.now().toString(),
      text: '',
      columns: [],
      checked: false,
      issued: false,
      type: 'separator',
      separatorText: 'Новый разделитель',
      separatorColor: '#e5e7eb',
      separatorAlign: 'left'
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

  const deleteSelected = (tabId: string) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? {
        ...tab,
        items: tab.items.filter(item => !item.checked)
      } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const moveItem = (tabId: string, fromIndex: number, toIndex: number) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const newItems = [...tab.items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);

    const updatedTabs = tabs.map(t =>
      t.id === tabId ? { ...t, items: newItems } : t
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const issueItems = (tabId: string, issuedTo: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const checkedItems = tab.items.filter(item => item.checked && item.type === 'item');
    const currentDate = new Date().toLocaleDateString('ru-RU');

    // Create archive entry
    const itemNumbers = checkedItems.map((_, index) => 
      tab.items.filter(i => i.type === 'item').indexOf(checkedItems[index]) + 1
    );
    
    const archiveEntry: ArchiveEntry = {
      id: Date.now().toString(),
      items: `№ ${itemNumbers.join(', ')}`,
      issuedTo,
      issuedDate: currentDate
    };

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
    const archiveTab = tabs.find(t => t.title === 'Архив');
    
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

    // Add to archive
    if (archiveTab) {
      updatedTabs = updatedTabs.map(t =>
        t.id === archiveTab.id ? { ...t, archive: [...(t.archive || []), archiveEntry] } : t
      );
    }

    setTabs(updatedTabs);
    saveTabs();
  };

  const returnItems = (fromTabId: string, toTabId: string) => {
    const fromTab = tabs.find(t => t.id === fromTabId);
    const toTab = tabs.find(t => t.id === toTabId);
    const archiveTab = tabs.find(t => t.title === 'Архив');
    
    if (!fromTab || !toTab) return;

    const checkedItems = fromTab.items.filter(item => item.checked);
    const currentDate = new Date().toLocaleDateString('ru-RU');

    // Update archive with return date
    if (archiveTab) {
      const updatedArchive = archiveTab.archive?.map(entry => {
        if (checkedItems.some(item => item.issuedTo === entry.issuedTo && item.issuedDate === entry.issuedDate)) {
          return { ...entry, returnedDate: currentDate };
        }
        return entry;
      }) || [];

      const updatedTabs = tabs.map(t => {
        if (t.id === fromTabId) {
          return { ...t, items: t.items.filter(item => !item.checked) };
        }
        if (t.id === toTabId) {
          const returnedItems = checkedItems.map(item => ({
            ...item,
            issued: false,
            returnedDate: currentDate,
            checked: false
          }));
          return {
            ...t,
            items: t.items.map(originalItem => {
              const returnedItem = returnedItems.find(ri => 
                ri.text === originalItem.text && originalItem.issued
              );
              return returnedItem ? { ...originalItem, ...returnedItem } : originalItem;
            })
          };
        }
        if (t.id === archiveTab.id) {
          return { ...t, archive: updatedArchive };
        }
        return t;
      });

      setTabs(updatedTabs);
      saveTabs();
    }
  };

  const clearArchive = () => {
    const archiveTab = tabs.find(t => t.id === '4');
    if (archiveTab) {
      const updatedTabs = tabs.map(t =>
        t.id === '4' ? { ...t, archive: [] } : t
      );
      setTabs(updatedTabs);
      saveTabs();
    }
    setClearArchiveDialogOpen(false);
  };

  const deleteItem = (tabId: string, itemId: string) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? {
        ...tab,
        items: tab.items.filter(item => item.id !== itemId)
      } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const updateItemColumn = (tabId: string, itemId: string, columnIndex: number, value: string, style?: ColumnStyle) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? {
        ...tab,
        items: tab.items.map(item => {
          if (item.id === itemId) {
            const newColumns = [...item.columns];
            newColumns[columnIndex] = value;
            
            const newColumnStyles = item.columnStyles ? [...item.columnStyles] : [];
            if (style) {
              newColumnStyles[columnIndex] = style;
            }
            
            return { ...item, columns: newColumns, columnStyles: newColumnStyles };
          }
          return item;
        })
      } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const updateColumnWidth = (tabId: string, itemId: string, columnIndex: number, width: number) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? {
        ...tab,
        items: tab.items.map(item => {
          if (item.id === itemId) {
            const newColumnWidths = item.columnWidths ? [...item.columnWidths] : [200, 200, 200, 200, 200];
            newColumnWidths[columnIndex] = width;
            return { ...item, columnWidths: newColumnWidths };
          }
          return item;
        })
      } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
  };

  const handleTabRename = () => {
    const updatedTabs = tabs.map(tab =>
      tab.id === renamingTabId ? { ...tab, title: newTabTitle } : tab
    );
    setTabs(updatedTabs);
    saveTabs();
    setRenameDialogOpen(false);
    setRenamingTabId('');
    setNewTabTitle('');
  };

  const openRenameDialog = (tabId: string, currentTitle: string) => {
    setRenamingTabId(tabId);
    setNewTabTitle(currentTitle);
    setRenameDialogOpen(true);
  };

  const handleIssueItems = () => {
    if (issuedTo.trim()) {
      issueItems(activeTab, issuedTo.trim());
      setIssueDialogOpen(false);
      setIssuedTo('');
    }
  };

  const getCurrentTab = () => tabs.find(tab => tab.id === activeTab);

  const filteredItems = (items: ListItem[]) => {
    if (!searchTerm) return items;
    
    // Поддержка поиска по тегам
    if (searchTerm.includes('#')) {
      const tag = searchTerm.toLowerCase();
      return items.filter(item => {
        if (item.type === 'separator' && item.separatorText) {
          return item.separatorText.toLowerCase().includes(tag);
        }
        return item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.columns?.some(col => col.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }
    
    return items.filter(item =>
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.columns?.some(col => col.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.separatorText && item.separatorText.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleDragStart = (e: React.DragEvent, itemId: string, index: number) => {
    setDraggedItem(itemId);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex && activeTab) {
      moveItem(activeTab, dragIndex, dropIndex);
    }
    setDraggedItem(null);
  };

  const getItemStyle = (item: ListItem) => {
    let style: React.CSSProperties = {};
    if (item.bold) style.fontWeight = 'bold';
    if (item.italic) style.fontStyle = 'italic';
    if (item.strikethrough) style.textDecoration = 'line-through';
    if (item.fontSize) style.fontSize = `${item.fontSize}px`;
    if (item.textColor) style.color = item.textColor;
    return style;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            {tabs.map(tab => (
              <ContextMenu key={tab.id}>
                <ContextMenuTrigger asChild>
                  <TabsTrigger 
                    value={tab.id}
                    onTouchStart={(e) => {
                      const timer = setTimeout(() => {
                        openRenameDialog(tab.id, tab.title);
                      }, 500);
                      e.currentTarget.dataset.timer = timer.toString();
                    }}
                    onTouchEnd={(e) => {
                      const timer = e.currentTarget.dataset.timer;
                      if (timer) clearTimeout(parseInt(timer));
                    }}
                  >
                    {tab.title}
                  </TabsTrigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => openRenameDialog(tab.id, tab.title)}>
                    Переименовать
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TabsList>

          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              {/* Control buttons */}
              <div className="flex items-center justify-between">
                {/* Show toolbar toggle only for main list and notes tabs */}
                {(tab.id === '1' || tab.id === '3') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setToolbarOpen(prev => ({ ...prev, [tab.id]: !prev[tab.id] }))}
                  >
                    ✓ {toolbarOpen[tab.id] ? 'Скрыть панель' : 'Показать панель'}
                  </Button>
                )}
                
                {/* Archive clear button */}
                {tab.id === '4' && (
                  <Button
                    variant="destructive"
                    onClick={() => setClearArchiveDialogOpen(true)}
                  >
                    Очистить архив
                  </Button>
                )}
                
                {/* Action buttons for main list and issued tabs */}
                {(tab.id === '1' || tab.id === '2') && (
                  <div className="flex space-x-2">
                    {tab.id === '1' && (
                      <Button
                        onClick={() => {
                          const checkedItems = tab.items.filter(item => item.checked);
                          if (checkedItems.length > 0) {
                            setIssueDialogOpen(true);
                          }
                        }}
                        disabled={!tab.items.some(item => item.checked)}
                      >
                        Выдать
                      </Button>
                    )}
                    {tab.id === '2' && (
                      <Button
                        onClick={() => {
                          const originalTab = tabs.find(t => t.id === '1');
                          if (originalTab) {
                            returnItems(tab.id, originalTab.id);
                          }
                        }}
                        disabled={!tab.items.some(item => item.checked)}
                      >
                        Сдать
                      </Button>
                    )}
                    <Button variant="outline">Копировать</Button>
                    <Button variant="outline">Сохранить как</Button>
                  </div>
                )}
              </div>

              {/* Toolbar Panel - only for main list and notes */}
              {(tab.id === '1' || tab.id === '3') && toolbarOpen[tab.id] && (
                <ToolbarPanel
                  tabId={tab.id}
                  onAddItem={addListItem}
                  onAddSeparator={addSeparator}
                  onDeleteSelected={deleteSelected}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedItems={tab.items.filter(item => item.checked)}
                  onUpdateItem={updateItem}
                  items={tab.items}
                />
              )}

              {/* Content */}
              {tab.id === '3' ? (
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
              ) : tab.id === '4' ? (
                <ArchiveRecord archive={tab.archive || []} />
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {filteredItems(tab.items).map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className={`cursor-move ${draggedItem === item.id ? 'opacity-50' : ''}`}
                        >
                          {item.type === 'separator' ? (
                            <div 
                              className="flex items-center space-x-2 py-2 px-3 rounded-lg border-l-4"
                              style={{ 
                                backgroundColor: item.separatorColor || '#e5e7eb',
                                borderLeftColor: item.separatorColor || '#6b7280'
                              }}
                            >
                              <div 
                                className="flex-1 font-medium"
                                style={{ textAlign: item.separatorAlign || 'left' }}
                              >
                                {item.separatorText}
                              </div>
                              <SeparatorDropdown
                                item={item}
                                tabId={tab.id}
                                onUpdate={updateItem}
                                onDelete={deleteItem}
                              />
                            </div>
                          ) : (
                            <div className={`flex items-center space-x-2 p-2 rounded-lg border ${item.issued ? 'bg-gray-200 text-gray-500' : 'bg-white'}`}>
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={(checked) => 
                                  updateItem(tab.id, item.id, { checked: Boolean(checked) })
                                }
                              />
                              <span className="w-8 text-sm text-gray-500">
                                {tab.items.filter(i => i.type === 'item').indexOf(item) + 1}
                              </span>
                              <div className="flex-1 flex gap-2">
                                {item.columns.map((col, colIndex) => (
                                  <EditableColumn
                                    key={colIndex}
                                    value={col}
                                    onChange={(value, style) => updateItemColumn(tab.id, item.id, colIndex, value, style)}
                                    style={item.columnStyles?.[colIndex]}
                                    disabled={item.issued}
                                    width={item.columnWidths?.[colIndex] || 200}
                                    onWidthChange={(width) => updateColumnWidth(tab.id, item.id, colIndex, width)}
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
            </TabsContent>
          ))}
        </Tabs>

        {/* Rename Tab Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Переименовать вкладку</DialogTitle>
            </DialogHeader>
            <Input
              value={newTabTitle}
              onChange={(e) => setNewTabTitle(e.target.value)}
              placeholder="Введите новое название"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleTabRename}>
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Archive Dialog */}
        <Dialog open={clearArchiveDialogOpen} onOpenChange={setClearArchiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Очистить архив</DialogTitle>
            </DialogHeader>
            <p>Вы уверены, что хотите очистить все данные архива? Это действие нельзя отменить.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClearArchiveDialogOpen(false)}>
                Отмена
              </Button>
              <Button variant="destructive" onClick={clearArchive}>
                Очистить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Issue Items Dialog */}
        <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выдать предметы</DialogTitle>
            </DialogHeader>
            <Input
              value={issuedTo}
              onChange={(e) => setIssuedTo(e.target.value)}
              placeholder="Кому выдано?"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleIssueItems}>
                Выдать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ListManager;
