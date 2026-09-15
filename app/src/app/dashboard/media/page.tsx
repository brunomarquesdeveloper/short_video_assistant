'use client';

import React, { useState } from 'react';
import { VideoUploader } from '@/components/media/VideoUploader';
import { VideoMetadataForm } from '@/components/media/VideoMetadataForm';
import { VideoMetadata, MediaItem, MediaStatus } from '@/types/media';
import { Clock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Dados simulados para o painel
const INITIAL_ITEMS: MediaItem[] = [
  {
    id: '1',
    videoUrl: '/samples/video1.mp4',
    metadata: {
      caption: 'Dica de Produtividade com IA #tech #shorts',
      tags: ['tech', 'ia', 'produtividade'],
      platforms: ['youtube', 'instagram'],
      scheduledAt: '2026-09-20T15:00',
    },
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    videoUrl: '/samples/video2.mp4',
    metadata: {
      caption: 'Bastidores da criação do app de vídeos',
      tags: ['buildinpublic', 'dev'],
      platforms: ['tiktok'],
      scheduledAt: '2026-09-22T18:30',
    },
    status: 'processing',
    progress: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function DashboardMediaPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>(INITIAL_ITEMS);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleMetadataSubmit = async (metadata: VideoMetadata) => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const newItem: MediaItem = {
        id: Date.now().toString(),
        videoUrl: URL.createObjectURL(selectedFile),
        metadata,
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMediaList((prev) => [newItem, ...prev]);
      setSelectedFile(null);
    } catch (error) {
      console.error('Erro ao agendar mídia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = mediaList.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 space-y-8">
      {/* Header do Dashboard */}
      <div className="max-w-6xl mx-auto flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Mídia & Agendamentos</h1>
          <p className="text-sm text-zinc-400">Gerencie uploads, metadados e monitore a fila de publicação.</p>
        </div>
        <Link 
          href="/" 
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao App Mobile
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna Esquerda: Upload + Formulário (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 bg-zinc-900/60 border border-zinc-800 p-5 rounded-xl">
          <h2 className="text-lg font-semibold text-zinc-200">Novo Envio</h2>

          {!selectedFile ? (
            <VideoUploader onVideoSelect={(file) => setSelectedFile(file)} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                <span className="text-xs text-zinc-300 truncate max-w-[200px]">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Trocar vídeo
                </button>
              </div>

              <VideoMetadataForm 
                onSubmit={handleMetadataSubmit} 
                isLoading={isSubmitting} 
              />
            </div>
          )}
        </div>

        {/* Coluna Direita: Painel e Fila de Status (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-200">Fila e Histórico</h2>

            {/* Filtros */}
            <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
              {['all', 'queued', 'processing', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                    filterStatus === status ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {status === 'all' ? 'Todos' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Cards */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-sm">
                Nenhum vídeo encontrado nesta categoria.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <video src={item.videoUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{item.metadata.caption}</p>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {new Date(item.metadata.scheduledAt).toLocaleString('pt-BR')}
                      </p>
                      <div className="flex gap-1 mt-1.5">
                        {item.metadata.platforms.map((platform) => (
                          <span key={platform} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700/50 capitalize">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Render do Badge de Status */}
                  <div className="flex-shrink-0">
                    <StatusBadge status={item.status} progress={item.progress} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponente simples para exibição visual do status
function StatusBadge({ status, progress }: { status: MediaStatus; progress?: number }) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2.5 py-1 rounded-full font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" /> Concluído
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-950/80 border border-indigo-800 text-indigo-400 px-2.5 py-1 rounded-full font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {progress ? `${progress}%` : 'Processando'}
        </span>
      );
    case 'queued':
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full font-medium">
          <Clock className="h-3.5 w-3.5 text-zinc-400" /> Na Fila
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-rose-950/80 border border-rose-800 text-rose-400 px-2.5 py-1 rounded-full font-medium">
          <AlertCircle className="h-3.5 w-3.5" /> Erro
        </span>
      );
  }
}