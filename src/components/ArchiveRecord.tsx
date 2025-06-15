
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ArchiveEntry {
  id: string;
  items: string;
  issuedTo: string;
  issuedDate: string;
  returnedDate?: string;
}

interface ArchiveRecordProps {
  archive: ArchiveEntry[];
}

const ArchiveRecord: React.FC<ArchiveRecordProps> = ({ archive }) => {
  const [sortBy, setSortBy] = useState<'issuedDate' | 'returnedDate' | 'rowNumber'>('issuedDate');
  const [searchTerm, setSearchTerm] = useState('');

  const extractRowNumbers = (items: string): number[] => {
    const matches = items.match(/№\s*(\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*)/);
    if (!matches) return [];
    
    const numbers: number[] = [];
    const parts = matches[1].split(',');
    
    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          numbers.push(i);
        }
      } else {
        numbers.push(parseInt(trimmed));
      }
    });
    
    return numbers.sort((a, b) => a - b);
  };

  const filteredAndSortedArchive = archive
    .filter(entry => 
      entry.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.issuedTo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rowNumber') {
        const aNumbers = extractRowNumbers(a.items);
        const bNumbers = extractRowNumbers(b.items);
        const aMin = aNumbers.length > 0 ? Math.min(...aNumbers) : 0;
        const bMin = bNumbers.length > 0 ? Math.min(...bNumbers) : 0;
        return aMin - bMin;
      }
      
      const dateA = new Date(a[sortBy] || '');
      const dateB = new Date(b[sortBy] || '');
      return dateB.getTime() - dateA.getTime(); // Newest first
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Архив выданных предметов</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Поиск в архиве..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant={sortBy === 'issuedDate' ? 'default' : 'outline'}
            onClick={() => setSortBy('issuedDate')}
          >
            По дате выдачи
          </Button>
          <Button 
            variant={sortBy === 'returnedDate' ? 'default' : 'outline'}
            onClick={() => setSortBy('returnedDate')}
          >
            По дате возврата
          </Button>
          <Button 
            variant={sortBy === 'rowNumber' ? 'default' : 'outline'}
            onClick={() => setSortBy('rowNumber')}
          >
            По номеру строки
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredAndSortedArchive.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Архив пуст</p>
          ) : (
            filteredAndSortedArchive.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{entry.items}</div>
                  <div className="text-sm text-gray-600">Выдано: {entry.issuedTo}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm">
                    <Badge variant="outline">Выдано: {entry.issuedDate}</Badge>
                  </div>
                  {entry.returnedDate && (
                    <div className="text-sm">
                      <Badge variant="secondary">Возвращено: {entry.returnedDate}</Badge>
                    </div>
                  )}
                  {!entry.returnedDate && (
                    <Badge variant="destructive">Не возвращено</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchiveRecord;
