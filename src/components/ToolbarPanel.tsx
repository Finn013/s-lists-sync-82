
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ToolbarPanelProps {
  tabId: string;
  onAddItem: (tabId: string, text?: string) => void;
  onAddSeparator: (tabId: string) => void;
  onDeleteSelected: (tabId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  tabId,
  onAddItem,
  onAddSeparator,
  onDeleteSelected,
  searchTerm,
  onSearchChange
}) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* First Row - Basic Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onAddItem(tabId)}
              className="bg-green-600 hover:bg-green-700"
            >
              Добавить строку
            </Button>
            <Button
              size="sm"
              onClick={() => onAddSeparator(tabId)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Создать разделитель
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onDeleteSelected(tabId)}
            >
              Удалить выбранные
            </Button>
          </div>

          <Separator />

          {/* Text Formatting */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <span className="text-lg font-bold">Ж</span>
            </Button>
            <Button size="sm" variant="outline">
              <span className="italic">К</span>
            </Button>
            <Button size="sm" variant="outline">
              <span className="line-through">З</span>
            </Button>
            <Button size="sm" variant="outline">
              А+
            </Button>
            <Button size="sm" variant="outline">
              А-
            </Button>
            <Button size="sm" variant="outline">
              🎨
            </Button>
          </div>

          <Separator />

          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Поиск по тексту и разделителям..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" variant="outline">
              Найти
            </Button>
          </div>

          <Separator />

          {/* Alignment */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              ⬅️
            </Button>
            <Button size="sm" variant="outline">
              ↔️
            </Button>
            <Button size="sm" variant="outline">
              ➡️
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolbarPanel;
