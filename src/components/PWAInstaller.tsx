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

    // -- Only show install prompt if browser supports it, and not standalone --
    const handleBeforeInstallPrompt = (e: Event) => {
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

    // Adjust when to show: only if prompt supported or iOS/Android fallback
    // Для всех устройств показываем баннер, если не standalone
    // Enhance always showing for mobile if not standalone and not rejected
    if (!standalone) {
      setTimeout(() => {
        const wasRejected = localStorage.getItem('pwa-install-rejected');
        const rejectedTime = wasRejected ? parseInt(wasRejected) : 0;
        const dayInMs = 24 * 60 * 60 * 1000;
        if (wasRejected && (Date.now() - rejectedTime < dayInMs)) return;
        setShowInstallBanner(true);
      }, 1000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          //
        } else {
          localStorage.setItem('pwa-install-rejected', Date.now().toString());
        }
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      } catch (error) {
        // handle error
      }
    }
  };
  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-rejected', Date.now().toString());
  };

  if (isStandalone || !showInstallBanner) return null;

  return (
    <div className="fixed bottom-2 left-0 right-0 z-50 px-2">
      <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg border border-blue-500 max-w-md mx-auto w-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-base mb-1">📱 Установить S-Lists</h3>
            {isIOS ? (
              <p className="text-xs opacity-90">
                В Safari: <span className="font-semibold">Поделиться</span> → "На экран Домой"
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
        
        {/* Show install button as long as possible, not only with deferredPrompt */}
        {(deferredPrompt || (!isIOS && !isStandalone && 'onbeforeinstallprompt' in window)) && (
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
