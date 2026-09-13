'use client';

import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAInstallModal() {
  const { isInstallable, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 m-auto max-w-md rounded-2xl bg-zinc-900 p-5 text-white shadow-2xl border border-zinc-800 backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-lg">
            SVA
          </div>
          <div>
            <h3 className="font-semibold text-base">Instalar o aplicativo</h3>
            <p className="text-xs text-zinc-400">
              Acesse o Short Video Assistant direto da sua tela inicial offline.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          Agora não
        </button>
        <button
          onClick={promptInstall}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md"
        >
          Instalar App
        </button>
      </div>
    </div>
  );
}