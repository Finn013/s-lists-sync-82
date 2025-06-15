
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      console.log('Checking if password exists...');
      await dataManager.init();
      const hasPassword = await dataManager.hasPassword();
      console.log('Has password:', hasPassword);
      setIsFirstTime(!hasPassword);
    } catch (error) {
      console.error('Error checking password:', error);
      setIsFirstTime(true);
    } finally {
      setIsLoading(false);
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
        console.log('Creating new password...');
        await cryptoManager.setPassword(password);
        await dataManager.setPassword(password);
        console.log('Password created successfully');
        onAuthenticated();
      } catch (error) {
        console.error('Error creating password:', error);
        setError('Ошибка при создании пароля');
      }
    } else {
      try {
        console.log('Verifying password...');
        const isValid = await dataManager.verifyPassword(password);
        if (isValid) {
          await cryptoManager.setPassword(password);
          console.log('Password verified successfully');
          onAuthenticated();
        } else {
          setError('Неверный пароль');
        }
      } catch (error) {
        console.error('Error verifying password:', error);
        setError('Ошибка при проверке пароля');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-2 sm:p-4">
        <Card className="w-full max-w-sm mx-auto">
          <CardContent className="flex items-center justify-center p-6 sm:p-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">S-</div>
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-2 sm:p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center px-4 pt-6 pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-600">S-</CardTitle>
          <p className="text-gray-600 text-sm sm:text-base px-2">
            {isFirstTime ? 'Добро пожаловать! Создайте пароль для защиты приложения' : 'Введите пароль для входа'}
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder={isFirstTime ? "Придумайте пароль" : "Пароль"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="text-base" // Prevents zoom on iOS
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
                  className="text-base" // Prevents zoom on iOS
                />
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm text-center px-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              {isFirstTime ? 'Создать пароль' : 'Войти'}
            </Button>
          </form>
          
          {isFirstTime && (
            <div className="mt-4 text-xs text-gray-500 text-center px-2">
              Пароль будет использоваться для защиты ваших данных.<br />
              Минимум 4 символа.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordManager;
