import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ToolbarPanel from './ToolbarPanel';
import SeparatorDropdown from './SeparatorDropdown';
import ArchiveRecord from './ArchiveRecord';
import EditableColumn from './EditableColumn';
import ExportImportPanel from './ExportImportPanel';
import CopySavePanel from './CopySavePanel';
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
  originalRowNumber?: number;
  collapsed?: boolean;
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
  globalColumnWidths?: number[];
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
  const [focusedColumnIndex, setFocusedColumnIndex] = useState<number>();
  const [focusedItemId, setFocusedItemId] = useState<string>();

  useEffect(() => {
    initializeTabs();
  }, []);

  const initializeTabs = async () => {
    try {
      const savedTabs = await dataManager.getTabs();
      if (savedTabs.length === 0) {
        const defaultTabs: TabData[] = [
          { id: '1', title: 'Основной список', items: [], notes: '', archive: [], globalColumnWidths: [200, 200, 200, 200] },
          { id: '2', title: 'Выданные', items: [], notes: '', archive: [], globalColumnWidths: [200, 200, 200, 200] },
          { id: '3', title: 'Заметки', items: [], notes: '', archive: [], globalColumnWidths: [200, 200, 200, 200] },
          { id: '4', title: 'Архив', items: [], notes: '', archive: [], globalColumnWidths: [200, 200, 200, 200] }
        ];
        setTabs(defaultTabs);
        setActiveTab('1');
        await dataManager.saveTabs(defaultTabs);
      } else {
        const orderedTabs = [
          { ...savedTabs.find(t => t.id === '1') || { id: '1', items: [], notes: '', archive: [] }, title: 'Основной список' },
          { ...savedTabs.find(t => t.id === '2') || { id: '2', items: [], notes: '', archive: [] }, title: 'Выданные' },
          { ...savedTabs.find(t => t.id === '3') || { id: '3', items: [], notes: '', archive: [] }, title: 'Заметки' },
          { ...savedTabs.find(t => t.id === '4') || { id: '4', items: [], notes: '', archive: [] }, title: 'Архив' }
        ].map(tab => ({
          ...tab,
          globalColumnWidths: tab.globalColumnWidths || [200, 200, 200, 200]
        }));
        setTabs(orderedTabs);
        setActiveTab('1');
      }
    } catch (error) {
      console.error('Error initializing tabs:', error);
    }
  };

  const saveTabs = useCallback(async () => {
    try {
      await dataManager.saveTabs(tabs);
    } catch (error) {
      console.error('Error saving tabs:', error);
    }
  }, [tabs, dataManager]);

  useEffect(() => {
    if (tabs.length > 0) {
      saveTabs();
    }
  }, [tabs, saveTabs]);

  const addListItem = (tabId: string, text: string = '') => {
    const newItem: ListItem = {
      id: Date.now().toString(),
      text,
      columns: ['', '', '', ''],
      checked: false,
      issued: false,
      type: 'item',
      bold: false,
      italic: false,
      strikethrough: false,
      fontSize: 14,
      textColor: '#000000'
    };
    
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, items: [...tab.items, newItem] } : tab
    ));
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
      separatorAlign: 'left',
      collapsed: false
    };
    
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, items: [...tab.items, newSeparator] } : tab
    ));
  };

  const updateItem = (tabId: string, itemId: string, updates: Partial<ListItem>) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? {
        ...tab,
        items: tab.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      } : tab
    ));
  };

  const deleteSelected = (tabId: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? {
        ...tab,
        items: tab.items.filter(item => !item.checked)
      } : tab
    ));
  };

  const moveItem = (tabId: string, fromIndex: number, toIndex: number) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id !== tabId) return tab;
      
      const newItems = [...tab.items];
      const [moved] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, moved);
      
      return { ...tab, items: newItems };
    }));
  };

  const issueItems = (tabId: string, issuedTo: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const checkedItems = tab.items.filter(item => item.checked && item.type === 'item');
    const currentDate = new Date().toLocaleDateString('ru-RU');

    const itemsWithRowNumbers = checkedItems.map(checkedItem => {
      const itemIndex = tab.items.filter(i => i.type === 'item').indexOf(checkedItem);
      return {
        ...checkedItem,
        originalRowNumber: itemIndex + 1
      };
    });

    const rowNumbers = itemsWithRowNumbers.map(item => item.originalRowNumber);
    const archiveEntry: ArchiveEntry = {
      id: Date.now().toString(),
      items: `№ ${rowNumbers.join(', ')}`,
      issuedTo,
      issuedDate: currentDate
    };

    setTabs(prev => {
      const updatedTabs = prev.map(t => {
        if (t.id === tabId) {
          return {
            ...t,
            items: t.items.map(item =>
              item.checked && item.type === 'item'
                ? { ...item, issued: true, issuedTo, issuedDate: currentDate, checked: false }
                : item
            )
          };
        }
        
        if (t.title === 'Выданные') {
          const issuedItems = itemsWithRowNumbers.map(item => ({
            ...item,
            id: Date.now().toString() + Math.random(),
            issued: true,
            issuedTo,
            issuedDate: currentDate,
            checked: false
          }));
          
          return { ...t, items: [...t.items, ...issuedItems] };
        }
        
        if (t.title === 'Архив') {
          return { ...t, archive: [...(t.archive || []), archiveEntry] };
        }
        
        return t;
      });
      
      return updatedTabs;
    });
  };

  const returnItems = (fromTabId: string, toTabId: string) => {
    const fromTab = tabs.find(t => t.id === fromTabId);
    const toTab = tabs.find(t => t.id === toTabId);
    const archiveTab = tabs.find(t => t.title === 'Архив');
    
    if (!fromTab || !toTab) return;

    const checkedItems = fromTab.items.filter(item => item.checked);
    const currentDate = new Date().toLocaleDateString('ru-RU');

    setTabs(prev => prev.map(t => {
      if (t.id === fromTabId) {
        return { ...t, items: t.items.filter(item => !item.checked) };
      }
      
      if (t.id === toTabId) {
        return {
          ...t,
          items: t.items.map(originalItem => {
            if (originalItem.type !== 'item') return originalItem;
            
            const itemIndex = t.items.filter(i => i.type === 'item').indexOf(originalItem);
            const currentRowNumber = itemIndex + 1;
            
            const returnedItem = checkedItems.find(ri => ri.originalRowNumber === currentRowNumber);
            
            if (returnedItem && originalItem.issued) {
              return {
                ...originalItem,
                issued: false,
                returnedDate: currentDate,
                checked: false,
                issuedTo: undefined,
                issuedDate: undefined
              };
            }
            return originalItem;
          })
        };
      }
      
      if (t.id === archiveTab?.id) {
        const updatedArchive = t.archive?.map(entry => {
          if (checkedItems.some(item => item.issuedTo === entry.issuedTo && item.issuedDate === entry.issuedDate)) {
            return { ...entry, returnedDate: currentDate };
          }
          return entry;
        }) || [];
        
        return { ...t, archive: updatedArchive };
      }
      
      return t;
    }));
  };

  const clearArchive = () => {
    setTabs(prev => prev.map(t =>
      t.id === '4' ? { ...t, archive: [] } : t
    ));
    setClearArchiveDialogOpen(false);
  };

  const deleteItem = (tabId: string, itemId: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? {
        ...tab,
        items: tab.items.filter(item => item.id !== itemId)
      } : tab
    ));
  };

  const updateItemColumn = (tabId: string, itemId: string, columnIndex: number, value: string, style?: ColumnStyle) => {
    setTabs(prev => prev.map(tab =>
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
    ));
  };

  const updateGlobalColumnWidth = (tabId: string, columnIndex: number, width: number) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? {
        ...tab,
        globalColumnWidths: tab.globalColumnWidths?.map((w, i) => i === columnIndex ? width : w) || [200, 200, 200, 200]
      } : tab
    ));
  };

  const updateColumnStyle = (columnIndex: number, style: ColumnStyle) => {
    if (focusedItemId && activeTab) {
      setTabs(prev => prev.map(tab =>
        tab.id === activeTab ? {
          ...tab,
          items: tab.items.map(item => {
            if (item.id === focusedItemId) {
              const newColumnStyles = item.columnStyles ? [...item.columnStyles] : [];
              newColumnStyles[columnIndex] = { ...newColumnStyles[columnIndex], ...style };
              return { ...item, columnStyles: newColumnStyles };
            }
            return item;
          })
        } : tab
      ));
    }
  };

  const toggleSeparatorCollapse = (tabId: string, separatorId: string) => {
    updateItem(tabId, separatorId, { collapsed: !tabs.find(t => t.id === tabId)?.items.find(i => i.id === separatorId)?.collapsed });
  };

  const handleTabRename = () => {
    setTabs(prev => prev.map(tab =>
      tab.id === renamingTabId ? { ...tab, title: newTabTitle } : tab
    ));
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

  const renderVisibleItems = (items: ListItem[]) => {
    const result: ListItem[] = [];
    let currentSeparator: ListItem | null = null;
    
    for (const item of items) {
      if (item.type === 'separator') {
        result.push(item);
        currentSeparator = item;
      } else {
        if (!currentSeparator || !currentSeparator.collapsed) {
          result.push(item);
        }
      }
    }
    
    return result;
  };

  const handleColumnFocus = (itemId: string, columnIndex: number) => {
    setFocusedItemId(itemId);
    setFocusedColumnIndex(columnIndex);
  };

  const handleImportTabs = (importedTabs: TabData[]) => {
    const orderedTabs = [
      { ...importedTabs.find(t => t.id === '1') || { id: '1', items: [], notes: '', archive: [] }, title: 'Основной список' },
      { ...importedTabs.find(t => t.id === '2') || { id: '2', items: [], notes: '', archive: [] }, title: 'Выданные' },
      { ...importedTabs.find(t => t.id === '3') || { id: '3', items: [], notes: '', archive: [] }, title: 'Заметки' },
      { ...importedTabs.find(t => t.id === '4') || { id: '4', items: [], notes: '', archive: [] }, title: 'Архив' }
    ].map(tab => ({
      ...tab,
      globalColumnWidths: tab.globalColumnWidths || [200, 200, 200, 200]
    }));
    
    setTabs(orderedTabs);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-2 sm:p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-2 sm:mb-4">
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
                    className="text-xs sm:text-sm"
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
            <TabsContent key={tab.id} value={tab.id} className="space-y-2 sm:space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {(tab.id === '1' || tab.id === '3') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setToolbarOpen(prev => ({ ...prev, [tab.id]: !prev[tab.id] }))}
                      className="text-xs px-2 sm:px-3"
                    >
                      <div className="flex flex-col gap-0.5 w-3 h-3">
                        <div className="w-full h-0.5 bg-current"></div>
                        <div className="w-full h-0.5 bg-current"></div>
                        <div className="w-full h-0.5 bg-current"></div>
                      </div>
                      <span className="ml-2 hidden sm:inline">Панель</span>
                    </Button>
                  )}
                </div>
                
                {tab.id === '4' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setClearArchiveDialogOpen(true)}
                    className="text-xs px-2 sm:px-3"
                  >
                    Очистить архив
                  </Button>
                )}
                
                {(tab.id === '1' || tab.id === '2') && (
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {tab.id === '1' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const checkedItems = tab.items.filter(item => item.checked);
                          if (checkedItems.length > 0) {
                            setIssueDialogOpen(true);
                          }
                        }}
                        disabled={!tab.items.some(item => item.checked)}
                        className="text-xs px-2 sm:px-3"
                      >
                        Выдать
                      </Button>
                    )}
                    {tab.id === '2' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const originalTab = tabs.find(t => t.id === '1');
                          if (originalTab) {
                            returnItems(tab.id, originalTab.id);
                          }
                        }}
                        disabled={!tab.items.some(item => item.checked)}
                        className="text-xs px-2 sm:px-3"
                      >
                        Сдать
                      </Button>
                    )}
                    <CopySavePanel 
                      currentTab={tab}
                      selectedItems={tab.items.filter(item => item.checked)}
                    />
                  </div>
                )}
              </div>

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
                  focusedColumnIndex={focusedColumnIndex}
                  onUpdateColumnStyle={updateColumnStyle}
                  tabs={tabs}
                  onImportTabs={handleImportTabs}
                />
              )}

              {tab.id === '3' ? (
                <Card>
                  <CardContent className="p-2 sm:p-4">
                    <textarea
                      className="w-full h-64 sm:h-96 p-2 sm:p-4 border rounded-lg resize-none text-sm sm:text-base"
                      placeholder="Введите ваши заметки здесь..."
                      value={tab.notes || ''}
                      onChange={(e) => {
                        setTabs(prev => prev.map(t =>
                          t.id === tab.id ? { ...t, notes: e.target.value } : t
                        ));
                      }}
                      style={{
                        fontFamily: 'inherit',
                        lineHeight: '1.5'
                      }}
                    />
                  </CardContent>
                </Card>
              ) : tab.id === '4' ? (
                <ArchiveRecord archive={tab.archive || []} />
              ) : (
                <Card>
                  <CardContent className="p-2 sm:p-4">
                    <div className="space-y-1 sm:space-y-2">
                      {renderVisibleItems(filteredItems(tab.items)).map((item, index) => (
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
                              className="flex items-center space-x-1 sm:space-x-2 py-1 sm:py-2 px-2 sm:px-3 rounded-lg border-l-4"
                              style={{ 
                                backgroundColor: item.separatorColor || '#e5e7eb',
                                borderLeftColor: item.separatorColor || '#6b7280'
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSeparatorCollapse(tab.id, item.id)}
                                className="p-0 h-auto"
                              >
                                {item.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                              </Button>
                              <div 
                                className="flex-1 font-medium text-sm sm:text-base"
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
                            <div className={`flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg border ${item.issued ? 'bg-gray-200 text-gray-500' : 'bg-white'}`}>
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={(checked) => 
                                  updateItem(tab.id, item.id, { checked: Boolean(checked) })
                                }
                              />
                              <span className="w-6 sm:w-8 text-xs sm:text-sm text-gray-500">
                                {tab.id === '2' && item.originalRowNumber ? 
                                  item.originalRowNumber : 
                                  tab.items.filter(i => i.type === 'item').indexOf(item) + 1
                                }
                              </span>
                              <div className="flex-1 flex gap-1 sm:gap-2">
                                {item.columns.map((col, colIndex) => (
                                  <EditableColumn
                                    key={colIndex}
                                    value={col}
                                    onChange={(value, style) => updateItemColumn(tab.id, item.id, colIndex, value, style)}
                                    style={item.columnStyles?.[colIndex]}
                                    disabled={item.issued}
                                    width={tab.globalColumnWidths?.[colIndex] || 200}
                                    onWidthChange={(width) => updateGlobalColumnWidth(tab.id, colIndex, width)}
                                    columnIndex={colIndex}
                                    onFocus={() => handleColumnFocus(item.id, colIndex)}
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
