'use client';

import { useState, useEffect } from 'react';
import { useWebPush } from '@/hooks/useWebPush';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { VideoUploader } from '@/components/media/VideoUploader';
import { VideoMetadataForm } from '@/components/media/VideoMetadataForm';
import { ScheduleModal } from '@/components/ScheduleModal';
import { Toaster } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { VideoMetadata, MediaItem } from '@/types/media';
import { Scissors, Clock, ArrowLeft } from 'lucide-react';
import Image from "next/image";

export default function Home() {
  useWebPush();

  // Estados de arquivo e fluxo de telas
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cleanedVideoUrl, setCleanedVideoUrl] = useState<string | null>(null);

  // Lista local para gerenciar agendamentos (substituir pela integração com o backend)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Hook do FFmpeg
  const { load: loadFFmpeg, loaded: ffmpegLoaded, isProcessing, processVideo } = useFFmpeg();

  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  // Captura vídeo/link vindo via Web Share Target (sessionStorage)
  useEffect(() => {
    const url = sessionStorage.getItem('shared_video_url');
    if (url) {
      setSharedUrl(url);
      sessionStorage.removeItem('shared_video_url');
    }
  }, []);

  const handleVideoSelect = (file: File | null) => {
    setSelectedVideo(file);
  };

  const handleCutVideo = async () => {
    if (!selectedVideo) return;
    const resultBlob = await processVideo(selectedVideo, "output.mp4");
    if (resultBlob) {
      // Atualiza o estado com o arquivo cortado gerado pelo FFmpeg
      const cutFile = new File([resultBlob], `corte_${selectedVideo.name}`, { type: 'video/mp4' });
      setSelectedVideo(cutFile);
    }
  };

  // Processa o envio dos metadados e cria o agendamento
  const handleMetadataSubmit = async (metadata: VideoMetadata) => {
    if (!selectedVideo && !sharedUrl) return;

    setIsSubmitting(true);
    try {
      const newItem: MediaItem = {
        id: Date.now().toString(),
        videoUrl: selectedVideo ? URL.createObjectURL(selectedVideo) : (sharedUrl || ''),
        metadata,
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMediaItems((prev) => [newItem, ...prev]);

      // Limpa os seletores e redireciona para a modal de agendados
      setSelectedVideo(null);
      setSharedUrl(null);
      setIsScheduleOpen(true);
    } catch (error) {
      console.error("Erro ao salvar metadados:", error);
    } finally {
      setIsSubmitting(false);
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
          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            Short Video Assistant
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsScheduleOpen(true)}
          className="border-zinc-700 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          <Clock className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
          Agendados ({mediaItems.length})
        </Button>
      </header>

      {/* Área Principal */}
      <section className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full gap-4">

        {/* Banner de notificação de link compartilhado */}
        {sharedUrl && !selectedVideo && (
          <div className="w-full p-3 bg-indigo-950/60 border border-indigo-800/80 rounded-xl text-xs text-indigo-200 flex flex-col gap-1">
            <span className="font-semibold text-indigo-300">Link recebido via compartilhamento:</span>
            <span className="truncate text-zinc-400">{sharedUrl}</span>
          </div>
        )}

        {/* ETAPA 1: Seleção de Vídeo */}
        {!selectedVideo ? (
          <>
            <VideoUploader onVideoSelect={handleVideoSelect} />

            <div className="text-xs text-zinc-500 text-center">
              {isProcessing ? (
                <span className="text-indigo-400 animate-pulse">Processando vídeo no navegador...</span>
              ) : ffmpegLoaded ? (
                <span>Motor de processamento pronto</span>
              ) : (
                <span>Iniciando motor de vídeo...</span>
              )}
            </div>
          </>
        ) : (
          /* ETAPA 2: Formulário de Metadados pós-seleção */
          <div className="w-full space-y-4">
            <button
              onClick={() => setSelectedVideo(null)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Trocar de vídeo
            </button>

            {/* Em vez de abrir o formulário/modal, renderiza o uploader com o botão de limpeza direto */}
            <VideoUploader
              onVideoSelect={(file) => setSelectedVideo(file)}
              onCleanComplete={(cleanedUrl) => {
                // Atualiza o estado com a URL do vídeo limpo
                setCleanedVideoUrl(cleanedUrl);
              }}
            />
          </div>
        )}
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
            <Scissors className="h-4 w-4 text-indigo-400" />
            Processar Corte
          </Button>
          <Button
            variant="ghost"
            disabled={!selectedVideo && !sharedUrl}
            onClick={() => setIsScheduleOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-xs text-zinc-400 hover:text-zinc-100 disabled:opacity-40"
          >
            <Clock className="h-4 w-4 text-violet-400" />
            Fila de Agendados
          </Button>
        </div>
      </footer>

      {/* Modal de Agendamento/Listagem */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        items={mediaItems}
      />

      <Toaster />
    </main>
  );
}