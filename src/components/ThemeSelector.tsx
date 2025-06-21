
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ThemeSelectorProps {
  onThemeChange?: (theme: string) => void;
}

const themes = [
  { id: 'light', name: 'Светлая', colors: { bg: '#ffffff', text: '#000000', primary: '#2563eb' } },
  { id: 'dark', name: 'Тёмная', colors: { bg: '#1a1a1a', text: '#ffffff', primary: '#3b82f6' } },
  { id: 'blue', name: 'Синяя', colors: { bg: '#1e3a8a', text: '#ffffff', primary: '#60a5fa' } },
  { id: 'green', name: 'Зелёная', colors: { bg: '#166534', text: '#ffffff', primary: '#34d399' } },
  { id: 'purple', name: 'Фиолетовая', colors: { bg: '#7c3aed', text: '#ffffff', primary: '#a78bfa' } }
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
      // Применяем CSS переменные
      document.documentElement.style.setProperty('--theme-bg', theme.colors.bg);
      document.documentElement.style.setProperty('--theme-text', theme.colors.text);
      document.documentElement.style.setProperty('--theme-primary', theme.colors.primary);
      
      // Применяем цвета к body для общего фона
      document.body.style.backgroundColor = theme.colors.bg;
      document.body.style.color = theme.colors.text;
      
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
    <Card style={{ 
      backgroundColor: 'var(--theme-bg)', 
      color: 'var(--theme-text)',
      border: '1px solid var(--theme-primary)'
    }}>
      <CardHeader>
        <CardTitle style={{ color: 'var(--theme-text)' }}>Выбор темы</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedTheme} onValueChange={handleThemeChange}>
          {themes.map(theme => (
            <div key={theme.id} className="flex items-center space-x-2">
              <RadioGroupItem value={theme.id} id={theme.id} />
              <Label htmlFor={theme.id} className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--theme-text)' }}>
                <div 
                  className="w-6 h-6 rounded border-2"
                  style={{ 
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.primary
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
