import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const initial = typeof window.navigator !== 'undefined' ? window.navigator.onLine : true;
    setIsOnline(initial);

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-amber-700 bg-amber-950 px-4 py-2 text-center text-sm text-amber-100 safe-area-top">
      You are currently offline. Some features may be limited.
    </div>
  );
}