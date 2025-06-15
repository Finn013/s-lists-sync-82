
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

interface SeparatorDropdownProps {
  item: ListItem;
  tabId: string;
  onUpdate: (tabId: string, itemId: string, updates: Partial<ListItem>) => void;
}

const SeparatorDropdown: React.FC<SeparatorDropdownProps> = ({ item, tabId, onUpdate }) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(item.separatorText || '');
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(item.separatorColor || '#e5e7eb');

  const colors = [
    { name: 'Серый', value: '#e5e7eb' },
    { name: 'Красный', value: '#fecaca' },
    { name: 'Синий', value: '#bfdbfe' },
    { name: 'Зеленый', value: '#bbf7d0' },
    { name: 'Желтый', value: '#fef3c7' },
    { name: 'Фиолетовый', value: '#e9d5ff' },
    { name: 'Розовый', value: '#fbcfe8' },
  ];

  const handleRename = () => {
    onUpdate(tabId, item.id, { separatorText: newName });
    setIsRenameOpen(false);
  };

  const handleColorChange = () => {
    onUpdate(tabId, item.id, { separatorColor: selectedColor });
    setIsColorOpen(false);
  };

  const handleAlignChange = (align: 'left' | 'center' | 'right') => {
    onUpdate(tabId, item.id, { separatorAlign: align });
  };

  const handleDelete = () => {
    if (confirm('Удалить разделитель?')) {
      // This would need to be handled at parent level
      console.log('Delete separator:', item.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          ...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Переименовать
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Переименовать разделитель</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleRename}>
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isColorOpen} onOpenChange={setIsColorOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Изменить цвет
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Изменить цвет разделителя</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    className={`h-10 rounded border-2 ${
                      selectedColor === color.value ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                  >
                    <span className="text-xs">{color.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsColorOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleColorChange}>
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenuItem onClick={() => handleAlignChange('left')}>
          Положение текста: Слева
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAlignChange('center')}>
          Положение текста: По центру
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAlignChange('right')}>
          Положение текста: Справа
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SeparatorDropdown;
