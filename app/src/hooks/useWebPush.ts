import { useEffect } from 'react';

export function useWebPush() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
        })
        .catch((error) => {
          console.error('Falha ao registrar Service Worker:', error);
        });
    }
  }, []);
}