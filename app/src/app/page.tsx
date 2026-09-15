'use client';

import { useState, useEffect } from 'react';
import { useWebPush } from '@/hooks/useWebPush';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { VideoUploader } from '@/components/VideoUploader';
import { ScheduleModal } from '@/components/ScheduleModal';
import { Toaster } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Scissors, Clock } from 'lucide-react';
import Image from "next/image";

export default function Home() {
  useWebPush();
  
  // Estado para armazenar o vídeo selecionado e controlar os modais
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);

  // Hook do FFmpeg
  const { load: loadFFmpeg, loaded: ffmpegLoaded, isProcessing, processVideo } = useFFmpeg();

  // Carrega a engine do FFmpeg em segundo plano
  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  // Captura vídeo/link vindo da página /share via sessionStorage
  useEffect(() => {
    const url = sessionStorage.getItem('shared_video_url');
    if (url) {
      setSharedUrl(url);
      console.log('Vídeo recebido via compartilhamento:', url);
      // Limpa a chave do sessionStorage para não reprocessar no refresh
      sessionStorage.removeItem('shared_video_url');
    }
  }, []);

  const handleVideoSelect = (file: File | null) => {
    setSelectedVideo(file);
  };

  const handleScheduleSubmit = (data: { date: string; time: string }) => {
    console.log("Vídeo agendado para:", data);
  };

  const handleCutVideo = async () => {
    if (!selectedVideo) return;
    
    const resultBlob = await processVideo(selectedVideo, "output.mp4");
    if (resultBlob) {
      console.log("Vídeo processado com sucesso!", resultBlob);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      {/* Header Mobile-First */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5 font-bold text-lg">
          <Image
            src="/android-chrome-192x192.png"
            alt="Logo Short Video Assistant"
            width={28}
            height={28}
            className="rounded-lg object-contain"
          />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Short Video Assistant
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsScheduleOpen(true)}
          className="border-zinc-700 bg-zinc-900 text-xs text-zinc-300"
        >
          <Clock className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
          Agendados
        </Button>
      </header>

      {/* Área Principal / Viewport de Upload e Edição */}
      <section className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full gap-4">
        
        {/* Banner de notificação se houver URL compartilhada */}
        {sharedUrl && (
          <div className="w-full p-3 bg-indigo-950/60 border border-indigo-800/80 rounded-xl text-xs text-indigo-200 flex flex-col gap-1">
            <span className="font-semibold text-indigo-300">Link recebido via compartilhamento:</span>
            <span className="truncate text-zinc-400">{sharedUrl}</span>
          </div>
        )}

        <VideoUploader onVideoSelect={handleVideoSelect} />

        {/* Indicador de status do FFmpeg */}
        <div className="text-xs text-zinc-500 text-center">
          {isProcessing ? (
            <span className="text-indigo-400 animate-pulse">Processando vídeo no navegador...</span>
          ) : ffmpegLoaded ? (
            <span>Motor de processamento pronto</span>
          ) : (
            <span>Iniciando motor de vídeo...</span>
          )}
        </div>
      </section>

      {/* Footer / Barra de Ferramentas Mobile */}
      <footer className="sticky bottom-0 border-t border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur-md">
        <div className="max-w-lg mx-auto flex items-center justify-around gap-2">
          <Button 
            variant="ghost" 
            disabled={!selectedVideo || isProcessing}
            onClick={handleCutVideo}
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-xs text-zinc-400 hover:text-zinc-100 disabled:opacity-40"
          >
            <Scissors className="h-4 w-4" />
            Corte
          </Button>
          <Button 
            variant="ghost" 
            disabled={!selectedVideo && !sharedUrl}
            onClick={() => setIsScheduleOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-xs text-zinc-400 hover:text-zinc-100 disabled:opacity-40"
          >
            <Clock className="h-4 w-4" />
            Agendar
          </Button>
        </div>
      </footer>

      {/* Modal de Agendamento */}
      <ScheduleModal 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
        onSchedule={handleScheduleSubmit}
      />

      <Toaster />
    </main>
  );
}