
import React, { useState, useEffect } from 'react';
import PasswordManager from '../components/PasswordManager';
import DynamicTabManager from '../components/DynamicTabManager';
import PWAInstaller from '../components/PWAInstaller';

const Index: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    // Регистрация service worker для PWA функциональности
    if ('serviceWorker' in navigator) {
      console.log('[SW] Registering Service Worker...');
      
      navigator.serviceWorker.register('/s-lists-sync-82/sw.js', {
        scope: '/s-lists-sync-82/'
      })
        .then((registration) => {
          console.log('[SW] Service Worker registered successfully:', registration);
          
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

    console.log('[PWA] Checking PWA capabilities:');
    console.log('- beforeinstallprompt supported:', 'onbeforeinstallprompt' in window);
    console.log('- Service Worker supported:', 'serviceWorker' in navigator);
    console.log('- Cache API supported:', 'caches' in window);
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');

    const savedAuth = localStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          {/* Пиксельный енот */}
          <div className="mb-8 flex justify-center">
            <div className="pixel-raccoon">
              <div className="raccoon-body"></div>
              <div className="raccoon-head"></div>
              <div className="raccoon-ears"></div>
              <div className="raccoon-eyes"></div>
              <div className="raccoon-nose"></div>
              <div className="raccoon-stripes"></div>
            </div>
          </div>
          <div className="text-6xl font-bold mb-8">NOTTE</div>
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
    <div style={{ 
      backgroundColor: `var(--theme-bg, #ffffff)`,
      color: `var(--theme-text, #000000)`,
      minHeight: '100vh'
    }}>
      {!isAuthenticated ? (
        <PasswordManager onAuthenticated={handleAuthenticated} />
      ) : (
        <DynamicTabManager onThemeChange={handleThemeChange} />
      )}
      <PWAInstaller />
      
      <style>{`
        .pixel-raccoon {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto;
        }
        
        .raccoon-body {
          position: absolute;
          bottom: 0;
          left: 20px;
          width: 40px;
          height: 50px;
          background: #8B7355;
          border-radius: 0;
          box-shadow: 
            inset 0 0 0 2px #654321,
            0 0 0 1px #000;
        }
        
        .raccoon-head {
          position: absolute;
          top: 10px;
          left: 15px;
          width: 50px;
          height: 40px;
          background: #8B7355;
          border-radius: 50%;
          box-shadow: 
            inset 0 0 0 2px #654321,
            0 0 0 1px #000;
        }
        
        .raccoon-ears {
          position: absolute;
          top: 5px;
          left: 20px;
          width: 40px;
          height: 20px;
        }
        
        .raccoon-ears::before,
        .raccoon-ears::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          background: #8B7355;
          border-radius: 50% 50% 0 0;
          box-shadow: 
            inset 0 0 0 1px #654321,
            0 0 0 1px #000;
        }
        
        .raccoon-ears::before {
          left: 3px;
        }
        
        .raccoon-ears::after {
          right: 3px;
        }
        
        .raccoon-eyes {
          position: absolute;
          top: 20px;
          left: 25px;
          width: 30px;
          height: 15px;
        }
        
        .raccoon-eyes::before,
        .raccoon-eyes::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: #000;
          border-radius: 50%;
        }
        
        .raccoon-eyes::before {
          left: 3px;
          box-shadow: 0 0 0 3px #fff, 0 0 0 6px #000;
        }
        
        .raccoon-eyes::after {
          right: 3px;
          box-shadow: 0 0 0 3px #fff, 0 0 0 6px #000;
        }
        
        .raccoon-nose {
          position: absolute;
          top: 32px;
          left: 37px;
          width: 6px;
          height: 4px;
          background: #000;
          border-radius: 0 0 50% 50%;
        }
        
        .raccoon-stripes {
          position: absolute;
          top: 15px;
          left: 10px;
          width: 60px;
          height: 30px;
        }
        
        .raccoon-stripes::before,
        .raccoon-stripes::after {
          content: '';
          position: absolute;
          width: 50px;
          height: 4px;
          background: #000;
          opacity: 0.3;
        }
        
        .raccoon-stripes::before {
          top: 8px;
          transform: rotate(-10deg);
        }
        
        .raccoon-stripes::after {
          top: 18px;
          transform: rotate(10deg);
        }
      `}</style>
    </div>
  );
};

export default Index;
