
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

interface TagSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  items: ListItem[];
}

const TagSearch: React.FC<TagSearchProps> = ({ searchTerm, onSearchChange, items }) => {
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (searchTerm.includes('#')) {
      const tags = extractTags(items);
      const searchTag = searchTerm.split('#').pop()?.toLowerCase() || '';
      const filteredTags = tags.filter(tag => 
        tag.toLowerCase().includes(searchTag)
      );
      setTagSuggestions(filteredTags);
      setShowTagSuggestions(filteredTags.length > 0);
    } else {
      setShowTagSuggestions(false);
    }
  }, [searchTerm, items]);

  const extractTags = (items: ListItem[]): string[] => {
    const tags: string[] = [];
    items.forEach(item => {
      if (item.type === 'separator' && item.separatorText) {
        const matches = item.separatorText.match(/#\w+/g);
        if (matches) {
          tags.push(...matches);
        }
      }
    });
    return [...new Set(tags)];
  };

  const handleTagClick = (tag: string) => {
    const beforeHash = searchTerm.substring(0, searchTerm.lastIndexOf('#'));
    onSearchChange(beforeHash + tag);
    setShowTagSuggestions(false);
  };

  return (
    <div className="relative">
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
      
      {showTagSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 mt-1">
          <div className="max-h-40 overflow-y-auto">
            {tagSuggestions.map((tag, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSearch;
