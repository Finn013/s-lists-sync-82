
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataManager } from '../utils/dataManager';
import { CryptoManager } from '../utils/cryptoManager';

interface PasswordManagerProps {
  onAuthenticated: () => void;
}

const PasswordManager: React.FC<PasswordManagerProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dataManager] = useState(() => new DataManager());
  const [cryptoManager] = useState(() => new CryptoManager());

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasPassword = await dataManager.hasPassword();
      setIsFirstTime(!hasPassword);
    } catch (error) {
      console.error('Error checking password:', error);
      setIsFirstTime(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isFirstTime) {
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      if (password.length < 4) {
        setError('Пароль должен содержать минимум 4 символа');
        return;
      }

      try {
        await cryptoManager.setPassword(password);
        await dataManager.setPassword(password);
        onAuthenticated();
      } catch (error) {
        setError('Ошибка при создании пароля');
      }
    } else {
      try {
        const isValid = await dataManager.verifyPassword(password);
        if (isValid) {
          await cryptoManager.setPassword(password);
          onAuthenticated();
        } else {
          setError('Неверный пароль');
        }
      } catch (error) {
        setError('Ошибка при проверке пароля');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">S-</CardTitle>
          <p className="text-gray-600">
            {isFirstTime ? 'Создайте пароль для защиты приложения' : 'Введите пароль для входа'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            {isFirstTime && (
              <div>
                <Input
                  type="password"
                  placeholder="Подтвердите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              {isFirstTime ? 'Создать пароль' : 'Войти'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordManager;
