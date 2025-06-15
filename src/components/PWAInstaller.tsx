
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
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show banner for iOS devices after a delay
    if (iOS && !standalone) {
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
  };

  // Don't show if app is already installed
  if (isStandalone || !showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Установить S-Lists</h3>
            {isIOS ? (
              <div className="text-sm space-y-2">
                <p>Для установки на iOS:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Нажмите кнопку "Поделиться" <span className="inline-block">📤</span></li>
                  <li>Выберите "На экран Домой"</li>
                  <li>Нажмите "Добавить"</li>
                </ol>
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
            className="text-white hover:bg-blue-700 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {!isIOS && deferredPrompt && (
          <Button
            onClick={handleInstallClick}
            className="w-full mt-3 bg-white text-blue-600 hover:bg-gray-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Установить приложение
          </Button>
        )}
      </div>
    </div>
  );
};

export default PWAInstaller;
