
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ThemeSelectorProps {
  onThemeChange?: (theme: string) => void;
}

const themes = [
  { id: 'light', name: 'Светлая', colors: { bg: '#ffffff', text: '#000000' } },
  { id: 'dark', name: 'Тёмная', colors: { bg: '#1a1a1a', text: '#ffffff' } },
  { id: 'blue', name: 'Синяя', colors: { bg: '#1e3a8a', text: '#ffffff' } },
  { id: 'green', name: 'Зелёная', colors: { bg: '#166534', text: '#ffffff' } },
  { id: 'purple', name: 'Фиолетовая', colors: { bg: '#7c3aed', text: '#ffffff' } }
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    setSelectedTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty('--theme-bg', theme.colors.bg);
      document.documentElement.style.setProperty('--theme-text', theme.colors.text);
      
      if (themeId === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      localStorage.setItem('appTheme', themeId);
      if (onThemeChange) {
        onThemeChange(themeId);
      }
    }
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Выбор темы</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedTheme} onValueChange={handleThemeChange}>
          {themes.map(theme => (
            <div key={theme.id} className="flex items-center space-x-2">
              <RadioGroupItem value={theme.id} id={theme.id} />
              <Label htmlFor={theme.id} className="flex items-center gap-2 cursor-pointer">
                <div 
                  className="w-6 h-6 rounded border-2"
                  style={{ 
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.text
                  }}
                />
                {theme.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
