import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataManager } from '../utils/dataManager';
import { CryptoManager } from '../utils/cryptoManager';
import { useToast } from '@/hooks/use-toast';

const PasswordChangeDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const dataManager = new DataManager();
  const cryptoManager = new CryptoManager();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 4) {
      setError('Новый пароль должен содержать минимум 4 символа');
      setIsLoading(false);
      return;
    }

    try {
      // Проверяем текущий пароль
      const isCurrentValid = await dataManager.verifyPassword(currentPassword);
      if (!isCurrentValid) {
        setError('Неверный текущий пароль');
        setIsLoading(false);
        return;
      }

      // Устанавливаем новый пароль
      await cryptoManager.setPassword(newPassword);
      await dataManager.setPassword(newPassword);

      toast({
        title: "Пароль изменен",
        description: "Ваш пароль успешно изменен",
      });

      // Закрываем диалог и очищаем поля
      setIsOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Ошибка при смене пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-xs px-2 sm:px-3"
        >
          🔑 <span className="hidden sm:inline ml-1">Сменить пароль</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs xs:max-w-sm w-full p-4">
        <DialogHeader>
          <DialogTitle>Смена пароля</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Текущий пароль"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isLoading}
              className="text-base"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              className="text-base"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Подтвердите новый пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="text-base"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Изменение...' : 'Изменить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordChangeDialog;
