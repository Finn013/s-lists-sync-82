
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TagSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  items: any[];
  tags?: string[];
}

const TagSearch: React.FC<TagSearchProps> = ({ 
  searchTerm, 
  onSearchChange, 
  items, 
  tags = [] 
}) => {
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  useEffect(() => {
    if (searchTerm.includes('#')) {
      const searchTag = searchTerm.split('#').pop()?.toLowerCase() || '';
      const filtered = tags.filter(tag => 
        tag.toLowerCase().includes(searchTag)
      );
      setFilteredTags(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setShowTagSuggestions(false);
    }
  }, [searchTerm, tags]);

  const handleTagClick = (tag: string) => {
    const beforeHash = searchTerm.substring(0, searchTerm.lastIndexOf('#'));
    onSearchChange(beforeHash + '#' + tag);
    setShowTagSuggestions(false);
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <Input
            placeholder="Поиск по тексту или тегам (используйте # для поиска тегов)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1"
          />
          {searchTerm && (
            <Button variant="outline" size="sm" onClick={clearSearch}>
              Очистить
            </Button>
          )}
        </div>
        
        {showTagSuggestions && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 mt-1">
            <div className="max-h-40 overflow-y-auto p-2">
              {filteredTags.map((tag, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm rounded"
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {tags.length > 0 && !searchTerm && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Доступные теги:</span>
          {tags.slice(0, 10).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-blue-100"
              onClick={() => onSearchChange('#' + tag)}
            >
              #{tag}
            </Badge>
          ))}
          {tags.length > 10 && (
            <Badge variant="outline">
              +{tags.length - 10} ещё
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSearch;
