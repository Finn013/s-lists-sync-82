
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    console.log('PWAInstaller: Инициализация');
    
    // Проверяем тип устройства
    const userAgent = navigator.userAgent.toLowerCase();
    const iOS = /ipad|iphone|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(android);
    
    console.log('PWAInstaller: iOS:', iOS, 'Android:', android);

    // Проверяем, установлено ли приложение
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    
    setIsStandalone(standalone);
    console.log('PWAInstaller: Standalone режим:', standalone);

    // Обработчик события beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWAInstaller: beforeinstallprompt событие получено');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    // Обработчик установки приложения
    const handleAppInstalled = () => {
      console.log('PWAInstaller: Приложение установлено');
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Для всех устройств показываем баннер, если не standalone
    if (!standalone) {
      console.log('PWAInstaller: Показываем баннер');
      setTimeout(() => {
        const wasRejected = localStorage.getItem('pwa-install-rejected');
        if (wasRejected) {
          const rejectedTime = parseInt(wasRejected);
          const dayInMs = 24 * 60 * 60 * 1000;
          if (Date.now() - rejectedTime < dayInMs) {
            console.log('PWAInstaller: Пользователь недавно отклонил установку');
            return;
          }
        }
        setShowInstallBanner(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('PWAInstaller: Попытка установки');
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('PWAInstaller: Результат установки:', outcome);
        
        if (outcome === 'accepted') {
          console.log('PWAInstaller: Пользователь принял установку');
        } else {
          console.log('PWAInstaller: Пользователь отклонил установку');
          localStorage.setItem('pwa-install-rejected', Date.now().toString());
        }
        
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      } catch (error) {
        console.error('PWAInstaller: Ошибка при установке:', error);
      }
    }
  };

  const handleDismiss = () => {
    console.log('PWAInstaller: Баннер закрыт пользователем');
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-rejected', Date.now().toString());
  };

  // Не показываем, если приложение уже установлено
  if (isStandalone) {
    console.log('PWAInstaller: Приложение уже установлено');
    return null;
  }

  // Не показываем, если баннер скрыт
  if (!showInstallBanner) {
    return null;
  }

  console.log('PWAInstaller: Рендерим баннер, deferredPrompt:', !!deferredPrompt);

  return (
    <div className="fixed bottom-4 left-2 right-2 z-50 mx-auto max-w-sm md:left-auto md:right-4">
      <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg border border-blue-500">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-base mb-1">📱 Установить S-Lists</h3>
            {isIOS ? (
              <p className="text-xs opacity-90">
                Нажмите <span className="font-semibold">⎙</span> в Safari → "На экран Домой"
              </p>
            ) : (
              <p className="text-xs opacity-90">
                Установите приложение для работы офлайн
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-blue-700 p-1 h-6 w-6 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        {deferredPrompt && (
          <Button
            onClick={handleInstallClick}
            className="w-full bg-white text-blue-600 hover:bg-gray-100 text-sm py-2 h-8"
          >
            <Download className="h-3 w-3 mr-1" />
            Установить
          </Button>
        )}
        
        {!deferredPrompt && isAndroid && (
          <div className="text-xs opacity-80 mt-1">
            В Chrome: Меню → "Установить приложение"
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstaller;
