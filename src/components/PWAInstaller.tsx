
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
                      (window.navigator as any).standalone === true ||
                      window.location.search.includes('homescreen=1');
    
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

    // Для мобильных устройств показываем баннер через короткое время
    if ((iOS || android) && !standalone) {
      console.log('PWAInstaller: Показываем баннер для мобильного устройства');
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 1000);
    }

    // Проверяем, было ли приложение уже отклонено пользователем
    const wasRejected = localStorage.getItem('pwa-install-rejected');
    if (wasRejected) {
      const rejectedTime = parseInt(wasRejected);
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - rejectedTime < dayInMs) {
        console.log('PWAInstaller: Пользователь недавно отклонил установку');
        return;
      }
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

  console.log('PWAInstaller: Рендерим баннер');

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">📱 Установить S-Lists</h3>
            {isIOS ? (
              <div className="text-sm space-y-2">
                <p className="mb-2">Для установки на iPhone/iPad:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Нажмите кнопку "Поделиться" в Safari 📤</li>
                  <li>Прокрутите вниз и выберите "На экран «Домой»"</li>
                  <li>Нажмите "Добавить"</li>
                </ol>
              </div>
            ) : isAndroid ? (
              <div className="text-sm">
                <p className="mb-3">
                  Установите приложение для быстрого доступа и работы офлайн
                </p>
                {!deferredPrompt && (
                  <p className="text-xs opacity-80">
                    В Chrome: Меню → "Установить приложение" или "Добавить на главный экран"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm mb-3">
                Установите приложение для быстрого доступа и работы офлайн
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-blue-700 p-1 h-auto ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {deferredPrompt && (
          <Button
            onClick={handleInstallClick}
            className="w-full mt-3 bg-white text-blue-600 hover:bg-gray-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Установить приложение
          </Button>
        )}
        
        {!deferredPrompt && isAndroid && (
          <div className="mt-3 text-xs opacity-80">
            Если кнопка установки не появилась, используйте меню браузера
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstaller;
