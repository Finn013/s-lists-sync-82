
import React, { useState, useEffect } from 'react';
import PasswordManager from '../components/PasswordManager';
import ListManager from '../components/ListManager';
import PWAInstaller from '../components/PWAInstaller';

const Index: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Регистрация service worker для PWA функциональности
    if ('serviceWorker' in navigator) {
      console.log('[SW] Registering Service Worker...');
      
      navigator.serviceWorker.register('/s-lists-sync/sw.js', {
        scope: '/s-lists-sync/'
      })
        .then((registration) => {
          console.log('[SW] Service Worker registered successfully:', registration);
          
          // Проверяем обновления
          registration.addEventListener('updatefound', () => {
            console.log('[SW] Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[SW] New Service Worker installed, prompting for reload');
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.error('[SW] Service Worker registration failed:', registrationError);
        });
    } else {
      console.log('[SW] Service Worker not supported in this browser');
    }

    // Проверяем поддержку PWA
    console.log('[PWA] Checking PWA capabilities:');
    console.log('- beforeinstallprompt supported:', 'onbeforeinstallprompt' in window);
    console.log('- Service Worker supported:', 'serviceWorker' in navigator);
    console.log('- Cache API supported:', 'caches' in window);
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');

    // Симуляция времени загрузки
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl font-bold mb-8">S-</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <div className="mt-4 text-lg">Загружается...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated ? (
        <PasswordManager onAuthenticated={handleAuthenticated} />
      ) : (
        <ListManager />
      )}
      <PWAInstaller />
    </>
  );
};

export default Index;
