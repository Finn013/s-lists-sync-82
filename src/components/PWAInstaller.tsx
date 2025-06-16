
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
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    console.log('[PWA] Initializing PWA Installer');
    
    // Проверяем тип устройства
    const userAgent = navigator.userAgent.toLowerCase();
    const iOS = /ipad|iphone|ipod/.test(userAgent);
    setIsIOS(iOS);
    
    console.log('[PWA] Device check - iOS:', iOS);

    // Проверяем, установлено ли приложение
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    
    setIsStandalone(standalone);
    console.log('[PWA] Standalone mode:', standalone);

    // Обработчик события beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Показываем баннер только если не отклонен недавно
      const wasRejected = localStorage.getItem('pwa-install-rejected');
      const rejectedTime = wasRejected ? parseInt(wasRejected) : 0;
      const dayInMs = 24 * 60 * 60 * 1000;
      
      if (!wasRejected || (Date.now() - rejectedTime >= dayInMs)) {
        setShowInstallBanner(true);
      }
    };

    // Обработчик установки приложения
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-rejected');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Показываем баннер для iOS и других устройств, если не в standalone режиме
    if (!standalone) {
      setTimeout(() => {
        const wasRejected = localStorage.getItem('pwa-install-rejected');
        const rejectedTime = wasRejected ? parseInt(wasRejected) : 0;
        const dayInMs = 24 * 60 * 60 * 1000;
        
        if (!wasRejected || (Date.now() - rejectedTime >= dayInMs)) {
          setShowInstallBanner(true);
        }
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('[PWA] Install button clicked', { deferredPrompt });
    
    if (deferredPrompt) {
      try {
        console.log('[PWA] Showing install prompt');
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User choice:', outcome);
        
        if (outcome === 'dismissed') {
          localStorage.setItem('pwa-install-rejected', Date.now().toString());
        }
        
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      } catch (error) {
        console.error('[PWA] Install prompt error:', error);
      }
    } else {
      console.log('[PWA] No deferred prompt available');
    }
  };

  const handleDismiss = () => {
    console.log('[PWA] Banner dismissed');
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-rejected', Date.now().toString());
  };

  if (isStandalone || !showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-sm mb-1">📱 Установить S-Lists</h3>
            {isIOS ? (
              <p className="text-xs opacity-90">
                В Safari: <span className="font-semibold">Поделиться</span> → "На экран Домой"
              </p>
            ) : (
              <p className="text-xs opacity-90">
                Установите для работы офлайн и быстрого доступа
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
            Установить приложение
          </Button>
        )}
        
        {!deferredPrompt && !isIOS && (
          <div className="text-xs opacity-80">
            В Chrome: Меню → "Установить приложение"
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstaller;
