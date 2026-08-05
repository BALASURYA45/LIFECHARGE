import { useEffect, useState } from 'react';

export default function GoogleAuthButton({ label = 'Continue with Google', onSuccess, disabled = false }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setMessage('Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to enable this option.');
      return;
    }

    if (window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: handleTokenResponse,
      });
      setIsReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: handleTokenResponse,
        });
        setIsReady(true);
      }
    };

    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('google-gsi-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTokenResponse(response) {
    setIsLoading(true);
    setMessage('');

    try {
      if (!response?.access_token) {
        throw new Error('Google sign-in was cancelled.');
      }

      await onSuccess(response.access_token);
    } catch (error) {
      const fallbackMessage = error?.message || 'Google sign-in failed. Please try again.';
      setMessage(fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClick() {
    if (!window.google?.accounts?.oauth2) {
      setMessage('Google sign-in is unavailable right now.');
      return;
    }

    window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: handleTokenResponse,
    }).requestAccessToken();
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading || !isReady}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.78-.07-1.53-.21-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.99-4.33 2.99-7.53Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.06.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.41 13.91A6.02 6.02 0 0 1 6.41 10.1V7.52H3.07a10 10 0 0 0 0 12.78l3.34-2.59Z"
          />
          <path
            fill="#EA4335"
            d="M12 6.04c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.93 5.52l3.34 2.59C7.2 7.8 9.4 6.04 12 6.04Z"
          />
        </svg>
        {isLoading ? 'Connecting...' : label}
      </button>
      {message ? <p className="mt-2 text-sm text-amber-600">{message}</p> : null}
    </div>
  );
}
