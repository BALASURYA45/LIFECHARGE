import { useState } from 'react';
import { ConfirmContext } from './ConfirmContext.jsx';
export { ConfirmContext };

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  function confirm({ title = 'Are you sure?', message = '' } = {}) {
    return new Promise((resolve) => {
      setState({
        open: true,
        title,
        message,
        onConfirm: () => {
          setState((current) => ({ ...current, open: false }));
          resolve(true);
        },
      });
    });
  }

  function handleCancel() {
    setState((current) => ({ ...current, open: false }));
  }

  function handleConfirm() {
    state.onConfirm();
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={handleCancel} />
          <div className="relative w-full max-w-sm rounded border border-slate-700 bg-slate-900 p-5 shadow-xl">
            <h2 className="text-lg font-bold text-white">{state.title}</h2>
            {state.message ? <p className="mt-2 text-sm text-slate-300">{state.message}</p> : null}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="lc-focus rounded border border-slate-700 px-4 py-2.5 font-semibold text-slate-200 hover:border-slate-500"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lc-focus rounded bg-red-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-red-400"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}