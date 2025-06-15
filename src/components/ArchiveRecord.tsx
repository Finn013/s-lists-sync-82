
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
  const [sortBy, setSortBy] = useState<'issuedDate' | 'returnedDate'>('issuedDate');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedArchive = archive
    .filter(entry => 
      entry.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.issuedTo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
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
