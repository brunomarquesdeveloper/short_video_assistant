'use client';

import { useWebPush } from '@/hooks/useWebPush';
import { Toaster } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Scissors, Upload, Clock, Video } from 'lucide-react';

export default function Home() {
  useWebPush();

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      {/* Header Mobile-First */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Scissors className="h-5 w-5 text-indigo-500" />
          <span>ShortsApp</span>
        </div>
        <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-900 text-xs text-zinc-300">
          <Clock className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
          Agendados
        </Button>
      </header>

      {/* Área Principal / Viewport de Edição */}
      <section className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full gap-4">
        <div className="w-full aspect-[9/16] max-h-[60vh] bg-zinc-900 rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
            <Video className="h-6 w-6 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-300">Nenhum vídeo carregado</p>
          <p className="text-xs text-zinc-500 mt-1 mb-4">Selecione um arquivo de mídia para começar a cortar</p>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
            <Upload className="h-4 w-4" />
            Carregar Vídeo
          </Button>
        </div>
      </section>

      {/* Footer / Barra de Ferramentas Mobile */}
      <footer className="sticky bottom-0 border-t border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur-md">
        <div className="max-w-lg mx-auto flex items-center justify-around gap-2">
          <Button variant="ghost" className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-xs text-zinc-400">
            <Scissors className="h-4 w-4" />
            Corte
          </Button>
          <Button variant="ghost" className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-xs text-zinc-400">
            <Clock className="h-4 w-4" />
            Agendar
          </Button>
        </div>
      </footer>

      <Toaster />
    </main>
  );
}