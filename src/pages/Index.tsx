
import React, { useState, useEffect } from 'react';
import PasswordManager from '../components/PasswordManager';
import ListManager from '../components/ListManager';
import PWAInstaller from '../components/PWAInstaller';

const Index: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/s-lists-sync/sw.js', {
        scope: '/s-lists-sync/'
      })
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Simulate loading time
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
