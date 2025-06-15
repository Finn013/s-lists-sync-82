import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle } from 'lucide-react';
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
  const [instructionDialogOpen, setInstructionDialogOpen] = useState(false);

  const applyFormatting = (format: keyof ListItem, value?: any) => {
    if (focusedColumnIndex !== undefined && onUpdateColumnStyle) {
      // Apply formatting to focused column
      const updates: any = {};
      
      if (format === 'bold') {
        updates.bold = !updates.bold; // Toggle
      } else if (format === 'italic') {
        updates.italic = !updates.italic; // Toggle
      } else if (format === 'strikethrough') {
        updates.strikethrough = !updates.strikethrough; // Toggle
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
    const fullText = textarea.value;
    
    if (start === end) return;
    
    const selectedText = textarea.value.substring(start, end);
    let newText = fullText;
    let newStart = start;
    let newEnd = end;
    
    // Логика переключения форматирования для заметок
    switch (format) {
      case 'bold':
        if (selectedText.startsWith('**') && selectedText.endsWith('**') && selectedText.length > 4) {
          // Убираем форматирование
          const unformattedText = selectedText.slice(2, -2);
          newText = fullText.substring(0, start) + unformattedText + fullText.substring(end);
          newStart = start;
          newEnd = start + unformattedText.length;
        } else {
          // Проверяем, окружен ли текст форматированием
          const beforeText = fullText.substring(Math.max(0, start - 2), start);
          const afterText = fullText.substring(end, Math.min(fullText.length, end + 2));
          
          if (beforeText === '**' && afterText === '**') {
            // Убираем окружающее форматирование
            newText = fullText.substring(0, start - 2) + selectedText + fullText.substring(end + 2);
            newStart = start - 2;
            newEnd = end - 2;
          } else {
            // Добавляем форматирование
            const formattedText = `**${selectedText}**`;
            newText = fullText.substring(0, start) + formattedText + fullText.substring(end);
            newStart = start + 2;
            newEnd = end + 2;
          }
        }
        break;
        
      case 'italic':
        if (selectedText.startsWith('*') && selectedText.endsWith('*') && selectedText.length > 2 && !selectedText.startsWith('**')) {
          // Убираем форматирование
          const unformattedText = selectedText.slice(1, -1);
          newText = fullText.substring(0, start) + unformattedText + fullText.substring(end);
          newStart = start;
          newEnd = start + unformattedText.length;
        } else {
          // Проверяем, окружен ли текст форматированием
          const beforeText = fullText.substring(Math.max(0, start - 1), start);
          const afterText = fullText.substring(end, Math.min(fullText.length, end + 1));
          
          if (beforeText === '*' && afterText === '*' && 
              fullText.substring(Math.max(0, start - 2), start) !== '**' &&
              fullText.substring(end, Math.min(fullText.length, end + 2)) !== '**') {
            // Убираем окружающее форматирование
            newText = fullText.substring(0, start - 1) + selectedText + fullText.substring(end + 1);
            newStart = start - 1;
            newEnd = end - 1;
          } else {
            // Добавляем форматирование
            const formattedText = `*${selectedText}*`;
            newText = fullText.substring(0, start) + formattedText + fullText.substring(end);
            newStart = start + 1;
            newEnd = end + 1;
          }
        }
        break;
        
      case 'strikethrough':
        if (selectedText.startsWith('~~') && selectedText.endsWith('~~') && selectedText.length > 4) {
          // Убираем форматирование
          const unformattedText = selectedText.slice(2, -2);
          newText = fullText.substring(0, start) + unformattedText + fullText.substring(end);
          newStart = start;
          newEnd = start + unformattedText.length;
        } else {
          // Проверяем, окружен ли текст форматированием
          const beforeText = fullText.substring(Math.max(0, start - 2), start);
          const afterText = fullText.substring(end, Math.min(fullText.length, end + 2));
          
          if (beforeText === '~~' && afterText === '~~') {
            // Убираем окружающее форматирование
            newText = fullText.substring(0, start - 2) + selectedText + fullText.substring(end + 2);
            newStart = start - 2;
            newEnd = end - 2;
          } else {
            // Добавляем форматирование
            const formattedText = `~~${selectedText}~~`;
            newText = fullText.substring(0, start) + formattedText + fullText.substring(end);
            newStart = start + 2;
            newEnd = end + 2;
          }
        }
        break;
        
      case 'fontSize':
        if (value === 'increase') {
          if (selectedText.startsWith('### ')) {
            // Убираем ### и делаем ##
            const newFormattedText = `## ${selectedText.slice(4)}`;
            newText = fullText.substring(0, start) + newFormattedText + fullText.substring(end);
            newStart = start + 3;
            newEnd = start + newFormattedText.length - 3;
          } else if (selectedText.startsWith('## ')) {
            // Убираем ## и делаем #
            const newFormattedText = `# ${selectedText.slice(3)}`;
            newText = fullText.substring(0, start) + newFormattedText + fullText.substring(end);
            newStart = start + 2;
            newEnd = start + newFormattedText.length - 2;
          } else if (selectedText.startsWith('# ')) {
            // Убираем форматирование
            const unformattedText = selectedText.slice(2);
            newText = fullText.substring(0, start) + unformattedText + fullText.substring(end);
            newStart = start;
            newEnd = start + unformattedText.length;
          } else {
            // Добавляем ###
            const formattedText = `### ${selectedText}`;
            newText = fullText.substring(0, start) + formattedText + fullText.substring(end);
            newStart = start + 4;
            newEnd = end + 4;
          }
        } else {
          if (selectedText.startsWith('# ')) {
            // Убираем # и делаем ##
            const newFormattedText = `## ${selectedText.slice(2)}`;
            newText = fullText.substring(0, start) + newFormattedText + fullText.substring(end);
            newStart = start + 3;
            newEnd = start + newFormattedText.length - 3;
          } else if (selectedText.startsWith('## ')) {
            // Убираем ## и делаем ###
            const newFormattedText = `### ${selectedText.slice(3)}`;
            newText = fullText.substring(0, start) + newFormattedText + fullText.substring(end);
            newStart = start + 4;
            newEnd = start + newFormattedText.length - 4;
          } else if (selectedText.startsWith('### ')) {
            // Убираем форматирование
            const unformattedText = selectedText.slice(4);
            newText = fullText.substring(0, start) + unformattedText + fullText.substring(end);
            newStart = start;
            newEnd = start + unformattedText.length;
          } else {
            // Добавляем #
            const formattedText = `# ${selectedText}`;
            newText = fullText.substring(0, start) + formattedText + fullText.substring(end);
            newStart = start + 2;
            newEnd = end + 2;
          }
        }
        break;
    }
    
    // Обновляем текст
    textarea.value = newText;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Восстанавливаем выделение
    textarea.setSelectionRange(newStart, newEnd);
    textarea.focus();
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080'
  ];

  const isNotesTab = tabId === '3';
  const hasFormatTarget = focusedColumnIndex !== undefined || selectedItems.length > 0;

  const instructionContent = `
# Инструкция по использованию приложения S-Lists

## Основные возможности

### 1. Работа с вкладками
- **Основной список** (ID: 1) - для ведения основного перечня предметов
- **Выданные** (ID: 2) - автоматически заполняется при выдаче предметов
- **Заметки** (ID: 3) - для ведения произвольных записей с поддержкой форматирования
- **Архив** (ID: 4) - история всех операций выдачи и возврата

### 2. Управление элементами списка

#### Добавление элементов:
- **"Добавить строку"** - создает новую строку с 4 колонками
- **"Создать разделитель"** - добавляет разделитель для группировки элементов

#### Работа с элементами:
- Чекбокс слева от элемента - для выделения
- Номер строки показывается автоматически
- Можно перетаскивать элементы для изменения порядка
- **"Удалить выбранные"** - удаляет отмеченные элементы

### 3. Операции с предметами

#### Выдача предметов:
1. Отметьте нужные элементы в "Основном списке"
2. Нажмите кнопку **"Выдать"**
3. Введите имя получателя
4. Предметы автоматически переместятся в раздел "Выданные"
5. Информация о выдаче сохранится в "Архиве"

#### Возврат предметов:
1. Отметьте нужные элементы в разделе "Выданные"
2. Нажмите кнопку **"Сдать"**
3. Предметы вернутся в "Основной список"
4. В архиве отметится дата возврата

### 4. Форматирование текста

#### В списках:
- **Ж** - жирный текст
- **К** - курсив
- **З** - зачеркнутый текст
- **А+/А-** - увеличить/уменьшить размер шрифта
- **🎨** - изменить цвет текста

#### В заметках (поддержка Markdown):
- **\*\*текст\*\*** - жирный текст
- **\*текст\*** - курсив
- **\~\~текст\~\~** - зачеркнутый текст
- **# текст** - заголовок большой
- **## текст** - заголовок средний
- **### текст** - заголовок малый

### 5. Поиск и фильтрация
- Используйте поле поиска для быстрого нахождения элементов
- Поиск работает по содержимому всех колонок
- Поддержка поиска по тегам через символ #

### 6. Управление данными

#### Экспорт:
- **"Экспорт"** - сохраняет все данные в зашифрованный файл с паролем
- **"TXT"** - экспортирует все данные в читаемый текстовый файл

#### Импорт:
- **"Импорт"** - загружает данные из зашифрованного файла
- Требует тот же пароль, что использовался при экспорте

### 7. Разделители
- Кликните по разделителю для настройки:
  - Изменение текста
  - Выбор цвета фона
  - Выравнивание текста (слева/по центру/справа)
- Используйте стрелки для сворачивания/разворачивания секций

### 8. Дополнительные возможности

#### Переименование вкладок:
- Долгое нажатие на название вкладки (мобильные)
- Правый клик на название вкладки (десктоп)
- Выберите "Переименовать" в контекстном меню

#### Изменение размера колонок:
- Наведите курсор на границу колонки
- Потяните для изменения ширины
- Ширина сохраняется автоматически

#### Очистка архива:
- В разделе "Архив" нажмите "Очистить архив"
- Будут удалены все записи о выдачах и возвратах

### 9. Советы по использованию

1. **Организация данных**: Используйте разделители для группировки похожих предметов
2. **Резервные копии**: Регулярно делайте экспорт данных для сохранности
3. **Поиск**: Используйте описательные названия для легкого поиска
4. **Форматирование**: Выделяйте важную информацию жирным шрифтом или цветом
5. **Заметки**: Используйте раздел "Заметки" для дополнительной информации и инструкций

### 10. Безопасность данных
- Все данные сохраняются локально в браузере
- При экспорте используется надежное шифрование
- Пароли не сохраняются - запомните их или используйте менеджер паролей
- Регулярно создавайте резервные копии экспортом данных

## Техническая информация
- Приложение работает полностью в браузере
- Не требует подключения к интернету после загрузки
- Поддерживает современные браузеры
- Оптимизировано для мобильных устройств

---

*Для получения помощи или сообщения об ошибках обратитесь к администратору системы.*
  `;

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

          {/* Instruction button for Notes tab */}
          {isNotesTab && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Справка:</span>
                <Dialog open={instructionDialogOpen} onOpenChange={setInstructionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-purple-50 border-purple-200 hover:bg-purple-100 text-xs px-2"
                    >
                      <HelpCircle size={14} className="mr-1" />
                      <span className="hidden sm:inline">Инструкция</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Инструкция по использованию S-Lists</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] w-full">
                      <div className="prose prose-sm max-w-none p-4">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                          {instructionContent}
                        </pre>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
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
