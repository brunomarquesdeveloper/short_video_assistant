// Tipos de plataformas suportadas
export type SocialPlatform = 'youtube' | 'instagram' | 'tiktok';

// Status do ciclo de vida e da fila de processamento
export type MediaStatus = 'queued' | 'processing' | 'completed' | 'failed';

// Estrutura dos metadados do formulário
export interface VideoMetadata {
  caption: string;
  tags: string[];
  platforms: SocialPlatform[];
  scheduledAt: string; // Formato ISO date string
}

// Objeto completo do vídeo (salvo no banco / exibido no painel)
export interface MediaItem {
  id: string;
  title?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  metadata: VideoMetadata;
  status: MediaStatus;
  progress?: number; // 0 a 100 para o progresso do processamento
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Payload para envio unificado ao backend
export interface CreateMediaPayload {
  file: File;
  metadata: VideoMetadata;
}