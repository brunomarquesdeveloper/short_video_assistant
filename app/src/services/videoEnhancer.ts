import { processVideoMetadata } from '../utils/textProcessor';

interface VideoEnhanceRequest {
  transcription?: string; // Transcrição obtida via Whisper
  rawCaption: string;
  brandHandle: string; // Ex: "@seu_canal"
}

export async function generateAutoVideoPackage({ transcription, rawCaption, brandHandle }: VideoEnhanceRequest) {
  // 1. Prompt de instrução para IA (Gemini ou similar)
  const baseText = transcription || rawCaption;
  
  // Exemplo de resposta estruturada retornada da IA:
  const aiGeneratedTags = ['viral', 'shorts', 'dicas', 'tecnologia'];
  const aiGeneratedCaption = `Confira este conteúdo incrível! Siga ${brandHandle} para mais novidades.`;

  // 2. Executa a limpeza e formatação por plataforma usando o nosso utilitário
  const metadata = processVideoMetadata(aiGeneratedCaption, aiGeneratedTags);

  return {
    cleanCaption: metadata.cleanCaption,
    tags: metadata.tags,
    descriptions: metadata.formattedDescriptions,
    watermarkText: brandHandle,
  };
}